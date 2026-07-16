import { AccessForm } from "@/components/access-form";
import { SiteHeader } from "@/components/site-header";

export default function AccessPage() {
  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Voltar" />
      <section className="app-background">
        <div className="auth-shell panel">
          <p className="eyebrow">Acesso do responsável</p>
          <h1>Entre com seu e-mail</h1>
          <p className="panel__lead">
            Use o e-mail informado na inscrição da viagem. Você receberá um código de
            acesso de uso único.
          </p>
          <AccessForm />
        </div>
      </section>
    </main>
  );
}
