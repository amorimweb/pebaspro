-- Habilita RLS para as tabelas de chat
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Limpa políticas existentes para evitar conflitos (opcional)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conversas" ON public.conversas;
DROP POLICY IF EXISTS "Usuários podem ver mensagens de suas conversas" ON public.mensagens;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens em suas conversas" ON public.mensagens;

-- Política para CONVERSAS: Usuário deve ser participante 1 ou 2
CREATE POLICY "Usuários podem ver suas próprias conversas" ON public.conversas
FOR SELECT USING (
  auth.uid() = participante1_id OR 
  auth.uid() = participante2_id
);

-- Política para MENSAGENS: Usuário deve participar da conversa da mensagem
CREATE POLICY "Usuários podem ver mensagens de suas conversas" ON public.mensagens
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversas
    WHERE id = mensagens.conversa_id
    AND (auth.uid() = participante1_id OR auth.uid() = participante2_id)
  )
);

-- Permissão para INSERIR mensagens (enviar)
CREATE POLICY "Usuários podem enviar mensagens em suas conversas" ON public.mensagens
FOR INSERT WITH CHECK (
  auth.uid() = remetente_id AND
  EXISTS (
    SELECT 1 FROM public.conversas
    WHERE id = mensagens.conversa_id
    AND (auth.uid() = participante1_id OR auth.uid() = participante2_id)
  )
);

-- Garante que usuários autenticados tenham permissões básicas
GRANT SELECT, INSERT, UPDATE ON public.conversas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mensagens TO authenticated;
