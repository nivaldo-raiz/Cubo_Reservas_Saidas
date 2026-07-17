export type PaymentStatus = "pendente" | "pago";

export type ConfirmationStage =
  | "antes_da_escolha"
  | "revisao_do_assento"
  | "confirmacao_final";

export interface Guardian {
  id: string;
  nome: string;
  email: string;
  phone: string | null;
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

export interface TripExportStudent {
  studentId: string;
  studentName: string;
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string | null;
  paymentStatus: PaymentStatus;
  guardianCreatedAt: string;
  busId: string;
  busName: string;
  busCapacity: number;
  seatId: string | null;
  seatNumber: number | null;
  confirmations: Record<ConfirmationStage, string[]>;
}

export interface TripExportTeacher {
  id: string;
  name: string;
  cpf: string | null;
  gender: string | null;
  birthDate: string | null;
  active: boolean;
}

export interface TripExportBus {
  id: string;
  name: string;
  capacity: number;
  assignedStudents: number;
  selectedSeats: number;
  availableSeats: number;
  teamSeatNumbers: number[];
}

export interface TripExportData {
  students: TripExportStudent[];
  teachers: TripExportTeacher[];
  buses: TripExportBus[];
}

export interface AdminAccount {
  id: string;
  email: string;
  senhaHash: string;
}
