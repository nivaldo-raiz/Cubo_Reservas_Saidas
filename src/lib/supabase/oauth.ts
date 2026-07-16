import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export function createOAuthClient(request: NextRequest, response: NextResponse) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase OAuth não configurado.");
  }

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headersToSet).forEach(([name, value]) =>
          response.headers.set(name, value),
        );
      },
    },
  });
}
