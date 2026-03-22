-- Adiciona políticas de RLS para INSERT e UPDATE na tabela de conversas

-- Política: usuário autenticado pode criar uma conversa onde ele seja participante
DROP POLICY IF EXISTS "Usuários podem criar conversas" ON public.conversas;
CREATE POLICY "Usuários podem criar conversas" ON public.conversas
FOR INSERT WITH CHECK (
  auth.uid() = participante1_id OR auth.uid() = participante2_id
);

-- Política: participantes podem atualizar a conversa (ex: atualizar ultima_mensagem, updated_at)
DROP POLICY IF EXISTS "Participantes podem atualizar conversas" ON public.conversas;
CREATE POLICY "Participantes podem atualizar conversas" ON public.conversas
FOR UPDATE USING (
  auth.uid() = participante1_id OR auth.uid() = participante2_id
) WITH CHECK (
  auth.uid() = participante1_id OR auth.uid() = participante2_id
);
