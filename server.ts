/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize GoogleGenAI as required by instructions
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it in your Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Helper function to handle transient errors (e.g. 503 Service Unavailable) with retry and fallback models
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  activeModel: string,
  contents: any,
  config: any,
  maxRetries = 2
) {
  let attempt = 0;
  let currentModel = activeModel;

  while (true) {
    try {
      console.log(`[Gemini API] Requesting ${currentModel} (attempt ${attempt + 1}/${maxRetries + 1})...`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config,
      });
      return response;
    } catch (error: any) {
      attempt++;
      
      const errorStr = (error?.message || "").toLowerCase();
      const isQuotaExceeded = 
        error?.status === 'RESOURCE_EXHAUSTED' || 
        error?.code === 429 || 
        error?.status === 429 ||
        errorStr.includes("429") || 
        errorStr.includes("resource_exhausted") ||
        errorStr.includes("quota") ||
        errorStr.includes("rate limit") ||
        errorStr.includes("limit exceeded");

      const isTransient = 
        error?.status === 'UNAVAILABLE' || 
        error?.code === 503 || 
        error?.status === 503 ||
        errorStr.includes("503") || 
        errorStr.includes("high demand") ||
        errorStr.includes("unavailable") ||
        errorStr.includes("overloaded");

      console.warn(`[Gemini API] Error on attempt ${attempt} with model ${currentModel}:`, error.message || error);

      // If it is a standard transient error (like 503) and we have retries left, wait and retry.
      // But if it is a quota issue, retry is useless and we should proceed directly to fallback.
      if (isTransient && !isQuotaExceeded && attempt <= maxRetries) {
        const delay = 800 * attempt;
        console.log(`[Gemini API] Retrying transient error in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Fallback strategy if we tried maxRetries or if we hit a quota limit
      if (currentModel === "gemini-3.1-pro-preview" || currentModel === "gemini-3.1-pro") {
        console.log(`[Gemini API] Pro model ${currentModel} failed (Quota/Transient). Trying fallback model 'gemini-3.5-flash'...`);
        currentModel = "gemini-3.5-flash";
        attempt = 0; // Reset attempts for the fallback model
        continue;
      } else if (currentModel === "gemini-3.5-flash") {
        console.log(`[Gemini API] Model ${currentModel} failed. Trying fallback model 'gemini-flash-latest'...`);
        currentModel = "gemini-flash-latest";
        attempt = 0; // Reset attempts for the fallback model
        continue;
      } else if (currentModel === "gemini-flash-latest") {
        console.log(`[Gemini API] Fallback model 'gemini-flash-latest' failed. Trying fallback 'gemini-3.1-flash-lite'...`);
        currentModel = "gemini-3.1-flash-lite";
        attempt = 0; // Reset attempts
        continue;
      } else if (currentModel === "gemini-3.1-flash-lite") {
        console.log(`[Gemini API] Fallback model 'gemini-3.1-flash-lite' failed. Trying fallback 'gemini-2.5-flash'...`);
        currentModel = "gemini-2.5-flash";
        attempt = 0; // Reset attempts
        continue;
      } else if (currentModel === "gemini-2.5-flash") {
        console.log(`[Gemini API] Fallback model 'gemini-2.5-flash' failed. Trying fallback 'gemini-1.5-flash'...`);
        currentModel = "gemini-1.5-flash";
        attempt = 0; // Reset attempts
        continue;
      }

      // If all fallback attempts failed, throw the final error
      throw error;
    }
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Chat completion endpoint with support for models, history, and search grounding
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, model, searchGrounding } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiAI();
    const activeModel = model || "gemini-3.5-flash";

    // Format history for @google/genai content structure
    // history should be array of: { role: 'user' | 'model', parts: [{ text: string }] }
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }

    // Append the current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Build configuration
    const config: any = {
      systemInstruction: "You are WEBNIXO AI, a highly intelligent, elegant, and helpful AI assistant styled like ChatGPT. Provide very polished, detailed, and beautifully structured markdown answers. Use code blocks with language indicators where appropriate. Be direct, professional, and friendly.",
    };

    // If search grounding is requested, inject the googleSearch tool
    if (searchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await generateContentWithRetryAndFallback(
      ai,
      activeModel,
      contents,
      config
    );

    const text = response.text || "";

    // Extract search grounding metadata if available
    const sources: { title: string; url: string }[] = [];
    let queries: string[] = [];
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata) {
      if (groundingMetadata.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            // Avoid adding duplicates
            if (!sources.find(s => s.url === chunk.web.uri)) {
              sources.push({
                title: chunk.web.title,
                url: chunk.web.uri
              });
            }
          }
        }
      }
      if (groundingMetadata.webSearchQueries) {
        queries = groundingMetadata.webSearchQueries;
      }
    }

    res.json({
      content: text,
      sources,
      queries
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while generating a response from Gemini.",
      isError: true 
    });
  }
});

// Title generation endpoint for a conversation session
app.post("/api/chat/title", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiAI();
    const response = await generateContentWithRetryAndFallback(
      ai,
      "gemini-3.5-flash",
      message,
      {
        systemInstruction: "Summarize the user's message into a short, elegant 2-4 word chat title. Do not include quotes, surrounding punctuation, colons, or explanations. Keep it extremely brief, descriptive, and human-friendly."
      }
    );

    const title = response.text?.trim().replace(/^["']|["']$/g, '') || "New Chat";
    res.json({ title });
  } catch (error: any) {
    console.error("Error in /api/chat/title:", error);
    res.json({ title: "New Chat" }); // Graceful fallback
  }
});

// Setup Vite Dev Server / Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
