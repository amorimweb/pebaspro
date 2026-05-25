import React, { useState, useMemo } from 'react';
import { Search, MapPin, CheckCircle2, XCircle, Settings, MoreVertical, Plus, PlayCircle, PauseCircle, Edit, Users, Briefcase, Eye } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockCidades = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  nome: `Cidade ${i + 1}`,
  uf: i % 3 === 0 ? 'SP' : i % 2 === 0 ? 'RJ' : 'MG',
  status: i % 5 === 0 ? 'inativo' : i % 4 === 0 ? 'pre_lancamento' : 'ativo',
  usuarios: Math.floor(Math.random() * 30000).toLocaleString('pt-BR'),
  vagas: Math.floor(Math.random() * 1000).toLocaleString('pt-BR'),
  dataAtivacao: i % 5 === 0 || i % 4 === 0 ? '-' : `1${i % 9}/04/2026`,
}));

export default function Cidades() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const filteredCidades = useMemo(() => {
    return mockCidades.filter(c =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.uf.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredCidades.length / itemsPerPage);
  const paginatedCidades = filteredCidades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    logAction('view_city_details', 'cidades', { cityId: item.id });
  };

  const handleAction = (action: string, item?: any) => {
    if (!canPerformAction('edit', 'cidades')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_cidade`, 'cidades', item ? { cityId: item.id } : undefined);
    alert(`Ação "${action}" realizada. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Expansão por Cidade</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie a operação da plataforma em diferentes regiões e cidades.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('create', 'cidades') && (
            <button onClick={() => handleAction('nova_cidade')} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              <Plus className="h-4 w-4" />
              Nova Cidade
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Cidades Ativas</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-green-600">
            {mockCidades.filter(c => c.status === 'ativo').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Em Pré-lançamento</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-yellow-600">
            {mockCidades.filter(c => c.status === 'pre_lancamento').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total de Usuários (Top 3)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">45.700</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Vagas Abertas (Top 3)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">1.480</dd>
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
            placeholder="Buscar por cidade ou estado..."
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
            <option>Ativo</option>
            <option>Pré-lançamento</option>
            <option>Inativo</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredCidades.length === 0 ? (
          <EmptyState
            title="Nenhuma cidade encontrada"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Cidade</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Usuários</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vagas</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Ativação</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedCidades.map((cidade) => (
                    <tr key={cidade.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-primary-50 flex items-center justify-center border border-primary-100">
                            <MapPin className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{cidade.nome}</div>
                            <div className="text-sm text-gray-500">{cidade.uf}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {cidade.status === 'ativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ativa
                          </span>
                        )}
                        {cidade.status === 'pre_lancamento' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            <Settings className="h-3.5 w-3.5" />
                            Pré-lançamento
                          </span>
                        )}
                        {cidade.status === 'inativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            <XCircle className="h-3.5 w-3.5" />
                            Inativa
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-gray-400" />
                          {cidade.usuarios}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          {cidade.vagas}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cidade.dataAtivacao}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(cidade)} className="text-gray-400 hover:text-primary-600" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'cidades') && (
                            <>
                              <button onClick={() => handleAction('editar_parametros', cidade)} className="text-gray-400 hover:text-primary-600" title="Editar Parâmetros">
                                <Settings className="h-4 w-4" />
                              </button>
                              {cidade.status === 'ativo' ? (
                                <button onClick={() => handleAction('suspender_operacao', cidade)} className="text-gray-400 hover:text-yellow-600" title="Suspender Operação">
                                  <PauseCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button onClick={() => handleAction('ativar_cidade', cidade)} className="text-gray-400 hover:text-green-600" title="Ativar Cidade">
                                  <PlayCircle className="h-4 w-4" />
                                </button>
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
              totalItems={filteredCidades.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes da Cidade">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-primary-50 flex items-center justify-center border border-primary-100">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedItem.nome}</h3>
                <p className="text-sm text-gray-500">{selectedItem.uf}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Ativação</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.dataAtivacao}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Usuários</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.usuarios}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vagas</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.vagas}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'cidades') && (
                <button onClick={() => { handleAction('editar_cidade', selectedItem); setIsModalOpen(false); }} className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Cidade
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
