import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionRole = "guardian" | "admin";

interface SessionPayload {
  sub: string;
  role: SessionRole;
  exp: number;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signToken(
  subject: string,
  role: SessionRole,
  secret: string,
  ttlSeconds: number,
  now = Date.now(),
) {
  const payload = encode(
    JSON.stringify({ sub: subject, role, exp: Math.floor(now / 1000) + ttlSeconds }),
  );
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyToken(
  token: string | undefined,
  expectedRole: SessionRole,
  secret: string,
  now = Date.now(),
) {
  if (!token) return null;

  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;

  const expectedSignature = signature(payload, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      parsed.role !== expectedRole ||
      typeof parsed.sub !== "string" ||
      parsed.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
