import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Ephemeral cache in serverless instances
export const inMemorySubscriptions = new Map<string, any>();
export const inMemoryPayments = new Map<string, any>();
export const inMemoryConversions = new Map<string, any>();
export const inMemoryCouponUsages: any[] = [];

let supabaseAdminInstance: any = null;

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.SUPABASE_ANON_KEY || 
                        process.env.VITE_SUPABASE_ANON_KEY ||
                        process.env.SUPABASE_KEY;
    if (url && serviceRole) {
      supabaseAdminInstance = createClient(url, serviceRole, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }
  }
  return supabaseAdminInstance;
}

export async function logPaymentToSupabase(payment: {
  order_id: string;
  email: string;
  amount: number;
  plan_id: string;
  status: string;
  payment_session_id?: string;
}) {
  const emailStr = payment.email.toLowerCase();
  const record = {
    order_id: payment.order_id,
    email: emailStr,
    amount: payment.amount,
    plan_id: payment.plan_id,
    status: payment.status,
    payment_session_id: payment.payment_session_id || null,
    created_at: new Date().toISOString()
  };

  inMemoryPayments.set(payment.order_id, record);

  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from("payments")
        .upsert(record);
      if (!error) {
        console.log(`[DB Payment] Successfully logged payment order ${payment.order_id} in Supabase.`);
      } else {
        console.log(`[DB Payment] Supabase payments log skipped (table not initialized yet). Saved in memory.`);
      }
    } catch (e) {
      console.log(`[DB Payment] Supabase query catch block hit. Fallback to cache.`);
    }
  }
}

export async function logConversionToSupabase(conversion: {
  email: string;
  conversion_type: string;
  conversion_value?: number;
  details?: any;
}) {
  const emailStr = conversion.email.toLowerCase();
  const id = `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const record = {
    id,
    email: emailStr,
    conversion_type: conversion.conversion_type,
    conversion_value: conversion.conversion_value || 0,
    details: conversion.details || {},
    created_at: new Date().toISOString()
  };

  inMemoryConversions.set(id, record);

  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from("conversions")
        .insert(record);
      if (!error) {
        console.log(`[DB Conversion] Logged ${conversion.conversion_type} conversion successfully for ${emailStr}`);
      } else {
        console.log(`[DB Conversion] Supabase conversions table skipped. Logged in-memory.`);
      }
    } catch (e) {
      console.log(`[DB Conversion] Supabase query catch block hit. Fallback to cache.`);
    }
  }
}

export async function rewardAffiliateIfApplicable(emailStr: string, amountPaid: number) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return;

    // Find the most recent coupon applied by this user
    let recentUsage = inMemoryCouponUsages.find(u => u.email === emailStr.toLowerCase());
    if (!recentUsage) {
      // Query from Supabase for serverless stateless execution
      const { data, error } = await supabaseAdmin
        .from("coupon_usages")
        .select("*")
        .eq("email", emailStr.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        recentUsage = data;
      }
    }

    if (!recentUsage) {
      console.log(`[Affiliate Payout] No recent coupon usage found for ${emailStr}`);
      return;
    }

    const codeClean = String(recentUsage.coupon_code).trim().toUpperCase();

    // Check if this coupon belongs to an affiliate (webnixo_profiles_affilate)
    const { data: affiliate, error } = await supabaseAdmin
      .from("webnixo_profiles_affilate")
      .select("*")
      .or(`custom_coupon_code.ilike.${codeClean},referral_code.ilike.${codeClean}`)
      .maybeSingle();

    let foundAffiliate = null;
    if (!error && affiliate) {
      foundAffiliate = affiliate;
    } else {
      const { data: allAffiliates, error: fetchErr } = await supabaseAdmin
        .from("webnixo_profiles_affilate")
        .select("*");
      if (!fetchErr && allAffiliates) {
        foundAffiliate = allAffiliates.find((aff: any) => 
          (aff.custom_coupon_code && String(aff.custom_coupon_code).trim().toUpperCase() === codeClean) ||
          (aff.referral_code && String(aff.referral_code).trim().toUpperCase() === codeClean)
        );
      }
    }

    if (!foundAffiliate) {
      console.log(`[Affiliate Payout] No matching affiliate found for coupon code ${codeClean}`);
      return;
    }

    const affiliateEmail = foundAffiliate.email;

    // Calculate commission based on standard settings
    let commission = amountPaid * 0.20; // Default 20%
    if (Math.abs(amountPaid - 199) < 10) commission = 39.80;
    else if (Math.abs(amountPaid - 499) < 10) commission = 99.80;
    else if (Math.abs(amountPaid - 999) < 10) commission = 199.80;
    else if (Math.abs(amountPaid - 1999) < 50) commission = 399.80;
    else if (Math.abs(amountPaid - 4999) < 50) commission = 999.80;

    // Log the "Sale" event in webnixo_events_affilate
    const eventId = `aff_sale_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const eventRecord = {
      id: eventId,
      user_email: affiliateEmail,
      type: "Sale",
      details: `Referral sale from customer ${emailStr} (Paid ₹${amountPaid}, Coupon ${codeClean})`,
      timestamp: new Date().toISOString(),
      commission: Number(commission.toFixed(2)),
      created_at: new Date().toISOString()
    };

    const { error: insErr } = await supabaseAdmin
      .from("webnixo_events_affilate")
      .insert(eventRecord);

    if (insErr) {
      console.error(`[Affiliate Payout] Failed to insert Sale event for ${affiliateEmail}:`, insErr);
    } else {
      console.log(`[Affiliate Payout] Logged referral sale of ₹${amountPaid} for affiliate ${affiliateEmail}`);

      // Now, update the affiliate's stats inside webnixo_profiles_affilate
      const stats = affiliate.stats || { clicks: 0, signups: 0, sales: 0, commissionEarned: 0, unpaidCommission: 0, payoutStatus: "None" };
      stats.sales = (Number(stats.sales) || 0) + 1;
      stats.commissionEarned = Number(((Number(stats.commissionEarned) || 0) + commission).toFixed(2));
      stats.unpaidCommission = Number(((Number(stats.unpaidCommission) || 0) + commission).toFixed(2));

      const { error: updErr } = await supabaseAdmin
        .from("webnixo_profiles_affilate")
        .update({ stats, updated_at: new Date().toISOString() })
        .eq("email", affiliateEmail);

      if (updErr) {
        console.error(`[Affiliate Stats] Failed to update stats for affiliate ${affiliateEmail}:`, updErr);
      } else {
        console.log(`[Affiliate Stats] Successfully updated stats for affiliate ${affiliateEmail}`);
      }
    }
  } catch (err) {
    console.error(`[Affiliate Payout] Error in rewardAffiliateIfApplicable:`, err);
  }
}
