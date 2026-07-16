import { NextRequest, NextResponse } from "next/server";
import { createGuardianSessionCookie } from "@/lib/auth/cookies";
import { parseOAuthProvider } from "@/lib/auth/oauth";
import { env } from "@/lib/env";
import { createOAuthClient } from "@/lib/supabase/oauth";

function accessUrl(error?: string) {
  const url = new URL("/acesso", env.appUrl);
  if (error) url.searchParams.set("erro", error);
  return url;
}

export async function GET(request: NextRequest) {
  const requestedProvider = request.nextUrl.searchParams.get("provider");
  if (env.demoMode && requestedProvider === "demo") {
    const pending = request.nextUrl.searchParams.get("account") === "pending";
    const host = request.headers.get("host") ?? request.nextUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.slice(0, -1);
    const demoOrigin = `${protocol}://${host}`;
    const response = NextResponse.redirect(
      new URL(pending ? "/pagamento-pendente" : "/alunos", demoOrigin),
    );
    const session = createGuardianSessionCookie(
      pending ? "responsavel-demo-pendente" : "responsavel-demo-pago",
    );
    response.cookies.set(session.name, session.value, session.options);
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
