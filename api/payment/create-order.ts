import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return res.status(200).json({ 
      error: "Cashfree API configuration is missing on the server.",
      canSimulate: true 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
