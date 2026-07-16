import { z } from "zod";
import { getApiGuardian } from "@/lib/auth/api";
import { errorResponse, hasValidOrigin } from "@/lib/http";
import { DomainError, getBusesWithSeats, getGuardianChild, reserveSeat } from "@/lib/repository";

const requestSchema = z.object({
  criancaId: z.string().min(1).max(100),
  assentoId: z.string().min(1).max(100),
});

export async function GET(request: Request) {
  const auth = await getApiGuardian();
  if (!auth.guardian) return errorResponse("Acesso não autorizado.", auth.status);
  const criancaId = new URL(request.url).searchParams.get("criancaId");
  if (!criancaId || criancaId.length > 100) return errorResponse("Criança inválida.", 400);
  const child = await getGuardianChild(auth.guardian.id, criancaId);
  if (!child) return errorResponse("Criança não encontrada.", 404);
  return Response.json({ onibus: await getBusesWithSeats(child.onibusId) });
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
      if (error.code === "BUS_MISMATCH") {
        return errorResponse("Esta criança só pode escolher um assento no ônibus designado.", 403);
      }
      if (error.code === "SEAT_BLOCKED") {
        return errorResponse("Este assento é reservado para a equipe responsável.", 409);
      }
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
