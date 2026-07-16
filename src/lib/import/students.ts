import { load } from "cheerio";
import { normalizeEmail } from "@/lib/format";

export interface StudentImportRecord {
  criancaNome: string;
  responsavelNome: string;
  responsavelEmail: string;
}

export interface ParsedStudentImport {
  records: StudentImportRecord[];
  duplicateRows: number;
}

export class StudentImportError extends Error {
  constructor(
    message: string,
    public readonly invalidRows: number[] = [],
  ) {
    super(message);
  }
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanCell(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  return headers.findIndex((header) => candidates.includes(header));
}

export function parseStudentHtml(html: string): ParsedStudentImport {
  const $ = load(html);
  const rows = $("table").first().find("tr").toArray();
  if (rows.length === 0) throw new StudentImportError("O arquivo não contém uma tabela.");

  let headerRowIndex = -1;
  let indexes: { child: number; guardian: number; email: number } | null = null;

  rows.some((row, rowIndex) => {
    const headers = $(row)
      .find("th,td")
      .toArray()
      .map((cell) => normalizeHeader($(cell).text()));
    const child = findHeaderIndex(headers, ["aluno", "nome do aluno"]);
    const guardian = findHeaderIndex(headers, ["responsavel", "nome do responsavel"]);
    const email = findHeaderIndex(headers, ["email responsavel", "e-mail responsavel"]);
    if (child >= 0 && guardian >= 0 && email >= 0) {
      headerRowIndex = rowIndex;
      indexes = { child, guardian, email };
      return true;
    }
    return false;
  });

  if (!indexes || headerRowIndex < 0) {
    throw new StudentImportError(
      "Cabeçalhos obrigatórios não encontrados: Aluno, Responsável e Email Responsável.",
    );
  }

  const resolvedIndexes = indexes as { child: number; guardian: number; email: number };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const records: StudentImportRecord[] = [];
  const invalidRows: number[] = [];
  let duplicateRows = 0;
  const seen = new Set<string>();

  rows.slice(headerRowIndex + 1).forEach((row, relativeIndex) => {
    const cells = $(row)
      .find("th,td")
      .toArray()
      .map((cell) => cleanCell($(cell).text()));
    if (!cells.some(Boolean)) return;

    const criancaNome = cells[resolvedIndexes.child] ?? "";
    const responsavelNome = cells[resolvedIndexes.guardian] ?? "";
    const responsavelEmail = normalizeEmail(cells[resolvedIndexes.email] ?? "");
    const displayedRow = headerRowIndex + relativeIndex + 2;

    if (!criancaNome || !responsavelNome || !emailPattern.test(responsavelEmail)) {
      invalidRows.push(displayedRow);
      return;
    }

    const key = `${responsavelEmail}|${criancaNome.toLocaleLowerCase("pt-BR")}`;
    if (seen.has(key)) {
      duplicateRows += 1;
      return;
    }
    seen.add(key);
    records.push({ criancaNome, responsavelNome, responsavelEmail });
  });

  if (invalidRows.length > 0) {
    throw new StudentImportError(
      "Existem linhas sem criança, responsável ou e-mail válido.",
      invalidRows,
    );
  }
  if (records.length === 0) throw new StudentImportError("Nenhum aluno válido encontrado.");

  return { records, duplicateRows };
}
