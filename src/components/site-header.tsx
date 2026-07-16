import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

interface SiteHeaderProps {
  actionHref?: string;
  actionLabel?: string;
}

export function SiteHeader({
  actionHref = "/acesso",
  actionLabel = "Acessar",
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" aria-label="Página inicial">
          <BrandLogo />
        </Link>
        <nav aria-label="Navegação principal">
          <Link className="button button--primary button--small" href={actionHref}>
            {actionLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
