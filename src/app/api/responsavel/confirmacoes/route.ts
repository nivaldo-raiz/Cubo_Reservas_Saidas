import { z } from "zod";
import { getApiGuardian } from "@/lib/auth/api";
import { errorResponse, hasValidOrigin } from "@/lib/http";
import { recordConfirmation } from "@/lib/repository";

const requestSchema = z.object({
  etapa: z.enum(["antes_da_escolha", "revisao_do_assento", "confirmacao_final"]),
});

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  const auth = await getApiGuardian();
  if (!auth.guardian) return errorResponse("Acesso não autorizado.", auth.status);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Etapa de confirmação inválida.", 400);
  await recordConfirmation(auth.guardian.id, parsed.data.etapa);
  return Response.json({ ok: true }, { status: 201 });
}
