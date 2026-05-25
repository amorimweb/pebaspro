<script setup lang="ts">
import {
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Flag,
  UserX,
  MessageSquare,
  MoreVertical,
  Eye,
  Ban,
  Archive,
  RotateCcw,
  CheckCircle2,
  History
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
type TabType = 'denuncias' | 'avaliacoes' | 'historico'
const tabs: { id: TabType, name: string, icon: any }[] = [
  { id: 'denuncias', name: 'Denúncias', icon: ShieldAlert },
  { id: 'avaliacoes', name: 'Avaliações Sinalizadas', icon: Flag },
  { id: 'historico', name: 'Histórico Disciplinar', icon: History },
]

// UI State
const activeTab = ref<TabType>('denuncias')
const searchTerm = ref('')
const currentPage = ref(1)
const isLoading = ref(true)
const selectedItem = ref<any>(null)
const isModalOpen = ref(false)
const itemsPerPage = 8

// Mock Data
const mockDenuncias = ref(Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  tipo: i % 3 === 0 ? 'Comportamento Inadequado' : i % 2 === 0 ? 'Vaga Falsa' : 'Perfil Falso',
  reportado: `Usuário Reportado ${i}`,
  autor: `Autor ${i}`,
  status: i % 4 === 0 ? 'resolvido' : i % 3 === 0 ? 'pendente' : 'em_analise',
  prioridade: i % 5 === 0 ? 'alta' : i % 2 === 0 ? 'media' : 'baixa',
  data: `1${i % 9}/04/2026`,
  detalhes: 'Detalhes da denúncia simulados aqui para visualização no modal.'
})))

const mockAvaliacoes = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  prestador: `Prestador ${i}`,
  cliente: `Cliente ${i}`,
  nota: (i % 5) + 1,
  comentario: i % 2 === 0 ? 'Comentário suspeito de spam ou ofensa.' : 'Avaliação muito baixa sem justificativa clara.',
  status: i % 3 === 0 ? 'em_analise' : 'sinalizada',
  data: `1${i % 9}/04/2026`
})))

onMounted(() => {
  setTimeout(() => isLoading.value = false, 500)
})

