-- Atualizar a tabela de favoritos para suportar favoritar pessoas (talentos/prestadores)
ALTER TABLE favoritos 
ADD COLUMN IF NOT EXISTS favorito_usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_search ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_target_user ON favoritos(favorito_usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_target_service ON favoritos(servico_id);

-- Comentários para documentação
COMMENT ON COLUMN favoritos.favorito_usuario_id IS 'ID do usuário (talento ou prestador) que está sendo favoritado';
COMMENT ON COLUMN favoritos.usuario_id IS 'ID do usuário que realizou a ação de favoritar';
