import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Uso: node scripts/import-guardian-phones.mjs <Alunos.html>");
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseSecret) {
  throw new Error("SUPABASE_URL e SUPABASE_SECRET_KEY são obrigatórias.");
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function usablePhone(value) {
  const phone = value.trim();
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && !/^0+$/.test(digits) ? phone : null;
}

const html = await readFile(sourcePath, "utf8");
const rows = [...html.matchAll(/<tr\b[^>]*>(.*?)<\/tr>/gis)];
const phonesByEmail = new Map();

for (const row of rows) {
  const cells = [...row[1].matchAll(/<td\b[^>]*>(.*?)<\/td>/gis)].map((cell) =>
    decodeHtml(cell[1]),
  );
  if (cells.length < 14 || cells[0] === "Aluno") continue;

  const email = cells[13].trim().toLocaleLowerCase("pt-BR");
  const phone = usablePhone(cells[11]) ?? usablePhone(cells[12]);
  if (!email || !phone) continue;

  const existing = phonesByEmail.get(email);
  if (existing && existing !== phone) {
    throw new Error(`Telefones divergentes para o mesmo e-mail: ${email}`);
  }
  phonesByEmail.set(email, phone);
}

const supabase = createClient(supabaseUrl, supabaseSecret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let updated = 0;
let unmatched = 0;

for (const [email, telefone] of phonesByEmail) {
  const { data, error } = await supabase
    .from("responsaveis")
    .update({ telefone })
    .eq("email", email)
    .select("id");
  if (error) throw new Error(`Falha ao atualizar telefone: ${error.message}`);
  if (data.length === 0) unmatched += 1;
  else updated += data.length;
}

console.log(JSON.stringify({ encontrados: phonesByEmail.size, atualizados: updated, naoEncontrados: unmatched }));
