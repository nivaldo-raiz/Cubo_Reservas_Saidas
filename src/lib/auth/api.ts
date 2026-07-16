import { readAdminSession, readGuardianSession } from "@/lib/auth/cookies";
import { adminExists, getGuardianById } from "@/lib/repository";

export async function getApiGuardian(requirePaid = true) {
  const id = await readGuardianSession();
  if (!id) return { guardian: null, status: 401 as const };
  const guardian = await getGuardianById(id);
  if (!guardian) return { guardian: null, status: 401 as const };
  if (requirePaid && guardian.statusPagamento !== "pago") {
    return { guardian: null, status: 403 as const };
  }
  return { guardian, status: 200 as const };
}

export async function getApiAdmin() {
  const id = await readAdminSession();
  if (!id || !(await adminExists(id))) return null;
  return id;
}
