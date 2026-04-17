<script setup lang="ts">
import { 
  Search, 
  Filter, 
  Image as ImageIcon, 
  MessageSquare, 
  HelpCircle, 
  AlertTriangle, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit, 
  Eye, 
  Trash2,
  Layout
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
const mockConteudo = ref(Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  titulo: i % 4 === 0 ? 'Banner Promocional Outubro' : i % 3 === 0 ? 'Aviso de Manutenção' : i % 2 === 0 ? 'FAQ: Como contratar' : 'Popup de Welcome',
  tipo: i % 4 === 0 ? 'Banner' : i % 3 === 0 ? 'Aviso' : i % 2 === 0 ? 'FAQ' : 'Popup',
  local: i % 3 === 0 ? 'Home - Topo' : i % 2 === 0 ? 'Dashboard Geral' : 'Central de Ajuda',
  status: i % 5 === 0 ? 'inativo' : i % 4 === 0 ? 'agendado' : 'ativo',
  data: `1${i % 9}/04/2026`
})))

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// Filter logic
const filteredConteudo = computed(() => {
  return mockConteudo.value.filter(c => 
    c.titulo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.local.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.tipo.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredConteudo.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredConteudo.value.slice(start, start + itemsPerPage)
})

watch(searchTerm, () => {
  currentPage.value = 1
})

const handleViewDetails = (item: any) => {
  selectedItem.value = item
  isModalOpen.value = true
  logAction('view_content_details', 'conteudo', { contentId: item.id })
}

const handleAction = (action: string, item?: any) => {
  const permission = action === 'create' ? 'create' : (action === 'delete' ? 'delete' : 'edit')
  if (!canPerformAction(permission, 'conteudo')) {
    alert('Acesso negado para esta operação de conteúdo.')
    return
  }
  logAction(`${action}_conteudo`, 'conteudo', item ? { contentId: item.id } : undefined)
  alert(`Ação "${action}" executada com sucesso.`)
}

// Stats
const stats = computed(() => ([
  { label: 'Banners Ativos', value: '4', icon: ImageIcon, color: 'text-slate-900' },
  { label: 'Avisos Globais', value: '1', icon: AlertTriangle, color: 'text-blue-600' },
  { label: 'Artigos FAQ', value: '42', icon: HelpCircle, color: 'text-slate-500' },
  { label: 'Campanhas', value: '2', icon: Clock, color: 'text-purple-600' }
]))
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Conteúdo & CMS</h1>
        <p class="text-slate-500 font-medium mt-1">Gestão de ativos visuais, comunicações e documentação de ajuda.</p>
      </div>
      <div class="flex gap-3">
         <button v-if="canPerformAction('create', 'conteudo')" @click="handleAction('create')" class="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
           <Plus class="h-4 w-4" />
           Novo Conteúdo
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
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
          placeholder="Pesquisar por título, local ou tipo..."
        />
      </div>
      <div class="flex gap-3">
        <select class="rounded-2xl border-slate-100 bg-white py-3 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm cursor-pointer transition-all focus:ring-indigo-500">
          <option>Todos os Ativos</option>
          <option>Banner</option>
          <option>Aviso</option>
          <option>FAQ</option>
          <option>Popup</option>
        </select>
      </div>
    </div>

    <!-- Content Table -->
    <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div v-if="isLoading" class="p-20 text-center">
        <div class="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indexando Biblioteca...</p>
      </div>

      <AdminEmptyState 
        v-else-if="filteredConteudo.length === 0"
        title="Nenhum ativo encontrado" 
        :description="`Refine sua pesquisa para '${searchTerm}' ou crie um novo conteúdo.`"
      />

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-50">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="py-5 px-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador / Título</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxonomia</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Posicionamento</th>
                <th class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in paginatedData" :key="item.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="whitespace-nowrap py-5 px-8">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm ring-1 ring-inset ring-black/5">
                      <component :is="item.tipo === 'Banner' ? ImageIcon : (item.tipo === 'Aviso' ? AlertTriangle : (item.tipo === 'FAQ' ? HelpCircle : MessageSquare))" class="h-5 w-5" />
                    </div>
                    <div>
                      <div class="text-sm font-black text-slate-900 tracking-tight">{{ item.titulo }}</div>
                      <div class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">DATA: {{ item.data }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                   <span class="text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest italic">{{ item.tipo }}</span>
                </td>
                <td class="px-6 py-5">
                   <div class="flex items-center gap-2">
                      <Layout class="h-3.5 w-3.5 text-slate-300" />
                      <span class="text-xs font-bold text-slate-500">{{ item.local }}</span>
                   </div>
                </td>
                <td class="px-6 py-5">
                   <span :class="[
                     item.status === 'ativo' ? 'bg-green-50 text-green-600 ring-green-600/10' : 
                     item.status === 'agendado' ? 'bg-purple-50 text-purple-600 ring-purple-600/10' : 
                     'bg-slate-50 text-slate-400 ring-slate-400/10',
                     'px-3 py-1.5 rounded-full text-[9px] font-black uppercase ring-1'
                   ]">
                     {{ item.status }}
                   </span>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="handleViewDetails(item)" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                      <Eye class="h-4 w-4" />
                    </button>
                    <template v-if="canPerformAction('edit', 'conteudo')">
                      <button @click="handleAction('edit', item)" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all">
                        <Edit class="h-4 w-4" />
                      </button>
                    </template>
                    <template v-if="canPerformAction('delete', 'conteudo')">
                      <button @click="handleAction('delete', item)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 class="h-4 w-4" />
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
          :total-items="filteredConteudo.length" 
          :items-per-page="itemsPerPage" 
          @page-change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Content Modal -->
    <AdminModal :is-open="isModalOpen" @close="isModalOpen = false" title="Visualização de Ativo">
      <div v-if="selectedItem" class="space-y-8">
        <div class="relative overflow-hidden group rounded-[28px] bg-slate-900 aspect-video flex items-center justify-center text-white/20">
           <component :is="selectedItem.tipo === 'Banner' ? ImageIcon : Layout" class="h-20 w-20 group-hover:scale-110 transition-transform duration-700" />
           <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
              <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">{{ selectedItem.tipo }}</span>
              <h4 class="text-2xl font-black italic tracking-tight">{{ selectedItem.titulo }}</h4>
           </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8 px-2 border-b border-slate-50 pb-8">
          <div v-for="info in [
            { label: 'Identificador Interno', value: `#${selectedItem.id}` },
            { label: 'Taxonomia de Ativo', value: selectedItem.tipo },
            { label: 'Local de Exibição', value: selectedItem.local },
            { label: 'Status de Veiculação', value: selectedItem.status, highlight: true }
          ]" :key="info.label">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ info.label }}</p>
            <p class="text-sm font-black text-slate-900" :class="{ 'text-green-600 uppercase italic': info.highlight && selectedItem.status === 'ativo' }">
              {{ info.value }}
            </p>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-3">
          <button @click="isModalOpen = false" class="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">
            Retornar à Grade
          </button>
          <button v-if="canPerformAction('edit', 'conteudo')" class="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
             Editar Propriedades
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
