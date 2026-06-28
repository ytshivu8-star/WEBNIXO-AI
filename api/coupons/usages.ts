import { getSupabaseAdmin, inMemoryCouponUsages } from "../payment/_shared";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("coupon_usages")
        .select("*");
      
      if (!error && data) {
        const sorted = data.sort((a: any, b: any) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
        return res.json({ source: "supabase", usages: sorted });
      }
    }
    return res.json({ source: "local_cache", usages: inMemoryCouponUsages });
  } catch (e) {
    return res.json({ source: "local_cache_fallback", usages: inMemoryCouponUsages });
  }
}
