-- 1. Tabela de Notificações
create table if not exists public.notificacoes (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  titulo text not null,
  mensagem text not null,
  tipo text not null default 'geral', -- 'vaga', 'mensagem', 'sistema'
  lida boolean not null default false,
  link text null,
  created_at timestamp with time zone not null default now(),
  constraint notificacoes_pkey primary key (id),
  constraint notificacoes_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Habilitar RLS para notificações
alter table public.notificacoes enable row level security;

create policy "Usuários podem ver suas próprias notificações"
  on public.notificacoes for select
  using (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias notificações"
  on public.notificacoes for update
  using (auth.uid() = user_id);

-- 2. Função para cálculo de distância (Haversine) - Retorna em KM
create or replace function calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
returns double precision as $$
declare
  r double precision := 6371; -- Raio da Terra em km
  dlat double precision;
  dlon double precision;
  a double precision;
  c double precision;
begin
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  return r * c;
end;
$$ language plpgsql immutable;

-- 3. Trigger para notificar talentos sobre novas vagas na região (20km)
create or replace function notify_nearby_talents()
returns trigger as $$
begin
  insert into public.notificacoes (user_id, titulo, mensagem, tipo, link)
  select 
    u.id,
    'Nova vaga na sua área: ' || NEW.titulo,
    'Uma nova vaga de ' || NEW.titulo || ' foi publicada perto de você em ' || NEW.local,
    'vaga',
    '/vagas/' || NEW.id
  from public.usuarios u
  where u.tipo_conta = 'talento'
    and u.latitude is not null 
    and u.longitude is not null
    and NEW.latitude is not null
    and NEW.longitude is not null
    and calculate_distance(u.latitude, u.longitude, NEW.latitude, NEW.longitude) <= 20; -- Raio de 20km
  
  return NEW;
end;
$$ language plpgsql;

create trigger tr_notify_nearby_talents
after insert on public.vagas
for each row
execute function notify_nearby_talents();
