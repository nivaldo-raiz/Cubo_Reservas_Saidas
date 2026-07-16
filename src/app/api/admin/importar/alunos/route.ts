import { getApiAdmin } from "@/lib/auth/api";
import { errorResponse, hasValidOrigin } from "@/lib/http";
import { parseStudentHtml, StudentImportError } from "@/lib/import/students";
import { importStudents } from "@/lib/repository";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return errorResponse("Origem inválida.", 403);
  if (!(await getApiAdmin())) return errorResponse("Acesso não autorizado.", 401);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("arquivo");
  if (!(file instanceof File)) return errorResponse("Selecione um arquivo HTML.", 400);
  if (!file.name.toLowerCase().endsWith(".html")) {
    return errorResponse("O arquivo precisa estar no formato HTML.", 415);
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return errorResponse("O arquivo deve ter no máximo 2 MB.", 413);
  }

  try {
    const parsed = parseStudentHtml(await file.text());
    const imported = await importStudents(parsed.records);
    return Response.json({
      ...imported,
      linhasDuplicadas: parsed.duplicateRows,
      linhasValidas: parsed.records.length,
    });
  } catch (error) {
    if (error instanceof StudentImportError) {
      return Response.json(
        { error: error.message, linhasInvalidas: error.invalidRows.slice(0, 20) },
        { status: 422 },
      );
    }
    throw error;
  }
}
