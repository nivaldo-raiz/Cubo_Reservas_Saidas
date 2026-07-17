"use client";

import { ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";

export function GuardianAccess() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/responsavel/verificar-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { destino?: string; error?: string };
      if (!response.ok || !result.destino) {
        setError(result.error ?? "Não foi possível verificar o e-mail.");
        return;
      }
      window.location.assign(result.destino);
    } catch {
      setError("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={enter}>
      <div className="field">
        <label htmlFor="guardian-email">E-mail do responsável</label>
        <input
          id="guardian-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      <button className="button button--primary button--full" type="submit" disabled={loading}>
        {loading ? "Verificando..." : "Entrar"}
      </button>
      <p className="access-note">
        <ShieldCheck size={18} aria-hidden="true" />
        O acesso é liberado somente para e-mails cadastrados como responsáveis da viagem.
      </p>
    </form>
  );
}
