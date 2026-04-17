export const initialCandidates = [
  { id: 1, name: 'Ricardo Santos', role: 'Operador de Escavadeira', location: 'Parauapebas', score: 92, status: 'Triagem', pending: 'Avaliação técnica', category: 'Operacional' },
  { id: 2, name: 'Ana Beatriz Souza', role: 'Engenheira de Minas', location: 'Canaã dos Carajás', score: 88, status: 'Triagem', pending: 'Nenhuma', category: 'Engenharia' },
  { id: 3, name: 'Carlos Eduardo', role: 'Técnico em Segurança', location: 'Parauapebas', score: 95, status: 'Entrevista', pending: 'Feedback RH', category: 'Técnico' },
  { id: 4, name: 'Juliana Lima', role: 'Assistente Administrativo', location: 'Parauapebas', score: 84, status: 'Documentação', pending: 'RG e CPF', category: 'ADM' },
  { id: 5, name: 'Marcos Oliveira', role: 'Mecânico Pesado', location: 'Parauapebas', score: 90, status: 'Documentação', pending: 'Certificados', category: 'Operacional' },
  { id: 6, name: 'Patrícia Mendes', role: 'Gerente de Projetos', location: 'Parauapebas', score: 98, status: 'Contratação', pending: 'Exame de Admissão', category: 'Engenharia' },
  { id: 7, name: 'Fernanda Rocha', role: 'Auxiliar de Almoxarifado', location: 'Parauapebas', score: 82, status: 'Admissão', progress: 65, status_adm: 'Em Conferência', pending: 'Aguardando ASO' },
  { id: 8, name: 'Gabriel Souza', role: 'Motorista de Caminhão Off-Road', location: 'Parauapebas', score: 78, status: 'Admissão', progress: 30, status_adm: 'Documentação', pending: 'Certificado MOPP' },
  { id: 9, name: 'Lúcia Ferreira', role: 'Técnica de Planejamento', location: 'Parauapebas', score: 90, status: 'Admissão', progress: 90, status_adm: 'eSocial', pending: 'Envio S-2200' },
];

export const initialAlerts = [
  { id: 101, title: 'ASO Vencendo (Ricardo S.)', date: 'Vence em 2 dias', status: 'crítico', type: 'Saúde Ocupacional' },
  { id: 102, title: 'Treinamento NR-10 Pendente', date: 'Hoje', status: 'crítico', type: 'Segurança' },
  { id: 103, title: 'Exame Periódico (Ana B.)', date: 'Vence em 15 dias', status: 'atenção', type: 'Saúde' },
  { id: 104, title: 'Função com Risco s/ Revisão', date: 'Vence em 30 dias', status: 'atenção', type: 'SST' },
  { id: 105, title: 'Evento eSocial S-2210', date: 'Pendente envio', status: 'crítico', type: 'eSocial' },
  { id: 106, title: 'Doc. Obrigatório Faltando', date: 'Pendente', status: 'atenção', type: 'Compliance' },
];

export const initialVagas = [
  { id: 201, title: 'Operador de Escavadeira', setor: 'Operacional', status: 'Aberta', candidatos: 12 },
  { id: 202, title: 'Engenheiro de Minas Senior', setor: 'Engenharia', status: 'Aberta', candidatos: 5 },
  { id: 203, title: 'Técnico em Segurança do Trabalho', setor: 'Técnico', status: 'Aberta', candidatos: 8 },
  { id: 204, title: 'Gerente de Qualidade', setor: 'ADM', status: 'Aberta', candidatos: 3 },
];

export const corporateStats = [
  { label: 'Taxa de Conversão', value: '28.4%', subtext: '+2.1% este mês' },
  { label: 'Admissões Finalizadas', value: '142', subtext: 'Meta anual: 200' },
  { label: 'Candidatos em Processo', value: '582', subtext: 'Ativos em todos os fluxos' },
];

// ─── Perfil da Empresa ─────────────────────────────────────────────────────
export const companyProfileMock = {
  name: 'PEBASPRO Soluções em Mineração',
  cnpj: '00.000.000/0001-00',
  email: 'contato@pebaspro.com.br',
  phone: '(94) 3346-0000',
  address: 'Av. Liberdade, 120 - Parauapebas, PA',
  employees: 280,
  units: 3,
  plan: 'corporativo',      // 'essencial' | 'operacional' | 'corporativo'
  mode: 'corporativo',      // modo de experiência atual do painel
  serviceProviderActive: false,
  serviceProviderData: null,
};

// ─── Definição dos Planos ──────────────────────────────────────────────────
export const plansDefinition = {
  essencial: {
    id: 'essencial',
    label: 'Essencial',
    price: 'R$ 149/mês',
    description: 'Ideal para pequenos negócios e operações simples.',
    color: '#1FAE66',
    modules: ['dashboard', 'recrutamento', 'talentos', 'admissao', 'documentos', 'configuracoes'],
    limits: { vagas: 3, usuarios: 1, relatorios: false, compliance: false, esocial: false, prestador: false },
  },
  operacional: {
    id: 'operacional',
    label: 'Operacional',
    price: 'R$ 349/mês',
    description: 'Para empresas com maior volume de contratações e controle intermediário.',
    color: '#1787D4',
    modules: ['dashboard', 'recrutamento', 'talentos', 'admissao', 'documentos', 'relatorios', 'configuracoes'],
    limits: { vagas: 15, usuarios: 5, relatorios: true, compliance: false, esocial: false, prestador: 'addon' },
  },
  corporativo: {
    id: 'corporativo',
    label: 'Corporativo',
    price: 'R$ 749/mês',
    description: 'Para grandes operações, múltiplas unidades e compliance completo.',
    color: '#0D2E5C',
    modules: ['dashboard', 'recrutamento', 'talentos', 'admissao', 'documentos', 'compliance', 'esocial', 'relatorios', 'configuracoes'],
    limits: { vagas: Infinity, usuarios: Infinity, relatorios: true, compliance: true, esocial: true, prestador: true },
  },
};

// ─── Mapeamento de módulos por modo de experiência ─────────────────────────
export const modeModules = {
  essencial:    ['dashboard', 'recrutamento', 'talentos', 'admissao', 'documentos', 'configuracoes'],
  operacional:  ['dashboard', 'recrutamento', 'talentos', 'admissao', 'documentos', 'relatorios', 'configuracoes'],
  corporativo:  ['dashboard', 'recrutamento', 'talentos', 'admissao', 'documentos', 'compliance', 'esocial', 'relatorios', 'configuracoes'],
};
