export type VisitStatus = 'pendente' | 'realizada' | 'cancelada' | 'em_andamento';

export interface Visit {
  id: string;
  code: string;
  date: string; // ISO string
  realEstateAgency: string;
  address: string;
  photographer?: string;
  status: VisitStatus;
  type: string;
  value: number;
  observations?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface RealEstateAgency {
  id: string;
  name: string;
}

export enum Tab {
  REGISTRATION = 'registration',
  SUMMARY = 'summary',
  LISTINGS = 'listings',
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; connectionStatus: ConnectionStatus };