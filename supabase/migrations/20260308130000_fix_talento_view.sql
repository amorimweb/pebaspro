-- Reforça a view de talentos garantindo o filtro por tipo_conta e incluindo a coluna para conferência
CREATE OR REPLACE VIEW talento_curriculos AS
SELECT 
    u.id,
    u.nome,
    u.email,
    u.foto,
    u.telefone,
    u.endereco,
    u.profissao,
    u.regiao,
    u.cadastro_completo,
    u.status,
    u.tipo_conta,
    u.created_at,
    u.updated_at,
    c.objetivo_profissional,
    c.biografia,
    c.habilidades,
    c.experiencia_profissional,
    c.formacao_academica,
    c.latitude,
    c.longitude
FROM usuarios u
LEFT JOIN curriculos c ON u.id = c.user_id
WHERE u.tipo_conta = 'talento';

GRANT SELECT ON talento_curriculos TO anon, authenticated, service_role;
