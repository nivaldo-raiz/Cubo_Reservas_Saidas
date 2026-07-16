import { redirect } from "next/navigation";
import { readAdminSession, readGuardianSession } from "@/lib/auth/cookies";
import { adminExists, getGuardianById } from "@/lib/repository";

export async function getAuthenticatedGuardian() {
  const id = await readGuardianSession();
  if (!id) return null;
  return getGuardianById(id);
}

export async function requireGuardian(options: { paid?: boolean } = {}) {
  const guardian = await getAuthenticatedGuardian();
  if (!guardian) redirect("/acesso");
  if (options.paid && guardian.statusPagamento !== "pago") {
    redirect("/pagamento-pendente");
  }
  return guardian;
}

export async function getAuthenticatedAdminId() {
  const id = await readAdminSession();
  if (!id || !(await adminExists(id))) return null;
  return id;
}

export async function requireAdmin() {
  const id = await getAuthenticatedAdminId();
  if (!id) redirect("/admin-acesso");
  return id;
}
