-- Migração para adicionar suporte a candidaturas e vincular conversas a vagas

-- 1. Criar tabela de candidaturas (se não existir)
CREATE TABLE IF NOT EXISTS public.candidaturas (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  vaga_id uuid NOT NULL,
  talento_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pendente', -- pendente, visualizada, aceita, rejeitada
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidaturas_pkey PRIMARY KEY (id),
  CONSTRAINT candidaturas_talento_id_fkey FOREIGN KEY (talento_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT candidaturas_vaga_id_fkey FOREIGN KEY (vaga_id) REFERENCES vagas (id) ON DELETE CASCADE,
  CONSTRAINT candidaturas_vaga_talento_unique UNIQUE (vaga_id, talento_id)
) TABLESPACE pg_default;

-- 2. Adicionar vaga_id à tabela de conversas
ALTER TABLE public.conversas 
ADD COLUMN IF NOT EXISTS vaga_id uuid REFERENCES public.vagas(id) ON DELETE SET NULL;

-- 3. Atualizar a restrição de unicidade das conversas
-- Primeiro removemos a antiga (se existir)
ALTER TABLE public.conversas DROP CONSTRAINT IF EXISTS conversas_participantes_unique;

-- Adicionamos a nova que permite múltiplos chats entre os mesmos usuários desde que sejam para vagas diferentes
-- Nota: PostgreSQL trata NULL como valores distintos em índices UNIQUE simples, 
-- então múltiplas conversas (P1, P2, NULL) poderiam ser criadas se não tomarmos cuidado.
-- No entanto, para o fluxo de "Chat Geral", manteremos apenas uma.
CREATE UNIQUE INDEX IF NOT EXISTS conversas_p1_p2_vaga_idx ON public.conversas (participante1_id, participante2_id, (COALESCE(vaga_id, '00000000-0000-0000-0000-000000000000'::uuid)));

-- 4. Políticas de RLS para Candidaturas
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

-- Talentos podem ver suas próprias candidaturas
CREATE POLICY "Talentos podem ver suas próprias candidaturas"
ON public.candidaturas FOR SELECT
USING (auth.uid() = talento_id);

-- Empresas podem ver candidaturas para suas vagas
CREATE POLICY "Empresas podem ver candidaturas para suas vagas"
ON public.candidaturas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vagas
    WHERE vagas.id = candidaturas.vaga_id
    AND vagas.empresa_id = auth.uid()
  )
);

-- Talentos podem se candidatar
CREATE POLICY "Talentos podem se candidatar"
ON public.candidaturas FOR INSERT
WITH CHECK (auth.uid() = talento_id);

-- Empresas podem atualizar o status da candidatura
CREATE POLICY "Empresas podem atualizar status da candidatura"
ON public.candidaturas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vagas
    WHERE vagas.id = candidaturas.vaga_id
    AND vagas.empresa_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vagas
    WHERE vagas.id = candidaturas.vaga_id
    AND vagas.empresa_id = auth.uid()
  )
);
