import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { getDemoState, withDemoReservationLock } from "@/lib/demo-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StudentImportRecord } from "@/lib/import/students";
import type {
  AdminAccount,
  Bus,
  ConfirmationStage,
  Guardian,
  GuardianChild,
  GuardianListItem,
  PaymentStatus,
  StudentImportResult,
} from "@/lib/types";

interface GuardianRow {
  id: string;
  nome: string;
  email: string;
  status_pagamento: PaymentStatus;
  created_at: string;
}

interface ChildRow {
  id: string;
  nome: string;
  responsavel_id: string;
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
}

interface OtpRow {
  id: string;
  responsavel_id: string;
  codigo_hash: string;
  expira_em: string;
  usado_em: string | null;
  tentativas: number;
}

function mapGuardian(row: GuardianRow): Guardian {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    statusPagamento: row.status_pagamento,
    createdAt: row.created_at,
  };
}

function throwDatabaseError(message: string) {
  throw new Error(`Falha de acesso ao banco: ${message}`);
}

export class DomainError extends Error {
  constructor(
    public readonly code:
      | "PAYMENT_REQUIRED"
      | "CHILD_NOT_FOUND"
      | "SEAT_NOT_FOUND"
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
    .select("id,nome,email,status_pagamento,created_at")
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
    .select("id,nome,email,status_pagamento,created_at")
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
    .select("id,nome,responsavel_id")
    .eq("responsavel_id", responsavelId)
    .order("nome");
  if (childrenError) throwDatabaseError(childrenError.message);

  const children = (childrenData ?? []) as ChildRow[];
  if (children.length === 0) return [];

  const { data: seatsData, error: seatsError } = await supabase
    .from("assentos")
    .select("id,onibus_id,numero,crianca_id")
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

export async function getBusesWithSeats(): Promise<Bus[]> {
  if (env.demoMode) {
    const state = getDemoState();
    return state.onibus.map((bus) => ({
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
        })),
    }));
  }

  const supabase = getSupabaseAdmin();
  const [{ data: busesData, error: busesError }, { data: seatsData, error: seatsError }] =
    await Promise.all([
      supabase.from("onibus").select("id,nome,capacidade").order("nome"),
      supabase.from("assentos").select("id,onibus_id,numero,crianca_id").order("numero"),
    ]);
  if (busesError) throwDatabaseError(busesError.message);
  if (seatsError) throwDatabaseError(seatsError.message);

  return ((busesData ?? []) as BusRow[]).map((bus) => ({
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
      const existing = state.assentos.find((item) => item.crianca_id === childId);
      if (existing?.id === seatId) return seat;
      if (existing) {
        throw new DomainError("CHILD_ALREADY_SEATED", "A criança já possui um assento.");
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

  const code = error.message.match(/(PAYMENT_REQUIRED|CHILD_NOT_FOUND|SEAT_NOT_FOUND|SEAT_TAKEN|CHILD_ALREADY_SEATED)/)?.[1] as DomainError["code"] | undefined;
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
      supabase.from("responsaveis").select("id,nome,email,status_pagamento,created_at").order("nome"),
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
    .select("id,nome,email,status_pagamento,created_at")
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

export async function createOtpRecord(
  responsavelId: string,
  codeHash: string,
  expiresAt: string,
  ipHash: string | null,
) {
  if (env.demoMode) return true;
  const supabase = getSupabaseAdmin();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("codigos_acesso")
    .select("id", { count: "exact", head: true })
    .eq("responsavel_id", responsavelId)
    .gte("created_at", tenMinutesAgo);
  if (countError) throwDatabaseError(countError.message);
  if ((count ?? 0) >= 3) return false;

  const now = new Date().toISOString();
  const { error: invalidationError } = await supabase
    .from("codigos_acesso")
    .update({ usado_em: now })
    .eq("responsavel_id", responsavelId)
    .is("usado_em", null);
  if (invalidationError) throwDatabaseError(invalidationError.message);

  const { error } = await supabase.from("codigos_acesso").insert({
    responsavel_id: responsavelId,
    codigo_hash: codeHash,
    expira_em: expiresAt,
    ip_hash: ipHash,
  });
  if (error) throwDatabaseError(error.message);
  return true;
}

export async function getLatestOtp(responsavelId: string): Promise<OtpRow | null> {
  if (env.demoMode) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("codigos_acesso")
    .select("id,responsavel_id,codigo_hash,expira_em,usado_em,tentativas")
    .eq("responsavel_id", responsavelId)
    .is("usado_em", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  return data ? (data as OtpRow) : null;
}

export async function incrementOtpAttempts(id: string) {
  if (env.demoMode) return;
  const { error } = await getSupabaseAdmin().rpc("incrementar_tentativa_codigo", {
    p_codigo_id: id,
  });
  if (error) throwDatabaseError(error.message);
}

export async function consumeOtp(id: string) {
  if (env.demoMode) return true;
  const { data, error } = await getSupabaseAdmin()
    .from("codigos_acesso")
    .update({ usado_em: new Date().toISOString() })
    .eq("id", id)
    .is("usado_em", null)
    .lt("tentativas", 5)
    .gt("expira_em", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error) throwDatabaseError(error.message);
  return Boolean(data);
}

export async function importStudents(
  records: StudentImportRecord[],
): Promise<StudentImportResult> {
  if (env.demoMode) {
    const state = getDemoState();
    let responsaveisCriados = 0;
    let criancasCriadas = 0;
    let registrosExistentes = 0;

    for (const record of records) {
      let guardian = state.responsaveis.find(
        (item) => item.email === record.responsavelEmail,
      );
      if (!guardian) {
        guardian = {
          id: randomUUID(),
          nome: record.responsavelNome,
          email: record.responsavelEmail,
          status_pagamento: "pendente",
          created_at: new Date().toISOString(),
        };
        state.responsaveis.push(guardian);
        responsaveisCriados += 1;
      }

      const exists = state.criancas.some(
        (child) =>
          child.responsavel_id === guardian.id &&
          child.nome.toLocaleLowerCase("pt-BR") ===
            record.criancaNome.toLocaleLowerCase("pt-BR"),
      );
      if (exists) {
        registrosExistentes += 1;
      } else {
        state.criancas.push({
          id: randomUUID(),
          nome: record.criancaNome,
          responsavel_id: guardian.id,
        });
        criancasCriadas += 1;
      }
    }

    return { responsaveisCriados, criancasCriadas, registrosExistentes };
  }

  const payload = records.map((record) => ({
    crianca_nome: record.criancaNome,
    responsavel_nome: record.responsavelNome,
    responsavel_email: record.responsavelEmail,
  }));
  const { data, error } = await getSupabaseAdmin().rpc("importar_responsaveis_criancas", {
    p_registros: payload,
  });
  if (error) throwDatabaseError(error.message);
  const result = data as {
    responsaveis_criados: number;
    criancas_criadas: number;
    registros_existentes: number;
  };
  return {
    responsaveisCriados: result.responsaveis_criados,
    criancasCriadas: result.criancas_criadas,
    registrosExistentes: result.registros_existentes,
  };
}
