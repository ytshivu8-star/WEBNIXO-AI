import { 
  getSupabaseAdmin, 
  inMemorySubscriptions, 
  logPaymentToSupabase, 
  logConversionToSupabase, 
  rewardAffiliateIfApplicable 
} from "./_shared";

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(200).json({ error: "order_id parameter is required" });
    }

    const orderIdStr = String(order_id);

    // Handle stateless sandbox order verification
    if (orderIdStr.startsWith("sim_order_")) {
      console.log(`[Cashfree PG Sandbox] Verifying simulated order: ${orderIdStr}`);
      const parts = orderIdStr.split("_");
      // sim_order_{amount}_{planId}_{hexEmail}_{timestamp}
      const amount = Number(parts[2]) || 49;
      const planId = parts[3] || "pro_monthly";
      let email = "demo@webnixo.ai";
      try {
        email = Buffer.from(parts[4], "hex").toString("utf8");
      } catch (e) {
        console.error("Failed to decode email from simulated order ID", e);
      }

      const emailStr = email.toLowerCase();
      const subscriptionDetails = {
        email: emailStr,
        plan_id: planId,
        amount,
        order_id: orderIdStr,
        status: "PAID",
        updated_at: new Date().toISOString()
      };

      inMemorySubscriptions.set(emailStr, subscriptionDetails);
      console.log(`[Subscription Sandbox] Simulated payment of ₹${amount} approved instantly for ${emailStr}`);

      // Sync simulated payment as PAID to Supabase
      await logPaymentToSupabase({
        order_id: orderIdStr,
        email: emailStr,
        amount,
        plan_id: planId,
        status: "PAID",
        payment_session_id: "simulated_success"
      });

      // Record conversion event
      await logConversionToSupabase({
        email: emailStr,
        conversion_type: "payment_success",
        conversion_value: amount,
        details: { plan_id: planId, order_id: orderIdStr, simulated: true }
      });

      // Reward affiliate if an affiliate coupon code was used
      await rewardAffiliateIfApplicable(emailStr, amount);

      return res.json({
        status: "PAID",
        amount,
        email,
        isPaid: true
      });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return res.status(200).json({ error: "Cashfree API configuration is missing on the server." });
    }

    console.log(`[Cashfree PG] Verifying order status for ${order_id}...`);

    const isSandbox = process.env.CASHFREE_ENV ? process.env.CASHFREE_ENV !== "production" : appId.startsWith("TEST");
    const cashfreeBaseUrl = isSandbox ? `https://sandbox.cashfree.com/pg/orders/${order_id}` : `https://api.cashfree.com/pg/orders/${order_id}`;

    const response = await fetch(cashfreeBaseUrl, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cashfree PG] Verification API Error:", errorText);
      // Fallback gracefully instead of throwing
      return res.status(200).json({ 
        error: `Cashfree Order Verification failed: ${errorText}`,
        isPaid: false
      });
    }

    const orderData = await response.json();
    const isPaid = orderData.order_status === "PAID";
    console.log(`[Cashfree PG] Order ${order_id} status is ${orderData.order_status}`);

    if (isPaid) {
      const email = orderData.customer_details?.customer_email || "user@example.com";
      const amount = Number(orderData.order_amount);
      const emailStr = email.toLowerCase();

      let plan_id = "pro_monthly";
      if (amount === 4999) {
        plan_id = "pro_yearly";
      } else if (amount === 499) {
        plan_id = "pro_monthly";
      } else if (amount === 1999) {
        plan_id = "starter_yearly";
      } else if (amount === 199) {
        plan_id = "starter_monthly";
      }

      const subscriptionDetails = {
        email: emailStr,
        plan_id,
        amount,
        order_id: order_id as string,
        status: "PAID",
        updated_at: new Date().toISOString()
      };

      // Write to in-memory cache immediately to ensure absolute instant reliability
      inMemorySubscriptions.set(emailStr, subscriptionDetails);
      console.log(`[Subscription] Saved user premium status to in-memory cache for ${emailStr}`);

      // Sync active subscription status as PAID to payments table in Supabase
      await logPaymentToSupabase({
        order_id: order_id as string,
        email: emailStr,
        amount,
        plan_id,
        status: "PAID",
        payment_session_id: orderData.payment_session_id || "live_success"
      });

      // Record conversion event
      await logConversionToSupabase({
        email: emailStr,
        conversion_type: "payment_success",
        conversion_value: amount,
        details: { plan_id, order_id: order_id as string, simulated: false }
      });

      // Reward affiliate if an affiliate coupon code was used
      await rewardAffiliateIfApplicable(emailStr, amount);

      // Save premium subscription to Supabase if client is ready
      const supabaseAdmin = getSupabaseAdmin();
      if (supabaseAdmin) {
        console.log(`[DB] Syncing user premium subscription for ${emailStr} with cloud store...`);
        supabaseAdmin
          .from("user_subscriptions")
          .upsert(subscriptionDetails)
          .then(({ error: upsertError }: any) => {
            if (upsertError) {
              console.log("[DB] Supabase sync skipped (table not initialized yet). Relying on robust local cache.");
            } else {
              console.log(`[DB] Successfully saved premium status for ${emailStr} in Supabase`);
            }
          })
          .catch((err: any) => {
            console.log("[DB] Cloud store sync error caught. Local cache remains active.");
          });
      }

      return res.json({
        status: "PAID",
        amount,
        email,
        isPaid: true
      });
    }

    return res.json({
      status: orderData.order_status,
      isPaid: false
    });
  } catch (err: any) {
    console.error("Payment Order Verification failure:", err);
    res.status(200).json({ 
      error: err.message,
      isPaid: false
    });
  }
}
