import { getSupabaseAdmin, inMemorySubscriptions } from "./_shared";

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const email = req.query.email || req.body?.email;
    if (!email) {
      return res.status(400).json({ error: "email parameter is required" });
    }

    const emailStr = String(email).toLowerCase();

    // Check memory cache first
    if (inMemorySubscriptions.has(emailStr)) {
      const cachedPlan = inMemorySubscriptions.get(emailStr);
      return res.json({ isPremium: true, plan: cachedPlan, dbStatus: "active" });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("user_subscriptions")
        .select("*")
        .eq("email", emailStr)
        .eq("status", "PAID")
        .maybeSingle();

      if (error) {
        console.log(`[Subscription Status] Table 'user_subscriptions' is not available. Using safe fallback.`);
        return res.json({ isPremium: false, dbStatus: "table_missing" });
      }

      if (data) {
        inMemorySubscriptions.set(emailStr, data);
        return res.json({ isPremium: true, plan: data, dbStatus: "active" });
      }

      return res.json({ isPremium: false, dbStatus: "active" });
    } else {
      return res.json({ isPremium: false, dbStatus: "credentials_missing" });
    }
  } catch (err: any) {
    console.log("[Subscription Status] Graceful fallback on query failure.");
    res.json({ isPremium: false, error: "Database fallback active" });
  }
}
