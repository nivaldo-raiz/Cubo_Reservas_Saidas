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
        "onibus-demo-1-assento-1",
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
        "onibus-demo-1-assento-1",
      ),
      reserveSeat(
        "responsavel-demo-pendente",
        "crianca-demo-bia",
        "onibus-demo-1-assento-1",
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
      "onibus-demo-1-assento-1",
    );
    await expect(
      reserveSeat(
        "responsavel-demo-pago",
        "crianca-demo-ana",
        "onibus-demo-1-assento-3",
      ),
    ).rejects.toMatchObject({ code: "CHILD_ALREADY_SEATED" });
  });
});
