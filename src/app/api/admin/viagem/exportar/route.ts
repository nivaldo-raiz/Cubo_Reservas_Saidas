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
      "Ônibus",
      "Capacidade",
      "Alunos atribuídos",
      "Assentos escolhidos",
      "Assentos disponíveis",
      "Assentos da equipe",
    ],
    ...data.buses.map((bus) => [
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
      "Aluno",
      "Responsável",
      "E-mail do responsável",
      "Telefone do responsável",
      "Pagamento",
      "Ônibus",
      "Capacidade do ônibus",
      "Assento",
      "Situação do assento",
      "Confirmação dos documentos",
      "Revisão do assento",
      "Confirmação final",
      "Responsável cadastrado em",
    ],
    ...data.students.map((student) => [
      student.studentName,
      student.guardianName,
      student.guardianEmail,
      student.guardianPhone,
      student.paymentStatus === "pago" ? "Pago" : "Pendente",
      student.busName,
      student.busCapacity,
      student.seatNumber === null ? "" : String(student.seatNumber).padStart(2, "0"),
      student.seatNumber === null ? "Aguardando escolha" : "Assento escolhido",
      formatConfirmations(student.confirmations.antes_da_escolha),
      formatConfirmations(student.confirmations.revisao_do_assento),
      formatConfirmations(student.confirmations.confirmacao_final),
      formatDateTime(student.guardianCreatedAt),
    ]),
    [],
    ["PROFESSORES / EQUIPE"],
    ["Nome", "CPF", "Sexo", "Data de nascimento", "Ativo"],
    ...data.teachers.map((teacher) => [
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
