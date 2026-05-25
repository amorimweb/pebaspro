import React, { useState } from 'react';
import { Settings, Shield, Bell, Globe, Mail, CreditCard, Database, Lock, Save, RotateCcw, Activity } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('geral');
  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();

  const handleSave = () => {
    if (!canPerformAction('edit', 'configuracoes')) {
      alert('Você não tem permissão para alterar as configurações.');
      return;
    }
    logAction('save_settings', 'configuracoes', { tab: activeTab });
    alert('Configurações salvas com sucesso! (Simulação)');
  };

  const handleRestore = () => {
    if (!canPerformAction('edit', 'configuracoes')) {
      alert('Você não tem permissão para restaurar as configurações.');
      return;
    }
    logAction('restore_settings', 'configuracoes', { tab: activeTab });
    alert('Configurações restauradas para o padrão! (Simulação)');
  };

  const handleTestConnection = (service: string) => {
    if (!canPerformAction('edit', 'configuracoes')) return;
    logAction('test_connection', 'configuracoes', { service });
    alert(`Conexão com ${service} testada com sucesso! (Simulação)`);
  };

  const handleToggleMaintenance = () => {
    if (!canPerformAction('edit', 'configuracoes')) return;
    logAction('toggle_maintenance_mode', 'configuracoes');
    alert('Modo de manutenção alterado! (Simulação)');
  };

  const handleToggle2FA = () => {
    if (!canPerformAction('edit', 'configuracoes')) return;
    logAction('toggle_2fa_requirement', 'configuracoes');
    alert('Exigência de 2FA alterada! (Simulação)');
  };

  const handleExportLogs = () => {
    if (!canPerformAction('view', 'configuracoes')) return;
    logAction('export_audit_logs', 'configuracoes');
    alert('Logs de auditoria exportados! (Simulação)');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configurações Gerais</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as preferências, integrações e parâmetros globais do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canPerformAction('edit', 'configuracoes') && (
            <>
              <button onClick={handleRestore} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                <RotateCcw className="h-4 w-4 text-gray-500" />
                Restaurar Padrão
              </button>
              <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation for Settings */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('geral')}
              className={`${activeTab === 'geral' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Settings className={`${activeTab === 'geral' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('permissoes')}
              className={`${activeTab === 'permissoes' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Shield className={`${activeTab === 'permissoes' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">Permissões e Perfis</span>
            </button>
            <button
              onClick={() => setActiveTab('notificacoes')}
              className={`${activeTab === 'notificacoes' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Bell className={`${activeTab === 'notificacoes' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">Notificações</span>
            </button>
            <button
              onClick={() => setActiveTab('pagamentos')}
              className={`${activeTab === 'pagamentos' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <CreditCard className={`${activeTab === 'pagamentos' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">Pagamentos e Taxas</span>
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`${activeTab === 'emails' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Mail className={`${activeTab === 'emails' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">E-mails Transacionais</span>
            </button>
            <button
              onClick={() => setActiveTab('integracoes')}
              className={`${activeTab === 'integracoes' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Database className={`${activeTab === 'integracoes' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">Integrações (API)</span>
            </button>
            <button
              onClick={() => setActiveTab('seguranca')}
              className={`${activeTab === 'seguranca' ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'} group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Lock className={`${activeTab === 'seguranca' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              <span className="truncate">Segurança e Auditoria</span>
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'geral' && (
            <>
              <div className="bg-white shadow-sm rounded-xl border border-gray-100">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">Informações da Plataforma</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Atualize os dados institucionais que aparecem publicamente no PEBASPRO.</p>
                  </div>
                  <form className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium leading-6 text-gray-900">Nome da Plataforma</label>
                      <div className="mt-2">
                        <input type="text" name="nome" id="nome" defaultValue="PEBASPRO" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">E-mail de Contato Oficial</label>
                      <div className="mt-2">
                        <input type="email" name="email" id="email" defaultValue="contato@pebaspro.com.br" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium leading-6 text-gray-900">URL Principal</label>
                      <div className="mt-2">
                        <input type="url" name="url" id="url" defaultValue="https://pebaspro.com.br" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" />
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-xl border border-gray-100">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">Modo de Manutenção</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Ative este modo para suspender temporariamente o acesso público ao sistema durante atualizações críticas.</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="flex flex-grow flex-col">
                      <span className="text-sm font-medium leading-6 text-gray-900" id="availability-label">Ativar modo de manutenção</span>
                      <span className="text-sm text-gray-500" id="availability-description">Apenas administradores master poderão acessar o sistema.</span>
                    </span>
                    <button type="button" onClick={handleToggleMaintenance} disabled={!canPerformAction('edit', 'configuracoes')} className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" role="switch" aria-checked="false" aria-labelledby="availability-label" aria-describedby="availability-description">
                      <span aria-hidden="true" className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notificacoes' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Notificações</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure quais eventos disparam notificações para os administradores.</p>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { id: 'notif-1', title: 'Novos Cadastros', desc: 'Alertar quando uma nova empresa ou prestador se cadastrar.' },
                    { id: 'notif-2', title: 'Pagamentos Recusados', desc: 'Alertar sobre falhas em cobranças de assinaturas.' },
                    { id: 'notif-3', title: 'Denúncias Recebidas', desc: 'Alertar quando um usuário ou vaga for denunciado.' },
                    { id: 'notif-4', title: 'Erros de Integração', desc: 'Alertar sobre falhas nas APIs externas.' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="flex flex-grow flex-col">
                        <span className="text-sm font-medium leading-6 text-gray-900" id={`${item.id}-label`}>{item.title}</span>
                        <span className="text-sm text-gray-500" id={`${item.id}-description`}>{item.desc}</span>
                      </span>
                      <button type="button" disabled={!canPerformAction('edit', 'configuracoes')} className="bg-primary-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" role="switch" aria-checked="true" aria-labelledby={`${item.id}-label`} aria-describedby={`${item.id}-description`}>
                        <span aria-hidden="true" className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagamentos' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Pagamentos e Taxas</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure as taxas padrão e regras de faturamento.</p>
                </div>
                <form className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="taxa-padrao" className="block text-sm font-medium leading-6 text-gray-900">Taxa Padrão de Serviço (%)</label>
                    <div className="mt-2 relative rounded-md shadow-sm max-w-xs">
                      <input type="number" name="taxa-padrao" id="taxa-padrao" defaultValue="15" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="prazo-repasse" className="block text-sm font-medium leading-6 text-gray-900">Prazo de Repasse (Dias)</label>
                    <div className="mt-2 max-w-xs">
                      <select id="prazo-repasse" name="prazo-repasse" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6">
                        <option>D+0 (Imediato)</option>
                        <option>D+1</option>
                        <option>D+14</option>
                        <option>D+30</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="flex flex-grow flex-col">
                      <span className="text-sm font-medium leading-6 text-gray-900">Retenção de Impostos Automática</span>
                      <span className="text-sm text-gray-500">Calcular e reter impostos na fonte.</span>
                    </span>
                    <button type="button" disabled={!canPerformAction('edit', 'configuracoes')} className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" role="switch" aria-checked="false">
                      <span aria-hidden="true" className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">E-mails Transacionais</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure os remetentes e templates de e-mail do sistema.</p>
                </div>
                <form className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="email-remetente" className="block text-sm font-medium leading-6 text-gray-900">E-mail de Remetente Padrão (From)</label>
                    <div className="mt-2">
                      <input type="email" name="email-remetente" id="email-remetente" defaultValue="no-reply@pebaspro.com.br" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="nome-remetente" className="block text-sm font-medium leading-6 text-gray-900">Nome do Remetente Padrão</label>
                    <div className="mt-2">
                      <input type="text" name="nome-remetente" id="nome-remetente" defaultValue="Equipe PEBASPRO" disabled={!canPerformAction('edit', 'configuracoes')} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Templates Ativos</h4>
                    <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                      {['Boas-vindas (Novo Usuário)', 'Recuperação de Senha', 'Confirmação de Pagamento', 'Aviso de Vaga Aprovada'].map((template) => (
                        <li key={template} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <Mail className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            <span className="ml-2 w-0 flex-1 truncate font-medium">{template}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            {canPerformAction('edit', 'configuracoes') && <button type="button" className="font-medium text-primary-600 hover:text-primary-500">Editar</button>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Integrações (API)</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure as chaves de API para serviços externos.</p>
                </div>
                <form className="mt-5 space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Gateway de Pagamento (Stripe/Pagar.me)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">Public Key</label>
                        <input type="text" disabled={!canPerformAction('edit', 'configuracoes')} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" placeholder="pk_test_..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">Secret Key</label>
                        <input type="password" disabled={!canPerformAction('edit', 'configuracoes')} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" placeholder="sk_test_..." />
                      </div>
                      {canPerformAction('edit', 'configuracoes') && (
                        <button type="button" onClick={() => handleTestConnection('Gateway de Pagamento')} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                          <Activity className="h-4 w-4 text-gray-500" />
                          Testar Conexão
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Serviço de E-mail (SendGrid/AWS SES)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">API Key</label>
                        <input type="password" disabled={!canPerformAction('edit', 'configuracoes')} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6" placeholder="SG...." />
                      </div>
                      {canPerformAction('edit', 'configuracoes') && (
                        <button type="button" onClick={() => handleTestConnection('Serviço de E-mail')} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                          <Activity className="h-4 w-4 text-gray-500" />
                          Testar Conexão
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'permissoes' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Permissões e Perfis</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure os níveis de acesso para os administradores do painel.</p>
                </div>
                <div className="mt-5 flex flex-col gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Administrador Master</h4>
                        <p className="text-sm text-gray-500">Acesso total a todas as funcionalidades do sistema.</p>
                      </div>
                      {canPerformAction('edit', 'configuracoes') && <button className="text-sm font-medium text-primary-600 hover:text-primary-500">Editar</button>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Gerente Financeiro</h4>
                        <p className="text-sm text-gray-500">Acesso aos módulos Financeiro e Relatórios.</p>
                      </div>
                      {canPerformAction('edit', 'configuracoes') && <button className="text-sm font-medium text-primary-600 hover:text-primary-500">Editar</button>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Moderador</h4>
                        <p className="text-sm text-gray-500">Acesso aos módulos de Moderação, Suporte e Usuários.</p>
                      </div>
                      {canPerformAction('edit', 'configuracoes') && <button className="text-sm font-medium text-primary-600 hover:text-primary-500">Editar</button>}
                    </div>
                  </div>
                  {canPerformAction('create', 'configuracoes') && (
                    <button className="mt-2 w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      Criar Novo Perfil
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-100">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Segurança e Auditoria</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configurações de segurança e logs de acesso.</p>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex flex-grow flex-col">
                      <span className="text-sm font-medium leading-6 text-gray-900">Autenticação em Duas Etapas (2FA) Obrigatória</span>
                      <span className="text-sm text-gray-500">Exigir 2FA para todos os administradores.</span>
                    </span>
                    <button type="button" onClick={handleToggle2FA} disabled={!canPerformAction('edit', 'configuracoes')} className="bg-primary-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" role="switch" aria-checked="true">
                      <span aria-hidden="true" className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <span className="flex flex-grow flex-col">
                      <span className="text-sm font-medium leading-6 text-gray-900">Tempo de Expiração da Sessão</span>
                      <span className="text-sm text-gray-500">Deslogar administradores inativos após:</span>
                    </span>
                    <select disabled={!canPerformAction('edit', 'configuracoes')} className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm sm:leading-6">
                      <option>15 minutos</option>
                      <option>30 minutos</option>
                      <option>1 hora</option>
                      <option>4 horas</option>
                    </select>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <button onClick={handleExportLogs} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      Exportar Logs de Auditoria
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
