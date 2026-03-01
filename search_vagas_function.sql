-- Function to search jobs by location and skills match
CREATE OR REPLACE FUNCTION public.search_vagas(
  user_lat double precision,
  user_lon double precision,
  radius_km double precision,
  user_skills text[] DEFAULT '{}'::text[]
)
RETURNS TABLE (
  id uuid,
  empresa_id uuid,
  titulo text,
  descricao text,
  requisitos text,
  beneficios text,
  modalidade text,
  tipo text,
  jornada text,
  salario text,
  "local" text,
  whatsapp text,
  data_publicacao timestamptz,
  encerramento date,
  updated_at timestamptz,
  categoria_id uuid,
  habilidades_exigidas text[],
  latitude double precision,
  longitude double precision,
  nivel_experiencia text,
  dist_km double precision,
  skill_match_count integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.empresa_id,
    v.titulo,
    v.descricao,
    v.requisitos,
    v.beneficios,
    v.modalidade,
    v.tipo,
    v.jornada,
    v.salario,
    v.local,
    v.whatsapp,
    v.data_publicacao,
    v.encerramento,
    v.updated_at,
    v.categoria_id,
    v.habilidades_exigidas,
    v.latitude,
    v.longitude,
    v.nivel_experiencia,
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(v.latitude)) * 
        cos(radians(v.longitude) - radians(user_lon)) + 
        sin(radians(user_lat)) * sin(radians(v.latitude))
      )
    ) AS dist_km,
    (
      SELECT count(*)::integer
      FROM unnest(v.habilidades_exigidas) AS h
      WHERE h = ANY(user_skills)
    ) AS skill_match_count
  FROM 
    public.vagas v
  WHERE 
    v.encerramento IS NULL -- Apenas vagas ativas
    AND (
      v.latitude IS NOT NULL 
      AND v.longitude IS NOT NULL
      AND (
        6371 * acos(
          cos(radians(user_lat)) * cos(radians(v.latitude)) * 
          cos(radians(v.longitude) - radians(user_lon)) + 
          sin(radians(user_lat)) * sin(radians(v.latitude))
        )
      ) <= radius_km
    )
  ORDER BY 
    skill_match_count DESC, 
    dist_km ASC,
    v.data_publicacao DESC;
END;
$$;
