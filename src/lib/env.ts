const read = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

const readNumber = (name: string, fallback: number) => {
  const value = Number(read(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const env = {
  appEnv: read("APP_ENV") ?? "local",
  appUrl: read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),
  otpPepper: read("OTP_PEPPER"),
  guardianSessionSecret:
    read("GUARDIAN_SESSION_SECRET") ?? read("OTP_PEPPER"),
  adminSessionSecret:
    read("ADMIN_SESSION_SECRET") ??
    (read("DEMO_MODE") === "true" ? read("OTP_PEPPER") : undefined),
  guardianSessionDays: readNumber("GUARDIAN_SESSION_DAYS", 30),
  adminSessionHours: readNumber("ADMIN_SESSION_HOURS", 12),
  resendApiKey: read("RESEND_API_KEY"),
  emailFrom: read("EMAIL_FROM"),
  demoMode: read("DEMO_MODE") === "true",
  demoAdminEmail: read("DEMO_ADMIN_EMAIL"),
  demoAdminPassword: read("DEMO_ADMIN_PASSWORD"),
};

export function requireSecret(value: string | undefined, name: string) {
  if (!value || value.length < 32) {
    throw new Error(`${name} deve ter pelo menos 32 caracteres.`);
  }
  return value;
}

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
