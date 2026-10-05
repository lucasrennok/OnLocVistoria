/**
 * Modelos de domínio do frontend — espelham as tabelas descritas no documento técnico.
 */

export type Role = 'Analista' | 'Gestor';
export type LoanStatus = 'sem avarias' | 'com avarias';
export type AssetStatus = 'disponivel' | 'emprestado' | 'avariado';
export type ApprovalStatus = 'pendente' | 'aprovado' | 'reprovado';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  responsible: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  tradeName: string;
  location: string;
  createdAt: string;
}

export interface SubItem {
  id: string;
  name: string;
  patrimonyNumber: string;
}

export interface Asset {
  id: string;
  patrimonyNumber: string;
  serialNumber: string;
  description: string;
  subItems: SubItem[];
  status: AssetStatus;
}

export interface LoanItem {
  id: string;
  assetId: string;
  patrimonyNumber: string;
  returned: boolean;
}

export interface Loan {
  id: string;
  clientId: string;
  organization: string;
  date: string;
  details?: string;
  status: LoanStatus;
  items: LoanItem[];
}

export interface PhotoEvidence {
  url: string;
  note?: string;
}

export interface Damage {
  id: string;
  loanId: string;
  loanItemId: string;
  description: string;
  photos: string[];
  registeredBy: string;
  registeredAt: string;
}

export interface Inspection {
  id: string;
  clientId: string;
  loanId: string;
  date: string;
  photos: PhotoEvidence[];
  assessment: 'avaria_por_mau_uso' | 'sem_avaria';
  approval: ApprovalStatus;
  archived: boolean;
}
