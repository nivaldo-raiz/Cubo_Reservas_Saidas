"use client";

import { useState } from "react";
import type { GuardianListItem, PaymentStatus } from "@/lib/types";

export function PaymentTable({ initialGuardians }: { initialGuardians: GuardianListItem[] }) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, PaymentStatus>>({});
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const guardians = initialGuardians.map((guardian) => ({
    ...guardian,
    statusPagamento: statusOverrides[guardian.id] ?? guardian.statusPagamento,
  }));

  async function toggle(id: string, current: PaymentStatus) {
    setPendingId(id);
    setError("");
    const next: PaymentStatus = current === "pago" ? "pendente" : "pago";
    try {
      const response = await fetch(`/api/admin/responsaveis/${id}/pagamento`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ statusPagamento: next }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Não foi possível atualizar.");
      setStatusOverrides((items) => ({ ...items, [id]: next }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível atualizar.");
    } finally {
      setPendingId("");
    }
  }

  const paid = guardians.filter((item) => item.statusPagamento === "pago").length;

  return (
    <>
      <div className="metric-row">
        <div className="metric"><span>Responsáveis</span><strong>{guardians.length}</strong></div>
        <div className="metric"><span>Pagamentos confirmados</span><strong>{paid}</strong></div>
        <div className="metric"><span>Pagamentos pendentes</span><strong>{guardians.length - paid}</strong></div>
      </div>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Responsável</th><th>Crianças</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            {guardians.map((guardian) => (
              <tr key={guardian.id}>
                <td><strong>{guardian.nome}</strong><br /><small>{guardian.email}</small></td>
                <td>{guardian.criancas.join(", ") || "Nenhuma"}</td>
                <td><span className={`status-pill status-pill--${guardian.statusPagamento === "pago" ? "paid" : "pending"}`}>{guardian.statusPagamento === "pago" ? "Pago" : "Pendente"}</span></td>
                <td>
                  <button className="switch-button" data-paid={guardian.statusPagamento === "pago"} disabled={pendingId === guardian.id} type="button" onClick={() => toggle(guardian.id, guardian.statusPagamento)}>
                    {pendingId === guardian.id ? "Salvando..." : guardian.statusPagamento === "pago" ? "Marcar pendente" : "Marcar pago"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
