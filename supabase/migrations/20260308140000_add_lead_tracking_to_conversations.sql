-- Adiciona suporte para rastreamento de leads do WhatsApp e status de contratação
ALTER TABLE public.conversas 
ADD COLUMN IF NOT EXISTS tipo_contato text DEFAULT 'interno', -- 'interno' (chat da plataforma), 'whatsapp' (contato via clique)
ADD COLUMN IF NOT EXISTS status_contratacao text DEFAULT 'interessado'; -- 'interessado', 'negociando', 'contratado', 'recusado'

-- Comentários para documentação no banco
COMMENT ON COLUMN public.conversas.tipo_contato IS 'Define se a conversa é via chat interno ou iniciada via link de WhatsApp';
COMMENT ON COLUMN public.conversas.status_contratacao IS 'Estado do processo de contratação para este lead/conversa';
