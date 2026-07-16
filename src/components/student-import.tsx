"use client";

import { FormEvent, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportResponse {
  error?: string;
  linhasInvalidas?: number[];
  responsaveisCriados?: number;
  criancasCriadas?: number;
  registrosExistentes?: number;
}

export function StudentImport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/importar/alunos", {
        method: "POST",
        body: data,
      });
      const body = (await response.json()) as ImportResponse;
      if (!response.ok) {
        const rows = body.linhasInvalidas?.length
          ? ` Linhas: ${body.linhasInvalidas.join(", ")}.`
          : "";
        setError(`${body.error ?? "Não foi possível importar."}${rows}`);
        return;
      }
      setSuccess(
        `${body.responsaveisCriados ?? 0} responsáveis e ${body.criancasCriadas ?? 0} crianças criados. ${body.registrosExistentes ?? 0} registros já existiam.`,
      );
      form.reset();
      router.refresh();
    } catch {
      setError("Não foi possível enviar o arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="import-panel" aria-labelledby="import-title">
      <div>
        <h2 id="import-title">Importar alunos</h2>
        <p>Arquivo HTML exportado da planilha. Novos responsáveis entram como pendentes.</p>
      </div>
      <form className="import-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="student-file">Planilha de alunos</label>
          <input id="student-file" name="arquivo" type="file" accept=".html,text/html" required />
        </div>
        <button className="button button--primary" type="submit" disabled={loading}>
          <Upload size={17} aria-hidden="true" /> {loading ? "Importando..." : "Importar"}
        </button>
      </form>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      {success ? <p className="form-message form-message--info" role="status">{success}</p> : null}
    </section>
  );
}
