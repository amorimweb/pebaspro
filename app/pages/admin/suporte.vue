<script setup lang="ts">
import { 
  Search, 
  Filter, 
  Headset, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  MessageSquare, 
  UserPlus, 
  CornerUpRight, 
  Archive, 
  Eye,
  Activity
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
const mockChamados = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  assunto: i % 3 === 0 ? 'Dificuldade no Acesso Supabase' : i % 2 === 0 ? 'Erro no Pagamento PIX' : 'Dúvida sobre Planos Empresas',
  usuario: `Usuário ${Math.floor(i / 3) + 1}`,
  categoria: i % 3 === 0 ? 'Financeiro' : i % 2 === 0 ? 'Técnico' : 'Dúvida',
  status: i % 5 === 0 ? 'resolvido' : i % 4 === 0 ? 'em_andamento' : 'aberto',
  prioridade: i % 6 === 0 ? 'alta' : i % 3 === 0 ? 'media' : 'baixa',
  data: `1${i % 9}/04/2026 10:30`
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredChamados = computed(() => {
  return mockChamados.value.filter(c => 
    c.assunto.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.usuario.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.id.toString().includes(searchTerm.value)
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredChamados.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredChamados.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
  logAction('view_support_ticket', 'suporte', { ticketId: item.id })
}

const handleAction = (action: string, item?: any) => {
  if (!canPerformAction('edit', 'suporte')) {
    alert('Permissão administrativa insuficiente.')
    return
  }
  logAction(`${action}_suporte`, 'suporte', item ? { ticketId: item.id } : undefined)
  alert(`Operação "${action}" processada com sucesso.`)
}

// Stats
const stats = computed(() => ([
  { label: 'Chamados Abertos', value: '124', icon: Headset, color: 'text-slate-900' },
  { label: 'SLA Resposta', value: '2h 15m', icon: Clock, color: 'text-green-600' },
  { label: 'Tickets Atrasados', value: '8', icon: AlertCircle, color: 'text-red-600' },
  { label: 'Resolvidos Hoje', value: '45', icon: CheckCircle2, color: 'text-blue-600' }
]))
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Suporte & CX</h1>
        <p class="text-slate-500 font-medium mt-1">Central de atendimento ao cliente e monitoramento de SLA.</p>
      </div>
      <div class="flex gap-3">
         <button @click="handleAction('new_broadcast')" class="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
           <Activity class="h-4 w-4" />
           Novo Broadcast
        </button>
      </div>
    </div>

    <!-- Stats Matrix -->
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
          class="block w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500 transition-all"
          placeholder="Buscar por ID, assunto ou usuário..."
        />
      </div>
      <div class="flex gap-3">
        <select class="rounded-2xl border-slate-100 bg-white py-3 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm cursor-pointer transition-all focus:ring-indigo-500">
          <option>Fluxo Inbound</option>
          <option>Crítico</option>
          <option>Em Espera</option>
          <option>Arquivados</option>
        </select>
      </div>
    </div>

    <!-- Tickets Table -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Desk...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredChamados.length === 0"
        title="Nenhum ticket pendente" 
        :description="`Zero ocorrências encontradas para '${searchTerm}'.`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ocorrência / Hash</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Requerente</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado CX</th>
                <th class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="ticket in paginatedData" :key="ticket.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center gap-4">
                    <div :class="[
                      ticket.prioridade === 'alta' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600',
                      'h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white'
                    ]">
                      <MessageSquare class="h-5 w-5" />
                    </div>
                    <div>
                      <div class="text-sm font-black text-slate-900 tracking-tight">{{ ticket.assunto }}</div>
                      <div class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">REF #{{ ticket.id.toString().padStart(6, '0') }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                   <div class="flex flex-col">
                      <span class="text-xs font-black text-slate-900">{{ ticket.usuario }}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ ticket.categoria }}</span>
                   </div>
                </td>
                <td class="px-6 py-5 text-xs font-bold text-slate-500 italic">
                  {{ ticket.data }}
                </td>
                <td class="px-6 py-5">
                   <div class="flex items-center gap-3">
                      <div class="h-1.5 w-8 rounded-full bg-slate-100 overflow-hidden">
                         <div :class="[
                           ticket.status === 'resolvido' ? 'bg-green-500 w-full' : 
                           ticket.status === 'em_andamento' ? 'bg-amber-400 w-2/3' : 
                           'bg-blue-400 w-1/3',
                           'h-full transition-all'
                         ]" />
                      </div>
                      <span :class="[
                        ticket.status === 'resolvido' ? 'text-green-600' : 
                        ticket.status === 'em_andamento' ? 'text-amber-600' : 
                        'text-blue-600',
                        'text-[9px] font-black uppercase tracking-widest'
                      ]">
                        {{ ticket.status }}
                      </span>
                   </div>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(ticket)" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'suporte')">
                      <button @click="handleAction('responder', ticket)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                        <MessageSquare class="h-4 w-4" />
                      </button>
                      <button v-if="ticket.status === 'aberto'" @click="handleAction('take', ticket)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <UserPlus class="h-4 w-4" />
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
          :total-items="filteredChamados.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Ticket Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Dossiê de Atendimento">
      <div v-if="selectedItem" class="space-y-8">
        <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
          <div class="h-20 w-20 rounded-[24px] bg-white flex items-center justify-center text-indigo-600 shadow-xl shadow-slate-200/50">
            <Headset class="h-10 w-10" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">{{ selectedItem.assunto }}</h3>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">HASH OPERACIONAL: #{{ selectedItem.id }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8 px-2">
          <div v-for="info in [
            { label: 'Requerente / Perfil', value: selectedItem.usuario },
            { label: 'Departamento / Fila', value: selectedItem.categoria },
            { label: 'Timeline de Abertura', value: selectedItem.data },
            { label: 'Severidade do Incidente', value: selectedItem.prioridade, highlight: true }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'text-red-600 uppercase italic': info.highlight && selectedItem.prioridade === 'alta' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
           <h5 class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Transcrições e Anotações Internas</h5>
           <p class="text-sm font-medium text-slate-600 leading-relaxed italic">"O usuário relata instabilidade rítmica ao tentar processar o checkout via PIX. Suspeita-se de delay na propagação de webhooks do gateway financeiro."</p>
        </div>

        <div class="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Arquivar Visualização
          </button>
          <button v-if="canPerformAction('edit', 'suporte') && selectedItem.status !== 'resolvido'" class="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
             Intervir e Responder
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
