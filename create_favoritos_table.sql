-- Criação da tabela de favoritos para suportar tanto serviços quanto usuários (talentos/prestadores)
CREATE TABLE IF NOT EXISTS favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
    favorito_usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Garantir que pelo menos um desses campos esteja preenchido e não ambos ao mesmo tempo (opcional)
    CONSTRAINT check_target CHECK (
        (servico_id IS NOT NULL AND favorito_usuario_id IS NULL) OR 
        (servico_id IS NULL AND favorito_usuario_id IS NOT NULL)
    ),
    
    -- Evitar duplicados (mesmo usuário favoritando a mesma coisa)
    CONSTRAINT unique_favorito_servico UNIQUE(usuario_id, servico_id),
    CONSTRAINT unique_favorito_usuario UNIQUE(usuario_id, favorito_usuario_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_search ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_target_user ON favoritos(favorito_usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_target_service ON favoritos(servico_id);

-- Permissões de acesso
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Política simples: Usuários podem gerenciar seus próprios favoritos
CREATE POLICY "Usuários podem gerenciar seus favoritos" ON favoritos
    FOR ALL 
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

GRANT SELECT, INSERT, DELETE ON favoritos TO authenticated;
GRANT SELECT ON favoritos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON favoritos TO service_role;

-- Comentários para documentação
COMMENT ON TABLE favoritos IS 'Tabela que armazena os destaques e favoritos (serviços ou pessoas)';
COMMENT ON COLUMN favoritos.favorito_usuario_id IS 'ID do usuário (talento ou prestador) que está sendo favoritado';
COMMENT ON COLUMN favoritos.usuario_id IS 'ID do usuário que realizou a ação de favoritar';
