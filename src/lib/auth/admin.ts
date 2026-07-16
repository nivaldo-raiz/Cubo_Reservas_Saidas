import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import { normalizeEmail } from "@/lib/format";
import { getAdminByEmail } from "@/lib/repository";

export async function authenticateAdmin(rawEmail: string, password: string) {
  const email = normalizeEmail(rawEmail);

  if (env.demoMode) {
    if (!env.demoAdminEmail || !env.demoAdminPassword) return null;
    const demoHash = await bcrypt.hash(env.demoAdminPassword, 10);
    const valid =
      email === normalizeEmail(env.demoAdminEmail) &&
      (await bcrypt.compare(password, demoHash));
    return valid ? { id: "admin-demo", email } : null;
  }

  const admin = await getAdminByEmail(email);
  if (!admin || !(await bcrypt.compare(password, admin.senhaHash))) return null;
  return { id: admin.id, email: admin.email };
}
