import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Building2,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { usePermissions } from '../hooks/usePermissions';
import { useAudit } from '../hooks/useAudit';

const data = [
  { name: 'Jan', usuarios: 4000, receita: 2400 },
  { name: 'Fev', usuarios: 3000, receita: 1398 },
  { name: 'Mar', usuarios: 2000, receita: 9800 },
  { name: 'Abr', usuarios: 2780, receita: 3908 },
  { name: 'Mai', usuarios: 1890, receita: 4800 },
  { name: 'Jun', usuarios: 2390, receita: 3800 },
  { name: 'Jul', usuarios: 3490, receita: 4300 },
];

const stats = [
  { name: 'Total de Usuários', value: '71.897', change: '+12%', icon: Users },
  { name: 'Empresas Ativas', value: '1.234', change: '+5.4%', icon: Building2 },
  { name: 'Vagas Abertas', value: '456', change: '-2.1%', icon: Briefcase },
  { name: 'Serviços Realizados', value: '8.912', change: '+24%', icon: CalendarCheck },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const { logAction } = useAudit();

  const handleExport = () => {
    if (!canPerformAction('view', 'relatorios')) {
      alert('Você não tem permissão para exportar relatórios.');
      return;
    }
    logAction('export_dashboard_report', 'dashboard');
    alert('Relatório do dashboard exportado com sucesso. (Simulação)');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Executivo</h1>
        <div className="flex items-center gap-2">
          <select className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500">
            <option>Últimos 30 dias</option>
            <option>Este mês</option>
            <option>Este ano</option>
          </select>
          {canPerformAction('view', 'relatorios') && (
            <button
              onClick={handleExport}
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Exportar Relatório
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm border border-gray-100 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-primary-50 p-3">
                <stat.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Crescimento de Usuários</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="usuarios" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsuarios)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Receita (R$)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="receita" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Atividade Recente (Sistema Principal)</h2>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  { id: 1, content: 'Nova empresa cadastrada', target: 'Tech Solutions Ltda', date: 'Há 10 min', icon: Building2, iconBg: 'bg-blue-500' },
                  { id: 2, content: 'Denúncia recebida', target: 'Serviço #8921', date: 'Há 45 min', icon: AlertCircle, iconBg: 'bg-red-500' },
                  { id: 3, content: 'Assinatura Premium', target: 'João Silva (Prestador)', date: 'Há 2 horas', icon: DollarSign, iconBg: 'bg-green-500' },
                  { id: 4, content: 'Nova vaga publicada', target: 'Desenvolvedor Frontend', date: 'Há 3 horas', icon: Briefcase, iconBg: 'bg-purple-500' },
                ].map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== 3 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.iconBg}`}>
                            <event.icon className="h-4 w-4 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              {event.content} <span className="font-medium text-gray-900">{event.target}</span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time>{event.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Alertas Operacionais</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">12 Documentos Pendentes</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Existem prestadores aguardando validação de documentos há mais de 24h.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/rh')}
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-700"
                    >
                      Ver pendências &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-red-50 p-4 border border-red-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">3 Denúncias Graves</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Denúncias reportadas por usuários que requerem atenção imediata.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/moderacao')}
                      className="text-sm font-medium text-red-800 hover:text-red-700"
                    >
                      Analisar denúncias &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
