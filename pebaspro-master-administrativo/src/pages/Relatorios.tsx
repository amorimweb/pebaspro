import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Users, Briefcase, DollarSign, ShieldAlert, Headset, Calendar, Filter, Eye, Clock } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

const relatorios = [
  { id: 1, nome: 'Crescimento de Usuários', descricao: 'Relatório detalhado de novos cadastros por tipo e região.', icone: Users, cor: 'bg-blue-50 text-blue-600' },
  { id: 2, nome: 'Desempenho de Vagas', descricao: 'Métricas de visualização, candidaturas e tempo de fechamento.', icone: Briefcase, cor: 'bg-purple-50 text-purple-600' },
  { id: 3, nome: 'Faturamento Mensal', descricao: 'Receitas de assinaturas, anúncios e taxas de serviço.', icone: DollarSign, cor: 'bg-green-50 text-green-600' },
  { id: 4, nome: 'Relatório de Moderação', descricao: 'Histórico de denúncias, suspensões e ações disciplinares.', icone: ShieldAlert, cor: 'bg-red-50 text-red-600' },
  { id: 5, nome: 'Métricas de Suporte', descricao: 'Tempo de resposta, volume de chamados e satisfação.', icone: Headset, cor: 'bg-orange-50 text-orange-600' },
  { id: 6, nome: 'Visão Geral da Plataforma', descricao: 'Resumo executivo com os principais KPIs do PEBASPRO.', icone: TrendingUp, cor: 'bg-primary-50 text-primary-600' },
];

export default function Relatorios() {
  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'relatorios' | 'historico'>('relatorios');

  const historicoExportacao = [
    { id: 1, relatorio: 'Faturamento Mensal', data: '15/04/2026 14:30', formato: 'PDF', usuario: 'Admin Master', status: 'concluido' },
    { id: 2, relatorio: 'Crescimento de Usuários', data: '14/04/2026 09:15', formato: 'Excel', usuario: 'Gerente Comercial', status: 'concluido' },
    { id: 3, relatorio: 'Relatório de Moderação', data: '13/04/2026 16:45', formato: 'CSV', usuario: 'Moderador Chefe', status: 'falha' },
  ];

  const handleSchedule = () => {
    if (!canPerformAction('edit', 'relatorios')) return;
    logAction('schedule_report', 'relatorios');
    alert('Agendamento de relatório configurado! (Simulação)');
  };

  const handleView = (relatorio: any) => {
    if (!canPerformAction('view', 'relatorios')) return;
    setSelectedReport(relatorio);
    setIsModalOpen(true);
    logAction('view_report', 'relatorios', { reportId: relatorio.id, reportName: relatorio.nome });
  };

  const handleExport = (relatorio: any) => {
    if (!canPerformAction('view', 'relatorios')) return;
    logAction('export_report', 'relatorios', { reportId: relatorio.id, reportName: relatorio.nome });
    alert(`Exportando relatório: ${relatorio.nome} (Simulação)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Relatórios e Exportação</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gere e exporte relatórios detalhados sobre a operação da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('edit', 'relatorios') && (
            <button onClick={handleSchedule} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-500" />
              Agendar Envio
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Receita Total (Mês)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">R$ 145.200</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Novos Usuários (Mês)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">1.245</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Serviços Concluídos</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-green-600">8.912</dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">Taxa de Conversão</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-purple-600">12.4%</dd>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`${activeTab === 'relatorios' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
            >
              <FileText className="h-4 w-4" />
              Relatórios Disponíveis
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`${activeTab === 'historico' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
            >
              <Clock className="h-4 w-4" />
              Histórico de Exportação
            </button>
          </nav>
        </div>

        {activeTab === 'relatorios' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Filtros Globais</h2>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Limpar Filtros
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
              <div>
                <label htmlFor="periodo" className="block text-sm font-medium text-gray-700">Período</label>
                <select id="periodo" className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                  <option>Últimos 30 dias</option>
                  <option>Este mês</option>
                  <option>Mês passado</option>
                  <option>Este ano</option>
                  <option>Personalizado...</option>
                </select>
              </div>
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
                <select id="cidade" className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                  <option>Todas as Cidades</option>
                  <option>São Paulo, SP</option>
                  <option>Rio de Janeiro, RJ</option>
                  <option>Belo Horizonte, MG</option>
                </select>
              </div>
              <div>
                <label htmlFor="formato" className="block text-sm font-medium text-gray-700">Formato de Exportação Padrão</label>
                <select id="formato" className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
                  <option>PDF</option>
                  <option>Excel (.xlsx)</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatorios.map((relatorio) => (
                <div key={relatorio.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${relatorio.cor}`}>
                      <relatorio.icone className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{relatorio.nome}</h3>
                  </div>
                  <p className="text-sm text-gray-500 flex-1 mb-6">
                    {relatorio.descricao}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <button onClick={() => handleView(relatorio)} className="flex-1 inline-flex justify-center items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </button>
                    <button onClick={() => handleExport(relatorio)} className="flex-1 inline-flex justify-center items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                      <Download className="h-4 w-4" />
                      Exportar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'historico' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Relatório</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Data/Hora</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Formato</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Usuário</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {historicoExportacao.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.relatorio}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.data}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.formato}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.usuario}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'concluido' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {item.status === 'concluido' ? 'Concluído' : 'Falha'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {item.status === 'concluido' && (
                        <button className="text-primary-600 hover:text-primary-900 flex items-center gap-1 justify-end w-full">
                          <Download className="h-4 w-4" />
                          Baixar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Visualização: ${selectedReport?.nome}`}>
        {selectedReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className={`h-16 w-16 rounded-lg flex items-center justify-center ${selectedReport.cor}`}>
                <selectedReport.icone className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedReport.nome}</h3>
                <p className="text-sm text-gray-500">{selectedReport.descricao}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-sm font-medium text-gray-900">Pré-visualização do Relatório</h4>
              <p className="mt-1 text-sm text-gray-500">
                A pré-visualização interativa de gráficos e tabelas seria renderizada aqui.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Fechar
              </button>
              <button onClick={() => { handleExport(selectedReport); setIsModalOpen(false); }} className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar Agora
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
