"use client";

import { LogIn, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { oauthErrorMessage } from "@/lib/auth/oauth";

export function OAuthAccess({
  demoMode,
  errorCode,
}: {
  demoMode: boolean;
  errorCode?: string;
}) {
  const providerError = oauthErrorMessage(errorCode);
  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [error, setError] = useState(providerError ?? "");
  const [loading, setLoading] = useState(false);

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/responsavel/verificar-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { email?: string; error?: string };
      if (!response.ok || !result.email) {
        setError(result.error ?? "Não foi possível verificar o e-mail.");
        return;
      }
      setVerifiedEmail(result.email);
    } catch {
      setError("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  if (!verifiedEmail) {
    return (
      <form className="form-stack" onSubmit={verifyEmail}>
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
          {loading ? "Verificando..." : "Continuar"}
        </button>
        <p className="oauth-note">
          <ShieldCheck size={18} aria-hidden="true" />
          Primeiro verificamos se o e-mail pertence a um responsável cadastrado.
        </p>
      </form>
    );
  }

  return (
    <div className="form-stack">
      <p className="form-message form-message--info">
        E-mail autorizado: <strong>{verifiedEmail}</strong>
      </p>
      {demoMode ? (
        <a className="button button--primary button--full" href="/api/auth/responsavel/oauth?provider=demo">
          <LogIn size={18} aria-hidden="true" /> Entrar na demonstração
        </a>
      ) : (
        <div className="oauth-buttons">
          <a className="button button--full oauth-button" href="/api/auth/responsavel/oauth?provider=google">
            Continuar com Google
          </a>
          <a className="button button--full oauth-button oauth-button--microsoft" href="/api/auth/responsavel/oauth?provider=azure">
            Continuar com Microsoft
          </a>
        </div>
      )}
      <button
        className="button button--secondary button--full"
        type="button"
        onClick={() => { setVerifiedEmail(""); setError(""); }}
      >
        Usar outro e-mail
      </button>
      <p className="oauth-note">
        <ShieldCheck size={18} aria-hidden="true" />
        O Google ou a Microsoft deve confirmar exatamente o mesmo e-mail informado acima.
      </p>
    </div>
  );
}
