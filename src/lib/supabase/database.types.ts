export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GuardianRow = {
  id: string;
  nome: string;
  email: string;
  status_pagamento: "pendente" | "pago";
  created_at: string;
};

type ChildRow = { id: string; nome: string; responsavel_id: string };
type BusRow = { id: string; nome: string; capacidade: number };
type SeatRow = {
  id: string;
  onibus_id: string;
  numero: number;
  crianca_id: string | null;
  bloqueado: boolean;
};
type ConfirmationRow = {
  id: string;
  responsavel_id: string;
  etapa: "antes_da_escolha" | "revisao_do_assento" | "confirmacao_final";
  confirmado_em: string;
};
type AdminRow = { id: string; email: string; senha_hash: string; created_at: string };
type TeacherRow = {
  id: string;
  nome: string;
  cpf: string | null;
  sexo: string | null;
  data_nascimento: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};
type OtpRow = {
  id: string;
  responsavel_id: string;
  codigo_hash: string;
  expira_em: string;
  usado_em: string | null;
  tentativas: number;
  ip_hash: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      responsaveis: {
        Row: GuardianRow;
        Insert: Omit<GuardianRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<GuardianRow, "id">>;
        Relationships: [];
      };
      criancas: {
        Row: ChildRow;
        Insert: Omit<ChildRow, "id"> & { id?: string };
        Update: Partial<Omit<ChildRow, "id">>;
        Relationships: [];
      };
      onibus: {
        Row: BusRow;
        Insert: Omit<BusRow, "id"> & { id?: string };
        Update: Partial<Omit<BusRow, "id">>;
        Relationships: [];
      };
      assentos: {
        Row: SeatRow;
        Insert: Omit<SeatRow, "id" | "crianca_id" | "bloqueado"> & {
          id?: string;
          crianca_id?: string | null;
          bloqueado?: boolean;
        };
        Update: Partial<Omit<SeatRow, "id">>;
        Relationships: [];
      };
      confirmacoes: {
        Row: ConfirmationRow;
        Insert: Pick<ConfirmationRow, "responsavel_id" | "etapa"> & {
          id?: string;
          confirmado_em?: string;
        };
        Update: Partial<Omit<ConfirmationRow, "id">>;
        Relationships: [];
      };
      admins: {
        Row: AdminRow;
        Insert: Pick<AdminRow, "email" | "senha_hash"> & { id?: string; created_at?: string };
        Update: Partial<Omit<AdminRow, "id">>;
        Relationships: [];
      };
      professores: {
        Row: TeacherRow;
        Insert: Omit<TeacherRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<TeacherRow, "id">>;
        Relationships: [];
      };
      codigos_acesso: {
        Row: OtpRow;
        Insert: Pick<OtpRow, "responsavel_id" | "codigo_hash" | "expira_em"> & {
          id?: string;
          usado_em?: string | null;
          tentativas?: number;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<OtpRow, "id">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      reservar_assento: {
        Args: { p_responsavel_id: string; p_crianca_id: string; p_assento_id: string };
        Returns: Json;
      };
      incrementar_tentativa_codigo: {
        Args: { p_codigo_id: string };
        Returns: undefined;
      };
      importar_responsaveis_criancas: {
        Args: { p_registros: Json };
        Returns: Json;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
