import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Briefcase, Users, FileText, CheckCircle2, Clock, XCircle, AlertCircle, MoreVertical, FileSignature, ArrowRightLeft, Eye, Edit, PauseCircle, PlayCircle, Star, History, Download, Check, X } from 'lucide-react';
import { FunnelChart, Funnel, LabelList, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockVagas = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  titulo: `Vaga RH ${i + 1}`,
  empresa: `Empresa ${Math.floor(i / 4) + 1} Ltda`,
  cidade: i % 3 === 0 ? 'Remoto' : i % 2 === 0 ? 'São Paulo, SP' : 'Rio de Janeiro, RJ',
  status: i % 5 === 0 ? 'encerrada' : i % 4 === 0 ? 'pausada' : 'aberta',
  urgencia: i % 6 === 0 ? 'alta' : i % 3 === 0 ? 'media' : 'baixa',
  candidatos: Math.floor(Math.random() * 200),
  dataCriacao: `1${i % 9}/04/2026`
}));

const mockCandidatos = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  nome: `Candidato ${i + 1}`,
  vaga: `Vaga RH ${Math.floor(i / 3) + 1}`,
  fase: i % 4 === 0 ? 'Triagem' : i % 3 === 0 ? 'Entrevista' : i % 2 === 0 ? 'Proposta' : 'Inscrito',
  score: Math.floor(Math.random() * 40) + 60,
  dataAplicacao: `1${i % 9}/04/2026`
}));

const mockAdmissoes = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nome: `Colaborador ${i + 1}`,
  tipo: i % 3 === 0 ? 'Desligamento' : 'Admissão',
  empresa: `Empresa ${Math.floor(i / 4) + 1} Ltda`,
  status: i % 4 === 0 ? 'concluido' : i % 2 === 0 ? 'pendente' : 'em_andamento',
  dataEfetivacao: `2${i % 9}/04/2026`
}));

const mockDocumentos = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  usuario: `Usuário ${i + 1}`,
  tipo: i % 3 === 0 ? 'Comprovante de Residência' : i % 2 === 0 ? 'CNH' : 'RG/CPF',
  status: i % 4 === 0 ? 'rejeitado' : i % 2 === 0 ? 'aprovado' : 'pendente',
  dataEnvio: `0${i % 9 + 1}/04/2026`
}));

const mockAuditoria = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  usuario: `Admin ${Math.floor(i / 5) + 1}`,
  acao: i % 3 === 0 ? 'Aprovação de Documento' : i % 2 === 0 ? 'Alteração de Status de Vaga' : 'Visualização de Perfil',
  detalhes: `Ação realizada no item #${i * 2 + 1}`,
  data: `1${i % 9}/04/2026 14:${(i * 3).toString().padStart(2, '0')}`
}));

const funnelData = [
  { value: 1000, name: 'Inscritos', fill: '#8b5cf6' },
  { value: 800, name: 'Triagem', fill: '#a855f7' },
  { value: 400, name: 'Entrevista', fill: '#d946ef' },
  { value: 150, name: 'Proposta', fill: '#ec4899' },
  { value: 50, name: 'Contratados', fill: '#f43f5e' },
];

type TabType = 'vagas' | 'candidatos' | 'admissoes' | 'documentos' | 'auditoria';

