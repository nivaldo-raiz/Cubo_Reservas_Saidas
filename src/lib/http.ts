import { env } from "@/lib/env";

export function hasValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;
  if (originUrl.host === host && originUrl.protocol === protocol) return true;

  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  return (
    env.appEnv === "local" &&
    localHosts.has(originUrl.hostname) &&
    localHosts.has(requestUrl.hostname) &&
    originUrl.port === requestUrl.port
  );
}

export function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
