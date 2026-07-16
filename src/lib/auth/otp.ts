import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env, requireSecret } from "@/lib/env";
import { normalizeEmail } from "@/lib/format";
import {
  consumeOtp,
  createOtpRecord,
  getGuardianByEmail,
  getLatestOtp,
  incrementOtpAttempts,
} from "@/lib/repository";
import { sendOtpEmail } from "@/lib/email";

const DEMO_OTP = "123456";
const MAX_ATTEMPTS = 5;

function otpHash(email: string, code: string) {
  const pepper = requireSecret(env.otpPepper, "OTP_PEPPER");
  return createHmac("sha256", pepper).update(`${email}:${code}`).digest("hex");
}

function ipHash(ip: string | null) {
  if (!ip) return null;
  const pepper = requireSecret(env.otpPepper, "OTP_PEPPER");
  return createHmac("sha256", pepper).update(`ip:${ip}`).digest("hex");
}

function hashesMatch(expected: string, supplied: string) {
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(supplied, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function issueOtp(rawEmail: string, requestIp: string | null) {
  const email = normalizeEmail(rawEmail);
  const guardian = await getGuardianByEmail(email);
  if (!guardian) return { email, sent: false, demoCode: null };

  const code = env.demoMode ? DEMO_OTP : randomInt(0, 1_000_000).toString().padStart(6, "0");
  const created = await createOtpRecord(
    guardian.id,
    otpHash(email, code),
    new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    ipHash(requestIp),
  );
  if (!created) return { email, sent: false, demoCode: null };

  await sendOtpEmail(email, code);
  return { email, sent: true, demoCode: env.demoMode ? DEMO_OTP : null };
}

export async function validateOtp(rawEmail: string, code: string) {
  const email = normalizeEmail(rawEmail);
  const guardian = await getGuardianByEmail(email);
  if (!guardian) return null;

  if (env.demoMode) return code === DEMO_OTP ? guardian : null;

  const record = await getLatestOtp(guardian.id);
  if (
    !record ||
    record.usado_em ||
    record.tentativas >= MAX_ATTEMPTS ||
    new Date(record.expira_em).getTime() <= Date.now()
  ) {
    return null;
  }

  const valid = hashesMatch(record.codigo_hash, otpHash(email, code));
  if (!valid) {
    await incrementOtpAttempts(record.id);
    return null;
  }

  return (await consumeOtp(record.id)) ? guardian : null;
}