const currentData = computed(() => {
  if (activeTab.value === 'denuncias') {
    return mockDenuncias.value.filter(d => 
      d.reportado.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      d.autor.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      d.id.toString().includes(searchTerm.value)
    )
  }
  return mockAvaliacoes.value.filter(a => 
    a.prestador.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    a.cliente.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(currentData.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return currentData.value.slice(start, start + itemsPerPage)
})

watch([activeTab, searchTerm], () => {
  currentPage.value = 1
})

const handleViewDetails = (item: any) => {
  selectedItem.value = { ...item, type: activeTab.value }
  isModalOpen.value = true
  logAction(`view_${activeTab.value}_details`, 'moderacao', { itemId: item.id })
}

const handleAction = (action: string, item?: any) => {
  if (!canPerformAction('edit', 'moderacao')) {
    alert('Permissão negada.')
    return
  }
  logAction(`${action}_moderacao`, 'moderacao', item ? { itemId: item.id } : undefined)
  alert(`Operação "${action}" executada com sucesso!`)
}

const stats = computed(() => ([
  { label: 'Denúncias Pendentes', value: mockDenuncias.value.filter(d => d.status === 'pendente').length, color: 'text-slate-900' },
  { label: 'Prioridade Máxima', value: mockDenuncias.value.filter(d => d.prioridade === 'alta').length, color: 'text-red-600' },
  { label: 'Review em Análise', value: mockAvaliacoes.value.filter(a => a.status === 'em_analise').length, color: 'text-amber-600' },
  { label: 'Suspensões Efetivas', value: '156', color: 'text-slate-500' }
]))
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Moderação & Confiança</h1>
        <p class="text-slate-500 font-medium mt-1">Garantindo a integridade e segurança do ecossistema PebasPro.</p>
      </div>
    </div>

    <!-- Mod Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
       <div v-for="stat in stats" :key="stat.label" class="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
          <div class="flex items-end justify-between">
             <h3 class="text-3xl font-black" :class="stat.color">{{ stat.value }}</h3>
             <div class="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                <ShieldAlert v-if="stat.red" class="h-4 w-4" />
                <Flag v-else class="h-4 w-4" />
             </div>
          </div>
       </div>
    </div>

    <div class="space-y-6">
      <!-- Tabs Layout -->
      <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div class="flex border-b border-slate-50 p-2 overflow-x-auto scrollbar-hide bg-slate-50/20">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white',
              'flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap'
            ]"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.name }}
          </button>
        </div>

        <!-- Search and Filters -->
        <div v-if="activeTab !== 'historico'" class="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
           <div class="relative flex-1 min-w-[200px] max-w-sm">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                v-model="searchTerm"
                class="w-full bg-slate-50/50 border-none rounded-xl pl-11 pr-4 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 transition-all"
                :placeholder="activeTab === 'denuncias' ? 'ID ou Usuário Reportado...' : 'Prestador ou Cliente...'"
              />
           </div>
           <div class="flex items-center gap-3">
              <select v-if="activeTab === 'denuncias'" class="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-600 focus:ring-2 focus:ring-red-500 outline-none">
                 <option>Todas as Prioridades</option>
                 <option>Alta</option>
                 <option>Média</option>
                 <option>Baixa</option>
              </select>
              <button class="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                 <Filter class="h-4 w-4" />
              </button>
           </div>
        </div>

        <!-- Content Area -->
        <div class="min-h-[400px]">
          <div v-if="isLoading" class="flex flex-col items-center justify-center p-20">
             <div class="h-10 w-10 border-4 border-slate-100 border-t-red-500 animate-spin rounded-full mb-4" />
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escaneando Relatos...</p>
          </div>

          <div v-else-if="activeTab === 'historico'" class="p-20 text-center">
             <div class="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <History class="h-10 w-10" />
             </div>
             <h4 class="text-xl font-black text-slate-900 mb-2 tracking-tight">Histórico de Moderação</h4>
             <p class="text-slate-500 font-medium max-w-sm mx-auto">Busque por um UUID de usuário para extrair o dossiê completo de advertências e infrações.</p>
             <div class="mt-8 max-w-xs mx-auto">
                <input class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-center focus:ring-red-500" placeholder="UUID DO USUÁRIO" />
             </div>
          </div>
          
          <AdminEmptyState 
            v-else-if="currentData.length === 0"
            title="Área Limpa"
            :description="`Nenhum registro de '${activeTab}' pendente para '${searchTerm}'.`"
          />

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-50">
               <thead class="bg-slate-50/30">
                  <tr v-if="activeTab === 'denuncias'">
                    <th class="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ocorrência</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reportado</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Severidade</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th class="px-6 py-4 text-right"></th>
                  </tr>
                  <tr v-else-if="activeTab === 'avaliacoes'">
                    <th class="py-4 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback / Nota</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Prestador</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-6 py-4 text-right"></th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-50">
                  <tr v-for="item in paginatedData" :key="item.id" class="group hover:bg-slate-50/50 transition-colors">
                     <!-- DENUNCIAS ROW -->
                     <template v-if="activeTab === 'denuncias'">
                        <td class="py-5 px-8">
                           <div class="flex items-center gap-4">
                              <div :class="[
                                item.prioridade === 'alta' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600',
                                'h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ring-1 ring-inset ring-black/5'
                              ]">
                                 <ShieldAlert class="h-5 w-5" />
                              </div>
                              <div>
                                 <p class="text-sm font-black text-slate-900 leading-none mb-1 group-hover:underline decoration-red-500/30 underline-offset-4">{{ item.tipo }}</p>
                                 <p class="text-[9px] font-bold text-slate-400 uppercase">TICKET #{{ item.id.toString().padStart(5, '0') }}</p>
                              </div>
                           </div>
                        </td>
                        <td class="px-6 py-5">
                           <span class="text-xs font-black text-slate-900 italic">{{ item.reportado }}</span>
                        </td>
                        <td class="px-6 py-5 text-xs font-bold text-slate-500">{{ item.autor }}</td>
                        <td class="px-6 py-5">
                           <span :class="[
                             item.status === 'resolvido' ? 'bg-green-50 text-green-600 border-green-100' :
                             item.status === 'pendente' ? 'bg-red-50 text-red-600 border-red-100' :
                             'bg-blue-50 text-blue-600 border-blue-100',
                             'px-3 py-1.5 rounded-full text-[8px] font-black uppercase border'
                           ]">
                             {{ item.status }}
                           </span>
                        </td>
                        <td class="px-6 py-5">
                           <div class="flex items-center gap-1.5">
                              <div v-for="i in 3" :key="i" :class="[
                                i <= (item.prioridade === 'alta' ? 3 : item.prioridade === 'media' ? 2 : 1) ?
                                (item.prioridade === 'alta' ? 'bg-red-500' : 'bg-amber-400') : 'bg-slate-100',
                                'h-1.5 w-4 rounded-full'
                              ]" />
                           </div>
                        </td>
                        <td class="px-6 py-5 text-[10px] font-bold text-slate-400">{{ item.data }}</td>
                     </template>

                     <!-- AVALIACOES ROW -->
                     <template v-else-if="activeTab === 'avaliacoes'">
                        <td class="py-5 px-8">
                           <div class="flex items-center gap-3">
                              <div class="flex gap-0.5">
                                 <div v-for="i in 5" :key="i" class="h-2 w-2 rounded-full" :class="i <= item.nota ? 'bg-amber-400' : 'bg-slate-100'" />
                              </div>
                              <p class="text-[11px] font-bold text-slate-500 max-w-[180px] truncate italic">"{{ item.comentario }}"</p>
                           </div>
                        </td>
                        <td class="px-6 py-5 text-xs font-black text-slate-700">{{ item.prestador }}</td>
                        <td class="px-6 py-5 text-xs font-bold text-slate-500">{{ item.cliente }}</td>
                        <td class="px-6 py-5">
                           <span class="px-2 py-1 bg-amber-900 text-white rounded text-[8px] font-black uppercase tracking-tighter shadow-lg shadow-amber-900/10">Sinalizada</span>
                        </td>
                     </template>

                     <td class="px-8 py-5 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button @click="handleViewDetails(item)" class="p-2 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                              <Eye class="h-4 w-4" />
                           </button>
                           <template v-if="canPerformAction('edit', 'moderacao')">
                              <!-- Denuncias actions -->
                              <button v-if="activeTab === 'denuncias'" @click="handleAction('suspender_usuario', item)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all" title="Suspender Usuário">
                                 <Ban class="h-4 w-4" />
                              </button>
                              <button v-if="activeTab === 'denuncias'" @click="handleAction('arquivar_denuncia', item)" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all" title="Arquivar">
                                 <Archive class="h-4 w-4" />
                              </button>
                              <!-- Avaliacoes actions -->
                              <button v-if="activeTab === 'avaliacoes'" @click="handleAction('manter_avaliacao', item)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all" title="Manter Avaliação">
                                 <CheckCircle2 class="h-4 w-4" />
                              </button>
                              <button v-if="activeTab === 'avaliacoes'" @click="handleAction('remover_avaliacao', item)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all" title="Remover Avaliação">
                                 <Ban class="h-4 w-4" />
                              </button>
                           </template>
                           <button class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                              <MoreVertical class="h-4 w-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
          </div>
        </div>

        <AdminPagination 
          v-if="currentData.length > 0 && activeTab !== 'historico'"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="currentData.length"
          :items-per-page="itemsPerPage"
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Mod Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" :title="`Dossiê de Moderação`" size="lg">
       <div v-if="selectedItem" class="space-y-8">
          <div class="flex items-center gap-6 p-6 bg-slate-50 rounded-[28px]">
             <div :class="[
               selectedItem.prioridade === 'alta' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-slate-900 text-white shadow-slate-900/20',
               'h-16 w-16 rounded-[22px] flex items-center justify-center shadow-xl'
             ]">
                <component :is="activeTab === 'denuncias' ? ShieldAlert : Flag" class="h-8 w-8" />
             </div>
             <div>
                <h4 class="text-xl font-black text-slate-900 leading-tight">{{ selectedItem.tipo || 'Avaliação Sinalizada' }}</h4>
                <p class="text-xs font-bold text-slate-400">IDENTIFICADOR DE RISCO #{{ selectedItem.id }}</p>
             </div>
          </div>

          <div class="bg-red-50/30 p-8 rounded-[28px] border border-red-100/30">
             <h5 class="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Relato e Detalhes Contextuais</h5>
             <p class="text-sm font-black text-slate-900 leading-relaxed italic">"{{ selectedItem.detalhes || selectedItem.comentario }}"</p>
          </div>

          <div class="grid grid-cols-2 gap-x-8 gap-y-6 px-4">
             <div v-for="(val, key) in selectedItem" :key="key">
                <template v-if="!['id', 'type', 'detalhes', 'comentario'].includes(String(key))">
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ String(key).replace(/([A-Z])/g, ' $1') }}</p>
                   <p class="text-sm font-black text-slate-900">{{ val }}</p>
                </template>
             </div>
          </div>

          <div class="flex gap-3 justify-end pt-4 border-t border-slate-50">
             <button @click="isModalOpen = false" class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm tracking-tight hover:bg-slate-200 transition-all">Manter Registro</button>
             <button @click="handleAction('suspender', selectedItem)" class="px-8 py-3 rounded-2xl bg-red-600 text-white font-black text-sm shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all">Efetivar Suspensão</button>
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
