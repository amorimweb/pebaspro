<script setup lang="ts">
import { 
  Search, 
  Filter, 
  Wrench, 
  Star, 
  Award, 
  Eye, 
  Lock, 
  Unlock, 
  Edit, 
  ShieldCheck,
  CheckCircle2
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
const selectedPrestador = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 10

// Mock Data
const mockPrestadores = ref(Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  nome: `Prestador ${i + 1}`,
  email: `prestador${i + 1}@email.com`,
  status: i % 6 === 0 ? 'bloqueado' : i % 4 === 0 ? 'pendente' : 'ativo',
  plano: i % 3 === 0 ? 'Pro' : i % 5 === 0 ? 'Premium' : 'Gratuito',
  avaliacao: i % 4 === 0 ? 0 : (4 + Math.random()).toFixed(1),
  dataCadastro: `1${i % 9}/04/2026`,
  categorias: ['Manutenção', 'Limpeza'].slice(0, (i % 2) + 1)
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredPrestadores = computed(() => {
  return mockPrestadores.value.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredPrestadores.value.length / itemsPerPage))
const paginatedPrestadores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredPrestadores.value.slice(start, start + itemsPerPage)
})

// Watch search to reset page
watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (prestador: any) => {
  selectedPrestador.value = prestador
  isModalOpen.value = true
  logAction('view_prestador_details', 'prestadores', { prestadorId: prestador.id })
}

const handleToggleStatus = (prestador: any) => {
  if (!canPerformAction('edit', 'prestadores')) {
    alert('Você não tem permissão para realizar esta ação.')
    return
  }
  const newStatus = prestador.status === 'bloqueado' ? 'ativo' : 'bloqueado'
  
  const index = mockPrestadores.value.findIndex(p => p.id === prestador.id)
  if (index !== -1) {
    mockPrestadores.value[index].status = newStatus
  }
  
  logAction('toggle_prestador_status', 'prestadores', { prestadorId: prestador.id, newStatus })
  alert(`Status do prestador ${prestador.nome} alterado para ${newStatus}. (Simulação)`)
}

const handleApprove = (prestador: any) => {
  if (!canPerformAction('edit', 'prestadores')) return
  
  const index = mockPrestadores.value.findIndex(p => p.id === prestador.id)
  if (index !== -1) {
    mockPrestadores.value[index].status = 'ativo'
  }
  
  logAction('approve_prestador', 'prestadores', { prestadorId: prestador.id })
  alert(`Prestador ${prestador.nome} aprovado com sucesso. (Simulação)`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestão de Prestadores</h1>
        <p class="text-slate-500 font-medium mt-1">Gerencie os profissionais autônomos e freelancers.</p>
      </div>
      <div v-if="canPerformAction('create', 'prestadores')">
        <button class="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
          Adicionar Novo Prestador
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-4">
      <div v-for="stat in [
        { label: 'Total', value: '24.500', color: 'text-slate-900' },
        { label: 'Assinantes', value: '8.230', color: 'text-blue-600' },
        { label: 'Pendentes', value: '450', color: 'text-amber-600' },
        { label: 'Avaliação Média', value: '4.6', color: 'text-slate-900', icon: Star }
      ]" :key="stat.label" class="p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
         <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
         <div class="flex items-center gap-2">
            <h3 class="text-2xl font-black transition-all" :class="stat.color">{{ stat.value }}</h3>
            <component v-if="stat.icon" :is="stat.icon" class="h-5 w-5 text-amber-400 fill-current" />
         </div>
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
          placeholder="Buscar por nome, email ou CPF/CNPJ..."
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
        <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Carregando Prestadores...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredPrestadores.length === 0"
        title="Nenhum prestador encontrado" 
        :description="`Não encontramos resultados para sua busca: '${searchTerm}'`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Prestador</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Plano</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Avaliação</th>
                <th class="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="prestador in paginatedPrestadores" :key="prestador.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      <Wrench class="h-5 w-5" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-black text-slate-900">{{ prestador.nome }}</div>
                      <div class="text-xs font-medium text-slate-400">{{ prestador.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="prestador.status === 'ativo'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                  <span v-else-if="prestador.status === 'pendente'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20">
                    Pendente
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/10">
                    Bloqueado
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span :class="[prestador.plano !== 'Gratuito' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-slate-50 text-slate-500 ring-slate-200', 'inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-tight ring-1 ring-inset']">
                    <Award v-if="prestador.plano !== 'Gratuito'" class="mr-1 h-3 w-3" />
                    {{ prestador.plano }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-sm font-bold text-slate-600">
                  <div class="flex items-center gap-1">
                    <Star class="h-4 w-4" :class="prestador.avaliacao > 0 ? 'text-amber-400 fill-current' : 'text-slate-200'" />
                    <span :class="prestador.avaliacao > 0 ? 'text-slate-900' : 'text-slate-300 font-medium'">
                       {{ prestador.avaliacao > 0 ? prestador.avaliacao : 'N/A' }}
                    </span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(prestador)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'prestadores')">
                      <button v-if="prestador.status === 'pendente'" @click="handleApprove(prestador)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Aprovar">
                        <ShieldCheck class="h-4 w-4" />
                      </button>
                      <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit class="h-4 w-4" />
                      </button>
                      <button 
                        @click="handleToggleStatus(prestador)" 
                        :class="[prestador.status === 'bloqueado' ? 'hover:text-green-600 hover:bg-green-50' : 'hover:text-red-600 hover:bg-red-50', 'p-2 text-slate-400 rounded-xl transition-all']"
                      >
                        <Unlock v-if="prestador.status === 'bloqueado'" class="h-4 w-4" />
                        <Lock v-else class="h-4 w-4" />
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
          :total-items="filteredPrestadores.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Details Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Ficha do Prestador">
      <div v-if="selectedPrestador" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-orange-100 flex items-center justify-center text-orange-600 text-3xl shadow-lg shadow-orange-100/20">
            <Wrench class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedPrestador.nome }}</h3>
            <p class="text-slate-500 font-bold">{{ selectedPrestador.email }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 px-2">
          <div v-for="info in [
            { label: 'Status da Conta', value: selectedPrestador.status, caps: true },
            { label: 'Plano Atual', value: selectedPrestador.plano, caps: false },
            { label: 'Média de Avaliação', value: selectedPrestador.avaliacao > 0 ? selectedPrestador.avaliacao : 'N/A', caps: false },
            { label: 'Data de Ingresso', value: selectedPrestador.dataCadastro, caps: false }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'uppercase text-green-600': info.caps && info.value === 'ativo' }">
              {{ info.value }}
            </p>
          </div>
          <div class="col-span-2">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categorias Atendidas</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="cat in selectedPrestador.categorias" :key="cat" class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">
                {{ cat }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Fechar
          </button>
          <button v-if="canPerformAction('edit', 'prestadores')" class="rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all">
            Editar Perfil Profissional
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
