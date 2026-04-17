<script setup lang="ts">
import { 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical, 
  Edit, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Megaphone, 
  ShieldCheck, 
  Eye, 
  Trash2 
} from 'lucide-vue-next'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { useAdminAudit } from '~/composables/useAdminAudit'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const { canPerformAction } = useAdminPermissions()
const { logAction } = useAdminAudit()

// Tabs logic
type TabType = 'cobrancas' | 'assinaturas' | 'planos' | 'anuncios'
const tabs: { id: TabType, name: string, icon: any }[] = [
  { id: 'cobrancas', name: 'Cobranças e Transações', icon: DollarSign },
  { id: 'assinaturas', name: 'Assinaturas Ativas', icon: CreditCard },
  { id: 'planos', name: 'Gestão de Planos', icon: ShieldCheck },
  { id: 'anuncios', name: 'Anúncios Patrocinados', icon: Megaphone },
]

const activeTab = ref<TabType>('cobrancas')
const searchTerm = ref('')
const currentPage = ref(1)
const isLoading = ref(true)
const selectedItem = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 8

// Chart Config
const chartData = [
  { name: 'Jan', receita: 24000 },
  { name: 'Fev', receita: 13980 },
  { name: 'Mar', receita: 98000 },
  { name: 'Abr', receita: 39080 },
  { name: 'Mai', receita: 48000 },
  { name: 'Jun', receita: 38000 },
  { name: 'Jul', receita: 43000 },
]

const chartOptions = {
  chart: {
    type: 'area',
    toolbar: { show: false },
    sparkline: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3, colors: ['#10b981'] },
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
    categories: chartData.map(d => d.name),
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { show: false },
  grid: { show: false },
  colors: ['#10b981'],
  tooltip: {
    theme: 'dark',
    y: { formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR')}` }
  }
}

const series = [{
  name: 'Receita',
  data: chartData.map(d => d.receita)
}]

// Mock Data
const mockTransacoes = ref(Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  descricao: i % 3 === 0 ? `Assinatura Premium - Usuário ${i}` : i % 2 === 0 ? `Destaque de Vaga - Empresa ${i}` : `Estorno - Serviço #${i * 10}`,
  tipo: i % 5 === 0 ? 'saida' : 'entrada',
  valor: `R$ ${(Math.random() * 200 + 50).toFixed(2).replace('.', ',')}`,
  data: `1${i % 9}/04/2026`,
  status: i % 4 === 0 ? 'pendente' : i % 5 === 0 ? 'processado' : 'pago'
})))

const mockPlanos = ref([
  { id: 1, nome: 'Plano Básico', tipo: 'Prestador', valor: 'R$ 29,90', assinantes: 4500, status: 'ativo' },
  { id: 2, nome: 'Plano Pro', tipo: 'Prestador', valor: 'R$ 49,90', assinantes: 2100, status: 'ativo' },
  { id: 3, nome: 'Plano Premium', tipo: 'Empresa', valor: 'R$ 199,90', assinantes: 850, status: 'ativo' },
])

const mockAssinaturas = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  usuario: `Usuário Assinante ${i + 1}`,
  plano: i % 3 === 0 ? 'Plano Premium' : i % 2 === 0 ? 'Plano Pro' : 'Plano Básico',
  valor: i % 3 === 0 ? 'R$ 199,90' : i % 2 === 0 ? 'R$ 49,90' : 'R$ 29,90',
  status: i % 5 === 0 ? 'cancelada' : i % 4 === 0 ? 'inadimplente' : 'ativa',
  proximaCobranca: `2${i % 9}/05/2026`
})))

const mockAnuncios = ref(Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  titulo: `Anúncio Patrocinado ${i + 1}`,
  anunciante: `Empresa ${Math.floor(i / 2) + 1} Ltda`,
  orcamento: `R$ ${(Math.random() * 500 + 100).toFixed(2).replace('.', ',')}`,
  status: i % 4 === 0 ? 'pausado' : i % 3 === 0 ? 'concluido' : 'ativo',
  cliques: Math.floor(Math.random() * 1000),
  impressoes: Math.floor(Math.random() * 10000)
})))

// Logic
const getDataByTab = () => {
  switch (activeTab.value) {
    case 'cobrancas': return mockTransacoes.value
    case 'assinaturas': return mockAssinaturas.value
    case 'planos': return mockPlanos.value
    case 'anuncios': return mockAnuncios.value
    default: return []
  }
}

const filteredData = computed(() => {
  const data = getDataByTab()
  if (!searchTerm.value) return data
  const term = searchTerm.value.toLowerCase()
  return (data as any[]).filter(item => {
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(term)
    )
  })
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(start, start + itemsPerPage)
})

watch([activeTab, searchTerm], () => {
  currentPage.value = 1
})

onMounted(() => {
  setTimeout(() => isLoading.value = false, 500)
})

