<script setup lang="ts">
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  ShieldAlert, 
  Headset, 
  Calendar, 
  Filter, 
  Eye, 
  Clock,
  Printer,
  ChevronRight,
  ChartPie
} from 'lucide-vue-next'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { useAdminAudit } from '~/composables/useAdminAudit'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const { canPerformAction } = useAdminPermissions()
const { logAction } = useAdminAudit()

// UI State
const activeTab = ref<'relatorios' | 'historico'>('relatorios')
const selectedReport = ref<any>(null)
const isModalOpen = ref(false)
const isLoading = ref(true)

// Mock Data
const reports = [
  { id: 1, nome: 'Crescimento de Usuários', descricao: 'Relatório detalhado de novos cadastros por tipo e região.', icone: Users, cor: 'bg-blue-50 text-blue-600', trend: '+12%' },
  { id: 2, nome: 'Desempenho de Vagas', descricao: 'Métricas de visualização, candidaturas e tempo de fechamento.', icone: Briefcase, cor: 'bg-purple-50 text-purple-600', trend: '+5%' },
  { id: 3, nome: 'Faturamento Mensal', descricao: 'Receitas de assinaturas, anúncios e taxas de serviço.', icone: DollarSign, cor: 'bg-green-50 text-green-600', trend: '+18%' },
  { id: 4, nome: 'Relatório de Moderação', descricao: 'Histórico de denúncias, suspensões e ações disciplinares.', icone: ShieldAlert, cor: 'bg-red-50 text-red-600', trend: '-2%' },
  { id: 5, nome: 'Métricas de Suporte', descricao: 'Tempo de resposta, volume de chamados e satisfação.', icone: Headset, cor: 'bg-amber-50 text-amber-600', trend: '-8%' },
  { id: 6, nome: 'Visão Geral da Plataforma', descricao: 'Resumo executivo com os principais KPIs do PEBASPRO.', icone: TrendingUp, cor: 'bg-indigo-50 text-indigo-600', trend: '+14%' },
]

const exportHistory = [
  { id: 1, relatorio: 'Faturamento Mensal', data: '15/04/2026 14:30', formato: 'PDF', usuario: 'Admin Master', status: 'concluido' },
  { id: 2, relatorio: 'Crescimento de Usuários', data: '14/04/2026 09:15', formato: 'Excel', usuario: 'Gerente Comercial', status: 'concluido' },
  { id: 3, relatorio: 'Relatório de Moderação', data: '13/04/2026 16:45', formato: 'CSV', usuario: 'Moderador Chefe', status: 'falha' },
]

onMounted(() => {
  setTimeout(() => isLoading.value = false, 500)
})

const handleView = (relatorio: any) => {
  if (!canPerformAction('view', 'relatorios')) return
  selectedReport.value = relatorio
  isModalOpen.value = true
  logAction('view_report', 'relatorios', { reportId: relatorio.id, reportName: relatorio.nome })
}

const handleExport = (relatorio: any) => {
  if (!canPerformAction('view', 'relatorios')) return
  logAction('export_report', 'relatorios', { reportId: relatorio.id, reportName: relatorio.nome })
  alert(`Exportando "${relatorio.nome}"...`)
}

