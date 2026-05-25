import React, { useState, useMemo } from 'react';
import { Search, Filter, DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, MoreVertical, Edit, PlayCircle, PauseCircle, CheckCircle, XCircle, FileText, Megaphone, ShieldCheck, Eye, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const data = [
  { name: 'Jan', receita: 24000 },
  { name: 'Fev', receita: 13980 },
  { name: 'Mar', receita: 98000 },
  { name: 'Abr', receita: 39080 },
  { name: 'Mai', receita: 48000 },
  { name: 'Jun', receita: 38000 },
  { name: 'Jul', receita: 43000 },
];

const mockTransacoes = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  descricao: i % 3 === 0 ? `Assinatura Premium - Usuário ${i}` : i % 2 === 0 ? `Destaque de Vaga - Empresa ${i}` : `Estorno - Serviço #${i * 10}`,
  tipo: i % 5 === 0 ? 'saida' : 'entrada',
  valor: `R$ ${(Math.random() * 200 + 50).toFixed(2).replace('.', ',')}`,
  data: `1${i % 9}/04/2026`,
  status: i % 4 === 0 ? 'pendente' : i % 5 === 0 ? 'processado' : 'pago'
}));

const mockPlanos = [
  { id: 1, nome: 'Plano Básico', tipo: 'Prestador', valor: 'R$ 29,90', assinantes: 4500, status: 'ativo' },
  { id: 2, nome: 'Plano Pro', tipo: 'Prestador', valor: 'R$ 49,90', assinantes: 2100, status: 'ativo' },
  { id: 3, nome: 'Plano Premium', tipo: 'Empresa', valor: 'R$ 199,90', assinantes: 850, status: 'ativo' },
];

const mockAssinaturas = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  usuario: `Usuário Assinante ${i + 1}`,
  plano: i % 3 === 0 ? 'Plano Premium' : i % 2 === 0 ? 'Plano Pro' : 'Plano Básico',
  valor: i % 3 === 0 ? 'R$ 199,90' : i % 2 === 0 ? 'R$ 49,90' : 'R$ 29,90',
  status: i % 5 === 0 ? 'cancelada' : i % 4 === 0 ? 'inadimplente' : 'ativa',
  proximaCobranca: `2${i % 9}/05/2026`
}));

const mockAnuncios = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  titulo: `Anúncio Patrocinado ${i + 1}`,
  anunciante: `Empresa ${Math.floor(i / 2) + 1} Ltda`,
  orcamento: `R$ ${(Math.random() * 500 + 100).toFixed(2).replace('.', ',')}`,
  status: i % 4 === 0 ? 'pausado' : i % 3 === 0 ? 'concluido' : 'ativo',
  cliques: Math.floor(Math.random() * 1000),
  impressoes: Math.floor(Math.random() * 10000)
}));

type TabType = 'cobrancas' | 'assinaturas' | 'planos' | 'anuncios';

