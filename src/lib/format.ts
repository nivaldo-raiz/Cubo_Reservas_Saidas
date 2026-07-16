export function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("pt-BR");
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
