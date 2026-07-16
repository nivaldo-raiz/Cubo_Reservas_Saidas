import Link from "next/link";
import { ArrowRight, BusFront } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { SiteHeader } from "@/components/site-header";
import { requireGuardian } from "@/lib/auth/guards";
import { getGuardianChildren } from "@/lib/repository";

export default async function StudentsPage() {
  const guardian = await requireGuardian({ paid: true });
  const children = await getGuardianChildren(guardian.id);

  return (
    <main>
      <SiteHeader actionHref="/" actionLabel="Início" />
      <section className="app-background">
        <div className="content-shell">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Responsável autenticado</p>
              <h1>Olá, {guardian.nome}</h1>
              <p>Selecione a criança para continuar a escolha de assento.</p>
            </div>
            <LogoutButton />
          </div>
          {children.length ? (
            <div className="student-grid">
              {children.map((child) => (
                <article className="student-card" key={child.id}>
                  <BusFront size={24} color="#463292" aria-hidden="true" />
                  <h2>{child.nome}</h2>
                  <p>
                    {child.assento
                      ? `${child.assento.onibusNome}, assento ${child.assento.numero}`
                      : "Assento ainda não escolhido"}
                  </p>
                  <Link className="button button--primary" href={`/escolha/${child.id}`}>
                    {child.assento ? "Ver confirmação" : "Escolher assento"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel">
              <h2>Nenhuma criança vinculada</h2>
              <p>Entre em contato com a escola para revisar os dados da inscrição.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