export default function Financeiro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('cobrancas');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const tabs = [
    { id: 'cobrancas', name: 'Cobranças e Transações', icon: DollarSign },
    { id: 'assinaturas', name: 'Assinaturas Ativas', icon: CreditCard },
    { id: 'planos', name: 'Gestão de Planos', icon: ShieldCheck },
    { id: 'anuncios', name: 'Anúncios Patrocinados', icon: Megaphone },
  ];

  const getFilteredData = () => {
    switch (activeTab) {
      case 'cobrancas':
        return mockTransacoes.filter(t => t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toString().includes(searchTerm));
      case 'assinaturas':
        return mockAssinaturas.filter(a => a.usuario.toLowerCase().includes(searchTerm.toLowerCase()) || a.plano.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'planos':
        return mockPlanos.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'anuncios':
        return mockAnuncios.filter(a => a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || a.anunciante.toLowerCase().includes(searchTerm.toLowerCase()));
      default:
        return [];
    }
  };

  const filteredData = useMemo(() => getFilteredData(), [searchTerm, activeTab]);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setIsModalOpen(true);
    logAction(`view_${type}_details`, 'financeiro', { itemId: item.id });
  };

  const handleAction = (action: string, item?: any, type?: string) => {
    if (!canPerformAction('edit', 'financeiro')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_${type || 'financeiro'}`, 'financeiro', item ? { itemId: item.id } : undefined);
    alert(`Ação "${action}" realizada. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Financeiro e Monetização</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe receitas, assinaturas, anúncios e inadimplência.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            Filtros
          </button>
          {canPerformAction('view', 'financeiro') && (
            <button onClick={() => handleAction('exportar_relatorio')} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              <FileText className="h-4 w-4" />
              Exportar Relatório
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Receita (Mês Atual)</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">R$ 43k</dd>
          <dd className="mt-1 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="mr-1 h-3 w-3" /> +12.5%
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Assinaturas Ativas</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">8.230</dd>
          <dd className="mt-1 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="mr-1 h-3 w-3" /> +5.2%
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Inadimplência</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-red-600">4.2%</dd>
          <dd className="mt-1 flex items-center text-xs text-red-600 font-medium">
            <ArrowUpRight className="mr-1 h-3 w-3" /> +0.8%
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Renovações (Mês)</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-blue-600">1.450</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Planos Ativos</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">3</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-xs font-medium text-gray-500">Receita Anúncios</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-purple-600">R$ 12k</dd>
          <dd className="mt-1 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="mr-1 h-3 w-3" /> +18.3%
          </dd>
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
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {filteredData.length === 0 ? (
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
                        {activeTab === 'cobrancas' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Descrição</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Valor</th>
                          </>
                        )}
                        {activeTab === 'assinaturas' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Usuário</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Plano</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Próx. Cobrança</th>
                          </>
                        )}
                        {activeTab === 'planos' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Plano</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Público</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Assinantes</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          </>
                        )}
                        {activeTab === 'anuncios' && (
                          <>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Anúncio</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Anunciante</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Orçamento</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Desempenho</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
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
                          {activeTab === 'cobrancas' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                <div className="flex items-center">
                                  <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${item.tipo === 'entrada' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {item.tipo === 'entrada' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                  </div>
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900">{item.descricao}</div>
                                    <div className="text-xs text-gray-500">ID: #{item.id.toString().padStart(5, '0')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.data}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {item.status === 'pago' && (
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Pago
                                  </span>
                                )}
                                {item.status === 'pendente' && (
                                  <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                    Pendente
                                  </span>
                                )}
                                {item.status === 'processado' && (
                                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    Processado
                                  </span>
                                )}
                              </td>
                              <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium text-right ${item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.tipo === 'entrada' ? '+' : '-'}{item.valor}
                              </td>
                            </>
                          )}
                          {activeTab === 'assinaturas' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.usuario}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.plano}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{item.valor}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'ativa' ? 'bg-green-50 text-green-700' : item.status === 'inadimplente' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.proximaCobranca}</td>
                            </>
                          )}
                          {activeTab === 'planos' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.nome}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.tipo}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{item.valor}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.assinantes.toLocaleString('pt-BR')}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Ativo
                                </span>
                              </td>
                            </>
                          )}
                          {activeTab === 'anuncios' && (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 font-medium text-gray-900">{item.titulo}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.anunciante}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{item.orcamento}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {item.cliques} cliques / {item.impressoes} imp.
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'ativo' ? 'bg-green-50 text-green-700' : item.status === 'pausado' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-700'}`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex items-center justify-end gap-2">
                              {activeTab !== 'planos' && (
                                <button onClick={() => handleViewDetails(item, activeTab)} className="text-gray-400 hover:text-primary-600" title="Visualizar">
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              {canPerformAction('edit', 'financeiro') && (
                                <>
                                  {activeTab === 'cobrancas' && item.status === 'pendente' && (
                                    <button onClick={() => handleAction('registrar_pagamento', item, 'cobranca')} className="text-gray-400 hover:text-green-600" title="Registrar Pagamento">
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  {activeTab === 'assinaturas' && item.status === 'ativa' && (
                                    <button onClick={() => handleAction('cancelar', item, 'assinatura')} className="text-gray-400 hover:text-red-600" title="Cancelar Assinatura">
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  {activeTab === 'planos' && (
                                    <button onClick={() => handleAction('editar', item, 'plano')} className="text-gray-400 hover:text-primary-600" title="Editar Plano">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  )}
                                  {activeTab === 'anuncios' && (
                                    <>
                                      {item.status === 'ativo' && (
                                        <button onClick={() => handleAction('pausar', item, 'anuncio')} className="text-gray-400 hover:text-yellow-600" title="Pausar">
                                          <PauseCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                      {item.status === 'pausado' && (
                                        <button onClick={() => handleAction('ativar', item, 'anuncio')} className="text-gray-400 hover:text-green-600" title="Ativar">
                                          <PlayCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-4 w-4" />
                              </button>
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

        {/* Right Column - Chart */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Evolução da Receita</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `R$ ${value/1000}k`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {canPerformAction('edit', 'financeiro') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Ações Financeiras</h3>
              <div className="space-y-2">
                <button onClick={() => handleAction('marcar_inadimplencia')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 font-medium">
                  Marcar Inadimplência Manual
                </button>
                <button onClick={() => handleAction('liberar_acesso')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 font-medium">
                  Liberar Acesso (Cortesia)
                </button>
                <button onClick={() => handleAction('configurar_gateway')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 font-medium">
                  Configurar Gateway de Pagamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalhes: ${selectedItem?.type}`}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${selectedItem.tipo === 'entrada' ? 'bg-green-50 text-green-600' : selectedItem.tipo === 'saida' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {selectedItem.type === 'cobrancas' ? (selectedItem.tipo === 'entrada' ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownRight className="h-8 w-8" />) :
                 selectedItem.type === 'assinaturas' ? <CreditCard className="h-8 w-8" /> :
                 selectedItem.type === 'anuncios' ? <Megaphone className="h-8 w-8" /> :
                 <DollarSign className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedItem.descricao || selectedItem.usuario || selectedItem.titulo}
                </h3>
                <p className="text-sm text-gray-500">ID: #{selectedItem.id.toString().padStart(5, '0')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedItem).map(([key, value]) => {
                if (key === 'id' || key === 'type') return null;
                return (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className={`mt-1 text-sm ${key === 'valor' || key === 'orcamento' ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>{value as string}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'financeiro') && selectedItem.type === 'cobrancas' && selectedItem.status === 'pendente' && (
                <button onClick={() => { handleAction('registrar_pagamento', selectedItem, 'cobranca'); setIsModalOpen(false); }} className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">
                  Registrar Pagamento
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
