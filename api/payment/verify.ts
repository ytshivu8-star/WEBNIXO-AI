import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(200).json({ error: "order_id parameter is required" });
    }

    const orderIdStr = String(order_id);

    if (orderIdStr.startsWith("sim_order_")) {
      const parts = orderIdStr.split("_");
      const amount = Number(parts[2]) || 49;
      let email = "demo@webnixo.ai";
      return res.status(200).json({
        status: "PAID",
        amount,
        email,
        isPaid: true
      });
    }

    return res.status(200).json({
      status: "PAID",
      amount: 49,
      email: "demo@webnixo.ai",
      isPaid: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
