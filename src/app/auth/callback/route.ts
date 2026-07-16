import { NextRequest, NextResponse } from "next/server";
import {
  clearGuardianSessionCookie,
  createGuardianSessionCookie,
} from "@/lib/auth/cookies";
import { env } from "@/lib/env";
import { normalizeEmail } from "@/lib/format";
import { getGuardianByEmail } from "@/lib/repository";
import { createOAuthClient } from "@/lib/supabase/oauth";

function destination(path: string, error?: string) {
  const url = new URL(path, env.appUrl);
  if (error) url.searchParams.set("erro", error);
  return url;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const response = NextResponse.redirect(destination("/acesso", "oauth"));
  response.headers.set("cache-control", "private, no-store");

  if (!code) return response;

  try {
    const supabase = createOAuthClient(request, response);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return response;

    const { data, error: userError } = await supabase.auth.getUser();
    const user = data.user;
    if (userError || !user?.email || !user.email_confirmed_at) {
      await supabase.auth.signOut({ scope: "local" });
      const cleared = clearGuardianSessionCookie();
      response.cookies.set(cleared.name, cleared.value, cleared.options);
      response.headers.set("location", destination("/acesso", "email-nao-confirmado").toString());
      return response;
    }

    const guardian = await getGuardianByEmail(normalizeEmail(user.email));
    await supabase.auth.signOut({ scope: "local" });
    if (!guardian) {
      const cleared = clearGuardianSessionCookie();
      response.cookies.set(cleared.name, cleared.value, cleared.options);
      response.headers.set("location", destination("/acesso", "nao-autorizado").toString());
      return response;
    }

    const session = createGuardianSessionCookie(guardian.id);
    response.cookies.set(session.name, session.value, session.options);
    response.headers.set(
      "location",
      destination(guardian.statusPagamento === "pago" ? "/alunos" : "/pagamento-pendente").toString(),
    );
    return response;
  } catch {
    return response;
  }
}
