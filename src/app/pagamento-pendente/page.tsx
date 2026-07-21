import { redirect } from "next/navigation";
import { CreditCard } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { SiteHeader } from "@/components/site-header";
import { requireGuardian } from "@/lib/auth/guards";

export default async function PendingPaymentPage() {
  const guardian = await requireGuardian();
  if (guardian.statusPagamento === "pago") redirect("/alunos");

  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Início" />
      <section className="app-background">
        <div className="auth-shell panel">
          <div className="success-mark" style={{ background: "#8a4b08" }}>
            <CreditCard aria-hidden="true" />
          </div>
          <p className="eyebrow">Acesso aguardando liberação</p>
          <h1>Pagamento pendente</h1>
          <p className="panel__lead">
            Olá, {guardian.nome}. Seu acesso ainda está aguardando liberação. Tente
            novamente mais tarde ou entre em contato com a escola.
          </p>
          <div className="flow-actions">
            <LogoutButton />
            <a className="button button--primary" href="/pagamento-pendente">Verificar novamente</a>
          </div>
        </div>
      </section>
    </main>
  );
}
