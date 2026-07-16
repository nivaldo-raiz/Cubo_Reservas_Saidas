import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let client: SupabaseClient<Database> | undefined;

export function getSupabaseAdmin() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Supabase não configurado no servidor.");
  }

  client ??= createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return client;
}
