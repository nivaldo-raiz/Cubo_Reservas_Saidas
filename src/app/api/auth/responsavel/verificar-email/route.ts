import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearGuardianPreAuthCookie,
  createGuardianPreAuthCookie,
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
    const cleared = clearGuardianPreAuthCookie();
    response.cookies.set(cleared.name, cleared.value, cleared.options);
    response.headers.set("cache-control", "private, no-store");
    return response;
  }

  const response = NextResponse.json({ ok: true, email });
  const preAuth = createGuardianPreAuthCookie(email);
  response.cookies.set(preAuth.name, preAuth.value, preAuth.options);
  response.headers.set("cache-control", "private, no-store");
  return response;
}
