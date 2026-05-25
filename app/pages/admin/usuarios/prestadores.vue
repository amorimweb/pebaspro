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
const selectedPrestador = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 10

// DB State
const prestadores = ref<any[]>([])
const totalCount = ref(0)
const statsValues = ref({ total: 0, assinantes: 0, pendentes: 0 })

const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))

const fetchPrestadores = async () => {
  isLoading.value = true
  let query = supabase
    .from('usuarios')
    .select('id, nome, email, status, regiao, habilidades, created_at', { count: 'exact' })
    .eq('modo_prestador', true)
  if (searchTerm.value) {
    query = query.or(`nome.ilike.%${searchTerm.value}%,email.ilike.%${searchTerm.value}%`)
  }
  const from = (currentPage.value - 1) * itemsPerPage
  const { data, count } = await query.order('created_at', { ascending: false }).range(from, from + itemsPerPage - 1)
  prestadores.value = data ?? []
  totalCount.value = count ?? 0
  isLoading.value = false
}

const fetchStats = async () => {
  const [
    { count: total },
    { count: pendentes }
  ] = await Promise.all([
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('modo_prestador', true),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('modo_prestador', true).eq('status', 'pendente'),
  ])
  statsValues.value = { total: total ?? 0, assinantes: 0, pendentes: pendentes ?? 0 }
}

watch(searchTerm, () => {
  currentPage.value = 1
  fetchPrestadores()
})

watch(currentPage, fetchPrestadores)

onMounted(() => {
  fetchStats()
  fetchPrestadores()
})

const handleViewDetails = (prestador: any) => {
  selectedPrestador.value = prestador
  isModalOpen.value = true
  logAction('view_prestador_details', 'prestadores', { prestadorId: prestador.id })
}

const handleToggleStatus = async (prestador: any) => {
  if (!canPerformAction('edit', 'prestadores')) {
    alert('Você não tem permissão para realizar esta ação.')
    return
  }
  const newStatus = prestador.status === 'suspenso' ? 'ativo' : 'suspenso'
  await supabase.from('usuarios').update({ status: newStatus }).eq('id', prestador.id)
  logAction('toggle_prestador_status', 'prestadores', { prestadorId: prestador.id, newStatus })
  await Promise.all([fetchStats(), fetchPrestadores()])
}

const handleApprove = async (prestador: any) => {
  if (!canPerformAction('edit', 'prestadores')) return
  await supabase.from('usuarios').update({ status: 'ativo' }).eq('id', prestador.id)
  logAction('approve_prestador', 'prestadores', { prestadorId: prestador.id })
  await Promise.all([fetchStats(), fetchPrestadores()])
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
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div v-for="stat in [
        { label: 'Total', value: statsValues.total.toLocaleString('pt-BR'), color: 'text-slate-900' },
        { label: 'Ativos', value: (statsValues.total - statsValues.pendentes).toLocaleString('pt-BR'), color: 'text-green-600' },
        { label: 'Pendentes', value: statsValues.pendentes.toLocaleString('pt-BR'), color: 'text-amber-600' }
      ]" :key="stat.label" class="p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
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
        v-else-if="prestadores.length === 0"
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
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Habilidades</th>
                <th class="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Região</th>
                <th class="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="prestador in prestadores" :key="prestador.id" class="group hover:bg-slate-50/50 transition-colors">
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
                    Suspenso
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="prestador.habilidades?.length > 0" class="inline-flex items-center rounded-lg bg-purple-50 px-2 py-1 text-[9px] font-black uppercase tracking-tight text-purple-700 ring-1 ring-inset ring-purple-600/20">
                    <Award class="mr-1 h-3 w-3" />
                    {{ prestador.habilidades.length }} área(s)
                  </span>
                  <span v-else class="inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-tight text-slate-500 ring-1 ring-inset ring-slate-200">
                    Sem habilidades
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">{{ prestador.regiao ?? '—' }}</td>
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
                        :class="[prestador.status === 'suspenso' ? 'hover:text-green-600 hover:bg-green-50' : 'hover:text-red-600 hover:bg-red-50', 'p-2 text-slate-400 rounded-xl transition-all']"
                      >
                        <Unlock v-if="prestador.status === 'suspenso'" class="h-4 w-4" />
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
            { label: 'Região', value: selectedPrestador.regiao ?? '—', caps: false },
            { label: 'Data de Ingresso', value: new Date(selectedPrestador.created_at).toLocaleDateString('pt-BR'), caps: false }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'uppercase text-green-600': info.caps && info.value === 'ativo' }">
              {{ info.value }}
            </p>
          </div>
          <div class="col-span-2" v-if="selectedPrestador.habilidades?.length > 0">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Habilidades</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="hab in selectedPrestador.habilidades" :key="hab" class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">
                {{ hab }}
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
