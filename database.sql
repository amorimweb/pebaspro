create table public.categorias (
  id uuid not null default gen_random_uuid (),
  nome text not null,
  slug text not null,
  icone text null,
  descricao text null,
  created_at timestamp with time zone null default now(),
  constraint categorias_pkey primary key (id),
  constraint categorias_slug_key unique (slug)
) TABLESPACE pg_default;

create table public.conversas (
  id uuid not null default gen_random_uuid (),
  participante1_id uuid not null,
  participante2_id uuid not null,
  vaga_id uuid null,
  ultima_mensagem text null,
  tipo_contato text null default 'chat'::text,
  status_contratacao text null default 'interessado'::text,
  updated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint conversas_pkey primary key (id),
  constraint conversas_participantes_unique unique (participante1_id, participante2_id),
  constraint conversas_participante1_id_fkey foreign KEY (participante1_id) references usuarios (id) on delete CASCADE,
  constraint conversas_participante2_id_fkey foreign KEY (participante2_id) references usuarios (id) on delete CASCADE,
  constraint conversas_vaga_id_fkey foreign KEY (vaga_id) references vagas (id) on delete SET NULL
) TABLESPACE pg_default;

create table public.mensagens (
  id uuid not null default gen_random_uuid (),
  conversa_id uuid not null,
  remetente_id uuid not null,
  conteudo text not null,
  lida boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint mensagens_pkey primary key (id),
  constraint mensagens_conversa_id_fkey foreign KEY (conversa_id) references conversas (id) on delete CASCADE,
  constraint mensagens_remetente_id_fkey foreign KEY (remetente_id) references usuarios (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger on_new_message
after INSERT on mensagens for EACH row
execute FUNCTION handle_new_message ();

create table public.servicos (
  id uuid not null default gen_random_uuid (),
  prestador_id uuid not null,
  titulo text not null,
  descricao text null,
  preco_inicial numeric null,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint servicos_pkey primary key (id),
  constraint servicos_prestador_id_fkey foreign KEY (prestador_id) references usuarios (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.solicitacoes_orcamento (
  id uuid not null default gen_random_uuid (),
  servico_id uuid not null,
  cliente_id uuid not null,
  mensagem text not null,
  status text not null default 'pendente'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint solicitacoes_orcamento_pkey primary key (id),
  constraint solicitacoes_orcamento_cliente_id_fkey foreign KEY (cliente_id) references usuarios (id) on delete CASCADE,
  constraint solicitacoes_orcamento_servico_id_fkey foreign KEY (servico_id) references servicos (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.avaliacoes (
  id uuid not null default gen_random_uuid (),
  servico_id uuid not null,
  prestador_id uuid not null,
  cliente_id uuid not null,
  nota integer not null,
  comentario text null,
  created_at timestamp with time zone not null default now(),
  constraint avaliacoes_pkey primary key (id),
  constraint avaliacoes_cliente_id_fkey foreign KEY (cliente_id) references usuarios (id) on delete CASCADE,
  constraint avaliacoes_prestador_id_fkey foreign KEY (prestador_id) references usuarios (id) on delete CASCADE,
  constraint avaliacoes_servico_id_fkey foreign KEY (servico_id) references servicos (id) on delete CASCADE,
  constraint avaliacoes_nota_check check ((nota >= 1) and (nota <= 5))
) TABLESPACE pg_default;

create table public.favoritos (
  id uuid not null default gen_random_uuid (),
  usuario_id uuid not null,
  servico_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint favoritos_pkey primary key (id),
  constraint favoritos_usuario_id_fkey foreign KEY (usuario_id) references usuarios (id) on delete CASCADE,
  constraint favoritos_servico_id_fkey foreign KEY (servico_id) references servicos (id) on delete CASCADE,
  constraint favoritos_usuario_servico_unique unique (usuario_id, servico_id)
) TABLESPACE pg_default;

create table public.usuarios (
  id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  nome text null,
  email text null,
  documento text null,
  telefone text null,
  endereco text null,
  profissao text null,
  regiao text null,
  sobre_mim text null,
  status text null default 'ativo'::text,
  tipo_conta text null default 'cliente'::text,
  biografia text null,
  cadastro_completo boolean null default false,
  foto text null,
  experiencia_profissional jsonb null default '[]'::jsonb,
  formacao_academica jsonb null default '[]'::jsonb,
  habilidades text[] null default '{}'::text[],
  objetivo_profissional text null,
  latitude double precision null,
  longitude double precision null,
  role text not null default 'user'::text,
  constraint usuarios_pkey primary key (id),
  constraint usuarios_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint usuarios_role_check check (
    (
      role = any (
        array['user'::text, 'admin'::text, 'superadmin'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_usuarios_location on public.usuarios using btree (latitude, longitude) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on usuarios for EACH row
execute FUNCTION extensions.moddatetime ('updated_at');

create index IF not exists idx_usuarios_location on public.usuarios using btree (latitude, longitude) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on usuarios for EACH row
execute FUNCTION extensions.moddatetime ('updated_at');

create table public.vagas (
  id uuid not null default gen_random_uuid (),
  empresa_id uuid not null,
  titulo text not null,
  descricao text null,
  requisitos text null,
  beneficios text null,
  modalidade text null default 'presencial'::text,
  tipo text null,
  jornada text null,
  salario text null,
  local text null,
  whatsapp text null,
  data_publicacao timestamp with time zone not null default timezone ('utc'::text, now()),
  encerramento date null,
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  categoria_id uuid null,
  habilidades_exigidas text[] null,
  latitude double precision null,
  longitude double precision null,
  nivel_experiencia text null,
  email text null,
  tipo_contato text null default 'whatsapp'::text,
  constraint vagas_pkey primary key (id),
  constraint vagas_categoria_id_fkey foreign KEY (categoria_id) references categorias (id),
  constraint vagas_empresa_id_fkey foreign KEY (empresa_id) references usuarios (id) on delete CASCADE,
  constraint vagas_tipo_contato_check check (
    (
      tipo_contato = any (
        array['whatsapp'::text, 'email'::text, 'ambos'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_vagas_location on public.vagas using btree (latitude, longitude) TABLESPACE pg_default;