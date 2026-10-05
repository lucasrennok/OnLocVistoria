import type { Asset, Client, Damage, Inspection, Loan, User } from '../models/domain';

/** Dados de exemplo usados pelos mocks (MSW). São reiniciados a cada recarga da página. */

export const USERS: User[] = [
  { id: 'u1', name: 'Ana Souza', email: 'analista@onloc.com.br', role: 'Analista' },
  { id: 'u2', name: 'Bruno Lima', email: 'gestor@onloc.com.br', role: 'Gestor' }
];

export const CLIENTS: Client[] = [
  {
    id: 'c1',
    responsible: 'Carlos Pereira',
    document: '12345678000199',
    documentType: 'CNPJ',
    tradeName: 'Construtora Alfa Ltda',
    location: 'Campinas - SP',
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'c2',
    responsible: 'Mariana Alves',
    document: '32987654321',
    documentType: 'CPF',
    tradeName: 'Transportes Beta ME',
    location: 'Valinhos - SP',
    createdAt: '2026-09-15T14:30:00Z'
  }
];

export const ASSETS: Asset[] = [
  {
    id: 'a1',
    patrimonyNumber: 'PAT-0001',
    serialNumber: 'SN-7788-01',
    description: 'Betoneira 400L',
    subItems: [
      { id: 's1', name: 'Cabo de força 5m', patrimonyNumber: 'PAT-0001-A' },
      { id: 's2', name: 'Carregador 110V', patrimonyNumber: 'PAT-0001-B' }
    ],
    status: 'emprestado'
  },
  {
    id: 'a2',
    patrimonyNumber: 'PAT-0002',
    serialNumber: 'SN-7788-02',
    description: 'Martelete Rompedor',
    subItems: [
      { id: 's3', name: 'Ponteira 25mm', patrimonyNumber: 'PAT-0002-A' },
      { id: 's4', name: 'Maleta de transporte', patrimonyNumber: 'PAT-0002-B' }
    ],
    status: 'emprestado'
  },
  {
    id: 'a3',
    patrimonyNumber: 'PAT-0003',
    serialNumber: 'SN-7788-03',
    description: 'Andaime 2m (módulo)',
    subItems: [],
    status: 'disponivel'
  }
];

export const LOANS: Loan[] = [
  {
    id: 'l1',
    clientId: 'c1',
    organization: 'Obra Residencial Jardim Europa',
    date: '2026-09-05T09:00:00Z',
    details: 'Locação de 30 dias',
    status: 'sem avarias',
    items: [
      { id: 'li1', assetId: 'a1', patrimonyNumber: 'PAT-0001', returned: false },
      { id: 'li2', assetId: 'a2', patrimonyNumber: 'PAT-0002', returned: false }
    ]
  },
  {
    id: 'l2',
    clientId: 'c2',
    organization: 'Frota Beta — Manutenção',
    date: '2026-09-20T15:00:00Z',
    details: 'Empréstimo avulso',
    status: 'com avarias',
    items: [{ id: 'li3', assetId: 'a1', patrimonyNumber: 'PAT-0001', returned: true }]
  }
];

export const DAMAGES: Damage[] = [
  {
    id: 'd1',
    loanId: 'l2',
    loanItemId: 'li3',
    description: 'Cabo de força rompido próximo ao plugue',
    photos: [],
    registeredBy: 'u1',
    registeredAt: '2026-09-30T08:00:00Z'
  }
];

export const INSPECTIONS: Inspection[] = [
  {
    id: 'i1',
    clientId: 'c2',
    loanId: 'l2',
    date: '2026-09-30T08:00:00Z',
    photos: [],
    assessment: 'avaria_por_mau_uso',
    approval: 'aprovado',
    archived: true
  },
  {
    id: 'i2',
    clientId: 'c1',
    loanId: 'l1',
    date: '2026-10-01T10:00:00Z',
    photos: [],
    assessment: 'sem_avaria',
    approval: 'pendente',
    archived: false
  }
];
