import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Briefcase, MapPin, Building2, Clock, CheckCircle2, XCircle, MoreVertical, Eye, Play, Pause, Star } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockVagas = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titulo: `Vaga de Teste ${i + 1}`,
  empresa: `Empresa ${Math.floor(i / 3) + 1} Ltda`,
  local: i % 3 === 0 ? 'Remoto' : i % 2 === 0 ? 'São Paulo, SP' : 'Híbrido',
  status: i % 5 === 0 ? 'encerrada' : i % 4 === 0 ? 'pausada' : 'aberta',
  tipo: i % 3 === 0 ? 'PJ' : 'CLT',
  candidatos: Math.floor(Math.random() * 150),
  dataCriacao: `1${i % 9}/04/2026`,
  destaque: i % 7 === 0
}));

export default function Vagas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVaga, setSelectedVaga] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredVagas = useMemo(() => {
    return mockVagas.filter(v =>
      v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.local.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredVagas.length / itemsPerPage);
  const paginatedVagas = filteredVagas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (vaga: any) => {
    setSelectedVaga(vaga);
    setIsModalOpen(true);
    logAction('view_vaga_details', 'vagas', { vagaId: vaga.id });
  };

  const handleToggleStatus = (vaga: any, newStatus: string) => {
    if (!canPerformAction('edit', 'vagas')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction('change_vaga_status', 'vagas', { vagaId: vaga.id, newStatus });
    alert(`Status da vaga "${vaga.titulo}" alterado para ${newStatus}. (Simulação)`);
  };

  const handleToggleDestaque = (vaga: any) => {
    if (!canPerformAction('edit', 'vagas')) return;
    const newDestaque = !vaga.destaque;
    logAction('toggle_vaga_destaque', 'vagas', { vagaId: vaga.id, destaque: newDestaque });
    alert(`Destaque da vaga "${vaga.titulo}" ${newDestaque ? 'ativado' : 'removido'}. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Vagas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe e modere todas as vagas publicadas pelas empresas na plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('create', 'vagas') && (
            <button className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              Nova Vaga (Admin)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Vagas</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">3.456</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Vagas Ativas</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-green-600">1.245</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Vagas Premium</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-purple-600">342</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Candidaturas (Mês)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">18.492</dd>
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
            placeholder="Buscar por título, empresa ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            Filtros Avançados
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando dados...</div>
        ) : filteredVagas.length === 0 ? (
          <EmptyState
            title="Nenhuma vaga encontrada"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Vaga</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Empresa</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Candidatos</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Criação</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedVagas.map((vaga) => (
                    <tr key={vaga.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {vaga.titulo}
                              {vaga.destaque && <Star className="h-3 w-3 text-yellow-400 fill-current" title="Vaga Destacada" />}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vaga.local}</span>
                              <span>&bull;</span>
                              <span>{vaga.tipo}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {vaga.empresa}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {vaga.status === 'aberta' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aberta
                          </span>
                        )}
                        {vaga.status === 'pausada' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            <Clock className="h-3.5 w-3.5" />
                            Pausada
                          </span>
                        )}
                        {vaga.status === 'encerrada' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            <XCircle className="h-3.5 w-3.5" />
                            Encerrada
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vaga.candidatos}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vaga.dataCriacao}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(vaga)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'vagas') && (
                            <>
                              <button onClick={() => handleToggleDestaque(vaga)} className={`text-gray-400 ${vaga.destaque ? 'hover:text-yellow-500' : 'hover:text-gray-600'}`} title={vaga.destaque ? 'Remover Destaque' : 'Destacar Vaga'}>
                                <Star className={`h-4 w-4 ${vaga.destaque ? 'fill-current text-yellow-400' : ''}`} />
                              </button>
                              {vaga.status === 'aberta' && (
                                <button onClick={() => handleToggleStatus(vaga, 'pausada')} className="text-gray-400 hover:text-yellow-600" title="Pausar Vaga">
                                  <Pause className="h-4 w-4" />
                                </button>
                              )}
                              {vaga.status === 'pausada' && (
                                <button onClick={() => handleToggleStatus(vaga, 'aberta')} className="text-gray-400 hover:text-green-600" title="Reabrir Vaga">
                                  <Play className="h-4 w-4" />
                                </button>
                              )}
                              {vaga.status !== 'encerrada' && (
                                <button onClick={() => handleToggleStatus(vaga, 'encerrada')} className="text-gray-400 hover:text-red-600" title="Encerrar Vaga">
                                  <XCircle className="h-4 w-4" />
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
              totalItems={filteredVagas.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes da Vaga">
        {selectedVaga && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {selectedVaga.titulo}
                  {selectedVaga.destaque && <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Destacada</span>}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Building2 className="h-4 w-4" /> {selectedVaga.empresa}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedVaga.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Local</p>
                <p className="mt-1 text-sm text-gray-900">{selectedVaga.local}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo de Contratação</p>
                <p className="mt-1 text-sm text-gray-900">{selectedVaga.tipo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Candidatos</p>
                <p className="mt-1 text-sm text-gray-900">{selectedVaga.candidatos}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p className="mt-1 text-sm text-gray-900">{selectedVaga.dataCriacao}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'vagas') && (
                <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Vaga
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
