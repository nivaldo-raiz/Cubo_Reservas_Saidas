"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  kind?: "guardian" | "admin";
}

export function LogoutButton({ kind = "guardian" }: LogoutButtonProps) {
  const router = useRouter();

  async function logout() {
    await fetch(`/api/auth/${kind === "admin" ? "admin" : "responsavel"}/logout`, {
      method: "POST",
    });
    router.replace(kind === "admin" ? "/admin-acesso" : "/");
    router.refresh();
  }

  return (
    <button className="button button--secondary" type="button" onClick={logout}>
      <LogOut size={17} aria-hidden="true" /> Sair
    </button>
  );
}
