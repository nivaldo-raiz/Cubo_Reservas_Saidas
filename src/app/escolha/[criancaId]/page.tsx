import { notFound } from "next/navigation";
import { SeatSelectionFlow } from "@/components/seat-selection-flow";
import { SiteHeader } from "@/components/site-header";
import { requireGuardian } from "@/lib/auth/guards";
import { getBusesWithSeats, getGuardianChild } from "@/lib/repository";

export default async function SeatSelectionPage({
  params,
}: {
  params: Promise<{ criancaId: string }>;
}) {
  const guardian = await requireGuardian({ paid: true });
  const { criancaId } = await params;
  const [child, buses] = await Promise.all([
    getGuardianChild(guardian.id, criancaId),
    getBusesWithSeats(),
  ]);
  if (!child) notFound();

  return (
    <main>
      <SiteHeader actionHref="/alunos" actionLabel="Minhas crianças" />
      <section className="app-background">
        <div className="flow-shell">
          <SeatSelectionFlow child={child} initialBuses={buses} />
        </div>
      </section>
    </main>
  );
}