const handleSchedule = () => {
  if (!canPerformAction('edit', 'relatorios')) return
  logAction('schedule_report', 'relatorios')
  alert('Painel de Agendamento disparado.')
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Relatórios & Insights</h1>
        <p class="text-slate-500 font-medium mt-1">Inteligência de dados aplicada ao crescimento da plataforma.</p>
      </div>
      <div class="flex gap-3">
         <button v-if="canPerformAction('edit', 'relatorios')" @click="handleSchedule" class="rounded-2xl bg-white border border-slate-100 px-6 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
           <Calendar class="h-4 w-4" />
           Agendar Envio
        </button>
      </div>
    </div>

    <!-- Quick Metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
       <div v-for="stat in [
         { label: 'Receita Total', value: 'R$ 145.2k', color: 'text-slate-900', bg: 'bg-white' },
         { label: 'Growth YoY', value: '1.245', color: 'text-blue-600', bg: 'bg-white' },
         { label: 'Op. Concluídas', value: '8.912', color: 'text-green-600', bg: 'bg-white' },
         { label: 'Conversão LTV', value: '12.4%', color: 'text-purple-600', bg: 'bg-white' }
       ]" :key="stat.label" class="p-6 rounded-[28px] border border-slate-100 shadow-sm" :class="stat.bg">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
          <h3 class="text-3xl font-black" :class="stat.color">{{ stat.value }}</h3>
       </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <!-- Tabs Nav -->
      <div class="flex border-b border-slate-50 p-2 bg-slate-50/20">
        <button 
          v-for="tab in ['relatorios', 'historico']" 
          :key="tab"
          @click="activeTab = tab as any"
          :class="[
            activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white',
            'flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all capitalize'
          ]"
        >
          <component :is="tab === 'relatorios' ? FileText : Clock" class="h-4 w-4" />
          {{ tab === 'relatorios' ? 'Relatórios Disponíveis' : 'Dossiê de Exportação' }}
        </button>
      </div>

      <div class="p-8">
        <!-- Reports View -->
        <div v-if="activeTab === 'relatorios'" class="space-y-8">
          <!-- Filters Area -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-[28px] border border-slate-100/50">
             <div v-for="f in [
               { label: 'Amplitude Temporal', options: ['Últimos 30 dias', 'Este Trimestre', 'Personalizado'] },
               { label: 'Segmentação Geográfica', options: ['Nacional', 'São Paulo, SP', 'Rio de Janeiro, RJ'] },
               { label: 'Output Primário', options: ['PDF (Executivo)', 'JSON (API)', 'CSV (Spreadsheet)'] }
             ]" :key="f.label">
                <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ f.label }}</label>
                <select class="w-full bg-white border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-indigo-500">
                   <option v-for="opt in f.options" :key="opt">{{ opt }}</option>
                </select>
             </div>
          </div>

          <!-- Report Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div v-for="r in reports" :key="r.id" class="group bg-white rounded-[28px] border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all transform hover:-translate-y-1">
                <div class="flex items-start justify-between mb-6">
                   <div :class="[r.cor, 'h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 ring-1 ring-inset ring-white/20']">
                      <component :is="r.icone" class="h-7 w-7" />
                   </div>
                   <span :class="[
                     r.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50',
                     'px-2 py-1 rounded-lg text-[10px] font-black border border-current/10'
                   ]">
                     {{ r.trend }}
                   </span>
                </div>
                <h4 class="text-lg font-black text-slate-900 mb-2 leading-tight tracking-tight">{{ r.nome }}</h4>
                <p class="text-xs font-medium text-slate-500 mb-8 leading-relaxed">{{ r.descricao }}</p>
                
                <div class="flex gap-3 pt-4 border-t border-slate-50">
                   <button @click="handleView(r)" class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-100 text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
                      <Eye class="h-3.5 w-3.5" /> Preview
                   </button>
                   <button @click="handleExport(r)" class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all">
                      <Download class="h-3.5 w-3.5" /> Exportar
                   </button>
                </div>
             </div>
          </div>
        </div>

        <!-- History View -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
             <thead class="bg-slate-50/50">
                <tr>
                   <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                   <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Geração</th>
                   <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operador</th>
                   <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   <th class="px-6 py-4"></th>
                </tr>
             </thead>
             <tbody class="divide-y divide-slate-50">
                <tr v-for="item in exportHistory" :key="item.id" class="group hover:bg-slate-50/50 transition-colors">
                   <td class="py-5 px-6">
                      <div class="flex items-center gap-3">
                         <div class="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <FileText class="h-5 w-5" />
                         </div>
                         <div>
                            <p class="text-xs font-black text-slate-900">{{ item.relatorio }}</p>
                            <p class="text-[9px] font-black text-slate-400 uppercase">FORMATO: {{ item.formato }}</p>
                         </div>
                      </div>
                   </td>
                   <td class="px-6 py-5 text-xs font-bold text-slate-500">{{ item.data }}</td>
                   <td class="px-6 py-5 text-xs font-bold text-slate-900 italic underline decoration-slate-100 decoration-2 underline-offset-4">{{ item.usuario }}</td>
                   <td class="px-6 py-5">
                      <span :class="[
                        item.status === 'concluido' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200',
                        'px-3 py-1 rounded-full text-[9px] font-black uppercase border'
                      ]">
                        {{ item.status }}
                      </span>
                   </td>
                   <td class="px-6 py-5 text-right">
                      <button v-if="item.status === 'concluido'" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                         <Download class="h-4 w-4" />
                      </button>
                   </td>
                </tr>
             </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" :title="`Analytics: ${selectedReport?.nome}`" size="lg">
       <div v-if="selectedReport" class="space-y-8">
          <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
             <div :class="[selectedReport.cor, 'h-16 w-16 rounded-[22px] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500']">
                <component :is="selectedReport.icone" class="h-8 w-8" />
             </div>
             <div>
                <h4 class="text-xl font-black text-slate-900 leading-tight">{{ selectedReport.nome }}</h4>
                <p class="text-xs font-bold text-slate-400">PRÉ-VISUALIZAÇÃO DE INTELIGÊNCIA</p>
             </div>
          </div>

          <div class="bg-indigo-600 rounded-[32px] p-10 text-white min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden">
             <ChartPie class="h-20 w-20 mb-6 text-white/20 animate-pulse" />
             <h5 class="text-2xl font-black italic mb-4">Mapeando Dinâmica Operacional...</h5>
             <p class="text-indigo-100 text-sm max-w-sm font-medium leading-relaxed opacity-80">Estamos processando os datasets mais recentes para gerar a visualização heurística deste relatório.</p>
             
             <!-- Decorative elements -->
             <div class="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp class="h-40 w-40" />
             </div>
          </div>

          <div class="flex gap-3 justify-end pt-4 border-t border-slate-50">
             <button @click="isModalOpen = false" class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all">Fechar Preview</button>
             <button @click="handleExport(selectedReport)" class="px-10 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
                <Printer class="h-4 w-4" /> Imprimir Documento
             </button>
          </div>
       </div>
    </AdminModal>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
