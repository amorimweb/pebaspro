<script setup lang="ts">
import { 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MoreVertical, 
  FileSignature, 
  ArrowRightLeft, 
  Eye, 
  Edit, 
  PauseCircle, 
  PlayCircle, 
  History, 
  Check, 
  X 
} from 'lucide-vue-next'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { useAdminAudit } from '~/composables/useAdminAudit'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const { canPerformAction } = useAdminPermissions()
const { logAction } = useAdminAudit()

// Tabs
type TabType = 'vagas' | 'candidatos' | 'admissoes' | 'documentos' | 'auditoria'
const tabs: { id: TabType, name: string, icon: any }[] = [
  { id: 'vagas', name: 'Gestão de Vagas', icon: Briefcase },
  { id: 'candidatos', name: 'Candidatos', icon: Users },
  { id: 'admissoes', name: 'Admissões / Desligamentos', icon: ArrowRightLeft },
  { id: 'documentos', name: 'Documentos', icon: FileSignature },
  { id: 'auditoria', name: 'Auditoria', icon: History },
]

// UI State
const activeTab = ref<TabType>('vagas')
const searchTerm = ref('')
const currentPage = ref(1)
const isLoading = ref(true)
const selectedItem = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 8

// Mock Data
const mockVagas = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  titulo: `Vaga RH ${i + 1}`,
  empresa: `Empresa ${Math.floor(i / 4) + 1} Ltda`,
  cidade: i % 3 === 0 ? 'Remoto' : i % 2 === 0 ? 'São Paulo, SP' : 'Rio de Janeiro, RJ',
  status: i % 5 === 0 ? 'encerrada' : i % 4 === 0 ? 'pausada' : 'aberta',
  urgencia: i % 6 === 0 ? 'alta' : i % 3 === 0 ? 'media' : 'baixa',
  candidatos: Math.floor(Math.random() * 200),
  dataCriacao: `1${i % 9}/04/2026`
})))

const mockCandidatos = ref(Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  nome: `Candidato ${i + 1}`,
  vaga: `Vaga RH ${Math.floor(i / 3) + 1}`,
  fase: i % 4 === 0 ? 'Triagem' : i % 3 === 0 ? 'Entrevista' : i % 2 === 0 ? 'Proposta' : 'Inscrito',
  score: Math.floor(Math.random() * 40) + 60,
  dataAplicacao: `1${i % 9}/04/2026`
})))

const mockAdmissoes = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nome: `Colaborador ${i + 1}`,
  tipo: i % 3 === 0 ? 'Desligamento' : 'Admissão',
  empresa: `Empresa ${Math.floor(i / 4) + 1} Ltda`,
  status: i % 4 === 0 ? 'concluido' : i % 2 === 0 ? 'pendente' : 'em_andamento',
  dataEfetivacao: `2${i % 9}/04/2026`
})))

const mockDocumentos = ref(Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  usuario: `Usuário ${i + 1}`,
  tipo: i % 3 === 0 ? 'Comprovante de Residência' : i % 2 === 0 ? 'CNH' : 'RG/CPF',
  status: i % 4 === 0 ? 'rejeitado' : i % 2 === 0 ? 'aprovado' : 'pendente',
  dataEnvio: `0${i % 9 + 1}/04/2026`
})))

const mockAuditoria = ref(Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  usuario: `Admin ${Math.floor(i / 5) + 1}`,
  acao: i % 3 === 0 ? 'Aprovação de Documento' : i % 2 === 0 ? 'Alteração de Status de Vaga' : 'Visualização de Perfil',
  detalhes: `Ação realizada no item #${i * 2 + 1}`,
  data: `1${i % 9}/04/2026 14:${(i * 3).toString().padStart(2, '0')}`
})))

// Funnel Chart Config
const funnelChart = {
  series: [{
    name: 'Recrutamento',
    data: [1000, 800, 400, 150, 50]
  }],
  options: {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        isFunnel: true,
      },
    },
    colors: ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'],
    dataLabels: {
      enabled: true,
      formatter: (val, opt) => opt.w.globals.labels[opt.dataPointIndex] + ': ' + val,
      dropShadow: { enabled: true },
    },
    xaxis: {
      categories: ['Inscritos', 'Triagem', 'Entrevista', 'Proposta', 'Contratados'],
    },
    legend: { show: false }
  }
}

