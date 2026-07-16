import { LogIn, ShieldCheck } from "lucide-react";
import { oauthErrorMessage } from "@/lib/auth/oauth";

export function OAuthAccess({
  demoMode,
  errorCode,
}: {
  demoMode: boolean;
  errorCode?: string;
}) {
  const error = oauthErrorMessage(errorCode);

  return (
    <div className="form-stack">
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
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
      <p className="oauth-note">
        <ShieldCheck size={18} aria-hidden="true" />
        O acesso só é liberado quando o e-mail confirmado pelo provedor está na lista de responsáveis.
      </p>
    </div>
  );
}
