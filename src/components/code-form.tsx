"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CodeForm({ demoCode = "" }: { demoCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/responsavel/verificar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ codigo: code }),
      });
      const body = (await response.json()) as {
        error?: string;
        statusPagamento?: "pendente" | "pago";
      };
      if (!response.ok) {
        setError(body.error ?? "Código inválido ou expirado.");
        return;
      }
      router.replace(body.statusPagamento === "pago" ? "/alunos" : "/pagamento-pendente");
      router.refresh();
    } catch {
      setError("Não foi possível validar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit} noValidate>
      {demoCode ? (
        <p className="form-message form-message--info">
          Modo demonstrativo: use o código <strong>{demoCode}</strong>.
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="codigo">Código de seis dígitos</label>
        <input
          className="otp-input"
          id="codigo"
          name="codigo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={Boolean(error)}
          required
        />
      </div>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      <button className="button button--primary button--full" disabled={loading || code.length !== 6} type="submit">
        {loading ? "Validando..." : "Validar e acessar"}
      </button>
      <Link className="muted-link" href="/acesso">Corrigir e-mail ou solicitar novo código</Link>
    </form>
  );
}
