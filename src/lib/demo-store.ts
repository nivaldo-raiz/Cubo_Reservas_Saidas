import type { ConfirmationStage, PaymentStatus } from "@/lib/types";

interface DemoGuardianRow {
  id: string;
  nome: string;
  email: string;
  status_pagamento: PaymentStatus;
  created_at: string;
}

interface DemoChildRow {
  id: string;
  nome: string;
  responsavel_id: string;
}

interface DemoBusRow {
  id: string;
  nome: string;
  capacidade: number;
}

interface DemoSeatRow {
  id: string;
  onibus_id: string;
  numero: number;
  crianca_id: string | null;
  bloqueado: boolean;
}

interface DemoConfirmationRow {
  id: string;
  responsavel_id: string;
  etapa: ConfirmationStage;
  confirmado_em: string;
}

export interface DemoState {
  responsaveis: DemoGuardianRow[];
  criancas: DemoChildRow[];
  onibus: DemoBusRow[];
  assentos: DemoSeatRow[];
  confirmacoes: DemoConfirmationRow[];
}

function makeSeats(busId: string, capacity: number, occupied: number[]) {
  return Array.from({ length: capacity }, (_, index): DemoSeatRow => {
    const numero = index + 1;
    const bloqueado = [1, 2, 43, 44].includes(numero);
    return {
      id: `${busId}-assento-${numero}`,
      onibus_id: busId,
      numero,
      crianca_id: !bloqueado && occupied.includes(numero) ? `ocupante-demo-${busId}-${numero}` : null,
      bloqueado,
    };
  });
}

export function createDemoState(): DemoState {
  const createdAt = "2026-07-15T12:00:00.000Z";
  return {
    responsaveis: [
      {
        id: "responsavel-demo-pago",
        nome: "Mariana Oliveira",
        email: "familia@example.com",
        status_pagamento: "pago",
        created_at: createdAt,
      },
      {
        id: "responsavel-demo-pendente",
        nome: "Rafael Santos",
        email: "pendente@example.com",
        status_pagamento: "pendente",
        created_at: createdAt,
      },
    ],
    criancas: [
      { id: "crianca-demo-ana", nome: "Ana Oliveira", responsavel_id: "responsavel-demo-pago" },
      { id: "crianca-demo-lucas", nome: "Lucas Oliveira", responsavel_id: "responsavel-demo-pago" },
      { id: "crianca-demo-bia", nome: "Beatriz Santos", responsavel_id: "responsavel-demo-pendente" },
    ],
    onibus: [
      { id: "onibus-demo-1", nome: "Ônibus 1", capacidade: 44 },
      { id: "onibus-demo-2", nome: "Ônibus 2", capacidade: 44 },
    ],
    assentos: [
      ...makeSeats("onibus-demo-1", 44, [7, 10, 18, 22, 31]),
      ...makeSeats("onibus-demo-2", 44, [4, 12, 16, 25, 33]),
    ],
    confirmacoes: [],
  };
}

declare global {
  var __cuboDemoState: DemoState | undefined;
  var __cuboReservationQueue: Promise<void> | undefined;
}

export function getDemoState() {
  globalThis.__cuboDemoState ??= createDemoState();
  return globalThis.__cuboDemoState;
}

export function resetDemoState() {
  globalThis.__cuboDemoState = createDemoState();
  globalThis.__cuboReservationQueue = Promise.resolve();
}

export async function withDemoReservationLock<T>(operation: () => T | Promise<T>) {
  const previous = globalThis.__cuboReservationQueue ?? Promise.resolve();
  let release: () => void = () => undefined;
  globalThis.__cuboReservationQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}
