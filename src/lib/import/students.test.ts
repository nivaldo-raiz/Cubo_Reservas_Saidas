import { describe, expect, it } from "vitest";
import { parseStudentHtml, StudentImportError } from "@/lib/import/students";

function sheet(rows: string) {
  return `<table>
    <thead><tr><th></th><th>E</th><th>F</th><th>G</th></tr></thead>
    <tbody>
      <tr><th>1</th><td>Aluno</td><td>Responsável</td><td>Email Responsável</td></tr>
      ${rows}
    </tbody>
  </table>`;
}

describe("parseStudentHtml", () => {
  it("extrai somente os campos mínimos e remove duplicatas", () => {
    const result = parseStudentHtml(
      sheet(`
        <tr><th>2</th><td>Ana Exemplo</td><td>Maria Exemplo</td><td> MARIA@EXAMPLE.COM </td></tr>
        <tr><th>3</th><td>Ana Exemplo</td><td>Maria Exemplo</td><td>maria@example.com</td></tr>
      `),
    );
    expect(result.records).toEqual([
      {
        criancaNome: "Ana Exemplo",
        responsavelNome: "Maria Exemplo",
        responsavelEmail: "maria@example.com",
      },
    ]);
    expect(result.duplicateRows).toBe(1);
  });

  it("rejeita o arquivo inteiro quando há linha inválida", () => {
    expect(() =>
      parseStudentHtml(
        sheet("<tr><th>2</th><td>Ana Exemplo</td><td></td><td>email-invalido</td></tr>"),
      ),
    ).toThrow(StudentImportError);
  });
});
