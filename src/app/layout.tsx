import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escolha de Assento | Cubo Global School",
  description: "Escolha antecipada de assentos para a viagem pedagógica.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
