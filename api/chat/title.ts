import { getGeminiAI, generateContentWithRetryAndFallback } from "../_shared_gemini";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
    console.log("[Gemini API Info] Status in /api/chat/title:", error.message || error);
    res.json({ title: "New Chat" }); // Graceful fallback
  }
}
