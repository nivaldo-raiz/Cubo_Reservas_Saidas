"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Não foi possível entrar.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="field">
        <label htmlFor="admin-email">E-mail</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="admin-password">Senha</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </div>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      <button className="button button--primary button--full" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
