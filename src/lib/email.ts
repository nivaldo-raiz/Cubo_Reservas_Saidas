import { Resend } from "resend";
import { env } from "@/lib/env";

export async function sendOtpEmail(email: string, code: string) {
  if (env.demoMode) return;
  if (!env.resendApiKey || !env.emailFrom) {
    throw new Error("RESEND_API_KEY e EMAIL_FROM são obrigatórios em produção.");
  }

  const resend = new Resend(env.resendApiKey);
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: "Seu código de acesso | Cubo Global School",
    html: `
      <div style="font-family:Arial,sans-serif;color:#101828;line-height:1.5">
        <h1 style="font-size:22px">Código de acesso</h1>
        <p>Use o código abaixo para acessar a escolha de assento:</p>
        <p style="font-size:30px;font-weight:700">${code}</p>
        <p>O código vale por 10 minutos e pode ser utilizado uma única vez.</p>
        <p>Se você não solicitou este acesso, ignore esta mensagem.</p>
      </div>
    `,
  });
  if (error) throw new Error(`Falha no envio de e-mail: ${error.message}`);
}
