"use client";

import { Check, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import type { Bus, ConfirmationStage, GuardianChild } from "@/lib/types";

interface SeatSelectionFlowProps {
  child: GuardianChild;
  initialBuses: Bus[];
}

const progressLabels = ["Dados", "Assento", "Revisão", "Documentos"];

async function postJson(path: string, body: object) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Não foi possível concluir a operação.");
}

export function SeatSelectionFlow({ child, initialBuses }: SeatSelectionFlowProps) {
  const [step, setStep] = useState(child.assento ? 4 : 0);
  const [buses, setBuses] = useState(initialBuses);
  const [busId, setBusId] = useState(initialBuses[0]?.id ?? "");
  const [seatId, setSeatId] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedAt] = useState(() => new Date().toLocaleString("pt-BR"));

  const selectedBus = buses.find((bus) => bus.id === busId) ?? buses[0];
  const selectedSeat = selectedBus?.assentos.find((seat) => seat.id === seatId);
  const finalSeat = child.assento ?? (selectedBus && selectedSeat
    ? {
        assentoId: selectedSeat.id,
        numero: selectedSeat.numero,
        onibusId: selectedBus.id,
        onibusNome: selectedBus.nome,
      }
    : null);

  const visibleStep = Math.min(step, 3);
  const stepTitle = useMemo(
    () => ["Confirme os dados", "Escolha o assento", "Revise a escolha", "Documentação"][visibleStep],
    [visibleStep],
  );

  async function registerConfirmation(stage: ConfirmationStage) {
    await postJson("/api/responsavel/confirmacoes", { etapa: stage });
  }

  async function continueFlow() {
    setError("");
    setLoading(true);
    try {
      if (step === 0) {
        await registerConfirmation("antes_da_escolha");
        setAccepted(false);
        setStep(1);
      } else if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        await postJson("/api/responsavel/assentos", {
          criancaId: child.id,
          assentoId: seatId,
        });
        await registerConfirmation("revisao_do_assento");
        setAccepted(false);
        setStep(3);
      } else if (step === 3) {
        await registerConfirmation("confirmacao_final");
        setStep(4);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Não foi possível continuar.";
      setError(message);
      if (step === 2) {
        const response = await fetch("/api/responsavel/assentos");
        if (response.ok) {
          const body = (await response.json()) as { onibus: Bus[] };
          setBuses(body.onibus);
          setSeatId("");
          setStep(1);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const canContinue =
    (step === 0 && accepted) ||
    (step === 1 && Boolean(seatId)) ||
    step === 2 ||
    (step === 3 && accepted);

  return (
    <>
      <ol className="progress" aria-label="Progresso da escolha">
        {progressLabels.map((label, index) => (
          <li key={label} data-active={index <= visibleStep}>{label}</li>
        ))}
      </ol>

      <section className="panel" aria-live="polite">
        {step < 4 ? <p className="eyebrow">Etapa {step + 1} de 4</p> : null}
        <h1>{step === 4 ? "Assento confirmado" : stepTitle}</h1>

        {step === 0 ? (
          <>
            <p className="panel__lead">
              Criança: <strong>{child.nome}</strong>. Antes de continuar, confirme que
              conhece a obrigação de levar a documentação original da criança no dia da
              viagem.
            </p>
            <label className="confirmation-box">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>Estou ciente de que devo levar a documentação da criança no dia do embarque.</span>
            </label>
          </>
        ) : null}

        {step === 1 && selectedBus ? (
          <>
            <p className="panel__lead">
              Selecione um ônibus e um assento disponível. A disponibilidade será validada
              novamente ao confirmar.
            </p>
            <div className="bus-tabs" role="tablist" aria-label="Ônibus disponíveis">
              {buses.map((bus) => (
                <button
                  className="bus-tab"
                  key={bus.id}
                  type="button"
                  role="tab"
                  aria-selected={bus.id === selectedBus.id}
                  onClick={() => { setBusId(bus.id); setSeatId(""); }}
                >
                  {bus.nome}
                </button>
              ))}
            </div>
            <div className="seat-legend" aria-label="Legenda dos assentos">
              <span><i className="legend-swatch" aria-hidden="true" /> Disponível</span>
              <span><i className="legend-swatch legend-swatch--occupied" aria-hidden="true" /> Ocupado</span>
              <span><i className="legend-swatch legend-swatch--selected" aria-hidden="true" /> Selecionado</span>
            </div>
            <div className="seat-map">
              <div className="bus-front">Frente do ônibus e motorista</div>
              <div className="seat-grid">
                {selectedBus.assentos.map((seat) => {
                  const state = seat.ocupado ? "occupied" : seat.id === seatId ? "selected" : "available";
                  return (
                    <button
                      className="seat-button"
                      data-state={state}
                      disabled={seat.ocupado}
                      key={seat.id}
                      type="button"
                      aria-pressed={seat.id === seatId}
                      aria-label={`Assento ${seat.numero}, ${seat.ocupado ? "ocupado" : "disponível"}`}
                      onClick={() => setSeatId(seat.id)}
                    >
                      {seat.numero}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 && selectedBus && selectedSeat ? (
          <>
            <p className="panel__lead">Revise os dados antes de confirmar a reserva.</p>
            <div className="summary-list">
              <div className="summary-item"><span>Criança</span><strong>{child.nome}</strong></div>
              <div className="summary-item"><span>Ônibus</span><strong>{selectedBus.nome}</strong></div>
              <div className="summary-item"><span>Assento</span><strong>{selectedSeat.numero}</strong></div>
            </div>
            <p className="form-message form-message--info">
              Ao confirmar, o banco fará uma última verificação para impedir reserva duplicada.
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="panel__lead">
              Sua escolha foi registrada. Confirme novamente que levará os documentos da
              criança no dia para finalizar o fluxo.
            </p>
            <label className="confirmation-box">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>Li a orientação e confirmo que a documentação exigida será levada no dia.</span>
            </label>
          </>
        ) : null}

        {step === 4 && finalSeat ? (
          <>
            <div className="success-mark"><Check aria-hidden="true" /></div>
            <p className="panel__lead">A escolha de {child.nome} está registrada.</p>
            <div className="summary-list">
              <div className="summary-item"><span>Criança</span><strong>{child.nome}</strong></div>
              <div className="summary-item"><span>Ônibus</span><strong>{finalSeat.onibusNome}</strong></div>
              <div className="summary-item"><span>Assento</span><strong>{finalSeat.numero}</strong></div>
            </div>
            <p>Confirmação consultada em {confirmedAt}.</p>
            <div className="flow-actions">
              <a className="button button--secondary" href="/alunos">Voltar às crianças</a>
              <button className="button button--primary" type="button" onClick={() => window.print()}>
                <Printer size={17} aria-hidden="true" /> Imprimir
              </button>
            </div>
          </>
        ) : null}

        {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
        {step < 4 ? (
          <div className="flow-actions">
            {step > 0 && step < 3 ? (
              <button className="button button--secondary" type="button" onClick={() => { setError(""); setStep(step - 1); }}>
                Voltar
              </button>
            ) : null}
            <button className="button button--primary" type="button" disabled={!canContinue || loading} onClick={continueFlow}>
              {loading ? "Processando..." : step === 2 ? "Confirmar assento" : step === 3 ? "Finalizar" : "Continuar"}
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
