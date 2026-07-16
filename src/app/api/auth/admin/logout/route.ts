import { clearAdminSession } from "@/lib/auth/cookies";
import { errorResponse, hasValidOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  await clearAdminSession();
  return Response.json({ ok: true });
}
