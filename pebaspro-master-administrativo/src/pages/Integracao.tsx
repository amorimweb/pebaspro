import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Building2, ArrowRightLeft, ShieldAlert, Eye, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockEmpresas = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nome: `Empresa ${i + 1} Ltda`,
  cnpj: `${(10 + i).toString().padStart(2, '0')}.345.678/0001-90`,
  status: i % 4 === 0 ? 'inativo' : i % 5 === 0 ? 'pendente' : 'ativo',
  dataAtivacao: i % 4 === 0 || i % 5 === 0 ? '-' : `1${i % 9}/04/2026`,
  categoria: ['TI e Programação', 'Construção Civil', 'Marketing', 'Transportes'][i % 4]
}));

export default function IntegracaoEmpresaPrestador() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredEmpresas = useMemo(() => {
    return mockEmpresas.filter(e =>
      e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cnpj.includes(searchTerm)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);
  const paginatedEmpresas = filteredEmpresas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewDetails = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setIsModalOpen(true);
    logAction('view_integracao_details', 'integracao', { empresaId: empresa.id });
  };

  const handleToggleAccess = (empresa: any) => {
    if (!canPerformAction('edit', 'integracao')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    const newStatus = empresa.status === 'ativo' ? 'inativo' : 'ativo';
    logAction('toggle_integracao_access', 'integracao', { empresaId: empresa.id, newStatus });
    alert(`Acesso da empresa ${empresa.nome} alterado para ${newStatus}. (Simulação)`);
  };

  const handleApprove = (empresa: any) => {
    if (!canPerformAction('edit', 'integracao')) return;
    logAction('approve_integracao', 'integracao', { empresaId: empresa.id });
    alert(`Integração da empresa ${empresa.nome} aprovada com sucesso. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Integração Empresa &gt; Prestador</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie quais empresas têm permissão para acessar a tela de Prestador no sistema principal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            Filtros
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <ArrowRightLeft className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Como funciona esta integração no PEBASPRO?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                A empresa não ganha um novo painel separado. Ela utiliza a mesma conta e acessa a tela já existente do ambiente Prestador através de um botão no seu painel. O controle abaixo define quem tem essa permissão ativada no sistema oficial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6">
            <option>Todos os Status</option>
            <option>Ativos</option>
            <option>Inativos</option>
            <option>Pendentes</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando dados...</div>
        ) : filteredEmpresas.length === 0 ? (
          <EmptyState
            title="Nenhuma integração encontrada"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Empresa</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CNPJ</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoria Principal</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status da Integração</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data Ativação</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedEmpresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{empresa.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{empresa.cnpj}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{empresa.categoria}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {empresa.status === 'ativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acesso Liberado
                          </span>
                        )}
                        {empresa.status === 'inativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            <XCircle className="h-3.5 w-3.5" />
                            Sem Acesso
                          </span>
                        )}
                        {empresa.status === 'pendente' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Aguardando Análise
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{empresa.dataAtivacao}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(empresa)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'integracao') && (
                            <>
                              {empresa.status === 'pendente' && (
                                <button onClick={() => handleApprove(empresa)} className="text-gray-400 hover:text-green-600" title="Aprovar Integração">
                                  <ShieldCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button onClick={() => handleToggleAccess(empresa)} className={`text-gray-400 ${empresa.status === 'inativo' ? 'hover:text-green-600' : 'hover:text-red-600'}`} title={empresa.status === 'inativo' ? 'Liberar Acesso' : 'Revogar Acesso'}>
                                {empresa.status === 'inativo' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
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
              totalItems={filteredEmpresas.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes da Integração">
        {selectedEmpresa && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedEmpresa.nome}</h3>
                <p className="text-sm text-gray-500">{selectedEmpresa.cnpj}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status da Integração</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEmpresa.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Categoria Principal</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEmpresa.categoria}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Ativação</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEmpresa.dataAtivacao}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'integracao') && (
                <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Integração
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
