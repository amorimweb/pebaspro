<script setup lang="ts">
import { 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Eye, 
  Play, 
  Pause, 
  Star 
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
const searchTerm = ref('')
const currentPage = ref(1)
const isLoading = ref(true)
const selectedVaga = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 8

// Mock Data
const mockVagas = ref(Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  titulo: `Vaga de Teste ${i + 1}`,
  empresa: `Empresa ${Math.floor(i / 3) + 1} Ltda`,
  local: i % 3 === 0 ? 'Remoto' : i % 2 === 0 ? 'São Paulo, SP' : 'Híbrido',
  status: i % 5 === 0 ? 'encerrada' : i % 4 === 0 ? 'pausada' : 'aberta',
  tipo: i % 3 === 0 ? 'PJ' : 'CLT',
  candidatos: Math.floor(Math.random() * 150),
  dataCriacao: `1${i % 9}/04/2026`,
  destaque: i % 7 === 0
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredVagas = computed(() => {
  return mockVagas.value.filter(v => 
    v.titulo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    v.empresa.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    v.local.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredVagas.value.length / itemsPerPage))
const paginatedVagas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredVagas.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (vaga: any) => {
  selectedVaga.value = vaga
  isModalOpen.value = true
  logAction('view_vaga_details', 'vagas', { vagaId: vaga.id })
}

const handleToggleStatus = (vaga: any, newStatus: any) => {
  if (!canPerformAction('edit', 'vagas')) {
    alert('Permissão negada.')
    return
  }
  
  const index = mockVagas.value.findIndex(v => v.id === vaga.id)
  if (index !== -1) {
    mockVagas.value[index].status = newStatus
  }
  
  logAction('change_vaga_status', 'vagas', { vagaId: vaga.id, newStatus })
  alert(`Status da vaga "${vaga.titulo}" alterado para ${newStatus}.`)
}

const handleToggleDestaque = (vaga: any) => {
  if (!canPerformAction('edit', 'vagas')) return
  
  const index = mockVagas.value.findIndex(v => v.id === vaga.id)
  if (index !== -1) {
    mockVagas.value[index].destaque = !mockVagas.value[index].destaque
  }
  
  logAction('toggle_vaga_destaque', 'vagas', { vagaId: vaga.id, destaque: !vaga.destaque })
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestão de Vagas</h1>
        <p class="text-slate-500 font-medium mt-1">Modere as oportunidades publicadas no PebasPro.</p>
      </div>
      <div v-if="canPerformAction('create', 'vagas')">
        <button class="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
          Publicar Vaga Institucional
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
       <div v-for="stat in [
         { label: 'Total Registrado', value: '3.456', color: 'text-slate-900' },
         { label: 'Oportunidades Ativas', value: '1.245', color: 'text-green-600' },
         { label: 'Destaques Premium', value: '342', color: 'text-purple-600' },
         { label: 'Candidaturas Mês', value: '18.492', color: 'text-blue-600' }
       ]" :key="stat.label" class="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
          <h3 class="text-2xl font-black" :class="stat.color">{{ stat.value }}</h3>
       </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      <div class="relative w-full max-w-md">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="searchTerm"
          type="text"
          class="block w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-green-500 focus:border-green-500 transition-all"
          placeholder="Filtrar por título, empresa ou local..."
        />
      </div>
      <button class="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
        <Filter class="h-4 w-4" />
        Filtros Avançados
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Acessando Banco de Vagas...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredVagas.length === 0"
        title="Nenhuma vaga localizada" 
        :description="`Não encontramos resultados ativos para '${searchTerm}'`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Oportunidade</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscritos</th>
                <th class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Gerenciar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="vaga in paginatedVagas" :key="vaga.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Briefcase class="h-5 w-5" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-black text-slate-900 flex items-center gap-2">
                        {{ vaga.titulo }}
                        <Star v-if="vaga.destaque" class="h-3 w-3 text-amber-400 fill-current" />
                      </div>
                      <div class="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 mt-0.5">
                        <span class="flex items-center gap-1"><MapPin class="h-3 w-3" /> {{ vaga.local }}</span>
                        <span>&bull;</span>
                        <span>{{ vaga.tipo }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-xs font-bold text-slate-600">
                  <div class="flex items-center gap-2">
                     <Building2 class="h-4 w-4 text-slate-300" />
                     {{ vaga.empresa }}
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="vaga.status === 'aberta'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-600 ring-1 ring-inset ring-green-600/20">
                    <CheckCircle2 class="h-3.5 w-3.5" /> Ativa
                  </span>
                  <span v-else-if="vaga.status === 'pausada'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20">
                    <Clock class="h-3.5 w-3.5" /> Pausada
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200">
                    <XCircle class="h-3.5 w-3.5" /> Encerrada
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-xs font-black text-slate-900">
                  {{ vaga.candidatos }}
                </td>
                <td class="whitespace-nowrap px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(vaga)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'vagas')">
                      <button @click="handleToggleDestaque(vaga)" class="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" :title="vaga.destaque ? 'Remover Destaque' : 'Destacar'">
                        <Star class="h-4 w-4" :class="{ 'fill-current text-amber-400': vaga.destaque }" />
                      </button>
                      <button v-if="vaga.status === 'aberta'" @click="handleToggleStatus(vaga, 'pausada')" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                        <Pause class="h-4 w-4" />
                      </button>
                      <button v-if="vaga.status === 'pausada'" @click="handleToggleStatus(vaga, 'aberta')" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                        <Play class="h-4 w-4" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <AdminPagination 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          :total-items="filteredVagas.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Details Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Detalhamento da Oportunidade">
      <div v-if="selectedVaga" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <Briefcase class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedVaga.titulo }}</h3>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{{ selectedVaga.empresa }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8 px-2">
          <div v-for="info in [
            { label: 'Status Estratégico', value: selectedVaga.status, caps: true },
            { label: 'Local de Atuação', value: selectedVaga.local, caps: false },
            { label: 'Modelo de Contrato', value: selectedVaga.tipo, caps: false },
            { label: 'Volume de Candidatos', value: selectedVaga.candidatos, caps: false },
            { label: 'Data de Publicação', value: selectedVaga.dataCriacao, caps: false }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'uppercase text-green-600': info.caps && info.value === 'aberta' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Fechar
          </button>
          <button v-if="canPerformAction('edit', 'vagas')" class="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
             Editar Oportunidade
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
