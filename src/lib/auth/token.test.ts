import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/token";

const secret = "test-secret-with-more-than-thirty-two-characters";

describe("session token", () => {
  it("valida assinatura, papel e validade", () => {
    const now = Date.parse("2026-07-15T12:00:00Z");
    const token = signToken("guardian-id", "guardian", secret, 60, now);
    expect(verifyToken(token, "guardian", secret, now + 30_000)?.sub).toBe("guardian-id");
    expect(verifyToken(token, "admin", secret, now + 30_000)).toBeNull();
    expect(verifyToken(token, "guardian", secret, now + 61_000)).toBeNull();
  });

  it("rejeita conteúdo adulterado", () => {
    const token = signToken("guardian-id", "guardian", secret, 60);
    const [payload, signature] = token.split(".");
    expect(verifyToken(`${payload}x.${signature}`, "guardian", secret)).toBeNull();
  });

  it("separa a pré-autorização da sessão autenticada", () => {
    const token = signToken("familia@example.com", "guardian-preauth", secret, 600);
    expect(verifyToken(token, "guardian-preauth", secret)?.sub).toBe("familia@example.com");
    expect(verifyToken(token, "guardian", secret)).toBeNull();
  });
});