const handleViewDetails = (item: any) => {
  selectedItem.value = { ...item, type: activeTab.value }
  isModalOpen.value = true
  logAction(`view_${activeTab.value}_details`, 'financeiro', { itemId: item.id })
}

const handleAction = (action: string, item?: any) => {
  if (!canPerformAction('edit', 'financeiro')) {
    alert('Permissão negada.')
    return
  }
  logAction(`${action}_financeiro`, 'financeiro', item ? { itemId: item.id } : undefined)
  alert(`Operação "${action}" executada.`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Financeiro & Monetização</h1>
        <p class="text-slate-500 font-medium mt-1">Gestão de receitas, assinaturas e campanhas publicitárias.</p>
      </div>
      <div class="flex gap-3">
         <button @click="handleAction('exportar')" class="rounded-2xl bg-white border border-slate-100 px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
           <FileText class="h-4 w-4" />
           Relatório Consolidado
        </button>
      </div>
    </div>

    <!-- Stats Matrix -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-2 scrollbar-hide">
       <div v-for="stat in [
         { label: 'Receita Mês', value: 'R$ 43k', up: true, diff: '12.5%' },
         { label: 'Assinaturas', value: '8.230', up: true, diff: '5.2%' },
         { label: 'Inadimplência', value: '4.2%', up: false, diff: '0.8%', red: true },
         { label: 'Renovações', value: '1.450', neutral: true },
         { label: 'Planos Ativos', value: '3', neutral: true },
         { label: 'Ads Revenue', value: 'R$ 12k', up: true, diff: '18.3%' }
       ]" :key="stat.label" class="min-w-[140px] p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm text-center">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
          <h3 class="text-xl font-black text-slate-900">{{ stat.value }}</h3>
          <p v-if="!stat.neutral" class="text-[10px] font-bold mt-1" :class="stat.red ? 'text-red-500' : 'text-green-500'">
             <component :is="stat.up ? ArrowUpRight : ArrowDownRight" class="inline h-3 w-3 mr-0.5" />
             {{ stat.diff }}
          </p>
       </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <!-- Tabs Nav -->
        <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div class="flex border-b border-slate-50 p-2 overflow-x-auto scrollbar-hide bg-slate-50/30">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white',
                'flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap'
              ]"
            >
              <component :is="tab.icon" class="h-4 w-4" />
              {{ tab.name }}
            </button>
          </div>

          <!-- Controls -->
          <div class="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
             <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  v-model="searchTerm"
                  class="w-full bg-slate-50/50 border-none rounded-xl pl-11 pr-4 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Pesquisar registros financeiros..."
                />
             </div>
             <button class="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                <Filter class="h-4 w-4" />
             </button>
          </div>

          <!-- Table Content -->
          <div class="overflow-x-auto min-h-[400px]">
            <div v-if="isLoading" class="flex flex-col items-center justify-center p-20">
               <div class="h-10 w-10 border-4 border-slate-100 border-t-green-500 animate-spin rounded-full mb-4" />
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compilando Livro Caixa...</p>
            </div>
            
            <AdminEmptyState 
              v-else-if="filteredData.length === 0"
              title="Vazio financeiro"
              :description="`Nenhum registro de '${activeTab}' encontrado para '${searchTerm}'.`"
            />

            <table v-else class="min-w-full divide-y divide-slate-50">
               <thead class="bg-slate-50/30">
                  <tr v-if="activeTab === 'cobrancas'">
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transação</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                    <th class="px-6 py-4"></th>
                  </tr>
                  <tr v-else-if="activeTab === 'assinaturas'">
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinante</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorrência</th>
                    <th class="px-6 py-4"></th>
                  </tr>
                  <tr v-else>
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Informação</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4"></th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-50">
                  <tr v-for="item in paginatedData" :key="item.id" class="group hover:bg-slate-50/50 transition-colors">
                     <!-- COBRANCAS -->
                     <template v-if="activeTab === 'cobrancas'">
                        <td class="py-4 px-6">
                           <div class="flex items-center gap-3">
                              <div :class="[
                                item.tipo === 'entrada' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                                'h-10 w-10 rounded-xl flex items-center justify-center transition-all'
                              ]">
                                 <component :is="item.tipo === 'entrada' ? ArrowUpRight : ArrowDownRight" class="h-4 w-4" />
                              </div>
                              <div>
                                 <p class="text-sm font-black text-slate-900 leading-none mb-1">{{ item.descricao }}</p>
                                 <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{{ item.id.toString().padStart(5, '0') }}</p>
                              </div>
                           </div>
                        </td>
                        <td class="px-6 py-4 text-xs font-bold text-slate-500">{{ item.data }}</td>
                        <td class="px-6 py-4">
                           <span :class="[
                             item.status === 'pago' ? 'bg-green-50 text-green-600 ring-green-600/10' : 
                             item.status === 'pendente' ? 'bg-amber-50 text-amber-600 ring-amber-600/10' : 
                             'bg-slate-50 text-slate-400 ring-slate-400/10',
                             'px-2.5 py-1 rounded-full text-[9px] font-black uppercase ring-1'
                           ]">
                             {{ item.status }}
                           </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                           <p class="text-sm font-black" :class="item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'">
                              {{ item.tipo === 'entrada' ? '+' : '-' }}{{ item.valor }}
                           </p>
                        </td>
                     </template>

                     <!-- ASSINATURAS -->
                     <template v-else-if="activeTab === 'assinaturas'">
                        <td class="py-4 px-6 font-black text-slate-900 text-sm italic underline decoration-slate-100 decoration-2 underline-offset-4">{{ item.usuario }}</td>
                        <td class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{{ item.plano }}</td>
                        <td class="px-6 py-4">
                           <span :class="[
                             item.status === 'ativa' ? 'bg-green-900 text-white' : 
                             item.status === 'inadimplente' ? 'bg-red-500 text-white' : 
                             'bg-slate-200 text-slate-500',
                             'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest'
                           ]">
                             {{ item.status }}
                           </span>
                        </td>
                        <td class="px-6 py-4 text-right text-xs font-black text-slate-900">{{ item.valor }}</td>
                     </template>

                     <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button @click="handleViewDetails(item)" class="p-2 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                              <Eye class="h-4 w-4" />
                           </button>
                           <button @click="handleAction('more', item)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-white shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                              <MoreVertical class="h-4 w-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
          </div>

          <AdminPagination 
            v-if="filteredData.length > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="filteredData.length"
            :items-per-page="itemsPerPage"
            @page-change="currentPage = $event"
          />
        </div>
      </div>

      <!-- Financial Strategy Column -->
      <div class="space-y-8">
        <!-- Revenue Evolution -->
        <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
           <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Receita Estratégica</h3>
           <div class="h-64">
              <ClientOnly>
                <apexchart 
                  height="100%" 
                  width="100%" 
                  :options="chartOptions" 
                  :series="series"
                />
              </ClientOnly>
           </div>
           <div class="mt-8 grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 rounded-2xl text-center">
                 <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Mensal</p>
                 <p class="text-base font-black text-slate-900">R$ 38.4k</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl text-center">
                 <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Crescimento</p>
                 <p class="text-base font-black text-green-600">+14%</p>
              </div>
           </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
           <div class="relative z-10">
              <h4 class="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Gateways & Configs</h4>
              <p class="text-2xl font-black mb-6 leading-tight italic">Otimize suas taxas de conversão hoje.</p>
              <button @click="handleAction('config_gateway')" class="w-full bg-white text-indigo-600 py-3 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 shadow-xl">
                 Portal do Gateway
              </button>
           </div>
           <CreditCard class="absolute -right-10 -bottom-10 h-40 w-40 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
        
        <!-- Smart List -->
        <div class="bg-white rounded-[32px] border border-slate-100 p-8">
           <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Task Financeiras</h4>
           <div class="space-y-4">
              <div v-for="t in [
                { id: 1, text: 'Aprovar estornos pendentes', count: 12 },
                { id: 2, text: 'Revisar planos de prestadores', count: 3 },
                { id: 3, text: 'Relatório DRE Trimestral', count: 0 }
              ]" :key="t.id" class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-50 rounded-2xl hover:border-indigo-100 transition-colors cursor-pointer group">
                 <span class="text-xs font-black text-slate-600 group-hover:text-indigo-600 transition-colors">{{ t.text }}</span>
                 <span v-if="t.count" class="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{{ t.count }}</span>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Details Overlay -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" :title="`Extrato: ${selectedItem?.type}`">
       <div v-if="selectedItem" class="space-y-8">
          <div class="flex items-center gap-6">
             <div :class="[
               selectedItem.tipo === 'entrada' ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-slate-900 text-white shadow-slate-900/20',
               'h-16 w-16 rounded-[22px] flex items-center justify-center shadow-xl'
             ]">
                <component :is="tabs.find(t => t.id === selectedItem.type)?.icon" class="h-8 w-8" />
             </div>
             <div>
                <h4 class="text-xl font-black text-slate-900 leading-tight">{{ selectedItem.descricao || selectedItem.usuario || selectedItem.titulo }}</h4>
                <p class="text-xs font-bold text-slate-400">HASH FINANCEIRO #{{ selectedItem.id }}</p>
             </div>
          </div>

          <div class="grid grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/50 p-8 rounded-[28px] border border-slate-50">
             <div v-for="(val, key) in selectedItem" :key="key">
                <template v-if="!['id', 'type'].includes(String(key))">
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ String(key).replace(/([A-Z])/g, ' $1') }}</p>
                   <p class="text-sm font-black text-slate-900">{{ val }}</p>
                </template>
             </div>
          </div>

          <div class="flex gap-3 justify-end pt-4">
             <button @click="isModalOpen = false" class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all">Descartar</button>
             <button @click="handleAction('confirmar', selectedItem)" class="px-8 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">Efetivar Lançamento</button>
          </div>
       </div>
    </AdminModal>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
