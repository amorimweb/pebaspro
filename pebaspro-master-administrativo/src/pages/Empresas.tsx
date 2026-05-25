import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Building2, MoreVertical, CheckCircle2, XCircle, FileText, Briefcase, Eye, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockEmpresas = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  nome: `Empresa ${i + 1} Ltda`,
  cnpj: `${(10 + i).toString().padStart(2, '0')}.345.678/0001-90`,
  email: `contato@empresa${i + 1}.com.br`,
  status: i % 5 === 0 ? 'bloqueado' : i % 3 === 0 ? 'pendente' : 'ativo',
  vagasAtivas: Math.floor(Math.random() * 15),
  plano: i % 4 === 0 ? 'Premium' : i % 2 === 0 ? 'Pro' : 'Gratuito',
  dataCadastro: `1${i % 9}/01/2026`,
}));

export default function Empresas() {
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
      e.cnpj.includes(searchTerm) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    logAction('view_empresa_details', 'empresas', { empresaId: empresa.id });
  };

  const handleToggleStatus = (empresa: any) => {
    if (!canPerformAction('edit', 'empresas')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    const newStatus = empresa.status === 'bloqueado' ? 'ativo' : 'bloqueado';
    logAction('toggle_empresa_status', 'empresas', { empresaId: empresa.id, newStatus });
    alert(`Status da empresa ${empresa.nome} alterado para ${newStatus}. (Simulação)`);
  };

  const handleValidate = (empresa: any) => {
    if (!canPerformAction('edit', 'empresas')) return;
    logAction('validate_empresa', 'empresas', { empresaId: empresa.id });
    alert(`Cadastro da empresa ${empresa.nome} validado com sucesso. (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestão de Empresas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie cadastros, planos e acessos das empresas na plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('create', 'empresas') && (
            <button className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              Adicionar Empresa
            </button>
          )}
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
            placeholder="Buscar por nome, CNPJ ou email..."
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando dados...</div>
        ) : filteredEmpresas.length === 0 ? (
          <EmptyState
            title="Nenhuma empresa encontrada"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Empresa</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Plano</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vagas Ativas</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cadastro</th>
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
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-primary-50 flex items-center justify-center border border-primary-100">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{empresa.nome}</div>
                            <div className="text-sm text-gray-500">{empresa.cnpj}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {empresa.status === 'ativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Ativo
                          </span>
                        )}
                        {empresa.status === 'pendente' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Aguardando Validação
                          </span>
                        )}
                        {empresa.status === 'bloqueado' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Bloqueado
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {empresa.plano}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          {empresa.vagasAtivas}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{empresa.dataCadastro}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(empresa)} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'empresas') && (
                            <>
                              {empresa.status === 'pendente' && (
                                <button onClick={() => handleValidate(empresa)} className="text-gray-400 hover:text-green-600" title="Validar Cadastro">
                                  <ShieldCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button onClick={() => handleToggleStatus(empresa)} className={`text-gray-400 ${empresa.status === 'bloqueado' ? 'hover:text-green-600' : 'hover:text-red-600'}`} title={empresa.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}>
                                {empresa.status === 'bloqueado' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes da Empresa">
        {selectedEmpresa && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-primary-50 flex items-center justify-center border border-primary-100">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedEmpresa.nome}</h3>
                <p className="text-sm text-gray-500">{selectedEmpresa.cnpj}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email de Contato</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEmpresa.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEmpresa.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plano</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEmpresa.plano}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vagas Ativas</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEmpresa.vagasAtivas}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEmpresa.dataCadastro}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'empresas') && (
                <button className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Empresa
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
