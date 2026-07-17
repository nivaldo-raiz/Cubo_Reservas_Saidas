import { createExcelCsv, type CsvValue } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";
import { getApiAdmin } from "@/lib/auth/api";
import { getTripExportData } from "@/lib/repository";

function formatConfirmations(values: string[]) {
  return values.map(formatDateTime).join(" | ");
}

export async function GET() {
  if (!(await getApiAdmin())) {
    return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const data = await getTripExportData();
  const rows: CsvValue[][] = [
    ["RESUMO DOS ÔNIBUS"],
    [
      "ID do ônibus",
      "Ônibus",
      "Capacidade",
      "Alunos atribuídos",
      "Assentos escolhidos",
      "Assentos disponíveis",
      "Assentos da equipe",
    ],
    ...data.buses.map((bus) => [
      bus.id,
      bus.name,
      bus.capacity,
      bus.assignedStudents,
      bus.selectedSeats,
      bus.availableSeats,
      bus.teamSeatNumbers.map((number) => String(number).padStart(2, "0")).join(", "),
    ]),
    [],
    ["ALUNOS E RESPONSÁVEIS"],
    [
      "ID do aluno",
      "Aluno",
      "ID do responsável",
      "Responsável",
      "E-mail do responsável",
      "Pagamento",
      "ID do ônibus",
      "Ônibus",
      "Capacidade do ônibus",
      "ID do assento",
      "Assento",
      "Situação do assento",
      "Confirmação dos documentos",
      "Revisão do assento",
      "Confirmação final",
      "Responsável cadastrado em",
    ],
    ...data.students.map((student) => [
      student.studentId,
      student.studentName,
      student.guardianId,
      student.guardianName,
      student.guardianEmail,
      student.paymentStatus === "pago" ? "Pago" : "Pendente",
      student.busId,
      student.busName,
      student.busCapacity,
      student.seatId,
      student.seatNumber === null ? "" : String(student.seatNumber).padStart(2, "0"),
      student.seatNumber === null ? "Aguardando escolha" : "Assento escolhido",
      formatConfirmations(student.confirmations.antes_da_escolha),
      formatConfirmations(student.confirmations.revisao_do_assento),
      formatConfirmations(student.confirmations.confirmacao_final),
      formatDateTime(student.guardianCreatedAt),
    ]),
    [],
    ["PROFESSORES / EQUIPE"],
    ["ID", "Nome", "CPF", "Sexo", "Data de nascimento", "Ativo"],
    ...data.teachers.map((teacher) => [
      teacher.id,
      teacher.name,
      teacher.cpf ? `'${teacher.cpf}` : "",
      teacher.gender,
      teacher.birthDate,
      teacher.active ? "Sim" : "Não",
    ]),
  ];

  if (data.teachers.length === 0) rows.push(["Nenhum professor cadastrado."]);

  const date = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  return new Response(createExcelCsv(rows), {
    headers: {
      "cache-control": "private, no-store",
      "content-disposition": `attachment; filename="cubo-viagem-${date}.csv"`,
      "content-type": "text/csv; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}
