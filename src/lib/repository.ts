import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { getDemoState, withDemoReservationLock } from "@/lib/demo-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AdminAccount,
  Bus,
  ConfirmationStage,
  Guardian,
  GuardianChild,
  GuardianListItem,
  PaymentStatus,
  TripExportData,
} from "@/lib/types";

interface GuardianRow {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  status_pagamento: PaymentStatus;
  created_at: string;
}

interface ChildRow {
  id: string;
  nome: string;
  responsavel_id: string;
  onibus_id: string;
}

interface BusRow {
  id: string;
  nome: string;
  capacidade: number;
}

interface SeatRow {
  id: string;
  onibus_id: string;
  numero: number;
  crianca_id: string | null;
  bloqueado: boolean;
}

interface ConfirmationRow {
  responsavel_id: string;
  etapa: ConfirmationStage;
  confirmado_em: string;
}

interface TeacherRow {
  id: string;
  nome: string;
  cpf: string | null;
  sexo: string | null;
  data_nascimento: string | null;
  ativo: boolean;
}

function mapGuardian(row: GuardianRow): Guardian {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    phone: row.telefone,
    statusPagamento: row.status_pagamento,
    createdAt: row.created_at,
  };
}

function throwDatabaseError(message: string): never {
  throw new Error(`Falha de acesso ao banco: ${message}`);
}

