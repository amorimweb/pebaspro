-- Migration: Add attachment support to messages table
ALTER TABLE public.mensagens ADD COLUMN IF NOT EXISTS url_anexo text;
ALTER TABLE public.mensagens ADD COLUMN IF NOT EXISTS tipo_anexo text;

-- Função para atualizar a última mensagem na conversa
CREATE OR REPLACE FUNCTION public.update_conversa_ultima_mensagem()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversas
    SET 
        ultima_mensagem = NEW.conteudo,
        updated_at = NOW()
    WHERE id = NEW.conversa_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para novas mensagens
DROP TRIGGER IF EXISTS tr_update_conversa_ultima_mensagem ON public.mensagens;
CREATE TRIGGER tr_update_conversa_ultima_mensagem
AFTER INSERT ON public.mensagens
FOR EACH ROW
EXECUTE FUNCTION public.update_conversa_ultima_mensagem();

-- Add comment for documentation
COMMENT ON COLUMN public.mensagens.url_anexo IS 'URL do arquivo em anexo (armazenado no Supabase Storage)';
COMMENT ON COLUMN public.mensagens.tipo_anexo IS 'Tipo do anexo (ex: image, document)';
