import { LogoutButton } from "@/components/logout-button";
import { PaymentTable } from "@/components/payment-table";
import { requireAdmin } from "@/lib/auth/guards";
import { listGuardians } from "@/lib/repository";

export default async function AdminPage() {
  await requireAdmin();
  const guardians = await listGuardians();
  return (
    <main className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__inner"><strong>Cubo | Administração</strong><LogoutButton kind="admin" /></div>
      </header>
      <section className="admin-main">
        <div className="page-heading">
          <div><p className="eyebrow">Controle de acesso</p><h1>Pagamentos</h1><p>A alteração libera ou bloqueia o responsável imediatamente.</p></div>
        </div>
        <PaymentTable initialGuardians={guardians} />
      </section>
    </main>
  );
}
