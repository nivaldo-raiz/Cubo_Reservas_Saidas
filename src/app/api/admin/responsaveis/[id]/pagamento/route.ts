import { z } from "zod";
import { getApiAdmin } from "@/lib/auth/api";
import { errorResponse, hasValidOrigin } from "@/lib/http";
import { updatePaymentStatus } from "@/lib/repository";

const requestSchema = z.object({ statusPagamento: z.enum(["pendente", "pago"]) });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  if (!(await getApiAdmin())) return errorResponse("Acesso não autorizado.", 401);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Status de pagamento inválido.", 400);
  const { id } = await context.params;
  const guardian = await updatePaymentStatus(id, parsed.data.statusPagamento);
  if (!guardian) return errorResponse("Responsável não encontrado.", 404);
  return Response.json({ responsavel: guardian });
}
