-- 1. Inserir Categorias Padrão (se a tabela estiver vazia ou faltando as básicas)
INSERT INTO public.categorias (nome, slug, icone) VALUES
('Eletricista', 'eletricista', '⚡'),
('Pintor', 'pintor', '🎨'),
('Diarista', 'diarista', '🧹'),
('Mecânico', 'mecanico', '🔧'),
('Pedreiro', 'pedreiro', '🧱'),
('Encanador', 'encanador', '🚰'),
('Marido de Aluguel', 'marido-de-aluguel', '🛠️'),
('Estética', 'estetica', '💅'),
('Tecnologia', 'tecnologia', '💻'),
('Eventos', 'eventos', '🎉')
ON CONFLICT (slug) DO NOTHING;

-- 2. Adicionar o relacionamento na tabela de serviços
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS categoria_id uuid references public.categorias (id) ON DELETE SET NULL;

-- 3. Criar índice para buscas otimizadas por categoria futuramente
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON public.servicos(categoria_id);
