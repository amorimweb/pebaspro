-- 1. Criar a nova tabela de visualizações
create table if not exists public.visualizacoes_vitrine (
  id uuid not null default gen_random_uuid(),
  vitrine_id uuid not null references public.usuarios(id) on delete cascade,
  visitante_id uuid references public.usuarios(id) on delete set null,
  ip_address text,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (id)
);

-- 2. Criar índices para buscas rápidas
create index if not exists idx_visualizacoes_vitrine_vitrine_id on public.visualizacoes_vitrine(vitrine_id);
create index if not exists idx_visualizacoes_vitrine_ip_address on public.visualizacoes_vitrine(ip_address);

-- 3. Habilitar RLS (opcional, mas recomendado)
alter table public.visualizacoes_vitrine enable row level security;

-- Permitir leitura apenas para o dono da vitrine ou admin
create policy "Ver próprias visualizações" on public.visualizacoes_vitrine
  for select using (
    auth.uid() = vitrine_id
    or exists (select 1 from public.usuarios where id = auth.uid() and role = 'admin')
  );

-- Permitir que o backend insira registros anonimamente com Service Role, então não precisamos de policies para INSERT.
