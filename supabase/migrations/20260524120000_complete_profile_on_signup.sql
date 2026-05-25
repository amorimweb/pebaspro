ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text;

CREATE OR REPLACE FUNCTION public.handle_complete_profile_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  cadastro jsonb := NEW.raw_user_meta_data -> 'cadastro';
  tipo text := cadastro ->> 'tipo_conta';
BEGIN
  -- OAuth is completed after the callback because its provider owns metadata.
  IF cadastro IS NULL THEN
    RETURN NEW;
  END IF;

  IF COALESCE((cadastro ->> 'cadastro_completo')::boolean, false) IS NOT TRUE
    OR tipo NOT IN ('talento', 'prestador', 'empresa')
    OR NULLIF(trim(cadastro ->> 'nome'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'documento'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'telefone'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'cidade'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'estado'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'profissao'), '') IS NULL
    OR NULLIF(trim(cadastro ->> 'sobre_mim'), '') IS NULL THEN
    RAISE EXCEPTION 'Cadastro completo e obrigatorio para criar a conta';
  END IF;

  INSERT INTO public.usuarios (
    id,
    email,
    nome,
    documento,
    telefone,
    cidade,
    estado,
    regiao,
    endereco,
    profissao,
    objetivo_profissional,
    habilidades,
    sobre_mim,
    biografia,
    tipo_conta,
    cadastro_completo,
    status
  ) VALUES (
    NEW.id,
    NEW.email,
    cadastro ->> 'nome',
    cadastro ->> 'documento',
    cadastro ->> 'telefone',
    upper(cadastro ->> 'cidade'),
    cadastro ->> 'estado',
    NULLIF(trim(cadastro ->> 'regiao'), ''),
    NULLIF(trim(cadastro ->> 'endereco'), ''),
    cadastro ->> 'profissao',
    NULLIF(trim(cadastro ->> 'objetivo_profissional'), ''),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(cadastro -> 'habilidades', '[]'::jsonb))),
    cadastro ->> 'sobre_mim',
    COALESCE(NULLIF(trim(cadastro ->> 'biografia'), ''), cadastro ->> 'sobre_mim'),
    tipo,
    true,
    'ativo'
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
