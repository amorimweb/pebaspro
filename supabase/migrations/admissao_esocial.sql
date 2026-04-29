-- =============================================
-- PEBASPRO — Admissão Digital + eSocial
-- Rodar no Supabase SQL Editor
-- =============================================

-- 1. Adicionar status à tabela candidaturas existente
alter table public.candidaturas
  add column if not exists status text not null default 'Pendente',
  add column if not exists mensagem text,
  add column if not exists updated_at timestamptz default now();

-- Constraint de valores válidos
alter table public.candidaturas
  drop constraint if exists candidaturas_status_check;
alter table public.candidaturas
  add constraint candidaturas_status_check
    check (status in ('Pendente', 'Aprovado', 'Reprovado', 'Contratado'));

-- 2. Tabela admissoes
create table if not exists public.admissoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.usuarios(id) on delete cascade,
  talento_id uuid not null references public.usuarios(id) on delete cascade,
  vaga_id uuid not null references public.vagas(id) on delete cascade,
  candidatura_id uuid references public.candidaturas(id),
  cargo text not null,
  salario text,
  regime text not null default 'CLT',  -- CLT | PJ | Temporário | Estágio
  jornada text,
  data_inicio date,
  status text not null default 'Documentação',
  -- Documentação | EmConferência | eSocial | Concluído
  checklist jsonb not null default '{
    "rg": false,
    "cpf": false,
    "comprovante_residencia": false,
    "foto_3x4": false,
    "ctps": false,
    "aso_admissional": false,
    "contrato_assinado": false,
    "esocial_enviado": false
  }',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admissoes_regime_check check (regime in ('CLT', 'PJ', 'Temporário', 'Estágio')),
  constraint admissoes_status_check check (status in ('Documentação', 'EmConferência', 'eSocial', 'Concluído'))
);

-- 3. Tabela esocial_eventos
create table if not exists public.esocial_eventos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.usuarios(id) on delete cascade,
  admissao_id uuid references public.admissoes(id) on delete set null,
  evento_id text not null,   -- S-2200, S-2210, S-2220, etc.
  titulo text not null,
  status text not null default 'Pendente', -- Pendente | Processando | Transmitido | Erro
  protocolo text,
  responsavel text,
  created_at timestamptz not null default now(),
  constraint esocial_status_check check (status in ('Pendente', 'Processando', 'Transmitido', 'Erro'))
);

-- 4. RLS — Segurança por empresa
alter table public.candidaturas enable row level security;
alter table public.admissoes enable row level security;
alter table public.esocial_eventos enable row level security;

-- Candidaturas
drop policy if exists "candidaturas_empresa_select" on public.candidaturas;
create policy "candidaturas_empresa_select" on public.candidaturas
  for select using (
    vaga_id in (select id from public.vagas where empresa_id = auth.uid())
    or talento_id = auth.uid()
  );

drop policy if exists "candidaturas_talento_insert" on public.candidaturas;
create policy "candidaturas_talento_insert" on public.candidaturas
  for insert with check (talento_id = auth.uid());

drop policy if exists "candidaturas_empresa_update" on public.candidaturas;
create policy "candidaturas_empresa_update" on public.candidaturas
  for update using (
    vaga_id in (select id from public.vagas where empresa_id = auth.uid())
  );

-- Admissões: somente a empresa
drop policy if exists "admissoes_empresa_all" on public.admissoes;
create policy "admissoes_empresa_all" on public.admissoes
  for all using (empresa_id = auth.uid());

-- eSocial: somente a empresa
drop policy if exists "esocial_empresa_all" on public.esocial_eventos;
create policy "esocial_empresa_all" on public.esocial_eventos
  for all using (empresa_id = auth.uid());

-- 5. Índices úteis
create index if not exists idx_candidaturas_vaga_id on public.candidaturas(vaga_id);
create index if not exists idx_candidaturas_talento_id on public.candidaturas(talento_id);
create index if not exists idx_candidaturas_status on public.candidaturas(status);
create index if not exists idx_admissoes_empresa_id on public.admissoes(empresa_id);
create index if not exists idx_admissoes_status on public.admissoes(status);
create index if not exists idx_esocial_empresa_id on public.esocial_eventos(empresa_id);
