import { beforeEach, describe, expect, it } from "vitest";

process.env.DEMO_MODE = "true";

describe("regras de assento e pagamento", () => {
  beforeEach(async () => {
    const { resetDemoState } = await import("@/lib/demo-store");
    resetDemoState();
  });

  it("bloqueia reserva de responsável pendente", async () => {
    const { reserveSeat } = await import("@/lib/repository");
    await expect(
      reserveSeat(
        "responsavel-demo-pendente",
        "crianca-demo-bia",
        "onibus-demo-1-assento-3",
      ),
    ).rejects.toMatchObject({ code: "PAYMENT_REQUIRED" });
  });

  it("permite apenas um vencedor em tentativas concorrentes", async () => {
    const { getDemoState } = await import("@/lib/demo-store");
    const { reserveSeat } = await import("@/lib/repository");
    getDemoState().responsaveis.find(
      (item) => item.id === "responsavel-demo-pendente",
    )!.status_pagamento = "pago";

    const results = await Promise.allSettled([
      reserveSeat(
        "responsavel-demo-pago",
        "crianca-demo-ana",
        "onibus-demo-1-assento-3",
      ),
      reserveSeat(
        "responsavel-demo-pendente",
        "crianca-demo-bia",
        "onibus-demo-1-assento-3",
      ),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  });

  it("impede uma criança de ocupar dois assentos", async () => {
    const { reserveSeat } = await import("@/lib/repository");
    await reserveSeat(
      "responsavel-demo-pago",
      "crianca-demo-ana",
      "onibus-demo-1-assento-3",
    );
    await expect(
      reserveSeat(
        "responsavel-demo-pago",
        "crianca-demo-ana",
        "onibus-demo-1-assento-4",
      ),
    ).rejects.toMatchObject({ code: "CHILD_ALREADY_SEATED" });
  });

  it("impede reserva no ônibus diferente do designado para a criança", async () => {
    const { reserveSeat } = await import("@/lib/repository");
    await expect(
      reserveSeat(
        "responsavel-demo-pago",
        "crianca-demo-ana",
        "onibus-demo-2-assento-3",
      ),
    ).rejects.toMatchObject({ code: "BUS_MISMATCH" });
  });

  it.each([1, 2, 43, 44])("mantém o assento %i reservado para a equipe", async (numero) => {
    const { reserveSeat } = await import("@/lib/repository");
    await expect(
      reserveSeat(
        "responsavel-demo-pago",
        "crianca-demo-ana",
        `onibus-demo-1-assento-${numero}`,
      ),
    ).rejects.toMatchObject({ code: "SEAT_BLOCKED" });
  });

  it("oferece dois ônibus de 44 lugares com quatro assentos da equipe em cada um", async () => {
    const { getBusesWithSeats } = await import("@/lib/repository");
    const buses = await getBusesWithSeats();

    expect(buses).toHaveLength(2);
    for (const bus of buses) {
      expect(bus.capacidade).toBe(44);
      expect(bus.assentos).toHaveLength(44);
      expect(bus.assentos.filter((seat) => seat.bloqueado).map((seat) => seat.numero)).toEqual([
        1, 2, 43, 44,
      ]);
    }
  });

  it("mostra somente o ônibus atribuído à criança", async () => {
    const { getBusesWithSeats, getGuardianChild } = await import("@/lib/repository");
    const child = await getGuardianChild("responsavel-demo-pago", "crianca-demo-lucas");
    const buses = await getBusesWithSeats(child?.onibusId);

    expect(child?.onibusId).toBe("onibus-demo-2");
    expect(buses.map((bus) => bus.nome)).toEqual(["Ônibus B"]);
  });

  it("reúne todos os dados necessários para a planilha da viagem", async () => {
    const { getTripExportData, recordConfirmation, reserveSeat } = await import("@/lib/repository");
    await reserveSeat(
      "responsavel-demo-pago",
      "crianca-demo-ana",
      "onibus-demo-1-assento-3",
    );
    await recordConfirmation("responsavel-demo-pago", "confirmacao_final");

    const data = await getTripExportData();
    const ana = data.students.find((student) => student.studentName === "Ana Oliveira");

    expect(data.students).toHaveLength(3);
    expect(data.buses).toHaveLength(2);
    expect(data.buses[0].teamSeatNumbers).toEqual([1, 2, 43, 44]);
    expect(ana).toMatchObject({
      guardianEmail: "familia@example.com",
      busName: "Ônibus A",
      seatNumber: 3,
    });
    expect(ana?.confirmations.confirmacao_final).toHaveLength(1);
  });
});
