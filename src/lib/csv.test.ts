import { describe, expect, it } from "vitest";
import { createExcelCsv } from "@/lib/csv";

describe("exportação CSV", () => {
  it("gera arquivo compatível com Excel e preserva acentos", () => {
    const csv = createExcelCsv([["Aluno", "Ônibus"], ["João", "Ônibus A"]]);
    expect(csv.startsWith("\uFEFFsep=;\r\n")).toBe(true);
    expect(csv).toContain('"João";"Ônibus A"');
  });

  it("escapa aspas e bloqueia fórmulas vindas dos dados", () => {
    const csv = createExcelCsv([["=HYPERLINK(\"https://example.com\")", "+1"]]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+1");
    expect(csv).toContain('""https://example.com""');
  });
});
