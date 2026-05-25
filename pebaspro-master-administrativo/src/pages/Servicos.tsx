import React, { useState, useMemo } from 'react';
import { Search, Filter, CalendarCheck, Clock, CheckCircle2, XCircle, AlertTriangle, MoreVertical, UserCircle, Eye, MessageSquare, Ban, CalendarDays } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockServicos = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  titulo: i % 3 === 0 ? 'Manutenção Elétrica' : i % 2 === 0 ? 'Limpeza Pós-Obra' : 'Instalação Hidráulica',
  prestador: `Prestador ${i}`,
  cliente: `Cliente ${i}`,
  status: i % 5 === 0 ? 'disputa' : i % 4 === 0 ? 'concluido' : i % 3 === 0 ? 'em_andamento' : 'agendado',
  valor: `R$ ${(Math.random() * 800 + 100).toFixed(2).replace('.', ',')}`,
  data: `1${i % 9}/04/2026`,
}));

export default function Servicos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const filteredServicos = useMemo(() => {
    return mockServicos.filter(s =>
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prestador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredServicos.length / itemsPerPage);
  const paginatedData = filteredServicos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    logAction('view_service_details', 'servicos', { serviceId: item.id });
  };

  const handleAction = (action: string, item?: any) => {
    if (!canPerformAction('edit', 'servicos')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_servico`, 'servicos', item ? { serviceId: item.id } : undefined);
    alert(`Ação "${action}" realizada. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Serviços & Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe os serviços prestados, agendamentos e resolva disputas.
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
          <dt className="truncate text-sm font-medium text-gray-500">Serviços Ativos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            {mockServicos.filter(s => s.status === 'em_andamento').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Agendados (Próx 7 dias)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">
            {mockServicos.filter(s => s.status === 'agendado').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Concluídos (Mês)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-green-600">
            {mockServicos.filter(s => s.status === 'concluido').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Em Disputa</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-red-600">
            {mockServicos.filter(s => s.status === 'disputa').length}
          </dd>
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
            placeholder="Buscar por ID, título, prestador ou cliente..."
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
            <option>Agendado</option>
            <option>Em Andamento</option>
            <option>Concluído</option>
            <option>Em Disputa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredServicos.length === 0 ? (
          <EmptyState
            title="Nenhum serviço encontrado"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Serviço</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prestador</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cliente</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedData.map((servico) => (
                    <tr key={servico.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <CalendarCheck className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{servico.titulo}</div>
                            <div className="text-sm text-gray-500">ID: #{servico.id.toString().padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <UserCircle className="h-4 w-4 text-gray-400" />
                          {servico.prestador}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {servico.cliente}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {servico.status === 'concluido' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Concluído
                          </span>
                        )}
                        {servico.status === 'agendado' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            <Clock className="h-3.5 w-3.5" />
                            Agendado
                          </span>
                        )}
                        {servico.status === 'em_andamento' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            <Clock className="h-3.5 w-3.5" />
                            Em Andamento
                          </span>
                        )}
                        {servico.status === 'disputa' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Em Disputa
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {servico.valor}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{servico.data}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(servico)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'servicos') && (
                            <>
                              {servico.status === 'disputa' && (
                                <button onClick={() => handleAction('mediar_disputa', servico)} className="text-gray-400 hover:text-red-600" title="Mediar Disputa">
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              )}
                              {servico.status === 'agendado' && (
                                <>
                                  <button onClick={() => handleAction('remarcar_servico', servico)} className="text-gray-400 hover:text-blue-600" title="Remarcar">
                                    <CalendarDays className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleAction('cancelar_servico', servico)} className="text-gray-400 hover:text-red-600" title="Cancelar Serviço">
                                    <Ban className="h-4 w-4" />
                                  </button>
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
              totalItems={filteredServicos.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes do Serviço">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <CalendarCheck className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedItem.titulo}</h3>
                <p className="text-sm text-gray-500">ID: #{selectedItem.id.toString().padStart(4, '0')}</p>
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
                <p className="text-sm font-medium text-gray-500">Valor</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.valor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.data}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'servicos') && selectedItem.status === 'disputa' && (
                <button onClick={() => { handleAction('mediar_disputa', selectedItem); setIsModalOpen(false); }} className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">
                  Mediar Disputa
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
