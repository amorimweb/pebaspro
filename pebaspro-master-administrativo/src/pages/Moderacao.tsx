import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, AlertTriangle, Flag, UserX, MessageSquare, MoreVertical, Eye, Ban, Archive, RotateCcw, CheckCircle2, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockDenuncias = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  tipo: i % 3 === 0 ? 'Comportamento Inadequado' : i % 2 === 0 ? 'Vaga Falsa' : 'Perfil Falso',
  reportado: `Usuário Reportado ${i}`,
  autor: `Autor ${i}`,
  status: i % 4 === 0 ? 'resolvido' : i % 3 === 0 ? 'pendente' : 'em_analise',
  prioridade: i % 5 === 0 ? 'alta' : i % 2 === 0 ? 'media' : 'baixa',
  data: `1${i % 9}/04/2026`,
  detalhes: 'Detalhes da denúncia simulados aqui para visualização no modal.'
}));

const mockAvaliacoes = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  prestador: `Prestador ${i}`,
  cliente: `Cliente ${i}`,
  nota: (i % 5) + 1,
  comentario: i % 2 === 0 ? 'Comentário suspeito de spam ou ofensa.' : 'Avaliação muito baixa sem justificativa clara.',
  status: i % 3 === 0 ? 'em_analise' : 'sinalizada',
  data: `1${i % 9}/04/2026`
}));

type TabType = 'denuncias' | 'avaliacoes' | 'historico';

