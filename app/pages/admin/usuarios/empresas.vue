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
import type { Database } from '~/types/database.types'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { useAdminAudit } from '~/composables/useAdminAudit'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const supabase = useSupabaseClient<Database>()
const { canPerformAction } = useAdminPermissions()
const { logAction } = useAdminAudit()

// UI State
const searchTerm = ref('')
const currentPage = ref(1)
const isLoading = ref(true)
const selectedEmpresa = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 10

// DB State
const empresas = ref<any[]>([])
const totalCount = ref(0)
const statsValues = ref({ total: 0, ativas: 0, pendentes: 0, suspensas: 0 })

const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))

const fetchEmpresas = async () => {
  isLoading.value = true
  let query = supabase
    .from('usuarios')
    .select('id, nome, email, status, regiao, created_at', { count: 'exact' })
    .eq('tipo_conta', 'empresa')
  if (searchTerm.value) {
    query = query.or(`nome.ilike.%${searchTerm.value}%,email.ilike.%${searchTerm.value}%`)
  }
  const from = (currentPage.value - 1) * itemsPerPage
  const { data, count } = await query.order('created_at', { ascending: false }).range(from, from + itemsPerPage - 1)
  empresas.value = data ?? []
  totalCount.value = count ?? 0
  isLoading.value = false
}

const fetchStats = async () => {
  const [
    { count: total },
    { count: ativas },
    { count: pendentes },
    { count: suspensas }
  ] = await Promise.all([
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('tipo_conta', 'empresa'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('tipo_conta', 'empresa').eq('status', 'ativo'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('tipo_conta', 'empresa').eq('status', 'pendente'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('tipo_conta', 'empresa').eq('status', 'suspenso'),
  ])
  statsValues.value = { total: total ?? 0, ativas: ativas ?? 0, pendentes: pendentes ?? 0, suspensas: suspensas ?? 0 }
}

watch(searchTerm, () => {
  currentPage.value = 1
  fetchEmpresas()
})

watch(currentPage, fetchEmpresas)

onMounted(() => {
  fetchStats()
  fetchEmpresas()
})

const handleViewDetails = (empresa: any) => {
  selectedEmpresa.value = empresa
  isModalOpen.value = true
  logAction('view_empresa_details', 'empresas', { empresaId: empresa.id })
}

const handleToggleStatus = async (empresa: any) => {
  if (!canPerformAction('edit', 'empresas')) {
    alert('Você não tem permissão para realizar esta ação.')
    return
  }
  const newStatus = empresa.status === 'suspenso' ? 'ativo' : 'suspenso'
  await supabase.from('usuarios').update({ status: newStatus }).eq('id', empresa.id)
  logAction('toggle_empresa_status', 'empresas', { empresaId: empresa.id, newStatus })
  await Promise.all([fetchStats(), fetchEmpresas()])
}

const handleValidate = async (empresa: any) => {
  if (!canPerformAction('edit', 'empresas')) return
  await supabase.from('usuarios').update({ status: 'ativo' }).eq('id', empresa.id)
  logAction('validate_empresa', 'empresas', { empresaId: empresa.id })
  await Promise.all([fetchStats(), fetchEmpresas()])
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

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <div v-for="stat in [
        { label: 'Total', value: statsValues.total.toLocaleString('pt-BR'), color: 'text-slate-900' },
        { label: 'Ativas', value: statsValues.ativas.toLocaleString('pt-BR'), color: 'text-green-600' },
        { label: 'Pendentes', value: statsValues.pendentes.toLocaleString('pt-BR'), color: 'text-amber-600' },
        { label: 'Suspensas', value: statsValues.suspensas.toLocaleString('pt-BR'), color: 'text-red-600' }
      ]" :key="stat.label" class="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
        <h3 class="text-2xl font-black transition-all" :class="stat.color">{{ stat.value }}</h3>
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
        v-else-if="empresas.length === 0"
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
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Região</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Cadastro</th>
                <th class="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="empresa in empresas" :key="empresa.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Building2 class="h-5 w-5" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-black text-slate-900">{{ empresa.nome }}</div>
                      <div class="text-xs font-medium text-slate-400">{{ empresa.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="empresa.status === 'ativo'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 ring-1 ring-inset ring-green-600/20">
                    Ativa
                  </span>
                  <span v-else-if="empresa.status === 'pendente'" class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20">
                    Aguardando Validação
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/10">
                    Suspensa
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">{{ empresa.regiao ?? '—' }}</td>
                <td class="whitespace-nowrap px-6 py-5 text-xs font-bold text-slate-400">
                  {{ new Date(empresa.created_at).toLocaleDateString('pt-BR') }}
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
                        :class="[empresa.status === 'suspenso' ? 'hover:text-green-600 hover:bg-green-50' : 'hover:text-red-600 hover:bg-red-50', 'p-2 text-slate-400 rounded-xl transition-all']"
                      >
                        <Unlock v-if="empresa.status === 'suspenso'" class="h-4 w-4" />
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
          :total-items="totalCount"
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
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{{ selectedEmpresa.regiao ?? 'Empresa' }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 px-2">
          <div class="col-span-2 border-b border-slate-50 pb-4">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato Oficial</p>
            <p class="text-sm font-black text-slate-900">{{ selectedEmpresa.email }}</p>
          </div>
          <div v-for="info in [
            { label: 'Status do Registro', value: selectedEmpresa.status, caps: true },
            { label: 'Região', value: selectedEmpresa.regiao ?? '—', caps: false },
            { label: 'Data de Cadastro', value: new Date(selectedEmpresa.created_at).toLocaleDateString('pt-BR'), caps: false }
          ]" :key="info.label">
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
