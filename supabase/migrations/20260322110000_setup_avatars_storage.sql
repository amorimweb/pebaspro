-- 1. Criar o bucket de avatars se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS (Storage buckets já têm RLS por padrão no Supabase, mas vamos garantir)
-- Nota: Supabase storage usa tabelas storage.objects e storage.buckets

-- 3. Políticas para o bucket 'avatars'

-- Permitir acesso público de leitura para todos
CREATE POLICY "Avatars são públicos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Permitir que usuários autenticados façam upload apenas com seu próprio ID no nome do arquivo
-- O padrão usado no código é {userId}-{timestamp}.jpg
CREATE POLICY "Usuários podem fazer upload de seus próprios avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = '' -- se não houver pastas
    AND name LIKE (auth.uid()::text || '%')
);

-- Permitir atualização (overwrite) de seus próprios arquivos
CREATE POLICY "Usuários podem atualizar seus próprios avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND name LIKE (auth.uid()::text || '%')
);

-- Permitir exclusão de seus próprios arquivos
CREATE POLICY "Usuários podem excluir seus próprios avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND name LIKE (auth.uid()::text || '%')
);
