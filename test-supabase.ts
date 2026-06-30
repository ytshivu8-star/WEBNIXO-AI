import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabaseAdmin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function runTest() {
  const email = "test_audit@example.com";
  const orderId = "order_" + Date.now();
  const planId = "pro_monthly";
  const amount = 1999;

  console.log("\n--- payments ---");
  const pRes = await supabaseAdmin.from("payments").upsert({
    order_id: orderId,
    email: email,
    amount: amount,
    plan_id: planId,
    status: "PAID",
    payment_session_id: "live_test",
    created_at: new Date().toISOString()
  }).select();
  if (pRes.error) {
    console.log("Error:", JSON.stringify(pRes.error, null, 2));
  } else {
    console.log("Success");
  }

  console.log("\n--- user_subscriptions ---");
  const subRes = await supabaseAdmin.from("user_subscriptions").upsert({
    email: email,
    plan_id: planId,
    amount,
    order_id: orderId,
    status: "PAID",
    updated_at: new Date().toISOString()
  }).select();
  if (subRes.error) {
    console.log("Error:", JSON.stringify(subRes.error, null, 2));
  } else {
    console.log("Success");
  }

  console.log("\n--- profiles ---");
  const prRes = await supabaseAdmin.from("profiles").upsert({
    email: email,
    name: "Test User",
    theme: "dark",
    credits_remaining: 10000,
    updated_at: new Date().toISOString()
  }).select();
  if (prRes.error) {
    console.log("Error:", JSON.stringify(prRes.error, null, 2));
  } else {
    console.log("Success");
  }

  console.log("\n--- conversions ---");
  const convId = "conv_" + Date.now();
  const cRes = await supabaseAdmin.from("conversions").insert({
    id: convId,
    email: email,
    conversion_type: "payment_success",
    conversion_value: amount,
    details: { plan_id: planId, order_id: orderId, simulated: false },
    created_at: new Date().toISOString()
  }).select();
  if (cRes.error) {
    console.log("Error:", JSON.stringify(cRes.error, null, 2));
  } else {
    console.log("Success");
  }
  
  console.log("\n--- coupon_usages ---");
  const usRes = await supabaseAdmin.from("coupon_usages").insert({
    id: "usage_" + Date.now(),
    code: "TESTCOUPON",
    email: email,
    plan_id: planId,
    original_price: amount,
    discounted_price: amount,
    applied_at: new Date().toISOString()
  }).select();
  if (usRes.error) {
    console.log("Error:", JSON.stringify(usRes.error, null, 2));
  } else {
    console.log("Success");
  }
}

runTest().catch(console.error);
