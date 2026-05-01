-- ─── Tabela documentos ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID        NOT NULL,
  talento_id    UUID,
  conversa_id   UUID        REFERENCES conversas(id) ON DELETE SET NULL,
  nome          TEXT        NOT NULL,
  tipo          TEXT        DEFAULT 'Geral',
  url           TEXT        NOT NULL,
  tamanho_bytes INTEGER,
  status        TEXT        DEFAULT 'Pendente'
                            CHECK (status IN ('Pendente', 'Aprovado', 'Atenção')),
  enviado_por   UUID        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_documentos" ON documentos
  FOR ALL USING (
    empresa_id  = auth.uid() OR
    talento_id  = auth.uid() OR
    enviado_por = auth.uid()
  );

-- ─── Alterar mensagens para suportar anexos ────────────────────────────────────
ALTER TABLE mensagens
  ADD COLUMN IF NOT EXISTS tipo          TEXT DEFAULT 'texto',
  ADD COLUMN IF NOT EXISTS documento_id  UUID REFERENCES documentos(id) ON DELETE SET NULL;