// Logic
const getDataByTab = () => {
  switch (activeTab.value) {
    case 'vagas': return mockVagas.value
    case 'candidatos': return mockCandidatos.value
    case 'admissoes': return mockAdmissoes.value
    case 'documentos': return mockDocumentos.value
    case 'auditoria': return mockAuditoria.value
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
  logAction(`view_${activeTab.value}_details`, 'rh', { itemId: item.id })
}

const handleAction = (action: string, item: any) => {
  if (!canPerformAction('edit', 'rh')) {
    alert('Permissão negada.')
    return
  }
  logAction(`${action}_${activeTab.value}`, 'rh', { itemId: item.id })
  alert(`Ação "${action}" realizada com sucesso!`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Painel RH <span class="text-green-500 font-medium">Master</span></h1>
        <p class="text-slate-500 font-medium mt-1">Controle estratégico de contratações e talentos.</p>
      </div>
      <div class="flex gap-3">
        <button class="rounded-2xl bg-white border border-slate-100 px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
           <Filter class="h-4 w-4" />
           Filtros Estratégicos
        </button>
      </div>
    </div>

    <!-- RH Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7 overflow-x-auto pb-2 scrollbar-hide">
      <div v-for="stat in [
        { label: 'Vagas Abertas', value: '145', color: 'text-green-600' },
        { label: 'Pausadas', value: '32', color: 'text-amber-600' },
        { label: 'Encerradas', value: '89', color: 'text-slate-400' },
        { label: 'Inscrições', value: '8.492', color: 'text-purple-600' },
        { label: 'Admissões', value: '124', color: 'text-blue-600' },
        { label: 'Desligados', value: '18', color: 'text-red-600' },
        { label: 'Docs Pendentes', value: '56', color: 'text-orange-600' }
      ]" :key="stat.label" class="min-w-[120px] p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
         <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{{ stat.label }}</p>
         <h3 class="text-xl font-black" :class="stat.color">{{ stat.value }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Management Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Dashboard Tabs -->
        <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div class="flex border-b border-slate-50 p-2 overflow-x-auto scrollbar-hide">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50',
                'flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap'
              ]"
            >
              <component :is="tab.icon" class="h-4 w-4" />
              {{ tab.name }}
            </button>
          </div>

          <!-- Tab Content Controls -->
          <div class="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
             <div class="relative flex-1 max-w-sm">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  v-model="searchTerm"
                  class="w-full bg-slate-50/50 border-none rounded-xl pl-11 pr-4 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Pesquisar registros..."
                />
             </div>
             <button class="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                <MoreVertical class="h-4 w-4" />
             </button>
          </div>

          <!-- Dynamic Table Content -->
          <div class="overflow-x-auto min-h-[400px]">
            <div v-if="isLoading" class="flex flex-col items-center justify-center p-20">
               <div class="h-12 w-12 border-4 border-slate-100 border-t-slate-900 animate-spin rounded-full mb-4" />
               <p class="text-[10px] font-black text-slate-400 uppercase">Processando Dados...</p>
            </div>
            
            <AdminEmptyState 
              v-else-if="filteredData.length === 0"
              title="Nada encontrado"
              :description="`Nenhum registro de '${activeTab}' corresponde aos critérios.`"
            />

            <table v-else class="min-w-full divide-y divide-slate-50">
               <thead class="bg-slate-50/30">
                  <tr v-if="activeTab === 'vagas'">
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaga</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidatos</th>
                    <th class="px-6 py-4 text-right"></th>
                  </tr>
                  <tr v-else-if="activeTab === 'candidatos'">
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidato</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fase</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                    <th class="px-6 py-4 text-right"></th>
                  </tr>
                  <tr v-else-if="activeTab === 'auditoria'">
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Agente</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-right"></th>
                  </tr>
                  <!-- Fallback titles for others -->
                  <tr v-else>
                    <th class="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Info</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-right"></th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-50">
                  <tr v-for="item in paginatedData" :key="item.id" class="group hover:bg-slate-50/50 transition-colors">
                     <!-- VAGAS ROW -->
                     <template v-if="activeTab === 'vagas'">
                        <td class="py-4 px-6">
                           <div class="flex items-center gap-3">
                              <div class="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 transition-all group-hover:bg-purple-600 group-hover:text-white">
                                 <Briefcase class="h-5 w-5" />
                              </div>
                              <div>
                                 <p class="text-sm font-black text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4 group-hover:decoration-purple-500 transition-all">{{ item.titulo }}</p>
                                 <p class="text-[10px] font-bold text-slate-400 uppercase">{{ item.cidade }}</p>
                              </div>
                           </div>
                        </td>
                        <td class="px-6 py-4 text-sm font-bold text-slate-600">{{ item.empresa }}</td>
                        <td class="px-6 py-4">
                           <span :class="[
                             item.status === 'aberta' ? 'bg-green-50 text-green-600 ring-green-600/10' : 
                             item.status === 'pausada' ? 'bg-amber-50 text-amber-600 ring-amber-600/10' : 
                             'bg-slate-50 text-slate-400 ring-slate-400/10',
                             'px-2.5 py-1 rounded-full text-[9px] font-black uppercase ring-1 ring-inset'
                           ]">
                             {{ item.status }}
                           </span>
                        </td>
                        <td class="px-6 py-4">
                           <div class="flex items-center gap-1.5 font-black text-slate-900 text-xs">
                              <Users class="h-4 w-4 text-slate-300" />
                              {{ item.candidatos }}
                           </div>
                        </td>
                     </template>

                     <!-- CANDIDATOS ROW -->
                     <template v-else-if="activeTab === 'candidatos'">
                        <td class="py-4 px-6">
                           <p class="text-sm font-black text-slate-900">{{ item.nome }}</p>
                           <p class="text-[10px] font-bold text-slate-400 uppercase">{{ item.vaga }}</p>
                        </td>
                        <td class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">{{ item.fase }}</td>
                        <td class="px-6 py-4">
                           <div class="w-full max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div :class="['h-full transition-all duration-1000', item.score > 80 ? 'bg-green-500' : 'bg-amber-500']" :style="{ width: item.score + '%' }" />
                           </div>
                           <p class="text-[9px] font-black mt-1 text-slate-400">{{ item.score }}% Match</p>
                        </td>
                     </template>

                     <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button @click="handleViewDetails(item)" class="p-2 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                              <Eye class="h-4 w-4" />
                           </button>
                           <button class="p-2 text-slate-400 hover:text-green-600 hover:bg-white shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100">
                              <MoreVertical class="h-4 w-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
          </div>

          <!-- Pagination -->
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

      <!-- Strategy Column -->
      <div class="space-y-8">
        <!-- Recruitment Funnel -->
        <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
           <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Pipeline de Recrutamento</h3>
           <div class="h-80">
              <ClientOnly>
                <apexchart 
                  height="100%" 
                  width="100%" 
                  :options="funnelChart.options" 
                  :series="funnelChart.series"
                />
              </ClientOnly>
           </div>
           <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase">Conversão Final</span>
              <span class="text-xl font-black text-green-600">5.0%</span>
           </div>
        </div>

        <!-- Action Cards -->
        <div class="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
           <div class="relative z-10">
              <h4 class="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Ações Necessárias</h4>
              <p class="text-2xl font-black mb-6 leading-tight">Você tem <span class="text-amber-400">56 documentos</span> aguardando validação.</p>
              <button @click="activeTab = 'documentos'" class="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-sm hover:bg-green-500 hover:text-white transition-all transform hover:scale-105 active:scale-95">
                 Analisar Docs Agora
              </button>
           </div>
           <!-- Decorative light -->
           <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full group-hover:scale-150 transition-all" />
        </div>
        
        <!-- Quick Reports -->
        <div class="bg-white rounded-[32px] border border-slate-100 p-8">
           <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Relatórios Rápidos</h4>
           <div class="space-y-4">
              <button 
                v-for="rep in ['Relatório Mensal de Contratações', 'Custo por Candidato', 'Performance de Vagas Remotas']" 
                :key="rep"
                class="w-full group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-left"
              >
                 <span class="text-xs font-black text-slate-600 group-hover:text-white">{{ rep }}</span>
                 <ArrowRightLeft class="h-4 w-4 text-slate-300 group-hover:text-green-500" />
              </button>
           </div>
        </div>
      </div>
    </div>

    <!-- Detail Overlay -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" :title="`Detalhamento de ${selectedItem?.type}`">
       <div v-if="selectedItem" class="space-y-8">
          <div class="flex items-center gap-6">
             <div class="h-16 w-16 bg-slate-50 rounded-[22px] flex items-center justify-center text-slate-900 border border-slate-100">
                <component :is="tabs.find(t => t.id === selectedItem.type)?.icon" class="h-8 w-8" />
             </div>
             <div>
                <h4 class="text-xl font-black text-slate-900 leading-tight">{{ selectedItem.titulo || selectedItem.nome || selectedItem.usuario }}</h4>
                <p class="text-xs font-bold text-slate-400">REGISTRO ANALÍTICO #{{ selectedItem.id }}</p>
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

          <div class="flex gap-3 justify-end pt-4 border-t border-slate-100">
             <button @click="isModalOpen = false" class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm tracking-tight hover:bg-slate-200 transition-all">Fechar</button>
             <button @click="handleAction('primary', selectedItem)" class="px-8 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">Ação Especial</button>
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
