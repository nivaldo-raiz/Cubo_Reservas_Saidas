import { AdminLoginForm } from "@/components/admin-login-form";
import { SiteHeader } from "@/components/site-header";

export default function AdminAccessPage() {
  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Início" />
      <section className="app-background">
        <div className="auth-shell panel">
          <p className="eyebrow">Acesso administrativo</p>
          <h1>Painel de pagamentos</h1>
          <p className="panel__lead">Acesso exclusivo do time de vendas.</p>
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
