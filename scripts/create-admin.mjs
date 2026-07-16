import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

if (!url || !serviceRoleKey || !email || !password) {
  console.error(
    "Defina a URL e a chave secreta do Supabase, ADMIN_BOOTSTRAP_EMAIL e ADMIN_BOOTSTRAP_PASSWORD.",
  );
  process.exit(1);
}

if (password.length < 12) {
  console.error("ADMIN_BOOTSTRAP_PASSWORD deve ter pelo menos 12 caracteres.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const hash = await bcrypt.hash(password, 12);
const { error } = await supabase.from("admins").insert({ email, senha_hash: hash });

if (error) {
  console.error(`Não foi possível criar o admin: ${error.message}`);
  process.exit(1);
}

console.log(`Admin criado para ${email}. Remova as variáveis ADMIN_BOOTSTRAP_* do ambiente.`);
