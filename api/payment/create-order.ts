import { logPaymentToSupabase } from "./_shared";

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { email, amount, planId } = req.body || {};
    if (!email || !amount || !planId) {
      return res.status(200).json({ error: "email, amount, and planId are required" });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    const host = req.headers.host || "localhost:3000";
    let protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    // Force HTTPS for non-localhost to satisfy Cashfree's strict requirements
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      protocol = "https";
    }
    const referer = req.headers.referer || `${protocol}://${host}/`;
    let returnBaseUrl = referer.split("?")[0].split("#")[0];
    if (!returnBaseUrl.endsWith("/")) {
      returnBaseUrl += "/";
    }

    // If Cashfree API credentials are not set up, return an explicit error to avoid bypassing checkout
    if (!appId || !secretKey) {
      console.log(`[Cashfree PG] API credentials missing.`);
      return res.status(200).json({ error: "Cashfree API credentials are not configured on the server." });
    }

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const returnUrl = `${returnBaseUrl}#/payment-verify?order_id=${orderId}`;

    const isSandbox = process.env.CASHFREE_ENV ? process.env.CASHFREE_ENV !== "production" : appId.startsWith("TEST");
    const cashfreeBaseUrl = isSandbox ? "https://sandbox.cashfree.com/pg/orders" : "https://api.cashfree.com/pg/orders";

    console.log(`[Cashfree PG] Creating order ${orderId} for ${email} (Amount: INR ${amount}) in ${isSandbox ? 'sandbox' : 'production'} mode`);

    const response = await fetch(cashfreeBaseUrl, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order_amount: Number(amount),
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
          customer_id: email.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50),
          customer_phone: "9999999999", // Mandatory field for Cashfree API
          customer_email: email
        },
        order_meta: {
          return_url: returnUrl
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Cashfree PG] API Error:", errorText);
      return res.status(200).json({ error: `Cashfree API Error: ${errorText}` });
    }

    const orderData = await response.json();
    console.log(`[Cashfree PG] Order ${orderId} created successfully. Session ID: ${orderData.payment_session_id}`);

    // Log the real Cashfree order to DB
    await logPaymentToSupabase({
      order_id: orderId,
      email,
      amount: Number(amount),
      plan_id: planId,
      status: "ACTIVE",
      payment_session_id: orderData.payment_session_id
    });

    res.json({
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
      orderStatus: orderData.order_status,
      returnUrl,
      environment: isSandbox ? "sandbox" : "production"
    });
  } catch (err: any) {
    console.error("Payment Order Creation failure:", err);
    // Return 200 status with error details so it doesn't trigger proxy HTML interception
    res.status(200).json({ 
      error: err.message
    });
  }
}
