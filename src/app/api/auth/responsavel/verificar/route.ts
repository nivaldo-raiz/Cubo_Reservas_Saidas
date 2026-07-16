import { z } from "zod";
import {
  clearOtpChallenge,
  readOtpChallenge,
  setGuardianSession,
} from "@/lib/auth/cookies";
import { validateOtp } from "@/lib/auth/otp";
import { errorResponse, hasValidOrigin } from "@/lib/http";

const requestSchema = z.object({ codigo: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Informe o código de seis dígitos.", 400);

  const email = await readOtpChallenge();
  if (!email) return errorResponse("Solicite um novo código de acesso.", 401);

  const guardian = await validateOtp(email, parsed.data.codigo);
  if (!guardian) return errorResponse("Código inválido ou expirado.", 401);

  await setGuardianSession(guardian.id);
  await clearOtpChallenge();
  return Response.json({ statusPagamento: guardian.statusPagamento });
}
