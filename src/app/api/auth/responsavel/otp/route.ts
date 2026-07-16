import { z } from "zod";
import { setOtpChallenge } from "@/lib/auth/cookies";
import { issueOtp } from "@/lib/auth/otp";
import { errorResponse, hasValidOrigin } from "@/lib/http";

const requestSchema = z.object({ email: z.string().trim().email().max(254) });
const publicMessage =
  "Caso o e-mail esteja cadastrado, enviaremos um código de acesso.";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Informe um e-mail válido.", 400);

  await setOtpChallenge(parsed.data.email.trim().toLocaleLowerCase("pt-BR"));
  try {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const result = await issueOtp(parsed.data.email, forwarded ?? null);
    return Response.json(
      { message: publicMessage, demoCode: result.demoCode },
      { status: 202 },
    );
  } catch {
    console.error("Falha ao processar solicitação de OTP.");
    return Response.json({ message: publicMessage }, { status: 202 });
  }
}
