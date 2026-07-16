import { CodeForm } from "@/components/code-form";
import { SiteHeader } from "@/components/site-header";

export default async function CodePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const demoCode = /^\d{6}$/.test(demo ?? "") ? demo : undefined;
  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Início" />
      <section className="app-background">
        <div className="auth-shell panel">
          <p className="eyebrow">Confirmação de acesso</p>
          <h1>Digite o código recebido</h1>
          <p className="panel__lead">
            O código tem seis dígitos, vale por 10 minutos e pode ser usado uma vez.
          </p>
          <CodeForm demoCode={demoCode} />
        </div>
      </section>
    </main>
  );
}