export default function PainelRH() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('vagas');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const tabs = [
    { id: 'vagas', name: 'Gestão de Vagas', icon: Briefcase },
    { id: 'candidatos', name: 'Candidatos', icon: Users },
    { id: 'admissoes', name: 'Admissões / Desligamentos', icon: ArrowRightLeft },
    { id: 'documentos', name: 'Documentos', icon: FileSignature },
    { id: 'auditoria', name: 'Auditoria', icon: History },
  ];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const getFilteredData = () => {
    switch (activeTab) {
      case 'vagas':
        return mockVagas.filter(v => v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || v.empresa.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'candidatos':
        return mockCandidatos.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.vaga.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'admissoes':
        return mockAdmissoes.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || a.empresa.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'documentos':
        return mockDocumentos.filter(d => d.usuario.toLowerCase().includes(searchTerm.toLowerCase()) || d.tipo.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'auditoria':
        return mockAuditoria.filter(a => a.usuario.toLowerCase().includes(searchTerm.toLowerCase()) || a.acao.toLowerCase().includes(searchTerm.toLowerCase()));
      default:
        return [];
    }
  };

  const filteredData = useMemo(() => getFilteredData(), [searchTerm, activeTab]);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const handleViewDetails = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setIsModalOpen(true);
    logAction(`view_${type}_details`, 'rh', { itemId: item.id });
  };

  const handleAction = (action: string, item: any, type: string) => {
    if (!canPerformAction('edit', 'rh')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_${type}`, 'rh', { itemId: item.id });
    alert(`Ação "${action}" realizada no item #${item.id}. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Painel RH</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestão completa de recrutamento, seleção, admissões e documentos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Vagas Abertas</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-green-600">145</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Vagas Pausadas</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-yellow-600">32</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Encerradas (Mês)</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">89</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Candidaturas</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-purple-600">8.492</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Admissões</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-blue-600">124</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Desligamentos</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-red-600">18</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Docs Pendentes</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-orange-600">56</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap'
                  )}
                >
                  <tab.icon
                    className={cn(
                      activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                      '-ml-0.5 mr-2 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:max-w-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder={`Buscar em ${tabs.find(t => t.id === activeTab)?.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-gray-500">Carregando dados...</div>
            ) : filteredData.length === 0 ? (
              <EmptyState
                title="Nenhum registro encontrado"
                description={`Não encontramos resultados para "${searchTerm}".`}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {activeTab === 'vagas' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Vaga</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Empresa / Local</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Candidatos</th>
                          </>
                        )}
                        {activeTab === 'candidatos' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Candidato</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vaga</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fase</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                          </>
                        )}
                        {activeTab === 'admissoes' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Colaborador</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Empresa</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          </>
                        )}
                        {activeTab === 'documentos' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Usuário</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo de Documento</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Envio</th>
                          </>
                        )}
                        {activeTab === 'auditoria' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Usuário</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ação</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Detalhes</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                          </>
                        )}
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {activeTab === 'vagas' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
                                    <Briefcase className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900">{item.titulo}</div>
                                    <div className="text-xs text-gray-500">Criada em {item.dataCriacao}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-900">{item.empresa}</div>
                                <div className="text-xs text-gray-500">{item.cidade}</div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <div className="flex flex-col gap-1">
                                  {item.status === 'aberta' && (
                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Aberta
                                    </span>
                                  )}
                                  {item.status === 'pausada' && (
                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                      <Clock className="h-3.5 w-3.5" /> Pausada
                                    </span>
                                  )}
                                  {item.status === 'encerrada' && (
                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                      <XCircle className="h-3.5 w-3.5" /> Encerrada
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  {item.candidatos}
                                </div>
                              </td>
                            </>
                          )}
                          {activeTab === 'candidatos' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.nome}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.vaga}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.fase}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.score >= 80 ? 'bg-green-50 text-green-700' : item.score >= 60 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                  {item.score}%
                                </span>
                              </td>
                            </>
                          )}
                          {activeTab === 'admissoes' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.nome}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.tipo}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.empresa}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'concluido' ? 'bg-green-50 text-green-700' : item.status === 'pendente' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                            </>
                          )}
                          {activeTab === 'documentos' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.usuario}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.tipo}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'aprovado' ? 'bg-green-50 text-green-700' : item.status === 'rejeitado' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.dataEnvio}</td>
                            </>
                          )}
                          {activeTab === 'auditoria' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.usuario}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.acao}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.detalhes}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.data}</td>
                            </>
                          )}
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex items-center justify-end gap-2">
                              {activeTab !== 'auditoria' && (
                                <button onClick={() => handleViewDetails(item, activeTab)} className="text-gray-400 hover:text-primary-600" title="Visualizar">
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              {canPerformAction('edit', 'rh') && activeTab === 'vagas' && (
                                <>
                                  {item.status === 'aberta' && (
                                    <button onClick={() => handleAction('pausar', item, 'vaga')} className="text-gray-400 hover:text-yellow-600" title="Pausar">
                                      <PauseCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  {item.status === 'pausada' && (
                                    <button onClick={() => handleAction('abrir', item, 'vaga')} className="text-gray-400 hover:text-green-600" title="Reabrir">
                                      <PlayCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  {item.status !== 'encerrada' && (
                                    <button onClick={() => handleAction('encerrar', item, 'vaga')} className="text-gray-400 hover:text-red-600" title="Encerrar">
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                </>
                              )}
                              {canPerformAction('edit', 'rh') && activeTab === 'documentos' && item.status === 'pendente' && (
                                <>
                                  <button onClick={() => handleAction('aprovar', item, 'documento')} className="text-gray-400 hover:text-green-600" title="Aprovar">
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleAction('rejeitar', item, 'documento')} className="text-gray-400 hover:text-red-600" title="Rejeitar">
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {activeTab !== 'auditoria' && (
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredData.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Column - Funnel Chart */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Funil de Recrutamento Global</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <RechartsTooltip />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Taxa de conversão (Inscritos para Contratados): <span className="font-semibold text-gray-900">5%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveTab('documentos')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 font-medium">
                Aprovar Documentos Pendentes (56)
              </button>
              <button onClick={() => setActiveTab('vagas')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 font-medium">
                Revisar Vagas Urgentes (12)
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 font-medium">
                Exportar Relatório Mensal
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalhes: ${selectedItem?.type}`}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
                {selectedItem.type === 'vagas' ? <Briefcase className="h-8 w-8 text-purple-600" /> :
                 selectedItem.type === 'candidatos' ? <Users className="h-8 w-8 text-purple-600" /> :
                 selectedItem.type === 'admissoes' ? <ArrowRightLeft className="h-8 w-8 text-purple-600" /> :
                 <FileSignature className="h-8 w-8 text-purple-600" />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedItem.titulo || selectedItem.nome || selectedItem.usuario}
                </h3>
                <p className="text-sm text-gray-500">ID: #{selectedItem.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedItem).map(([key, value]) => {
                if (key === 'id' || key === 'type') return null;
                return (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="mt-1 text-sm text-gray-900">{value as string}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'rh') && (
                <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
