ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS modo_prestador boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.usuarios.modo_prestador IS
'Permite que contas empresa tambem publiquem servicos e aparecam como prestadores.';
