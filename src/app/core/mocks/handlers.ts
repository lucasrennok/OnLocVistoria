import { delay, http, HttpResponse } from 'msw';
import type {
  Asset,
  Client,
  Damage,
  Inspection,
  Loan,
  LoanItem,
  User
} from '../models/domain';
import { ASSETS, CLIENTS, DAMAGES, INSPECTIONS, LOANS, USERS } from './data';
import { API_BASE } from '../api/api-base';

const wait = (ms = 300) => delay(ms);

type Params = Record<string, string | readonly string[] | undefined>;

/** Extrai o parâmetro de rota `:id` como string. */
function routeId(params: Params): string {
  const value = params['id'];
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw ?? '');
}

/** Monta um JWT fake (não assinado de verdade) com expiração de 1 hora. */
function fakeJwt(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(
    JSON.stringify({ sub: user.id, email: user.email, role: user.role, exp: now + 3600 })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

function unauthorized() {
  return HttpResponse.json({ message: 'Não autenticado' }, { status: 401 });
}

let nextId = 100;

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────────
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await wait();
    const body = (await request.json()) as { email: string; password: string };
    const user = USERS.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    // Aceita qualquer senha no mock; a validação real fica no backend C++.
    if (!user) {
      return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }
    return HttpResponse.json({ token: fakeJwt(user), user });
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    await wait(100);
    return HttpResponse.json({ ok: true });
  }),

  // ── Clientes ────────────────────────────────────────────────────────────
  http.get(`${API_BASE}/clients`, async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const list = CLIENTS.filter(
      (c) =>
        !search ||
        c.tradeName.toLowerCase().includes(search) ||
        c.responsible.toLowerCase().includes(search) ||
        c.document.includes(search)
    );
    return HttpResponse.json(list);
  }),

  http.post(`${API_BASE}/clients`, async ({ request }) => {
    await wait();
    const body = (await request.json()) as Partial<Client>;
    const client: Client = {
      id: `c${nextId++}`,
      responsible: body.responsible ?? '',
      document: body.document ?? '',
      documentType: body.documentType ?? 'CPF',
      tradeName: body.tradeName ?? '',
      location: body.location ?? '',
      createdAt: new Date().toISOString()
    };
    CLIENTS.push(client);
    return HttpResponse.json(client, { status: 201 });
  }),

  http.put(`${API_BASE}/clients/:id`, async ({ request, params }) => {
    await wait();
    const id = routeId(params);
    const body = (await request.json()) as Partial<Client>;
    const idx = CLIENTS.findIndex((c) => c.id === id);
    if (idx < 0) return HttpResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    CLIENTS[idx] = { ...CLIENTS[idx], ...body, id };
    return HttpResponse.json(CLIENTS[idx]);
  }),

  http.delete(`${API_BASE}/clients/:id`, async ({ params }) => {
    await wait();
    const id = routeId(params);
    const idx = CLIENTS.findIndex((c) => c.id === id);
    if (idx < 0) return HttpResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    CLIENTS.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get(`${API_BASE}/clients/:id/loans`, async ({ params }) => {
    await wait();
    const id = routeId(params);
    return HttpResponse.json(LOANS.filter((l) => l.clientId === id));
  }),

  // ── Equipamentos ────────────────────────────────────────────────────────
  http.get(`${API_BASE}/assets`, async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const list = status ? ASSETS.filter((a) => a.status === status) : ASSETS;
    return HttpResponse.json(list);
  }),

  http.post(`${API_BASE}/assets`, async ({ request }) => {
    await wait();
    const body = (await request.json()) as Partial<Asset>;
    const asset: Asset = {
      id: `a${nextId++}`,
      patrimonyNumber: body.patrimonyNumber ?? '',
      serialNumber: body.serialNumber ?? '',
      description: body.description ?? '',
      subItems: body.subItems ?? [],
      status: body.status ?? 'disponivel'
    };
    ASSETS.push(asset);
    return HttpResponse.json(asset, { status: 201 });
  }),

  http.put(`${API_BASE}/assets/:id`, async ({ request, params }) => {
    await wait();
    const id = routeId(params);
    const body = (await request.json()) as Partial<Asset>;
    const idx = ASSETS.findIndex((a) => a.id === id);
    if (idx < 0) return HttpResponse.json({ message: 'Equipamento não encontrado' }, { status: 404 });
    ASSETS[idx] = { ...ASSETS[idx], ...body, id };
    return HttpResponse.json(ASSETS[idx]);
  }),

  http.delete(`${API_BASE}/assets/:id`, async ({ params }) => {
    await wait();
    const id = routeId(params);
    const idx = ASSETS.findIndex((a) => a.id === id);
    if (idx < 0) return HttpResponse.json({ message: 'Equipamento não encontrado' }, { status: 404 });
    ASSETS.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  // ── Empréstimos ─────────────────────────────────────────────────────────
  http.get(`${API_BASE}/loans`, async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const clientId = url.searchParams.get('clientId');
    let list = LOANS;
    if (status) list = list.filter((l) => l.status === status);
    if (clientId) list = list.filter((l) => l.clientId === clientId);
    return HttpResponse.json(list);
  }),

  http.get(`${API_BASE}/loans/:id`, async ({ params }) => {
    await wait();
    const id = routeId(params);
    const loan = LOANS.find((l) => l.id === id);
    if (!loan) return HttpResponse.json({ message: 'Empréstimo não encontrado' }, { status: 404 });
    return HttpResponse.json(loan);
  }),

  http.post(`${API_BASE}/loans`, async ({ request }) => {
    await wait();
    const body = (await request.json()) as Partial<Loan>;
    const loan: Loan = {
      id: `l${nextId++}`,
      clientId: body.clientId ?? '',
      organization: body.organization ?? '',
      date: body.date ?? new Date().toISOString(),
      details: body.details,
      status: body.status ?? 'sem avarias',
      items: (body.items ?? []) as LoanItem[]
    };
    LOANS.push(loan);
    return HttpResponse.json(loan, { status: 201 });
  }),

  // ── Vistorias / Devoluções ──────────────────────────────────────────────
  http.get(`${API_BASE}/inspections`, async () => {
    await wait();
    return HttpResponse.json(INSPECTIONS);
  }),

  http.post(`${API_BASE}/inspections`, async ({ request }) => {
    await wait();
    const body = (await request.json()) as Partial<Inspection> & {
      damages?: Partial<Damage>[];
      items?: LoanItem[];
    };
    const isDamaged = body.assessment === 'avaria_por_mau_uso';
    const inspection: Inspection = {
      id: `i${nextId++}`,
      clientId: body.clientId ?? '',
      loanId: body.loanId ?? '',
      date: body.date ?? new Date().toISOString(),
      photos: body.photos ?? [],
      assessment: body.assessment ?? 'sem_avaria',
      approval: isDamaged ? 'aprovado' : 'pendente',
      archived: isDamaged
    };
    INSPECTIONS.push(inspection);

    const loan = LOANS.find((l) => l.id === inspection.loanId);
    if (loan) {
      if (body.items) loan.items = body.items;
      if (isDamaged) {
        loan.status = 'com avarias';
        for (const d of body.damages ?? []) {
          DAMAGES.push({
            id: `d${nextId++}`,
            loanId: inspection.loanId,
            loanItemId: d.loanItemId ?? '',
            description: d.description ?? '',
            photos: d.photos ?? [],
            registeredBy: d.registeredBy ?? '',
            registeredAt: new Date().toISOString()
          });
        }
      }
    }
    return HttpResponse.json(inspection, { status: 201 });
  }),

  http.patch(`${API_BASE}/inspections/:id/approve`, async ({ params, request }) => {
    await wait();
    if (!request.headers.get('Authorization')) return unauthorized();
    const id = routeId(params);
    const insp = INSPECTIONS.find((i) => i.id === id);
    if (!insp) return HttpResponse.json({ message: 'Vistoria não encontrada' }, { status: 404 });
    insp.approval = 'aprovado';
    insp.archived = true;
    const loan = LOANS.find((l) => l.id === insp.loanId);
    if (loan) loan.status = 'sem avarias';
    return HttpResponse.json(insp);
  }),

  http.patch(`${API_BASE}/inspections/:id/reject`, async ({ params, request }) => {
    await wait();
    if (!request.headers.get('Authorization')) return unauthorized();
    const id = routeId(params);
    const insp = INSPECTIONS.find((i) => i.id === id);
    if (!insp) return HttpResponse.json({ message: 'Vistoria não encontrada' }, { status: 404 });
    insp.approval = 'reprovado';
    return HttpResponse.json(insp);
  }),

  // ── Avariados ───────────────────────────────────────────────────────────
  http.get(`${API_BASE}/damages`, async () => {
    await wait();
    return HttpResponse.json(DAMAGES);
  }),

  // ── Upload (MinIO via URL pré-assinada) ─────────────────────────────────
  http.post(`${API_BASE}/uploads/presign`, async ({ request }) => {
    await wait();
    const body = (await request.json()) as { filename?: string };
    const filename = body.filename ?? 'file.jpg';
    return HttpResponse.json({
      uploadUrl: `${API_BASE}/uploads/put/${encodeURIComponent(filename)}`,
      fileUrl: `${API_BASE}/uploads/${encodeURIComponent(filename)}`
    });
  }),

  // ── Usuários ────────────────────────────────────────────────────────────
  http.get(`${API_BASE}/users`, async ({ request }) => {
    await wait();
    if (!request.headers.get('Authorization')) return unauthorized();
    return HttpResponse.json(USERS);
  }),

  http.post(`${API_BASE}/users`, async ({ request }) => {
    await wait();
    if (!request.headers.get('Authorization')) return unauthorized();
    const body = (await request.json()) as Partial<User>;
    const user: User = {
      id: `u${nextId++}`,
      name: body.name ?? '',
      email: body.email ?? '',
      role: body.role ?? 'Analista'
    };
    USERS.push(user);
    return HttpResponse.json(user, { status: 201 });
  }),

  http.delete(`${API_BASE}/users/:id`, async ({ params, request }) => {
    await wait();
    if (!request.headers.get('Authorization')) return unauthorized();
    const id = routeId(params);
    const idx = USERS.findIndex((u) => u.id === id);
    if (idx < 0) return HttpResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    USERS.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  })
];
