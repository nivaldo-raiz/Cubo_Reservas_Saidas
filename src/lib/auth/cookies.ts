import { cookies } from "next/headers";
import { env, requireSecret } from "@/lib/env";
import { signToken, verifyToken } from "@/lib/auth/token";

const GUARDIAN_COOKIE = "cubo_guardian_session";
const ADMIN_COOKIE = "cubo_admin_session";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.appEnv !== "local",
  path: "/",
};

export function createGuardianSessionCookie(responsavelId: string) {
  const ttl = env.guardianSessionDays * 24 * 60 * 60;
  const secret = requireSecret(env.guardianSessionSecret, "GUARDIAN_SESSION_SECRET");
  return {
    name: GUARDIAN_COOKIE,
    value: signToken(responsavelId, "guardian", secret, ttl),
    options: { ...cookieBase, maxAge: ttl },
  };
}

export function clearGuardianSessionCookie() {
  return {
    name: GUARDIAN_COOKIE,
    value: "",
    options: { ...cookieBase, maxAge: 0 },
  };
}

export async function setGuardianSession(responsavelId: string) {
  const session = createGuardianSessionCookie(responsavelId);
  const jar = await cookies();
  jar.set(session.name, session.value, session.options);
}

export async function readGuardianSession() {
  const secret = requireSecret(env.guardianSessionSecret, "GUARDIAN_SESSION_SECRET");
  const jar = await cookies();
  return verifyToken(jar.get(GUARDIAN_COOKIE)?.value, "guardian", secret)?.sub ?? null;
}

export async function setAdminSession(adminId: string) {
  const ttl = env.adminSessionHours * 60 * 60;
  const secret = requireSecret(env.adminSessionSecret, "ADMIN_SESSION_SECRET");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signToken(adminId, "admin", secret, ttl), {
    ...cookieBase,
    maxAge: ttl,
  });
}

export async function readAdminSession() {
  const secret = requireSecret(env.adminSessionSecret, "ADMIN_SESSION_SECRET");
  const jar = await cookies();
  return verifyToken(jar.get(ADMIN_COOKIE)?.value, "admin", secret)?.sub ?? null;
}

export async function clearGuardianSession() {
  const jar = await cookies();
  jar.delete(GUARDIAN_COOKIE);
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
