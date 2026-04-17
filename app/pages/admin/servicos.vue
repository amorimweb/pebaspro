<script setup lang="ts">
import { 
  Search, 
  Filter, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MoreVertical, 
  UserCircle, 
  Eye, 
  MessageSquare, 
  Ban, 
  CalendarDays 
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
const mockServicos = ref(Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  titulo: i % 3 === 0 ? 'Manutenção Elétrica' : i % 2 === 0 ? 'Limpeza Pós-Obra' : 'Instalação Hidráulica',
  prestador: `Prestador ${i}`,
  cliente: `Cliente ${i}`,
  status: i % 5 === 0 ? 'disputa' : i % 4 === 0 ? 'concluido' : i % 3 === 0 ? 'em_andamento' : 'agendado',
  valor: `R$ ${(Math.random() * 800 + 100).toFixed(2).replace('.', ',')}`,
  data: `1${i % 9}/04/2026`,
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredServicos = computed(() => {
  return mockServicos.value.filter(s => 
    s.titulo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    s.prestador.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    s.cliente.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    s.id.toString().includes(searchTerm.value)
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredServicos.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredServicos.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
  logAction('view_service_details', 'servicos', { serviceId: item.id })
}

const handleAction = (action: string, item?: any) => {
  if (!canPerformAction('edit', 'servicos')) {
    alert('Você não tem permissão para realizar esta ação.')
    return
  }
  logAction(`action_${action}_servico`, 'servicos', item ? { serviceId: item.id } : undefined)
  alert(`Ação "${action}" realizada com sucesso!`)
}

// Stats computed
const stats = computed(() => ([
  { label: 'Em Andamento', value: mockServicos.value.filter(s => s.status === 'em_andamento').length, color: 'text-amber-600' },
  { label: 'Próximos 7 dias', value: mockServicos.value.filter(s => s.status === 'agendado').length, color: 'text-blue-600' },
  { label: 'Concluídos Mês', value: mockServicos.value.filter(s => s.status === 'concluido').length, color: 'text-green-600' },
  { label: 'Em Disputa', value: mockServicos.value.filter(s => s.status === 'disputa').length, color: 'text-red-600' }
]))
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Serviços & Agenda</h1>
        <p class="text-slate-500 font-medium mt-1">Supervisão de fluxos operacionais e mediação de conflitos.</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
       <div v-for="stat in stats" :key="stat.label" class="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
          <div class="flex items-end justify-between">
            <h3 class="text-3xl font-black" :class="stat.color">{{ stat.value }}</h3>
            <div class="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
               <component :is="stat.label === 'Em Disputa' ? AlertTriangle : Clock" class="h-4 w-4 text-slate-300" />
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
          class="block w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-green-500 focus:border-green-500 transition-all"
          placeholder="Filtrar por ID, título, prestador ou cliente..."
        />
      </div>
      <div class="flex gap-3">
        <select class="rounded-2xl border-slate-100 bg-white py-3 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm cursor-pointer transition-all focus:ring-green-500">
          <option>Fluxo Completo</option>
          <option>Agendado</option>
          <option>Em Andamento</option>
          <option>Concluído</option>
          <option>Em Disputa</option>
        </select>
        <button class="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
          <Filter class="h-4 w-4" />
          Filtros
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Mapeando Agenda Global...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredServicos.length === 0"
        title="Nenhum ciclo operacional encontrado" 
        :description="`Refine sua busca para '${searchTerm}' ou altere os filtros de status.`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço / ID</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholders</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Atual</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Brut.</th>
                <th class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="servico in paginatedData" :key="servico.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <CalendarCheck class="h-5 w-5" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-black text-slate-900 tracking-tight">{{ servico.titulo }}</div>
                      <div class="text-[9px] font-black text-slate-400 uppercase">Track ID #{{ servico.id.toString().padStart(5, '0') }}</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                   <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                         <div class="h-1.5 w-1.5 rounded-full bg-blue-500" />
                         P: {{ servico.prestador }}
                      </div>
                      <div class="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                         <div class="h-1.5 w-1.5 rounded-full bg-slate-300" />
                         C: {{ servico.cliente }}
                      </div>
                   </div>
                </td>
                <td class="whitespace-nowrap px-6 py-5">
                  <span v-if="servico.status === 'concluido'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-green-50 text-green-600 ring-1 ring-green-600/10">
                    <CheckCircle2 class="h-3.5 w-3.5" /> Concluído
                  </span>
                  <span v-else-if="servico.status === 'agendado'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 ring-1 ring-blue-600/10">
                    <Clock class="h-3.5 w-3.5" /> Agendado
                  </span>
                  <span v-else-if="servico.status === 'em_andamento'" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-600 ring-1 ring-amber-600/10">
                    <Clock class="h-3.5 w-3.5" /> Executando
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-600 ring-1 ring-red-600/10">
                    <AlertTriangle class="h-3.5 w-3.5" /> Em Disputa
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-5 text-sm font-black text-slate-900 italic">
                  {{ servico.valor }}
                </td>
                <td class="whitespace-nowrap px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(servico)" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'servicos')">
                      <button v-if="servico.status === 'disputa'" @click="handleAction('mediar', servico)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Mediar Conflito">
                        <MessageSquare class="h-4 w-4" />
                      </button>
                      <button v-if="servico.status === 'agendado'" @click="handleAction('cancelar', servico)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Cancelar">
                        <Ban class="h-4 w-4" />
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
          :total-items="filteredServicos.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Details Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Ciclo Operacional Detalhado">
      <div v-if="selectedItem" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-white flex items-center justify-center text-indigo-600 shadow-xl shadow-slate-200/50">
            <CalendarCheck class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedItem.titulo }}</h3>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Identificador Logístico: #{{ selectedItem.id }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8 px-2">
          <div v-for="info in [
            { label: 'Prestador de Serviço', value: selectedItem.prestador },
            { label: 'Contratante / Cliente', value: selectedItem.cliente },
            { label: 'Status Operacional', value: selectedItem.status, color: true },
            { label: 'Valor da Transação', value: selectedItem.valor },
            { label: 'Data do Evento', value: selectedItem.data }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'text-red-600 uppercase': info.color && selectedItem.status === 'disputa' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Voltar
          </button>
          <button v-if="canPerformAction('edit', 'servicos') && selectedItem.status === 'disputa'" class="rounded-2xl bg-red-600 px-8 py-3 text-sm font-black text-white shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all">
             Intervir em Disputa
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
