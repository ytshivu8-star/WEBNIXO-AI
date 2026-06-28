import { getGeminiAI, generateContentWithRetryAndFallback, offlineOptimizePrompt } from "./_shared_gemini";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // If API key is missing, immediately use the offline prompt optimizer
    if (!process.env.GEMINI_API_KEY) {
      const optimized = offlineOptimizePrompt(prompt);
      return res.json({ optimized });
    }

    const ai = getGeminiAI();
    const response = await generateContentWithRetryAndFallback(
      ai,
      "gemini-3.5-flash",
      prompt,
      {
        systemInstruction: "You are an expert prompt engineer. Your job is to optimize, structure, and refine the user's raw input prompt to get the best possible outcome from an AI model. Enrich it with clear objectives, context, and formatting specifications. Do NOT add any pleasantries, intro, or explanations. Return ONLY the final optimized prompt itself. Do not wrap the final output in quotes or markdown code blocks (unless the prompt itself describes code)."
      }
    );

    const optimized = response.text?.trim() || offlineOptimizePrompt(prompt);
    res.json({ optimized });
  } catch (error: any) {
    console.log("[Gemini API Info] Error in /api/optimize-prompt:", error.message || error);
    const fallbackOptimized = offlineOptimizePrompt(prompt);
    res.json({ optimized: fallbackOptimized }); // Robust offline fallback on any error
  }
}
