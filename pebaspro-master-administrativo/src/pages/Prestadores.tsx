import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Wrench, MoreVertical, CheckCircle2, XCircle, Star, Award, Eye, Lock, Unlock, Edit, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockPrestadores = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  nome: `Prestador ${i + 1}`,
  email: `prestador${i + 1}@email.com`,
  status: i % 6 === 0 ? 'bloqueado' : i % 4 === 0 ? 'pendente' : 'ativo',
  plano: i % 3 === 0 ? 'Pro' : i % 5 === 0 ? 'Premium' : 'Gratuito',
  avaliacao: i % 4 === 0 ? 0 : (4 + Math.random()).toFixed(1),
  dataCadastro: `1${i % 9}/04/2026`,
  categorias: ['Manutenção', 'Limpeza'].slice(0, (i % 2) + 1)
}));

export default function Prestadores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrestador, setSelectedPrestador] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPrestadores = useMemo(() => {
    return mockPrestadores.filter(p =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPrestadores.length / itemsPerPage);
  const paginatedPrestadores = filteredPrestadores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (prestador: any) => {
    setSelectedPrestador(prestador);
    setIsModalOpen(true);
    logAction('view_prestador_details', 'prestadores', { prestadorId: prestador.id });
  };

  const handleToggleStatus = (prestador: any) => {
    if (!canPerformAction('edit', 'prestadores')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    const newStatus = prestador.status === 'bloqueado' ? 'ativo' : 'bloqueado';
    logAction('toggle_prestador_status', 'prestadores', { prestadorId: prestador.id, newStatus });
    alert(`Status do prestador ${prestador.nome} alterado para ${newStatus}. (Simulação)`);
  };

  const handleApprove = (prestador: any) => {
    if (!canPerformAction('edit', 'prestadores')) return;
    logAction('approve_prestador', 'prestadores', { prestadorId: prestador.id });
    alert(`Prestador ${prestador.nome} aprovado com sucesso. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Prestadores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os prestadores de serviço, autônomos e freelancers da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('create', 'prestadores') && (
            <button className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              Adicionar Prestador
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Prestadores</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">24.500</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Assinantes Pagantes</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">8.230</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Aguardando Validação</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-yellow-600">450</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Avaliação Média</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            4.6 <Star className="h-5 w-5 text-yellow-400 fill-current" />
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
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
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
        ) : filteredPrestadores.length === 0 ? (
          <EmptyState
            title="Nenhum prestador encontrado"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Prestador</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Plano</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Avaliação</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cadastro</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedPrestadores.map((prestador) => (
                    <tr key={prestador.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                            <Wrench className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{prestador.nome}</div>
                            <div className="text-sm text-gray-500">{prestador.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {prestador.status === 'ativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Ativo
                          </span>
                        )}
                        {prestador.status === 'pendente' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Pendente
                          </span>
                        )}
                        {prestador.status === 'bloqueado' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Bloqueado
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${prestador.plano !== 'Gratuito' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                          {prestador.plano !== 'Gratuito' && <Award className="mr-1 h-3 w-3" />}
                          {prestador.plano}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${prestador.avaliacao > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          <span>{prestador.avaliacao > 0 ? prestador.avaliacao : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{prestador.dataCadastro}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(prestador)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'prestadores') && (
                            <>
                              {prestador.status === 'pendente' && (
                                <button onClick={() => handleApprove(prestador)} className="text-gray-400 hover:text-green-600" title="Aprovar">
                                  <ShieldCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button onClick={() => handleToggleStatus(prestador)} className={`text-gray-400 ${prestador.status === 'bloqueado' ? 'hover:text-green-600' : 'hover:text-red-600'}`} title={prestador.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}>
                                {prestador.status === 'bloqueado' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
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
              totalItems={filteredPrestadores.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes do Prestador">
        {selectedPrestador && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedPrestador.nome}</h3>
                <p className="text-sm text-gray-500">{selectedPrestador.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPrestador.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plano</p>
                <p className="mt-1 text-sm text-gray-900">{selectedPrestador.plano}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avaliação</p>
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                  {selectedPrestador.avaliacao > 0 ? selectedPrestador.avaliacao : 'N/A'}
                  {selectedPrestador.avaliacao > 0 && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                <p className="mt-1 text-sm text-gray-900">{selectedPrestador.dataCadastro}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Categorias</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedPrestador.categorias?.map((cat: string) => (
                    <span key={cat} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'prestadores') && (
                <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Prestador
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
