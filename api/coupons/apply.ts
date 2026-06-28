import { 
  getSupabaseAdmin, 
  inMemoryCoupons, 
  inMemoryCouponUsages, 
  logConversionToSupabase 
} from "../payment/_shared";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, code, planId, originalPrice } = req.body;
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
