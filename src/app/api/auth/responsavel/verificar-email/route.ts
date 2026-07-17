import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearGuardianSessionCookie,
  createGuardianSessionCookie,
} from "@/lib/auth/cookies";
import { normalizeEmail } from "@/lib/format";
import { hasValidOrigin } from "@/lib/http";
import { getGuardianByEmail } from "@/lib/repository";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const guardian = await getGuardianByEmail(email);
  if (!guardian) {
    const response = NextResponse.json(
      { error: "Você não é um responsável autorizado." },
      { status: 403 },
    );
    const clearedSession = clearGuardianSessionCookie();
    response.cookies.set(clearedSession.name, clearedSession.value, clearedSession.options);
    response.headers.set("cache-control", "private, no-store");
    return response;
  }

  const destino = guardian.statusPagamento === "pago" ? "/alunos" : "/pagamento-pendente";
  const response = NextResponse.json({ ok: true, email, destino });
  const session = createGuardianSessionCookie(guardian.id);
  response.cookies.set(session.name, session.value, session.options);
  response.headers.set("cache-control", "private, no-store");
  return response;
}
