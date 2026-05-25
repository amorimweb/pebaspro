import React, { useState, useMemo } from 'react';
import { Search, Filter, Headset, Clock, CheckCircle2, AlertCircle, MoreVertical, MessageSquare, UserPlus, CornerUpRight, Archive, Eye } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockChamados = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  assunto: `Chamado de Suporte ${i + 1}`,
  usuario: `Usuário ${Math.floor(i / 3) + 1}`,
  categoria: i % 3 === 0 ? 'Financeiro' : i % 2 === 0 ? 'Técnico' : 'Dúvida',
  status: i % 5 === 0 ? 'resolvido' : i % 4 === 0 ? 'em_andamento' : 'aberto',
  prioridade: i % 6 === 0 ? 'alta' : i % 3 === 0 ? 'media' : 'baixa',
  data: `1${i % 9}/04/2026 10:30`
}));

export default function Suporte() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const filteredChamados = useMemo(() => {
    return mockChamados.filter(c =>
      c.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredChamados.length / itemsPerPage);
  const paginatedChamados = filteredChamados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (chamado: any) => {
    setSelectedItem(chamado);
    setIsModalOpen(true);
    logAction('view_chamado_details', 'suporte', { chamadoId: chamado.id });
  };

  const handleAction = (action: string, chamado: any) => {
    if (!canPerformAction('edit', 'suporte')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_chamado`, 'suporte', { chamadoId: chamado.id });
    alert(`Ação "${action}" realizada no chamado #${chamado.id}. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Suporte e Chamados</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie o atendimento aos usuários da plataforma.
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
          <dt className="truncate text-sm font-medium text-gray-500">Chamados Abertos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">124</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">SLA Médio de Resposta</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-green-600">2h 15m</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Tickets Atrasados</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-red-600">8</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Resolvidos (Hoje)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">45</dd>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="Buscar por assunto, usuário ou ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6">
            <option>Todos os Status</option>
            <option>Aberto</option>
            <option>Em Andamento</option>
            <option>Resolvido</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredChamados.length === 0 ? (
          <EmptyState
            title="Nenhum chamado encontrado"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Chamado</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Usuário</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoria</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prioridade</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedChamados.map((chamado) => (
                    <tr key={chamado.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{chamado.assunto}</div>
                            <div className="text-sm text-gray-500">ID: #{chamado.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                        {chamado.usuario}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {chamado.categoria}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {chamado.status === 'aberto' && (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                            Aberto
                          </span>
                        )}
                        {chamado.status === 'em_andamento' && (
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Em Andamento
                          </span>
                        )}
                        {chamado.status === 'resolvido' && (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Resolvido
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          chamado.prioridade === 'alta' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                          chamado.prioridade === 'media' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                          'bg-gray-50 text-gray-600 ring-gray-500/10'
                        }`}>
                          {chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{chamado.data}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(chamado)} className="text-gray-400 hover:text-primary-600" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'suporte') && (
                            <>
                              <button onClick={() => handleAction('responder', chamado)} className="text-primary-600 hover:text-primary-700" title="Responder">
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              {chamado.status === 'aberto' && (
                                <button onClick={() => handleAction('assumir', chamado)} className="text-gray-400 hover:text-green-600" title="Assumir Chamado">
                                  <UserPlus className="h-4 w-4" />
                                </button>
                              )}
                              {chamado.status !== 'resolvido' && (
                                <>
                                  <button onClick={() => handleAction('transferir', chamado)} className="text-gray-400 hover:text-blue-600" title="Transferir">
                                    <CornerUpRight className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleAction('fechar', chamado)} className="text-gray-400 hover:text-green-600" title="Fechar Chamado">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {chamado.status === 'resolvido' && (
                                <button onClick={() => handleAction('arquivar', chamado)} className="text-gray-400 hover:text-gray-600" title="Arquivar">
                                  <Archive className="h-4 w-4" />
                                </button>
                              )}
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
              totalItems={filteredChamados.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes do Chamado">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedItem.assunto}</h3>
                <p className="text-sm text-gray-500">ID: #{selectedItem.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Usuário</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.usuario}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Categoria</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.categoria}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Prioridade</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.prioridade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Abertura</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.data}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'suporte') && selectedItem.status !== 'resolvido' && (
                <button onClick={() => { handleAction('responder', selectedItem); setIsModalOpen(false); }} className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Responder Chamado
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
