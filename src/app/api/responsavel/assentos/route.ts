import { z } from "zod";
import { getApiGuardian } from "@/lib/auth/api";
import { errorResponse, hasValidOrigin } from "@/lib/http";
import { DomainError, getBusesWithSeats, reserveSeat } from "@/lib/repository";

const requestSchema = z.object({
  criancaId: z.string().min(1).max(100),
  assentoId: z.string().min(1).max(100),
});

export async function GET() {
  const auth = await getApiGuardian();
  if (!auth.guardian) return errorResponse("Acesso não autorizado.", auth.status);
  return Response.json({ onibus: await getBusesWithSeats() });
}

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  const auth = await getApiGuardian();
  if (!auth.guardian) return errorResponse("Acesso não autorizado.", auth.status);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Dados de assento inválidos.", 400);

  try {
    await reserveSeat(auth.guardian.id, parsed.data.criancaId, parsed.data.assentoId);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      const conflict = error.code === "SEAT_TAKEN" || error.code === "CHILD_ALREADY_SEATED";
      return errorResponse(
        conflict
          ? "Este assento acabou de ser escolhido por outro participante. Selecione outra opção."
          : error.message,
        conflict ? 409 : 403,
      );
    }
    throw error;
  }
}
