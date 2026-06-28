import { getSupabaseAdmin, inMemoryConversions } from "./payment/_shared";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("conversions")
        .select("*");
      if (!error && data) {
        return res.json({ source: "supabase", conversions: data });
      }
    }
    return res.json({ source: "local_cache", conversions: Array.from(inMemoryConversions.values()) });
  } catch (e) {
    return res.json({ source: "local_cache_fallback", conversions: Array.from(inMemoryConversions.values()) });
  }
}
