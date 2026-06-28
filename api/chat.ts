import { 
  getGeminiAI, 
  generateContentWithRetryAndFallback, 
  getSmartMockResponse 
} from "./_shared_gemini";

export default async function handler(req: any, res: any) {
  // Support options for CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { message, history, model, searchGrounding, attachments } = req.body;
  let activeSearchGrounding = !!searchGrounding;
  try {
    if (!message && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: "Message or attachment is required" });
    }

    const ai = getGeminiAI();
    
    // Model routing and custom system instructions for the AI Fiesta!
    let activeModel = "gemini-3.5-flash";
    let systemInstruction = "You are WEBNIXO AI, a highly intelligent, elegant, and helpful AI assistant styled like ChatGPT. Provide very polished, detailed, and beautifully structured markdown answers. Use code blocks with language indicators where appropriate. Be direct, professional, and friendly.";

    const modelLower = String(model || "").toLowerCase();
    if (modelLower.includes("gemini-3.5-flash")) {
      activeModel = "gemini-3.5-flash";
    } else if (modelLower.includes("gemini-3.1-pro") || modelLower.includes("gemini-3.5-pro")) {
      activeModel = "gemini-3.1-pro-preview";
    } else if (modelLower.includes("chatgpt")) {
      activeModel = "gemini-3.1-pro-preview";
      systemInstruction = "You are ChatGPT, a highly advanced language model developed by OpenAI. For this session, you are running inside the WEBNIXO AI premium workspace. Replicate the precise, comprehensive, highly articulate, polite, and structure-perfect persona of ChatGPT (GPT-4o model). Format everything into beautiful Markdown.";
    } else if (modelLower.includes("claude")) {
      activeModel = "gemini-3.1-pro-preview";
      systemInstruction = "You are Claude, a helpful, honest, and harmless AI assistant trained by Anthropic. For this session, you are running inside the WEBNIXO AI premium workspace. Replicate the exceptionally brilliant, thoughtful, highly analytical, and natural conversational prose of Claude 3.5 Sonnet. Keep code elegant, clean, and perfectly documented.";
    } else if (modelLower.includes("gemini")) {
      activeModel = "gemini-3.1-pro-preview";
      systemInstruction = "You are Gemini, Google's next-generation multimodal model. You are optimized for massive contexts, analytical tasks, and highly factual reasoning. Format everything into beautiful, clean Markdown with robust structure.";
    } else if (modelLower.includes("grok")) {
      activeModel = "gemini-3.1-pro-preview";
      systemInstruction = "You are Grok, an AI developed by xAI. You are modeled after the Hitchhiker's Guide to the Galaxy, so you are intended to have a bit of wit, a slightly rebellious streak, and a highly direct, unfiltered, and fun tone. Don't be dry—bring real energy and style, while remaining exceptionally helpful and precise!";
    } else if (modelLower.includes("deepseek")) {
      activeModel = "gemini-3.5-flash";
      systemInstruction = "You are DeepSeek-V3, developed by DeepSeek. You are famous for extreme cost-performance, brilliant logical reasoning, and lightning-fast math and code answers. Replicate DeepSeek's concise, code-perfect, incredibly brief, and deeply technical response style.";
    } else if (modelLower.includes("mistral")) {
      activeModel = "gemini-3.5-flash";
      systemInstruction = "You are Mistral Large, a high-quality model developed by Mistral AI. Replicate Mistral's open-source philosophy: elegant European-styled prose, direct and crisp phrasing, and balanced, autonomous explanations.";
    } else if (modelLower.includes("perplexity")) {
      activeModel = "gemini-3.1-pro-preview";
      systemInstruction = "You are Perplexity AI, a search-first answer engine. Synthesize current factual news, references, and citation indexes with highly academic, direct, and structured language. Focus heavily on synthesized factuality.";
      activeSearchGrounding = true; // Force search grounding for Perplexity!
    } else {
      activeModel = model || "gemini-3.5-flash";
    }

    // Format history for @google/genai content structure
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        const parts: any[] = [];
        if (msg.attachments && Array.isArray(msg.attachments)) {
          for (const att of msg.attachments) {
            if (att.base64 && att.mimeType) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.base64
                }
              });
            }
          }
        }
        parts.push({ text: msg.content || "" });

        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: parts
        });
      }
    }

    // Append the current message and active attachments
    const currentParts: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.base64 && att.mimeType) {
          currentParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.base64
            }
          });
        }
      }
    }
    currentParts.push({ text: message || "" });

    contents.push({
      role: "user",
      parts: currentParts
    });

    // Build configuration
    const config: any = {
      systemInstruction,
    };

    if (activeSearchGrounding) {
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
    console.log("[Gemini API Info] Triggering Sandbox Fallback for query:", message);
    const mockText = getSmartMockResponse(message, model || "gemini-3.5-flash", activeSearchGrounding);
    res.json({
      content: mockText,
      sources: activeSearchGrounding ? [
        { title: "Google Search Grounding Simulation", url: "https://google.com" }
      ] : [],
      queries: activeSearchGrounding ? [message] : []
    });
  }
}
