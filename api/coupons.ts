import { 
  getSupabaseAdmin, 
  inMemoryCoupons,
  inMemoryCouponUsages,
  logConversionToSupabase
} from "./payment/_shared";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "";
  const pathname = url.split("?")[0];

  // 1. APPLY ROUTE
  if (pathname.includes("/apply")) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { email, code, planId, originalPrice } = req.body || {};
      if (!email || !code) {
        return res.status(200).json({ error: "email and coupon code are required parameters" });
      }

      const cleanCode = String(code).trim().toUpperCase();
      const emailStr = String(email).toLowerCase();

      // Check if coupon exists
      let coupon = null;
      let isAffiliateCoupon = false;
      let affiliateEmail = "";

      const supabaseAdmin = getSupabaseAdmin();
      if (supabaseAdmin) {
        try {
          // Query webnixo_profiles_affilate directly for custom_coupon_code or referral_code (case-insensitive)
          const { data: affiliate, error } = await supabaseAdmin
            .from("webnixo_profiles_affilate")
            .select("*")
            .or(`custom_coupon_code.ilike.${cleanCode},referral_code.ilike.${cleanCode}`)
            .maybeSingle();

          let foundAffiliate = null;
          if (!error && affiliate) {
            foundAffiliate = affiliate;
          } else {
            // Fallback to fetch and in-memory search if .or/.ilike fails
            const { data: allAffiliates, error: fetchErr } = await supabaseAdmin
              .from("webnixo_profiles_affilate")
              .select("*");
            if (!fetchErr && allAffiliates) {
              foundAffiliate = allAffiliates.find((aff: any) => 
                (aff.custom_coupon_code && String(aff.custom_coupon_code).trim().toUpperCase() === cleanCode) ||
                (aff.referral_code && String(aff.referral_code).trim().toUpperCase() === cleanCode)
              );
            }
          }

          if (foundAffiliate) {
            const isReferralCode = String(foundAffiliate.referral_code || '').trim().toUpperCase() === cleanCode;
            coupon = {
              code: cleanCode,
              discount_percent: 20, // Default 20% discount for affiliate coupons/referrals
              description: isReferralCode 
                ? `Affiliate referral of ${foundAffiliate.full_name}`
                : `Affiliate promo code of ${foundAffiliate.full_name}`,
              is_active: true,
              created_at: foundAffiliate.joined_at || new Date().toISOString()
            };
            isAffiliateCoupon = true;
            affiliateEmail = foundAffiliate.email;
          }
        } catch (dbErr) {
          console.warn("Failed to check affiliate coupon from webnixo_profiles_affilate table:", dbErr);
        }
      }

      // Fallback to local inMemoryCoupons if synced
      if (!coupon) {
        const cached = inMemoryCoupons.get(cleanCode);
        if (cached) {
          coupon = cached;
          isAffiliateCoupon = true;
          affiliateEmail = cached.email || "";
        }
      }

      if (!coupon || !coupon.is_active) {
        return res.status(200).json({ error: "❌ Invalid or expired coupon code. Check coupon database listings below." });
      }

      // Log the affiliate lead event to webnixo_events_affilate if applicable
      if (isAffiliateCoupon && affiliateEmail) {
        try {
          const supabaseAdmin = getSupabaseAdmin();
          if (supabaseAdmin) {
            const eventId = `aff_evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const eventRecord = {
              id: eventId,
              user_email: affiliateEmail,
              type: "Coupon Applied",
              details: `User ${emailStr} applied coupon ${cleanCode} for plan ${planId || 'unknown'}`,
              timestamp: new Date().toISOString(),
              commission: 0,
              created_at: new Date().toISOString()
            };
            await supabaseAdmin
              .from("webnixo_events_affilate")
              .insert(eventRecord);
            console.log(`[Affiliate Event] Logged coupon apply lead event for ${affiliateEmail}`);
          }
        } catch (evtErr) {
          console.warn("Failed to log affiliate event to webnixo_events_affilate:", evtErr);
        }
      }

      const discountPercent = coupon.discount_percent;
      const originalPriceNum = Number(originalPrice) || 0;
      
      let discountedPrice = originalPriceNum;
      if (cleanCode === 'FREEPASS') {
        discountedPrice = 1;
      } else {
        const discountAmt = 50; // Flat ₹50 discount
        discountedPrice = Math.max(1, originalPriceNum - discountAmt);
      }

      const usageRecord = {
        id: `usage_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        email: emailStr,
        coupon_code: cleanCode,
        plan_id: planId || "starter_monthly",
        original_price: originalPriceNum,
        discounted_price: discountedPrice,
        applied_at: new Date().toISOString()
      };

      // Log to local memory cache
      inMemoryCouponUsages.unshift(usageRecord);

      // Sync usage with Supabase
      try {
        const supabaseAdmin = getSupabaseAdmin();
        if (supabaseAdmin) {
          const { error } = await supabaseAdmin
            .from("coupon_usages")
            .insert(usageRecord);
          if (!error) {
            console.log(`[Coupon Usage DB] Successfully logged coupon application for ${emailStr}`);
          } else {
            console.log(`[Coupon Usage DB] Supabase usage log skipped (table not ready yet). Logged locally.`);
          }
        }
      } catch (dbErr) {
        console.warn(`[Coupon Usage DB] Supabase log error. Swallowing to maintain robust local fallback:`, dbErr);
      }

      // Record conversion event for coupon applied
      await logConversionToSupabase({
        email: emailStr,
        conversion_type: "coupon_applied",
        conversion_value: originalPriceNum - discountedPrice,
        details: { code: cleanCode, plan_id: planId || "starter_monthly", saved: originalPriceNum - discountedPrice }
      });

      return res.json({
        success: true,
        code: cleanCode,
        discountPercent,
        discountedPrice,
        savedAmount: originalPriceNum - discountedPrice,
        message: `🎉 Coupon ${cleanCode} applied successfully! Saved ₹${originalPriceNum - discountedPrice}`
      });
    } catch (err: any) {
      return res.status(200).json({ error: err.message });
    }
  }

  // 2. USAGES ROUTE
  if (pathname.includes("/usages")) {
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

  // 3. BASE COUPONS ROUTE (GET: Retrieve all coupons)
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

  // 4. BASE COUPONS ROUTE (POST: Create/Update a coupon in the database)
  if (req.method === "POST") {
    try {
      const { code, discount_percent, description } = req.body || {};
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