export default function Moderacao() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('denuncias');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const tabs = [
    { id: 'denuncias', name: 'Denúncias', icon: ShieldAlert },
    { id: 'avaliacoes', name: 'Avaliações Sinalizadas', icon: Flag },
    { id: 'historico', name: 'Histórico Disciplinar', icon: History },
  ];

  const filteredDenuncias = useMemo(() => {
    return mockDenuncias.filter(d =>
      d.reportado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  const filteredAvaliacoes = useMemo(() => {
    return mockAvaliacoes.filter(a =>
      a.prestador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const currentData = activeTab === 'denuncias' ? filteredDenuncias : filteredAvaliacoes;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    logAction(`view_${activeTab}_details`, 'moderacao', { itemId: item.id });
  };

  const handleAction = (action: string, item?: any) => {
    if (!canPerformAction('edit', 'moderacao')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_${activeTab}`, 'moderacao', item ? { itemId: item.id } : undefined);
    alert(`Ação "${action}" realizada. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Moderação e Confiança</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie denúncias, avaliações sinalizadas e usuários suspensos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            Filtros Avançados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Denúncias Pendentes</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            {mockDenuncias.filter(d => d.status === 'pendente').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Prioridade Alta</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-red-600">
            {mockDenuncias.filter(d => d.prioridade === 'alta').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Avaliações em Análise</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-yellow-600">
            {mockAvaliacoes.filter(a => a.status === 'em_analise').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Usuários Suspensos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">156</dd>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto px-6" aria-label="Tabs">
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
        <div className="p-0">
          {activeTab === 'denuncias' && (
            <>
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="Buscar por usuário ou ID da denúncia..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6">
                    <option>Todas as Prioridades</option>
                    <option>Alta</option>
                    <option>Média</option>
                    <option>Baixa</option>
                  </select>
                </div>
              </div>

              {filteredDenuncias.length === 0 ? (
                <EmptyState
                  title="Nenhuma denúncia encontrada"
                  description={`Não encontramos resultados para "${searchTerm}".`}
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Denúncia</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reportado</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Autor</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prioridade</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedData.map((denuncia: any) => (
                          <tr key={denuncia.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                              <div className="flex items-center">
                                <div className={`h-10 w-10 flex-shrink-0 rounded-md flex items-center justify-center border ${denuncia.prioridade === 'alta' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>
                                  <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">{denuncia.tipo}</div>
                                  <div className="text-sm text-gray-500">ID: #{denuncia.id.toString().padStart(4, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                              {denuncia.reportado}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {denuncia.autor}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              {denuncia.status === 'em_analise' && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                  Em Análise
                                </span>
                              )}
                              {denuncia.status === 'pendente' && (
                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                  Pendente
                                </span>
                              )}
                              {denuncia.status === 'resolvido' && (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Resolvido
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                denuncia.prioridade === 'alta' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                denuncia.prioridade === 'media' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                                'bg-gray-50 text-gray-600 ring-gray-500/10'
                              }`}>
                                {denuncia.prioridade === 'alta' && <AlertTriangle className="h-3 w-3" />}
                                {denuncia.prioridade.charAt(0).toUpperCase() + denuncia.prioridade.slice(1)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{denuncia.data}</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleViewDetails(denuncia)} className="text-gray-400 hover:text-primary-600" title="Visualizar Detalhes">
                                  <Eye className="h-4 w-4" />
                                </button>
                                {canPerformAction('edit', 'moderacao') && (
                                  <>
                                    <button onClick={() => handleAction('suspender_usuario', denuncia)} className="text-gray-400 hover:text-red-600" title="Suspender Usuário">
                                      <Ban className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleAction('arquivar_denuncia', denuncia)} className="text-gray-400 hover:text-gray-600" title="Arquivar">
                                      <Archive className="h-4 w-4" />
                                    </button>
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
                    totalItems={filteredDenuncias.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'avaliacoes' && (
            <>
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="Buscar por prestador ou cliente..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {filteredAvaliacoes.length === 0 ? (
                <EmptyState
                  title="Nenhuma avaliação encontrada"
                  description={`Não encontramos resultados para "${searchTerm}".`}
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Avaliação</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prestador</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cliente</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedData.map((avaliacao: any) => (
                          <tr key={avaliacao.id} className="hover:bg-gray-50">
                            <td className="py-4 pl-4 pr-3 sm:pl-6">
                              <div className="font-medium text-gray-900">Nota: {avaliacao.nota}/5</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{avaliacao.comentario}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{avaliacao.prestador}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{avaliacao.cliente}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                {avaliacao.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleViewDetails(avaliacao)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                                  <Eye className="h-4 w-4" />
                                </button>
                                {canPerformAction('edit', 'moderacao') && (
                                  <>
                                    <button onClick={() => handleAction('manter_avaliacao', avaliacao)} className="text-gray-400 hover:text-green-600" title="Manter Avaliação">
                                      <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleAction('remover_avaliacao', avaliacao)} className="text-gray-400 hover:text-red-600" title="Remover Avaliação">
                                      <Ban className="h-4 w-4" />
                                    </button>
                                  </>
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
                    totalItems={filteredAvaliacoes.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'historico' && (
            <div className="p-6 text-center text-gray-500">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Histórico Disciplinar</h3>
              <p className="mt-1">Busque por um usuário para ver seu histórico de advertências e suspensões.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detalhes da ${activeTab === 'denuncias' ? 'Denúncia' : 'Avaliação'}`}>
        {selectedItem && (
          <div className="space-y-4">
            {activeTab === 'denuncias' ? (
              <>
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className={`h-16 w-16 rounded-md flex items-center justify-center border ${selectedItem.prioridade === 'alta' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedItem.tipo}</h3>
                    <p className="text-sm text-gray-500">ID: #{selectedItem.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reportado</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.reportado}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Autor</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.autor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prioridade</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.prioridade}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Detalhes</p>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{selectedItem.detalhes}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="h-16 w-16 rounded-md bg-yellow-50 flex items-center justify-center border border-yellow-100 text-yellow-600">
                    <Flag className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Avaliação Sinalizada</h3>
                    <p className="text-sm text-gray-500">Nota: {selectedItem.nota}/5</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prestador</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.prestador}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.cliente}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.data}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Comentário</p>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{selectedItem.comentario}</p>
                </div>
              </>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'moderacao') && (
                <button onClick={() => { handleAction(activeTab === 'denuncias' ? 'resolver_denuncia' : 'remover_avaliacao', selectedItem); setIsModalOpen(false); }} className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  {activeTab === 'denuncias' ? 'Marcar como Resolvido' : 'Remover Avaliação'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
