<script setup lang="ts">
import { 
  Search, 
  Filter, 
  Building2, 
  Briefcase, 
  Eye, 
  Lock, 
  Unlock, 
  Edit, 
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
const mockEmpresas = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  nome: `Empresa ${i + 1} Ltda`,
  cnpj: `${(10 + i).toString().padStart(2, '0')}.345.678/0001-90`,
  email: `contato@empresa${i + 1}.com.br`,
  status: i % 5 === 0 ? 'bloqueado' : i % 3 === 0 ? 'pendente' : 'ativo',
  vagasAtivas: Math.floor(Math.random() * 15),
  plano: i % 4 === 0 ? 'Premium' : i % 2 === 0 ? 'Pro' : 'Gratuito',
  dataCadastro: `1${i % 9}/01/2026`,
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
    e.cnpj.includes(searchTerm.value) ||
    e.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredEmpresas.value.length / itemsPerPage))
const paginatedEmpresas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEmpresas.value.slice(start, start + itemsPerPage)
})

// Watch search to reset page
watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (empresa: any) => {
  selectedEmpresa.value = empresa
  isModalOpen.value = true
  logAction('view_empresa_details', 'empresas', { empresaId: empresa.id })
}

const handleToggleStatus = (empresa: any) => {
  if (!canPerformAction('edit', 'empresas')) {
    alert('Você não tem permissão para realizar esta ação.')
    return
  }
  const newStatus = empresa.status === 'bloqueado' ? 'ativo' : 'bloqueado'
  
  const index = mockEmpresas.value.findIndex(e => e.id === empresa.id)
  if (index !== -1) {
    mockEmpresas.value[index].status = newStatus
  }
  
  logAction('toggle_empresa_status', 'empresas', { empresaId: empresa.id, newStatus })
  alert(`Status da empresa ${empresa.nome} alterado para ${newStatus}. (Simulação)`)
}

const handleValidate = (empresa: any) => {
  if (!canPerformAction('edit', 'empresas')) return
  
  const index = mockEmpresas.value.findIndex(e => e.id === empresa.id)
  if (index !== -1) {
    mockEmpresas.value[index].status = 'ativo'
  }
  
  logAction('validate_empresa', 'empresas', { empresaId: empresa.id })
  alert(`Cadastro da empresa ${empresa.nome} validado com sucesso. (Simulação)`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestão de Empresas</h1>
        <p class="text-slate-500 font-medium mt-1">Gerencie cadastros, planos e acessos das contratantes.</p>
      </div>
      <div v-if="canPerformAction('create', 'empresas')">
        <button class="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
          Adicionar Nova Empresa
        </button>
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
          placeholder="Buscar por nome, CNPJ ou email..."
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
        <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Carregando Empresas...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredEmpresas.length === 0"
        title="Nenhuma empresa encontrada" 
        :description="`Não encontramos resultados para sua busca: '${searchTerm}'`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Plano</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Vagas Ativas</th>
                <th class="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="empresa in paginatedEmpresas" :key="empresa.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Building2 class="h-5 w-5" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-black text-slate-900">{{ empresa.nome }}</div>
                      <div class="text-xs font-medium text-slate-400">{{ empresa.cnpj }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="empresa.status === 'ativo'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 ring-1 ring-inset ring-green-600/20">
                    Ativo
                  </span>
                  <span v-else-if="empresa.status === 'pendente'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20">
                    Aguardando Validação
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/10">
                    Bloqueado
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-sm font-bold text-slate-600">
                  <span class="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500 ring-1 ring-inset ring-slate-200">
                    {{ empresa.plano }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                   <div class="flex items-center gap-1.5 text-xs font-black text-slate-700">
                      <Briefcase class="h-4 w-4 text-slate-400" />
                      {{ empresa.vagasAtivas }}
                   </div>
                </td>
                <td class="whitespace-nowrap px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(empresa)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'empresas')">
                      <button v-if="empresa.status === 'pendente'" @click="handleValidate(empresa)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Validar Cadastro">
                        <ShieldCheck class="h-4 w-4" />
                      </button>
                      <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit class="h-4 w-4" />
                      </button>
                      <button 
                        @click="handleToggleStatus(empresa)" 
                        :class="[empresa.status === 'bloqueado' ? 'hover:text-green-600 hover:bg-green-50' : 'hover:text-red-600 hover:bg-red-50', 'p-2 text-slate-400 rounded-xl transition-all']"
                      >
                        <Unlock v-if="empresa.status === 'bloqueado'" class="h-4 w-4" />
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
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Ficha Cadastral">
      <div v-if="selectedEmpresa" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-blue-100 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/20">
            <Building2 class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedEmpresa.nome }}</h3>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{{ selectedEmpresa.cnpj }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 px-2">
          <div v-for="info in [
            { label: 'Contato Oficial', value: selectedEmpresa.email, caps: false },
            { label: 'Status do Registro', value: selectedEmpresa.status, caps: true },
            { label: 'Plano Ativo', value: selectedEmpresa.plano, caps: false },
            { label: 'Vagas Publicadas', value: selectedEmpresa.vagasAtivas, caps: false },
            { label: 'Data de Fundação/Cadastro', value: selectedEmpresa.dataCadastro, caps: false }
          ]" :key="info.label" :class="{ 'col-span-2 border-b border-slate-50 pb-4': info.label === 'Contato Oficial' }">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'uppercase text-green-600': info.caps && info.value === 'ativo' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Fechar
          </button>
          <button v-if="canPerformAction('edit', 'empresas')" class="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
            Editar Cadastro
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
