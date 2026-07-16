import { describe, expect, it } from "vitest";
import { oauthErrorMessage, parseOAuthProvider } from "@/lib/auth/oauth";

describe("OAuth de responsáveis", () => {
  it("aceita somente os provedores configurados", () => {
    expect(parseOAuthProvider("google")).toBe("google");
    expect(parseOAuthProvider("azure")).toBe("azure");
    expect(parseOAuthProvider("demo")).toBeNull();
    expect(parseOAuthProvider("https://malicioso.example")).toBeNull();
  });

  it("explica quando o e-mail confirmado não está autorizado", () => {
    expect(oauthErrorMessage("nao-autorizado")).toContain("lista de responsáveis");
  });
});
