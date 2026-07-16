"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/responsavel/otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json()) as { error?: string; demoCode?: string | null };
      if (!response.ok) {
        setError(body.error ?? "Não foi possível solicitar o código.");
        return;
      }
      router.push(body.demoCode ? `/acesso/codigo?demo=${body.demoCode}` : "/acesso/codigo");
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="email">E-mail do responsável</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          required
        />
      </div>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      <button className="button button--primary button--full" disabled={loading} type="submit">
        {loading ? "Solicitando..." : "Receber código de acesso"}
      </button>
      <p className="form-message form-message--info">
        Caso o e-mail esteja cadastrado, enviaremos um código de acesso.
      </p>
    </form>
  );
}
