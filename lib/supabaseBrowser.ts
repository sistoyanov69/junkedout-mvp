import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Safe to import during build: does NOT touch env vars until called in the browser.
export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser env vars are missing.");
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
