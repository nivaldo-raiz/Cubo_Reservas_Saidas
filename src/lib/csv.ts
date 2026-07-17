export type CsvValue = string | number | boolean | null | undefined;

function escapeCsvValue(value: CsvValue) {
  const raw = value === null || value === undefined ? "" : String(value);
  const formulaSafe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

export function createExcelCsv(rows: CsvValue[][]) {
  const content = rows.map((row) => row.map(escapeCsvValue).join(";")).join("\r\n");
  return `\uFEFFsep=;\r\n${content}\r\n`;
}
