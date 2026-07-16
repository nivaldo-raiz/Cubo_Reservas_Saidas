import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const highlights = [
  {
    icon: CalendarDays,
    title: "18 a 22 de novembro",
    description: "Janela de escolha aberta até 30 de setembro.",
  },
  {
    icon: MapPin,
    title: "NR Sapucaí Mirim",
    description: "Programa English & Action.",
  },
  {
    icon: ShieldCheck,
    title: "Acesso protegido",
    description: "Identidade confirmada por Google ou Microsoft.",
  },
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="hero">
        <div className="hero__ring" aria-hidden="true" />
        <div className="page-shell hero__content">
          <p className="eyebrow eyebrow--light">Viagem pedagógica 2026</p>
          <h1>Sua jornada começa antes do embarque.</h1>
          <p className="hero__lead">
            Escolha o assento, confira as orientações e deixe tudo pronto para o NR
            English &amp; Action.
          </p>
          <Link className="button button--light" href="/acesso">
            Acessar escolha <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="home-details" aria-label="Informações da viagem">
        <div className="page-shell">
          <div className="highlight-grid">
            {highlights.map(({ icon: Icon, title, description }) => (
              <article className="highlight-card" key={title}>
                <Icon size={24} aria-hidden="true" />
                <h2>{title}</h2>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="steps-band">
            <div>
              <p className="eyebrow">Simples e transparente</p>
              <h2>Resolva em poucos minutos</h2>
              <p>
                Identifique o aluno, confirme os dados, escolha um assento disponível e
                registre sua ciência.
              </p>
            </div>
            <ol>
              <li>Entre com Google ou Microsoft</li>
              <li>Confirme o e-mail cadastrado</li>
              <li>Escolha e confirme o assento</li>
              <li>Receba sua confirmação</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
