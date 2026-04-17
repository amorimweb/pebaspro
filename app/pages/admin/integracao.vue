<script setup lang="ts">
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  ArrowRightLeft, 
  ShieldAlert, 
  Eye, 
  Lock, 
  Unlock, 
  ShieldCheck 
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
const selectedEmpresa = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 10

// Mock Data
const mockEmpresas = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nome: `Empresa ${i + 1} Ltda`,
  cnpj: `${(10 + i).toString().padStart(2, '0')}.345.678/0001-90`,
  status: i % 4 === 0 ? 'inativo' : i % 5 === 0 ? 'pendente' : 'ativo',
  dataAtivacao: i % 4 === 0 || i % 5 === 0 ? '-' : `1${i % 9}/04/2026`,
  categoria: ['TI e Programação', 'Construção Civil', 'Marketing', 'Transportes'][i % 4]
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredEmpresas = computed(() => {
  return mockEmpresas.value.filter(e => 
    e.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    e.cnpj.includes(searchTerm.value)
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredEmpresas.value.length / itemsPerPage))
const paginatedEmpresas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEmpresas.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (empresa: any) => {
  selectedEmpresa.value = empresa
  isModalOpen.value = true
  logAction('view_integracao_details', 'integracao', { empresaId: empresa.id })
}

const handleToggleAccess = (empresa: any) => {
  if (!canPerformAction('edit', 'integracao')) {
    alert('Você não tem permissão para realizar esta ação.')
    return
  }
  const newStatus = empresa.status === 'ativo' ? 'inativo' : 'ativo'
  
  const index = mockEmpresas.value.findIndex(e => e.id === empresa.id)
  if (index !== -1) {
    mockEmpresas.value[index].status = newStatus
  }
  
  logAction('toggle_integracao_access', 'integracao', { empresaId: empresa.id, newStatus })
  alert(`Acesso da empresa ${empresa.nome} alterado para ${newStatus}. (Simulação)`)
}

const handleApprove = (empresa: any) => {
  if (!canPerformAction('edit', 'integracao')) return
  
  const index = mockEmpresas.value.findIndex(e => e.id === empresa.id)
  if (index !== -1) {
    mockEmpresas.value[index].status = 'ativo'
  }
  
  logAction('approve_integracao', 'integracao', { empresaId: empresa.id })
  alert(`Integração da empresa ${empresa.nome} aprovada com sucesso. (Simulação)`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Integração Empresa > Prestador</h1>
        <p class="text-slate-500 font-medium mt-1">Controle de acesso cruzado entre contratantes e prestadores.</p>
      </div>
    </div>

    <!-- Strategy Banner -->
    <div class="rounded-[32px] bg-blue-600 p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
      <div class="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div class="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
          <ArrowRightLeft class="h-8 w-8 text-white" />
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-black mb-1">Como funciona esta integração?</h3>
          <p class="text-blue-100 text-sm font-medium leading-relaxed max-w-2xl">
            A empresa não ganha um painel novo. Ela utiliza a mesma conta e acessa o ambiente de Prestador via integração. O controle abaixo define quem pode chavear entre esses perfis.
          </p>
        </div>
      </div>
      <!-- Decorative circle -->
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transition-transform group-hover:scale-125" />
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      <div class="relative w-full max-w-md">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="searchTerm"
          type="text"
          class="block w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-green-500 focus:border-green-500 transition-all"
          placeholder="Buscar empresa por nome ou CNPJ..."
        />
      </div>
      <div class="flex gap-3">
        <select class="rounded-2xl border-slate-100 bg-white py-3 pl-4 pr-10 text-sm font-bold text-slate-700 focus:ring-green-500 shadow-sm transition-all cursor-pointer">
          <option>Todos os Status</option>
          <option>Ativos</option>
          <option>Inativos</option>
          <option>Pendentes</option>
        </select>
        <button class="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
          <Filter class="h-4 w-4" />
          Refinar
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Carregando Integrações...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredEmpresas.length === 0"
        title="Nenhuma integração encontrada" 
        :description="`Não existem solicitações ou ativações para '${searchTerm}'`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de Acesso</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativação</th>
                <th class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="empresa in paginatedEmpresas" :key="empresa.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Building2 class="h-5 w-5" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-black text-slate-900">{{ empresa.nome }}</div>
                      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ empresa.cnpj }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-xs font-bold text-slate-600">
                  {{ empresa.categoria }}
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="empresa.status === 'ativo'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-600 ring-1 ring-inset ring-green-600/20">
                    <CheckCircle2 class="h-3.5 w-3.5" /> Acesso Liberado
                  </span>
                  <span v-else-if="empresa.status === 'pendente'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20">
                    <ShieldAlert class="h-3.5 w-3.5" /> Aguardando Análise
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200">
                    <XCircle class="h-3.5 w-3.5" /> Sem Acesso
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-sm font-black text-slate-900">
                  {{ empresa.dataAtivacao }}
                </td>
                <td class="whitespace-nowrap px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(empresa)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'integracao')">
                      <button v-if="empresa.status === 'pendente'" @click="handleApprove(empresa)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Aprovar">
                        <ShieldCheck class="h-4 w-4" />
                      </button>
                      <button 
                        @click="handleToggleAccess(empresa)" 
                        :class="[empresa.status === 'inativo' ? 'hover:text-green-600 hover:bg-green-50' : 'hover:text-red-600 hover:bg-red-50', 'p-2 text-slate-400 rounded-xl transition-all']"
                      >
                        <Unlock v-if="empresa.status === 'inativo'" class="h-4 w-4" />
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
          :total-items="filteredEmpresas.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Details Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Análise de Integração">
      <div v-if="selectedEmpresa" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-white flex items-center justify-center text-blue-600 shadow-xl shadow-slate-200/50">
            <Building2 class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedEmpresa.nome }}</h3>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{{ selectedEmpresa.cnpj }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8 px-2">
          <div v-for="info in [
            { label: 'Status Atual', value: selectedEmpresa.status, caps: true },
            { label: 'Segmento Estratégico', value: selectedEmpresa.categoria, caps: false },
            { label: 'Data de Ativação', value: selectedEmpresa.dataAtivacao, caps: false },
            { label: 'ID da Conexão', value: `#${selectedEmpresa.id.toString().padStart(5, '0')}`, caps: false }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'uppercase text-green-600': info.caps && info.value === 'ativo' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Voltar
          </button>
          <button v-if="canPerformAction('edit', 'integracao')" class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
             Configurar Parâmetros
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
