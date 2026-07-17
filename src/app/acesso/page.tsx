import { GuardianAccess } from "@/components/guardian-access";
import { SiteHeader } from "@/components/site-header";

export default function AccessPage() {
  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Voltar" />
      <section className="app-background">
        <div className="auth-shell panel">
          <p className="eyebrow">Acesso do responsável</p>
          <h1>Informe seu e-mail</h1>
          <p className="panel__lead">
            Use o mesmo e-mail cadastrado para a viagem.
          </p>
          <GuardianAccess />
        </div>
      </section>
    </main>
  );
}
