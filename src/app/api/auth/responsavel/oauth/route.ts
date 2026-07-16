import { NextRequest, NextResponse } from "next/server";
import {
  clearGuardianPreAuthCookie,
  createGuardianSessionCookie,
  guardianPreAuthCookieName,
  readGuardianPreAuthCookie,
} from "@/lib/auth/cookies";
import { parseOAuthProvider } from "@/lib/auth/oauth";
import { env } from "@/lib/env";
import { getGuardianByEmail } from "@/lib/repository";
import { createOAuthClient } from "@/lib/supabase/oauth";

function accessUrl(error?: string) {
  const url = new URL("/acesso", env.appUrl);
  if (error) url.searchParams.set("erro", error);
  return url;
}

export async function GET(request: NextRequest) {
  const requestedProvider = request.nextUrl.searchParams.get("provider");
  const preAuthEmail = readGuardianPreAuthCookie(
    request.cookies.get(guardianPreAuthCookieName())?.value,
  );
  if (!preAuthEmail) return NextResponse.redirect(accessUrl("preautorizacao"));

  if (env.demoMode && requestedProvider === "demo") {
    const guardian = await getGuardianByEmail(preAuthEmail);
    if (!guardian) return NextResponse.redirect(accessUrl("nao-autorizado"));
    const host = request.headers.get("host") ?? request.nextUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.slice(0, -1);
    const demoOrigin = `${protocol}://${host}`;
    const response = NextResponse.redirect(
      new URL(guardian.statusPagamento === "pago" ? "/alunos" : "/pagamento-pendente", demoOrigin),
    );
    const session = createGuardianSessionCookie(guardian.id);
    response.cookies.set(session.name, session.value, session.options);
    const cleared = clearGuardianPreAuthCookie();
    response.cookies.set(cleared.name, cleared.value, cleared.options);
    response.headers.set("cache-control", "private, no-store");
    return response;
  }

  const provider = parseOAuthProvider(requestedProvider);
  if (!provider) return NextResponse.redirect(accessUrl("provedor"));

  const response = NextResponse.redirect(accessUrl("oauth"));
  try {
    const supabase = createOAuthClient(request, response);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: new URL("/auth/callback", env.appUrl).toString(),
        skipBrowserRedirect: true,
        scopes: "openid email profile",
      },
    });
    if (error || !data.url) return response;
    response.headers.set("location", data.url);
    return response;
  } catch {
    return NextResponse.redirect(accessUrl("configuracao"));
  }
}
