import { z } from "zod";
import { authenticateAdmin } from "@/lib/auth/admin";
import { setAdminSession } from "@/lib/auth/cookies";
import { errorResponse, hasValidOrigin } from "@/lib/http";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
  senha: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Credenciais inválidas.", 400);

  const admin = await authenticateAdmin(parsed.data.email, parsed.data.senha);
  if (!admin) return errorResponse("E-mail ou senha inválidos.", 401);
  await setAdminSession(admin.id);
  return Response.json({ ok: true });
}
