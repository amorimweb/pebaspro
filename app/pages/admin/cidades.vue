<script setup lang="ts">
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  MoreVertical, 
  Plus, 
  PlayCircle, 
  PauseCircle, 
  Edit, 
  Users, 
  Briefcase, 
  Eye,
  Globe
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
const selectedItem = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 8

// Mock Data
const mockCidades = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  nome: i % 3 === 0 ? 'Parauapebas' : i % 2 === 0 ? 'Marabá' : 'Canaã dos Carajás',
  uf: i % 5 === 0 ? 'MA' : 'PA',
  status: i % 5 === 0 ? 'inativo' : i % 4 === 0 ? 'pre_lancamento' : 'ativo',
  usuarios: Math.floor(Math.random() * 30000).toLocaleString('pt-BR'),
  vagas: Math.floor(Math.random() * 1000).toLocaleString('pt-BR'),
  dataAtivacao: i % 5 === 0 || i % 4 === 0 ? '-' : `1${i % 9}/04/2026`,
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredCidades = computed(() => {
  return mockCidades.value.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.uf.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredCidades.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCidades.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
  logAction('view_city_expansion', 'cidades', { cityId: item.id })
}

const handleAction = (action: string, item?: any) => {
  if (!canPerformAction('edit', 'cidades')) {
    alert('Acesso negado para gestão regional.')
    return
  }
  logAction(`${action}_cidade`, 'cidades', item ? { cityId: item.id } : undefined)
  alert(`Operação de expansão "${action}" realizada.`)
}

// Stats
const stats = computed(() => ([
  { label: 'Cidades Ativas', value: mockCidades.value.filter(c => c.status === 'ativo').length, color: 'text-green-600', icon: Globe },
  { label: 'Em Lançamento', value: mockCidades.value.filter(c => c.status === 'pre_lancamento').length, color: 'text-amber-600', icon: MapPin },
  { label: 'Usuários (Top Region)', value: '45.7k', color: 'text-slate-900', icon: Users },
  { label: 'Vagas Abertas', value: '1.480', color: 'text-blue-600', icon: Briefcase }
]))
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Expansão & Territórios</h1>
        <p class="text-slate-500 font-medium mt-1">Gestão da capilaridade regional e abertura de novos mercados.</p>
      </div>
      <div class="flex gap-3">
         <button v-if="canPerformAction('create', 'cidades')" @click="handleAction('create')" class="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
           <Plus class="h-4 w-4" />
           Novo Território
        </button>
      </div>
    </div>

    <!-- Expansion Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
       <div v-for="stat in stats" :key="stat.label" class="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
          <div class="flex items-end justify-between">
             <h3 class="text-3xl font-black" :class="stat.color">{{ stat.value }}</h3>
             <div class="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                <component :is="stat.icon" class="h-5 w-5" />
             </div>
          </div>
       </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      <div class="relative w-full max-w-md">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="searchTerm"
          type="text"
          class="block w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-slate-900 transition-all"
          placeholder="Pesquisar cidade ou UF..."
        />
      </div>
      <div class="flex gap-3">
        <select class="rounded-2xl border-slate-100 bg-white py-3 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm cursor-pointer transition-all focus:ring-slate-900">
          <option>Todos os Territórios</option>
          <option>Ativos</option>
          <option>Pré-lançamento</option>
          <option>Inativos</option>
        </select>
      </div>
    </div>

    <!-- Cities Table -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapeando Satélites...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredCidades.length === 0"
        title="Território Inexplorado" 
        :description="`Nenhum mapeamento encontrado para '${searchTerm}'.`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Território / UF</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operação</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Usuários</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Vagas</th>
                <th class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="cidade in paginatedData" :key="cidade.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm ring-1 ring-inset ring-black/5">
                      <MapPin class="h-5 w-5" />
                    </div>
                    <div>
                      <div class="text-sm font-black text-slate-900 tracking-tight">{{ cidade.nome }}</div>
                      <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ cidade.uf }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                   <span :class="[
                     cidade.status === 'ativo' ? 'bg-green-50 text-green-600 ring-green-600/10' : 
                     cidade.status === 'pre_lancamento' ? 'bg-amber-50 text-amber-600 ring-amber-600/10' : 
                     'bg-slate-50 text-slate-400 ring-slate-400/10',
                     'px-3 py-1.5 rounded-full text-[9px] font-black uppercase ring-1'
                   ]">
                     {{ cidade.status === 'ativo' ? 'Em Operação' : (cidade.status === 'pre_lancamento' ? 'Soft Opening' : 'Inativo') }}
                   </span>
                </td>
                <td class="px-6 py-5">
                   <div class="flex items-center gap-2">
                      <Users class="h-3.5 w-3.5 text-slate-300" />
                      <span class="text-xs font-bold text-slate-700 italic underline decoration-slate-100 decoration-4 underline-offset-[-2px]">{{ cidade.usuarios }}</span>
                   </div>
                </td>
                <td class="px-6 py-5">
                   <div class="flex items-center gap-2">
                      <Briefcase class="h-3.5 w-3.5 text-slate-300" />
                      <span class="text-xs font-bold text-slate-500">{{ cidade.vagas }}</span>
                   </div>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(cidade)" class="p-2 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'cidades')">
                      <button @click="handleAction('edit', cidade)" class="p-2 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                        <Settings class="h-4 w-4" />
                      </button>
                      <button v-if="cidade.status === 'ativo'" @click="handleAction('pause', cidade)" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                        <PauseCircle class="h-4 w-4" />
                      </button>
                      <button v-else @click="handleAction('resume', cidade)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                        <PlayCircle class="h-4 w-4" />
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
          :total-items="filteredCidades.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- City Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Dossiê de Mercado">
      <div v-if="selectedItem" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-white flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200/50">
            <Globe class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">{{ selectedItem.nome }}</h3>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">UNIDADE TERRITORIAL: {{ selectedItem.uf }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8 px-2 border-b border-slate-50 pb-8">
          <div v-for="info in [
            { label: 'Status da Operação', value: selectedItem.status, highlight: true },
            { label: 'Data de Homologação', value: selectedItem.dataAtivacao },
            { label: 'Market Share (Est.)', value: selectedItem.usuarios },
            { label: 'Oportunidades Ativas', value: selectedItem.vagas }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'text-green-600 uppercase italic': info.highlight && selectedItem.status === 'ativo' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Retornar
          </button>
          <button v-if="canPerformAction('edit', 'cidades')" class="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
             Audit Regional
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
