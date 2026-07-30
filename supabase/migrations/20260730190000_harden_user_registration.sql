-- Garante integridade do cadastro independentemente do cliente utilizado.
UPDATE public.usuarios
SET modo_prestador = (tipo_conta = 'prestador')
WHERE modo_prestador IS DISTINCT FROM (tipo_conta = 'prestador');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE NULLIF(regexp_replace(COALESCE(documento, ''), '\D', '', 'g'), '') IS NOT NULL
    GROUP BY regexp_replace(documento, '\D', '', 'g')
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Existem CPFs/CNPJs duplicados em public.usuarios; corrija-os antes de aplicar a restricao unica';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_documento_digits_unique
ON public.usuarios ((regexp_replace(documento, '\D', '', 'g')))
WHERE NULLIF(regexp_replace(COALESCE(documento, ''), '\D', '', 'g'), '') IS NOT NULL;

ALTER TABLE public.usuarios
DROP CONSTRAINT IF EXISTS usuarios_tipo_conta_check;

ALTER TABLE public.usuarios
ADD CONSTRAINT usuarios_tipo_conta_check
CHECK (tipo_conta IS NULL OR tipo_conta IN ('talento', 'prestador', 'empresa'));

ALTER TABLE public.usuarios
DROP CONSTRAINT IF EXISTS usuarios_documento_length_check;

ALTER TABLE public.usuarios
ADD CONSTRAINT usuarios_documento_length_check
CHECK (
  documento IS NULL OR
  length(regexp_replace(documento, '\D', '', 'g')) IN (11, 14)
);

CREATE OR REPLACE FUNCTION public.handle_complete_profile_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  cadastro jsonb := NEW.raw_user_meta_data -> 'cadastro';
  tipo text := cadastro ->> 'tipo_conta';
  documento_digits text := regexp_replace(COALESCE(cadastro ->> 'documento', ''), '\D', '', 'g');
  habilidades_count integer := jsonb_array_length(COALESCE(cadastro -> 'habilidades', '[]'::jsonb));
BEGIN
  -- OAuth é finalizado pelo callback da aplicação.
  IF cadastro IS NULL THEN
    RETURN NEW;
  END IF;

  IF COALESCE((cadastro ->> 'cadastro_completo')::boolean, false) IS NOT TRUE
    OR tipo NOT IN ('talento', 'prestador', 'empresa')
    OR NULLIF(trim(cadastro ->> 'nome'), '') IS NULL
    OR length(documento_digits) NOT IN (11, 14)
    OR (tipo = 'empresa' AND length(documento_digits) <> 14)
    OR (tipo = 'talento' AND length(documento_digits) <> 11)
    OR NULLIF(trim(cadastro ->> 'telefone'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'cidade'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'estado'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'profissao'), '') IS NULL
    OR length(trim(COALESCE(cadastro ->> 'sobre_mim', ''))) < 20
    OR (
      tipo = 'talento' AND (
        NULLIF(trim(cadastro ->> 'objetivo_profissional'), '') IS NULL
        OR habilidades_count = 0
      )
    ) THEN
    RAISE EXCEPTION 'Cadastro completo e valido e obrigatorio para criar a conta';
  END IF;

  INSERT INTO public.usuarios (
    id, email, nome, documento, telefone, cidade, estado, regiao, endereco,
    profissao, objetivo_profissional, habilidades, sobre_mim, biografia,
    tipo_conta, modo_prestador, cadastro_completo, status
  ) VALUES (
    NEW.id, NEW.email, trim(cadastro ->> 'nome'), cadastro ->> 'documento',
    cadastro ->> 'telefone', upper(trim(cadastro ->> 'cidade')),
    upper(trim(cadastro ->> 'estado')), NULLIF(trim(cadastro ->> 'regiao'), ''),
    NULLIF(trim(cadastro ->> 'endereco'), ''), trim(cadastro ->> 'profissao'),
    CASE WHEN tipo = 'talento' THEN NULLIF(trim(cadastro ->> 'objetivo_profissional'), '') END,
    CASE WHEN tipo = 'talento'
      THEN ARRAY(SELECT jsonb_array_elements_text(COALESCE(cadastro -> 'habilidades', '[]'::jsonb)))
      ELSE ARRAY[]::text[]
    END,
    trim(cadastro ->> 'sobre_mim'),
    COALESCE(NULLIF(trim(cadastro ->> 'biografia'), ''), trim(cadastro ->> 'sobre_mim')),
    tipo, tipo = 'prestador', true, 'ativo'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    documento = EXCLUDED.documento,
    telefone = EXCLUDED.telefone,
    cidade = EXCLUDED.cidade,
    estado = EXCLUDED.estado,
    regiao = EXCLUDED.regiao,
    endereco = EXCLUDED.endereco,
    profissao = EXCLUDED.profissao,
    objetivo_profissional = EXCLUDED.objetivo_profissional,
    habilidades = EXCLUDED.habilidades,
    sobre_mim = EXCLUDED.sobre_mim,
    biografia = EXCLUDED.biografia,
    tipo_conta = EXCLUDED.tipo_conta,
    modo_prestador = EXCLUDED.modo_prestador,
    cadastro_completo = true,
    status = 'ativo',
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_complete_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_complete_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_complete_profile_signup();
