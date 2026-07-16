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
          <h1>Informe seu e-mail</h1>
          <p className="panel__lead">
            Vamos verificar seu cadastro antes de liberar a autenticação com Google ou Microsoft.
          </p>
          <OAuthAccess demoMode={env.demoMode} errorCode={erro} />
        </div>
      </section>
    </main>
  );
}
