import { logProfileToSupabase, inMemoryProfiles, getSupabaseAdmin } from "./payment/_shared";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { email, name, theme, credits } = req.body;
      if (!email) {
        return res.status(200).json({ error: "email is a required parameter" });
      }
      
      await logProfileToSupabase({
        email,
        name: name || "Anonymous User",
        theme,
        credits_remaining: credits
      });

      return res.json({ success: true, profile: inMemoryProfiles.get(email.toLowerCase()) });
    } catch (err: any) {
      return res.status(200).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: "email is required" });
      }
      const emailStr = String(email).toLowerCase();

      const supabaseAdmin = getSupabaseAdmin();
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("email", emailStr)
          .maybeSingle();
        if (!error && data) {
          return res.json({ source: "supabase", profile: data });
        }
      }
      return res.json({ source: "local_cache", profile: inMemoryProfiles.get(emailStr) || null });
    } catch (e) {
      const qEmail = req.query.email ? String(req.query.email).toLowerCase() : "";
      return res.json({ source: "local_cache_fallback", profile: inMemoryProfiles.get(qEmail) || null });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
