import { getSupabaseAdmin, inMemoryCoupons } from "./payment/_shared";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Retrieve all coupons
  if (req.method === "GET") {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("webnixo_profiles_affilate")
          .select("email, full_name, referral_code, custom_coupon_code, joined_at");
        
        if (!error && data) {
          const couponsList: any[] = [];
          data.forEach((item: any) => {
            if (item.custom_coupon_code && item.custom_coupon_code.trim()) {
              const codeUpper = item.custom_coupon_code.trim().toUpperCase();
              // Avoid duplicate overriding of standard codes if any
              if (!couponsList.some(c => c.code === codeUpper)) {
                couponsList.push({
                  code: codeUpper,
                  discount_percent: 20, // Default 20% discount for affiliate coupon
                  description: `Affiliate promo of ${item.full_name}`,
                  is_active: true,
                  created_at: item.joined_at || new Date().toISOString(),
                  email: item.email
                });
              }
            }
            if (item.referral_code && item.referral_code.trim()) {
              const codeUpper = item.referral_code.trim().toUpperCase();
              if (!couponsList.some(c => c.code === codeUpper)) {
                couponsList.push({
                  code: codeUpper,
                  discount_percent: 20, // Default 20% discount for affiliate referral link
                  description: `Referral of ${item.full_name}`,
                  is_active: true,
                  created_at: item.joined_at || new Date().toISOString(),
                  email: item.email
                });
              }
            }
          });

          // Sync local cache
          inMemoryCoupons.clear();
          couponsList.forEach((c: any) => {
            inMemoryCoupons.set(c.code, c);
          });

          return res.json({ source: "supabase", coupons: couponsList });
        }
      }

      return res.json({ source: "local_cache", coupons: Array.from(inMemoryCoupons.values()) });
    } catch (e) {
      return res.json({ source: "local_cache_fallback", coupons: Array.from(inMemoryCoupons.values()) });
    }
  }

  // POST: Create/Update a coupon in the database
  if (req.method === "POST") {
    try {
      const { code, discount_percent, description } = req.body;
      if (!code || typeof discount_percent !== "number") {
        return res.status(200).json({ error: "code and discount_percent are required parameters" });
      }

      const cleanCode = String(code).trim().toUpperCase();
      const couponRecord = {
        code: cleanCode,
        discount_percent: Number(discount_percent),
        description: description || `${discount_percent}% Discount Coupon`,
        is_active: true,
        created_at: new Date().toISOString()
      };

      // Save to local cache
      inMemoryCoupons.set(cleanCode, couponRecord);

      // Save to Supabase
      try {
        const supabaseAdmin = getSupabaseAdmin();
        if (supabaseAdmin) {
          const { error } = await supabaseAdmin
            .from("coupons")
            .upsert(couponRecord);
          if (!error) {
            console.log(`[Coupon Database] Synced coupon ${cleanCode} in Supabase successfully.`);
          } else {
            console.log(`[Coupon Database] Supabase sync skipped (table not ready yet). Saved locally.`);
          }
        }
      } catch (dbErr) {
        console.warn(`[Coupon Database] Supabase upsert error. Swallowing to maintain robust local fallback:`, dbErr);
      }

      return res.json({ success: true, coupon: couponRecord });
    } catch (err: any) {
      return res.status(200).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
