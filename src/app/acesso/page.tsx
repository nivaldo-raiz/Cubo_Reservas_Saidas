import { OAuthAccess } from "@/components/oauth-access";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/lib/env";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Voltar" />
      <section className="app-background">
        <div className="auth-shell panel">
          <p className="eyebrow">Acesso do responsável</p>
          <h1>Entre com sua conta</h1>
          <p className="panel__lead">
            Use Google ou Microsoft com o mesmo e-mail informado na inscrição da viagem.
          </p>
          <OAuthAccess demoMode={env.demoMode} errorCode={erro} />
        </div>
      </section>
    </main>
  );
}