function buildTripExportData(
  guardians: GuardianRow[],
  children: ChildRow[],
  buses: BusRow[],
  seats: SeatRow[],
  confirmations: ConfirmationRow[],
  teachers: TeacherRow[],
): TripExportData {
  const guardianById = new Map(guardians.map((guardian) => [guardian.id, guardian]));
  const busById = new Map(buses.map((bus) => [bus.id, bus]));
  const seatByChildId = new Map(
    seats.filter((seat) => seat.crianca_id).map((seat) => [seat.crianca_id as string, seat]),
  );

  const students = children.map((child) => {
    const guardian = guardianById.get(child.responsavel_id);
    const bus = busById.get(child.onibus_id);
    if (!guardian || !bus) throwDatabaseError("Aluno sem responsável ou ônibus válido.");
    const seat = seatByChildId.get(child.id) ?? null;
    const confirmationDates = (stage: ConfirmationStage) =>
      confirmations
        .filter(
          (confirmation) =>
            confirmation.responsavel_id === guardian.id && confirmation.etapa === stage,
        )
        .map((confirmation) => confirmation.confirmado_em)
        .sort();

    return {
      studentId: child.id,
      studentName: child.nome,
      guardianId: guardian.id,
      guardianName: guardian.nome,
      guardianEmail: guardian.email,
      guardianPhone: guardian.telefone,
      paymentStatus: guardian.status_pagamento,
      guardianCreatedAt: guardian.created_at,
      busId: bus.id,
      busName: bus.nome,
      busCapacity: bus.capacidade,
      seatId: seat?.id ?? null,
      seatNumber: seat?.numero ?? null,
      confirmations: {
        antes_da_escolha: confirmationDates("antes_da_escolha"),
        revisao_do_assento: confirmationDates("revisao_do_assento"),
        confirmacao_final: confirmationDates("confirmacao_final"),
      },
    };
  });

  students.sort((left, right) => {
    const busOrder = left.busName.localeCompare(right.busName, "pt-BR");
    if (busOrder !== 0) return busOrder;
    const seatOrder = (left.seatNumber ?? Number.MAX_SAFE_INTEGER) -
      (right.seatNumber ?? Number.MAX_SAFE_INTEGER);
    return seatOrder || left.studentName.localeCompare(right.studentName, "pt-BR");
  });

  return {
    students,
    teachers: teachers
      .map((teacher) => ({
        id: teacher.id,
        name: teacher.nome,
        cpf: teacher.cpf,
        gender: teacher.sexo,
        birthDate: teacher.data_nascimento,
        active: teacher.ativo,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
    buses: buses
      .map((bus) => ({
        id: bus.id,
        name: bus.nome,
        capacity: bus.capacidade,
        assignedStudents: children.filter((child) => child.onibus_id === bus.id).length,
        selectedSeats: seats.filter(
          (seat) => seat.onibus_id === bus.id && seat.crianca_id !== null,
        ).length,
        availableSeats: seats.filter(
          (seat) => seat.onibus_id === bus.id && !seat.bloqueado && seat.crianca_id === null,
        ).length,
        teamSeatNumbers: seats
          .filter((seat) => seat.onibus_id === bus.id && seat.bloqueado)
          .map((seat) => seat.numero)
          .sort((left, right) => left - right),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
  };
}

export class DomainError extends Error {
  constructor(
    public readonly code:
      | "PAYMENT_REQUIRED"
      | "CHILD_NOT_FOUND"
      | "SEAT_NOT_FOUND"
      | "BUS_MISMATCH"
      | "SEAT_BLOCKED"
      | "SEAT_TAKEN"
      | "CHILD_ALREADY_SEATED",
    message: string,
  ) {
    super(message);
  }
}

export async function getGuardianByEmail(email: string) {
  if (env.demoMode) {
    const row = getDemoState().responsaveis.find((item) => item.email === email);
    return row ? mapGuardian(row) : null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("responsaveis")
    .select("id,nome,email,telefone,status_pagamento,created_at")
    .eq("email", email)
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  return data ? mapGuardian(data as GuardianRow) : null;
}

export async function getGuardianById(id: string) {
  if (env.demoMode) {
    const row = getDemoState().responsaveis.find((item) => item.id === id);
    return row ? mapGuardian(row) : null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("responsaveis")
    .select("id,nome,email,telefone,status_pagamento,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  return data ? mapGuardian(data as GuardianRow) : null;
}

export async function getGuardianChildren(responsavelId: string): Promise<GuardianChild[]> {
  if (env.demoMode) {
    const state = getDemoState();
    return state.criancas
      .filter((child) => child.responsavel_id === responsavelId)
      .map((child) => {
        const seat = state.assentos.find((item) => item.crianca_id === child.id);
        const bus = seat ? state.onibus.find((item) => item.id === seat.onibus_id) : null;
        return {
          id: child.id,
          nome: child.nome,
          responsavelId: child.responsavel_id,
          onibusId: child.onibus_id,
          assento: seat && bus
            ? {
                assentoId: seat.id,
                numero: seat.numero,
                onibusId: bus.id,
                onibusNome: bus.nome,
              }
            : null,
        };
      });
  }

  const supabase = getSupabaseAdmin();
  const { data: childrenData, error: childrenError } = await supabase
    .from("criancas")
    .select("id,nome,responsavel_id,onibus_id")
    .eq("responsavel_id", responsavelId)
    .order("nome");
  if (childrenError) throwDatabaseError(childrenError.message);

  const children = (childrenData ?? []) as ChildRow[];
  if (children.length === 0) return [];

  const { data: seatsData, error: seatsError } = await supabase
    .from("assentos")
    .select("id,onibus_id,numero,crianca_id,bloqueado")
    .in("crianca_id", children.map((child) => child.id));
  if (seatsError) throwDatabaseError(seatsError.message);
  const seats = (seatsData ?? []) as SeatRow[];

  const busIds = [...new Set(seats.map((seat) => seat.onibus_id))];
  let buses: BusRow[] = [];
  if (busIds.length > 0) {
    const { data: busesData, error: busesError } = await supabase
      .from("onibus")
      .select("id,nome,capacidade")
      .in("id", busIds);
    if (busesError) throwDatabaseError(busesError.message);
    buses = (busesData ?? []) as BusRow[];
  }

  return children.map((child) => {
    const seat = seats.find((item) => item.crianca_id === child.id);
    const bus = seat ? buses.find((item) => item.id === seat.onibus_id) : null;
    return {
      id: child.id,
      nome: child.nome,
      responsavelId: child.responsavel_id,
      onibusId: child.onibus_id,
      assento: seat && bus
        ? {
            assentoId: seat.id,
            numero: seat.numero,
            onibusId: bus.id,
            onibusNome: bus.nome,
          }
        : null,
    };
  });
}

export async function getGuardianChild(responsavelId: string, childId: string) {
  const children = await getGuardianChildren(responsavelId);
  return children.find((child) => child.id === childId) ?? null;
}

export async function getBusesWithSeats(onibusId?: string): Promise<Bus[]> {
  if (env.demoMode) {
    const state = getDemoState();
    return state.onibus.filter((bus) => !onibusId || bus.id === onibusId).map((bus) => ({
      id: bus.id,
      nome: bus.nome,
      capacidade: bus.capacidade,
      assentos: state.assentos
        .filter((seat) => seat.onibus_id === bus.id)
        .sort((a, b) => a.numero - b.numero)
        .map((seat) => ({
          id: seat.id,
          numero: seat.numero,
          onibusId: seat.onibus_id,
          ocupado: seat.crianca_id !== null,
          bloqueado: seat.bloqueado,
        })),
    }));
  }

  const supabase = getSupabaseAdmin();
  const [{ data: busesData, error: busesError }, { data: seatsData, error: seatsError }] =
    await Promise.all([
      supabase.from("onibus").select("id,nome,capacidade").order("nome"),
      supabase.from("assentos").select("id,onibus_id,numero,crianca_id,bloqueado").order("numero"),
    ]);
  if (busesError) throwDatabaseError(busesError.message);
  if (seatsError) throwDatabaseError(seatsError.message);

  return ((busesData ?? []) as BusRow[]).filter((bus) => !onibusId || bus.id === onibusId).map((bus) => ({
    id: bus.id,
    nome: bus.nome,
    capacidade: bus.capacidade,
    assentos: ((seatsData ?? []) as SeatRow[])
      .filter((seat) => seat.onibus_id === bus.id)
      .map((seat) => ({
        id: seat.id,
        numero: seat.numero,
        onibusId: seat.onibus_id,
        ocupado: seat.crianca_id !== null,
        bloqueado: seat.bloqueado,
      })),
  }));
}

export async function reserveSeat(responsavelId: string, childId: string, seatId: string) {
  if (env.demoMode) {
    return withDemoReservationLock(() => {
      const state = getDemoState();
      const guardian = state.responsaveis.find((item) => item.id === responsavelId);
      if (!guardian || guardian.status_pagamento !== "pago") {
        throw new DomainError("PAYMENT_REQUIRED", "Pagamento pendente.");
      }
      const child = state.criancas.find(
        (item) => item.id === childId && item.responsavel_id === responsavelId,
      );
      if (!child) throw new DomainError("CHILD_NOT_FOUND", "Criança não encontrada.");
      const seat = state.assentos.find((item) => item.id === seatId);
      if (!seat) throw new DomainError("SEAT_NOT_FOUND", "Assento não encontrado.");
      if (seat.onibus_id !== child.onibus_id) {
        throw new DomainError("BUS_MISMATCH", "Esta criança deve escolher um assento no ônibus designado.");
      }
      const existing = state.assentos.find((item) => item.crianca_id === childId);
      if (existing?.id === seatId) return seat;
      if (existing) {
        throw new DomainError("CHILD_ALREADY_SEATED", "A criança já possui um assento.");
      }
      if (seat.bloqueado) {
        throw new DomainError("SEAT_BLOCKED", "Este assento é reservado para a equipe responsável.");
      }
      if (seat.crianca_id) {
        throw new DomainError("SEAT_TAKEN", "Este assento acabou de ser escolhido.");
      }
      seat.crianca_id = childId;
      return seat;
    });
  }

  const { data, error } = await getSupabaseAdmin().rpc("reservar_assento", {
    p_responsavel_id: responsavelId,
    p_crianca_id: childId,
    p_assento_id: seatId,
  });
  if (!error) return data;

  const code = error.message.match(/(PAYMENT_REQUIRED|CHILD_NOT_FOUND|SEAT_NOT_FOUND|BUS_MISMATCH|SEAT_BLOCKED|SEAT_TAKEN|CHILD_ALREADY_SEATED)/)?.[1] as DomainError["code"] | undefined;
  if (code) throw new DomainError(code, error.message);
  throwDatabaseError(error.message);
}

export async function recordConfirmation(
  responsavelId: string,
  stage: ConfirmationStage,
) {
  if (env.demoMode) {
    getDemoState().confirmacoes.push({
      id: randomUUID(),
      responsavel_id: responsavelId,
      etapa: stage,
      confirmado_em: new Date().toISOString(),
    });
    return;
  }

  const { error } = await getSupabaseAdmin().from("confirmacoes").insert({
    responsavel_id: responsavelId,
    etapa: stage,
  });
  if (error) throwDatabaseError(error.message);
}

export async function listGuardians(): Promise<GuardianListItem[]> {
  if (env.demoMode) {
    const state = getDemoState();
    return state.responsaveis.map((row) => ({
      ...mapGuardian(row),
      criancas: state.criancas
        .filter((child) => child.responsavel_id === row.id)
        .map((child) => child.nome),
    }));
  }

  const supabase = getSupabaseAdmin();
  const [{ data: guardiansData, error: guardiansError }, { data: childrenData, error: childrenError }] =
    await Promise.all([
      supabase.from("responsaveis").select("id,nome,email,telefone,status_pagamento,created_at").order("nome"),
      supabase.from("criancas").select("id,nome,responsavel_id").order("nome"),
    ]);
  if (guardiansError) throwDatabaseError(guardiansError.message);
  if (childrenError) throwDatabaseError(childrenError.message);

  const children = (childrenData ?? []) as ChildRow[];
  return ((guardiansData ?? []) as GuardianRow[]).map((row) => ({
    ...mapGuardian(row),
    criancas: children
      .filter((child) => child.responsavel_id === row.id)
      .map((child) => child.nome),
  }));
}

export async function getTripExportData(): Promise<TripExportData> {
  if (env.demoMode) {
    const state = getDemoState();
    return buildTripExportData(
      state.responsaveis,
      state.criancas,
      state.onibus,
      state.assentos,
      state.confirmacoes,
      [],
    );
  }

  const supabase = getSupabaseAdmin();
  const [
    { data: guardiansData, error: guardiansError },
    { data: childrenData, error: childrenError },
    { data: busesData, error: busesError },
    { data: seatsData, error: seatsError },
    { data: confirmationsData, error: confirmationsError },
    { data: teachersData, error: teachersError },
  ] = await Promise.all([
    supabase.from("responsaveis").select("id,nome,email,telefone,status_pagamento,created_at"),
    supabase.from("criancas").select("id,nome,responsavel_id,onibus_id"),
    supabase.from("onibus").select("id,nome,capacidade"),
    supabase.from("assentos").select("id,onibus_id,numero,crianca_id,bloqueado"),
    supabase.from("confirmacoes").select("responsavel_id,etapa,confirmado_em"),
    supabase.from("professores").select("id,nome,cpf,sexo,data_nascimento,ativo"),
  ]);

  if (guardiansError) throwDatabaseError(guardiansError.message);
  if (childrenError) throwDatabaseError(childrenError.message);
  if (busesError) throwDatabaseError(busesError.message);
  if (seatsError) throwDatabaseError(seatsError.message);
  if (confirmationsError) throwDatabaseError(confirmationsError.message);
  if (teachersError) throwDatabaseError(teachersError.message);

  return buildTripExportData(
    (guardiansData ?? []) as GuardianRow[],
    (childrenData ?? []) as ChildRow[],
    (busesData ?? []) as BusRow[],
    (seatsData ?? []) as SeatRow[],
    (confirmationsData ?? []) as ConfirmationRow[],
    (teachersData ?? []) as TeacherRow[],
  );
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  if (env.demoMode) {
    const guardian = getDemoState().responsaveis.find((item) => item.id === id);
    if (!guardian) return null;
    guardian.status_pagamento = status;
    return mapGuardian(guardian);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("responsaveis")
    .update({ status_pagamento: status })
    .eq("id", id)
    .select("id,nome,email,telefone,status_pagamento,created_at")
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  return data ? mapGuardian(data as GuardianRow) : null;
}

export async function getAdminByEmail(email: string): Promise<AdminAccount | null> {
  if (env.demoMode) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("admins")
    .select("id,email,senha_hash")
    .eq("email", email)
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  if (!data) return null;
  return { id: data.id as string, email: data.email as string, senhaHash: data.senha_hash as string };
}

export async function adminExists(id: string) {
  if (env.demoMode) return id === "admin-demo";
  const { data, error } = await getSupabaseAdmin()
    .from("admins")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  return Boolean(data);
}
