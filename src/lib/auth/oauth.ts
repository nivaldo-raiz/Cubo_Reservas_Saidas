export const oauthProviders = ["google", "azure"] as const;

export type OAuthProvider = (typeof oauthProviders)[number];

export function parseOAuthProvider(value: string | null): OAuthProvider | null {
  return oauthProviders.find((provider) => provider === value) ?? null;
}

export function oauthErrorMessage(code: string | undefined) {
  if (code === "nao-autorizado") {
    return "O e-mail confirmado pelo provedor não está na lista de responsáveis autorizados.";
  }
  if (code === "email-nao-confirmado") {
    return "O provedor não confirmou um e-mail válido para esta conta.";
  }
  if (code === "provedor") {
    return "Selecione Google ou Microsoft para continuar.";
  }
  if (code === "configuracao") {
    return "O login social ainda não está configurado. Fale com a equipe responsável.";
  }
  if (code) return "Não foi possível concluir o login. Tente novamente.";
  return null;
}
