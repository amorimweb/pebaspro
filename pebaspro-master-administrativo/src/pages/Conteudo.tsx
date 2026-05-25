import React, { useState, useMemo } from 'react';
import { Search, Filter, Image, MessageSquare, HelpCircle, AlertTriangle, Plus, MoreVertical, CheckCircle2, XCircle, Clock, Edit, Eye, Trash2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const mockConteudo = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  titulo: `Conteúdo de Teste ${i + 1}`,
  tipo: i % 4 === 0 ? 'Banner' : i % 3 === 0 ? 'Aviso' : i % 2 === 0 ? 'FAQ' : 'Popup',
  local: i % 3 === 0 ? 'Home - Topo' : i % 2 === 0 ? 'Dashboard Geral' : 'Central de Ajuda',
  status: i % 5 === 0 ? 'inativo' : i % 4 === 0 ? 'agendado' : 'ativo',
  data: `1${i % 9}/04/2026`
}));

export default function Conteudo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const itemsPerPage = 10;

  const filteredConteudo = useMemo(() => {
    return mockConteudo.filter(c =>
      c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.local.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredConteudo.length / itemsPerPage);
  const paginatedConteudo = filteredConteudo.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    logAction('view_conteudo_details', 'conteudo', { conteudoId: item.id });
  };

  const handleAction = (action: string, item: any) => {
    if (!canPerformAction('edit', 'conteudo')) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }
    logAction(`action_${action}_conteudo`, 'conteudo', { conteudoId: item.id });
    alert(`Ação "${action}" realizada no conteúdo #${item.id}. (Simulação)`);
  };

  const handleCreate = () => {
    if (!canPerformAction('create', 'conteudo')) {
      alert('Você não tem permissão para criar conteúdo.');
      return;
    }
    logAction('create_conteudo', 'conteudo');
    alert('Abrindo formulário de criação de conteúdo. (Simulação)');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Conteúdo e Comunicação</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie banners, avisos, FAQs e campanhas da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('create', 'conteudo') && (
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              <Plus className="h-4 w-4" />
              Novo Conteúdo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Banners Ativos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">4</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Avisos Globais</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">1</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Artigos no FAQ</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">42</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Campanhas Agendadas</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-purple-600">2</dd>
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
            placeholder="Buscar por título ou local..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6">
            <option>Todos os Tipos</option>
            <option>Banner</option>
            <option>Aviso</option>
            <option>FAQ</option>
            <option>Popup</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredConteudo.length === 0 ? (
          <EmptyState
            title="Nenhum conteúdo encontrado"
            description={`Não encontramos resultados para "${searchTerm}".`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Conteúdo</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Local</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedConteudo.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                            {item.tipo === 'Banner' && <Image className="h-5 w-5 text-gray-500" />}
                            {item.tipo === 'Aviso' && <AlertTriangle className="h-5 w-5 text-gray-500" />}
                            {item.tipo === 'FAQ' && <HelpCircle className="h-5 w-5 text-gray-500" />}
                            {item.tipo === 'Popup' && <MessageSquare className="h-5 w-5 text-gray-500" />}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{item.titulo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {item.tipo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {item.local}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {item.status === 'ativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ativo
                          </span>
                        )}
                        {item.status === 'inativo' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            <XCircle className="h-3.5 w-3.5" />
                            Inativo
                          </span>
                        )}
                        {item.status === 'agendado' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                            <Clock className="h-3.5 w-3.5" />
                            Agendado
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.data}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewDetails(item)} className="text-gray-400 hover:text-primary-600" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canPerformAction('edit', 'conteudo') && (
                            <>
                              <button onClick={() => handleAction('editar', item)} className="text-gray-400 hover:text-primary-600" title="Editar">
                                <Edit className="h-4 w-4" />
                              </button>
                              {item.status === 'ativo' ? (
                                <button onClick={() => handleAction('desativar', item)} className="text-gray-400 hover:text-yellow-600" title="Desativar">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button onClick={() => handleAction('ativar', item)} className="text-gray-400 hover:text-green-600" title="Ativar">
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                          {canPerformAction('delete', 'conteudo') && (
                            <button onClick={() => handleAction('excluir', item)} className="text-gray-400 hover:text-red-600" title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </button>
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
              totalItems={filteredConteudo.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detalhes do Conteúdo">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                {selectedItem.tipo === 'Banner' && <Image className="h-8 w-8 text-gray-500" />}
                {selectedItem.tipo === 'Aviso' && <AlertTriangle className="h-8 w-8 text-gray-500" />}
                {selectedItem.tipo === 'FAQ' && <HelpCircle className="h-8 w-8 text-gray-500" />}
                {selectedItem.tipo === 'Popup' && <MessageSquare className="h-8 w-8 text-gray-500" />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedItem.titulo}</h3>
                <p className="text-sm text-gray-500">ID: #{selectedItem.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.tipo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Local</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.local}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedItem.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.data}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              {canPerformAction('edit', 'conteudo') && (
                <button onClick={() => { handleAction('editar', selectedItem); setIsModalOpen(false); }} className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  Editar Conteúdo
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
