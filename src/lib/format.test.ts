import { describe, expect, it } from "vitest";
import { normalizeEmail } from "@/lib/format";

describe("normalizeEmail", () => {
  it("remove espaços e normaliza caixa", () => {
    expect(normalizeEmail("  Familia@Example.COM ")).toBe("familia@example.com");
  });
});
