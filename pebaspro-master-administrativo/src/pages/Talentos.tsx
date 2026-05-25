import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, UserCircle, MoreVertical, CheckCircle2, XCircle, FileText, ShieldAlert, Eye, Lock, Unlock, Edit } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockTalentos = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  nome: `Talento ${i + 1}`,
  email: `talento${i + 1}@email.com`,
  status: i % 5 === 0 ? 'bloqueado' : i % 3 === 0 ? 'pendente' : 'ativo',
  perfil: i % 4 === 0 ? 'Incompleto' : 'Completo',
  cidade: i % 2 === 0 ? 'São Paulo, SP' : 'Rio de Janeiro, RJ',
  dataCadastro: `1${i % 9}/04/2026`,
}));

export default function Talentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTalent, setSelectedTalent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter logic
  const filteredTalentos = useMemo(() => {
    return mockTalentos.filter(t =>
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTalentos.length / itemsPerPage);
  const paginatedTalentos = filteredTalentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (talento: any) => {
    setSelectedTalent(talento);
    setIsModalOpen(true);
    logAction('view_talent_details', 'talentos', { talentId: talento.id });
  };

  const handleToggleStatus = (talento: any) => {
    if (!canPerformAction('edit', 'talentos')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    const newStatus = talento.status === 'bloqueado' ? 'ativo' : 'bloqueado';
    logAction('toggle_talent_status', 'talentos', { talentId: talento.id, newStatus });
    alert(`Status do talento ${talento.nome} alterado para ${newStatus}. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Talentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os profissionais cadastrados na plataforma buscando oportunidades.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('create', 'talentos') && (
            <button className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              Adicionar Talento
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Talentos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">45.231</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Ativos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-green-600">38.900</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Perfis Incompletos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-yellow-600">5.120</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Bloqueados</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-red-600">1.211</dd>
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
            placeholder="Buscar por nome, email ou CPF..."
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
        ) : filteredTalentos.length === 0 ? (
          <EmptyState
            title="Nenhum talento encontrado"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Talento</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Perfil</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Localização</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cadastro</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedTalentos.map((talento) => (
                    <tr key={talento.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                            <UserCircle className="h-6 w-6 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{talento.nome}</div>
                            <div className="text-sm text-gray-500">{talento.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {talento.status === 'ativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Ativo
                          </span>
                        )}
                        {talento.status === 'pendente' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Pendente
                          </span>
                        )}
                        {talento.status === 'bloqueado' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Bloqueado
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${talento.perfil === 'Completo' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                          {talento.perfil}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{talento.cidade}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{talento.dataCadastro}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(talento)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'talentos') && (
                            <>
                              <button className="text-gray-400 hover:text-primary-600" title="Editar">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleToggleStatus(talento)} className={`text-gray-400 ${talento.status === 'bloqueado' ? 'hover:text-green-600' : 'hover:text-red-600'}`} title={talento.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}>
                                {talento.status === 'bloqueado' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
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
              totalItems={filteredTalentos.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes do Talento">
        {selectedTalent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                <UserCircle className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedTalent.nome}</h3>
                <p className="text-sm text-gray-500">{selectedTalent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedTalent.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Perfil</p>
                <p className="mt-1 text-sm text-gray-900">{selectedTalent.perfil}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Localização</p>
                <p className="mt-1 text-sm text-gray-900">{selectedTalent.cidade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                <p className="mt-1 text-sm text-gray-900">{selectedTalent.dataCadastro}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'talentos') && (
                <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Talento
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
