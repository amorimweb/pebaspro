<script setup lang="ts">
import { 
  Users, 
  Building2, 
  Briefcase, 
  CalendarCheck, 
  AlertCircle,
  DollarSign
} from 'lucide-vue-next'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { useAdminAudit } from '~/composables/useAdminAudit'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const { canPerformAction } = useAdminPermissions()
const { logAction } = useAdminAudit()

// Mock Data
const stats = [
  { name: 'Total de Usuários', value: '71.897', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Empresas Ativas', value: '1.234', change: '+5.4%', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Vagas Abertas', value: '456', change: '-2.1%', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Serviços Realizados', value: '8.912', change: '+24%', icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
]

const recentActivity = [
  { id: 1, content: 'Nova empresa cadastrada', target: 'Tech Solutions Ltda', date: 'Há 10 min', icon: Building2, iconBg: 'bg-blue-500' },
  { id: 2, content: 'Denúncia recebida', target: 'Serviço #8921', date: 'Há 45 min', icon: AlertCircle, iconBg: 'bg-red-500' },
  { id: 3, content: 'Assinatura Premium', target: 'João Silva (Prestador)', date: 'Há 2 horas', icon: DollarSign, iconBg: 'bg-green-500' },
  { id: 4, content: 'Nova vaga publicada', target: 'Desenvolvedor Frontend', date: 'Há 3 horas', icon: Briefcase, iconBg: 'bg-purple-500' },
]

// ApexCharts Config
const chartData = {
  series: [{
    name: 'Usuários',
    data: [4000, 3000, 2000, 2780, 1890, 2390, 3490]
  }],
  options: {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: true },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    }
  }
}

const revenueChart = {
  series: [{
    name: 'Receita',
    data: [2400, 1398, 9800, 3908, 4800, 3800, 4300]
  }],
  options: {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: ['#0f172a'],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    }
  }
}

const handleExport = () => {
  if (!canPerformAction('view', 'relatorios')) {
    alert('Você não tem permissão para exportar relatórios.')
    return
  }
  logAction('export_dashboard_report', 'dashboard')
  alert('Iniciando exportação do Dashboard...')
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Dashboard Executivo</h1>
        <p class="text-slate-500 font-medium mt-1">Bem-vindo ao centro de comando do PebasPro.</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="rounded-xl border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-bold text-slate-700 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all cursor-pointer">
          <option>Últimos 30 dias</option>
          <option>Este mês</option>
          <option>Este ano</option>
        </select>
        <button 
          v-if="canPerformAction('view', 'relatorios')"
          @click="handleExport"
          class="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all"
        >
          Exportar Dados
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="stat in stats" 
        :key="stat.name" 
        class="group relative overflow-hidden rounded-[24px] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <div :class="['p-3 rounded-2xl transition-colors duration-300', stat.bg, stat.color]">
            <component :is="stat.icon" class="h-6 w-6" />
          </div>
          <span :class="['text-xs font-black px-2.5 py-1 rounded-full', stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600']">
            {{ stat.change }}
          </span>
        </div>
        <div>
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.name }}</p>
          <h3 class="text-2xl font-black text-slate-900">{{ stat.value }}</h3>
        </div>
        <!-- Decorative line -->
        <div class="absolute bottom-0 left-0 h-1.5 w-0 bg-green-500 group-hover:w-full transition-all duration-500" />
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-8">
           <h2 class="text-lg font-black text-slate-900">Crescimento de Usuários</h2>
           <span class="text-xs font-bold text-slate-400">Total acumulado</span>
        </div>
        <div class="h-80 w-full">
           <ClientOnly>
             <apexchart 
               height="100%" 
               width="100%" 
               :options="chartData.options" 
               :series="chartData.series"
             />
           </ClientOnly>
        </div>
      </div>

      <div class="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-8">
           <h2 class="text-lg font-black text-slate-900">Receita Mensal (R$)</h2>
           <span class="text-xs font-bold text-slate-400 font-mono tracking-tighter">BRL / Mês</span>
        </div>
        <div class="h-80 w-full">
           <ClientOnly>
             <apexchart 
               height="100%" 
               width="100%" 
               :options="revenueChart.options" 
               :series="revenueChart.series"
             />
           </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Activity & Alerts -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 rounded-[32px] bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div class="border-b border-slate-50 px-8 py-6 bg-slate-50/30">
          <h2 class="text-lg font-black text-slate-900 uppercase tracking-tight">Atividade Recente</h2>
        </div>
        <div class="p-8">
          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(event, eventIdx) in recentActivity" :key="event.id">
                <div class="relative pb-8">
                  <span 
                    v-if="eventIdx !== recentActivity.length - 1" 
                    class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-100" 
                    aria-hidden="true" 
                  />
                  <div class="relative flex space-x-4">
                    <div>
                      <span :class="['h-10 w-10 rounded-2xl flex items-center justify-center ring-8 ring-white shadow-sm transition-transform hover:scale-110', event.iconBg]">
                        <component :is="event.icon" class="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p class="text-sm text-slate-600 font-medium">
                          {{ event.content }} <span class="font-black text-slate-900">{{ event.target }}</span>
                        </p>
                      </div>
                      <div class="whitespace-nowrap text-right text-xs font-black text-slate-300 uppercase">
                        <time>{{ event.date }}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Operational Alerts -->
      <div class="space-y-6">
        <div class="rounded-[32px] bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div class="border-b border-slate-50 px-8 py-6 bg-slate-50/30">
            <h2 class="text-lg font-black text-slate-900 uppercase tracking-tight">Alertas</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="rounded-3xl bg-amber-50/50 p-5 border border-amber-100/50">
              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <AlertCircle class="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 class="text-sm font-black text-amber-900">12 Documentos Pendentes</h3>
                  <p class="mt-1 text-xs text-amber-700 leading-relaxed">Existem prestadores aguardando validação de documentos há mais de 24h.</p>
                  <NuxtLink to="/admin/rh" class="mt-4 inline-flex items-center text-xs font-black text-amber-800 hover:gap-2 transition-all">
                    VER PENDÊNCIAS →
                  </NuxtLink>
                </div>
              </div>
            </div>

            <div class="rounded-3xl bg-red-50/50 p-5 border border-red-100/50">
              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <AlertCircle class="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 class="text-sm font-black text-red-900">3 Denúncias Graves</h3>
                  <p class="mt-1 text-xs text-red-700 leading-relaxed">Denúncias reportadas reportadas por usuários que requerem atenção imediata.</p>
                  <NuxtLink to="/admin/moderacao" class="mt-4 inline-flex items-center text-xs font-black text-red-800 hover:gap-2 transition-all">
                    ANALISAR AGORA →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Info Card -->
        <div class="rounded-[32px] bg-slate-900 p-8 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden group">
           <div class="relative z-10">
              <h3 class="text-xl font-black mb-2">Suporte PebasPro</h3>
              <p class="text-slate-400 text-sm mb-6 leading-relaxed">Precisa de ajuda com alguma funcionalidade master ou acesso especial?</p>
              <button class="w-full py-3 bg-white text-slate-900 font-black rounded-2xl hover:bg-green-500 hover:text-white transition-all transform group-hover:scale-105">
                 Falar com TI
              </button>
           </div>
           <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-green-500 opacity-10 rounded-full blur-3xl transition-all group-hover:scale-150" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: translateIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes translateIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
