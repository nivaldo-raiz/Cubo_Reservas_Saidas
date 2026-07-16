export type PaymentStatus = "pendente" | "pago";

export type ConfirmationStage =
  | "antes_da_escolha"
  | "revisao_do_assento"
  | "confirmacao_final";

export interface Guardian {
  id: string;
  nome: string;
  email: string;
  statusPagamento: PaymentStatus;
  createdAt: string;
}

export interface Child {
  id: string;
  nome: string;
  responsavelId: string;
  onibusId: string;
}

export interface Seat {
  id: string;
  numero: number;
  onibusId: string;
  ocupado: boolean;
  bloqueado: boolean;
}

export interface Bus {
  id: string;
  nome: string;
  capacidade: number;
  assentos: Seat[];
}

export interface ChildSeat {
  assentoId: string;
  numero: number;
  onibusId: string;
  onibusNome: string;
}

export interface GuardianChild extends Child {
  assento: ChildSeat | null;
}

export interface GuardianListItem extends Guardian {
  criancas: string[];
}

export interface AdminAccount {
  id: string;
  email: string;
  senhaHash: string;
}
