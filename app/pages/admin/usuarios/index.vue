<script setup lang="ts">
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  X
} from 'lucide-vue-next'
import type { Database } from '~/types'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const supabase = useSupabaseClient<Database>()
const search = ref('')
const filterTipo = ref('')
const users = ref<any[]>([])
const loading = ref(true)
const providers = ref<Record<string, string>>({})

const currentPage = ref(1)
const totalItems = ref(0)
const itemsPerPage = 50

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage) || 1)

const fetchUsers = async () => {
  loading.value = true
  try {
    let query = supabase.from('usuarios').select('*', { count: 'exact' })
    if (search.value) {
      query = query.or(`nome.ilike.%${search.value}%,email.ilike.%${search.value}%`)
    }
    if (filterTipo.value) query = query.eq('tipo_conta', filterTipo.value)
    
    // Pagination
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    
    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)
      
    users.value = data || []
    totalItems.value = count || 0
  } finally {
    loading.value = false
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchUsers()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchUsers()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

onMounted(async () => {
  await fetchUsers()
  try {
    providers.value = await $fetch('/api/admin/auth-providers')
  } catch (e) {
    console.error('Erro ao buscar provedores de login:', e)
  }
})

const isEditModalOpen = ref(false)
const selectedUser = ref<any>(null)
const isSaving = ref(false)

const openEditModal = (user: any) => {
  selectedUser.value = { ...user }
  isEditModalOpen.value = true
}

const saveUser = async () => {
  if (!selectedUser.value) return
  isSaving.value = true
  try {
    const { id, role, status } = selectedUser.value
    await supabase.from('usuarios').update({ role, status } as never).eq('id', id)
    isEditModalOpen.value = false
    await fetchUsers()
  } catch(e) {
    alert('Erro ao salvar: ' + e)
  } finally {
    isSaving.value = false
  }
}

const deleteUser = async () => {
  if (!selectedUser.value) return
  if (!confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE o usuário ${selectedUser.value.nome}? Essa ação não pode ser desfeita e todas as vagas e serviços associados serão excluídos.`)) return
  
  isSaving.value = true
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}`, { method: 'DELETE' })
    isEditModalOpen.value = false
    await fetchUsers()
  } catch(e: any) {
    alert('Erro ao deletar: ' + (e.data?.statusMessage || e.message))
  } finally {
    isSaving.value = false
  }
}

const statusBadgeClass = (status: string | null) =>
  status === 'suspenso'
    ? 'bg-red-50 text-red-600 border-red-100'
    : 'bg-green-50 text-green-600 border-green-100'

const tipoBadgeClass = (tipo: string | null) => {
  const map: Record<string, string> = {
    talento: 'bg-blue-50 text-blue-600 border-blue-100',
    prestador: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    empresa: 'bg-purple-50 text-purple-600 border-purple-100',
    cliente: 'bg-slate-50 text-slate-500 border-slate-100',
  }
  return map[tipo || ''] || 'bg-slate-50 text-slate-400 border-slate-100'
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          User Ecosystem
          <span class="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{{ totalItems }}</span>
        </h1>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Gestão central de identidades e privilégios da plataforma</p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 flex flex-wrap gap-4 items-center">
      <div class="flex-1 min-w-[300px] relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        <input
          v-model="search"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Busca por nome ou e-mail..."
          class="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:bg-white transition-all outline-none"
        />
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative">
          <Filter class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            v-model="filterTipo"
            @change="handleSearch"
            class="h-12 pl-12 pr-10 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:bg-white transition-all outline-none appearance-none min-w-[200px]"
          >
            <option value="">Fluxos: Todos os tipos</option>
            <option value="talento">Talento</option>
            <option value="prestador">Prestador</option>
            <option value="empresa">Empresa</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>
        
        <button @click="handleSearch" class="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
          Sync
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade</th>
              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atribuição</th>
              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Privilégio</th>
              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CreatedAt</th>
              <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loading" v-for="i in 5" :key="i">
              <td colspan="6" class="px-8 py-10"><div class="h-4 bg-slate-50 rounded-full w-full animate-pulse"></div></td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-8 py-20 text-center">
                 <div class="flex flex-col items-center gap-3">
                    <AlertCircle class="h-10 w-10 text-slate-200" />
                    <p class="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhum registro encontrado</p>
                 </div>
              </td>
            </tr>
            <tr v-else v-for="u in users" :key="u.id" class="group hover:bg-slate-50/50 transition-all">
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-[18px] bg-slate-100 flex items-center justify-center font-black text-slate-500 overflow-hidden ring-4 ring-transparent group-hover:ring-slate-100 transition-all">
                    <img v-if="u.foto" :src="u.foto" class="w-full h-full object-cover shadow-sm"/>
                    <span v-else>{{ u.nome?.charAt(0) || '?' }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-black text-slate-900 tracking-tight">{{ u.nome || 'Identidade Oculta' }}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ u.email }}</p>
                    <span v-if="providers[u.id]" class="mt-1 inline-block text-[8px] font-black text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded uppercase italic">Via: {{ providers[u.id] }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span :class="[tipoBadgeClass(u.tipo_conta), 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border']">
                  {{ u.tipo_conta || 'N/A' }}
                </span>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                   <Shield :class="[u.role === 'admin' || u.role === 'superadmin' ? 'text-indigo-500' : 'text-slate-300', 'h-4 w-4']" />
                   <span class="text-xs font-black text-slate-700 uppercase tracking-tight">{{ u.role || 'user' }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                 <span :class="[statusBadgeClass(u.status), 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border']">
                    {{ u.status || 'ativo' }}
                 </span>
              </td>
              <td class="px-8 py-6">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ new Date(u.created_at).toLocaleDateString('pt-BR') }}</p>
              </td>
              <td class="px-8 py-6 text-right">
                <button
                  @click="openEditModal(u)"
                  class="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                >
                  <Edit class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Página {{ currentPage }} de {{ totalPages }}</p>
        <div class="flex items-center gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-30 shadow-sm"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
      <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 duration-500 h-max max-h-[90vh]">
        <!-- Modal Header -->
        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
               <h3 class="text-xl font-black text-slate-900 tracking-tight">Identity Overwrite</h3>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Alteração Manual de Privilégios</p>
            </div>
            <button @click="isEditModalOpen = false" class="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center">
               <X class="h-6 w-6" />
            </button>
        </div>

        <!-- Modal Body -->
        <div class="p-8 space-y-8" v-if="selectedUser">
           <div class="flex items-center gap-5 p-4 bg-slate-50 rounded-[28px]">
              <div class="w-16 h-16 rounded-[22px] bg-white shadow-sm flex items-center justify-center font-black text-2xl text-slate-300">
                 <img v-if="selectedUser.foto" :src="selectedUser.foto" class="w-full h-full object-cover rounded-[22px]" />
                 <span v-else>{{ selectedUser.nome?.charAt(0) || '?' }}</span>
              </div>
              <div class="overflow-hidden">
                 <p class="text-base font-black text-slate-900 truncate tracking-tight">{{ selectedUser.nome }}</p>
                 <p class="text-xs font-medium text-slate-500">{{ selectedUser.email }}</p>
              </div>
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security Clearance</label>
                 <div class="relative group">
                    <Shield class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    <select v-model="selectedUser.role" class="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:bg-white transition-all outline-none appearance-none">
                       <option value="user">Usuário Padrão</option>
                       <option value="admin">Admin Root</option>
                    </select>
                 </div>
              </div>
              <div class="space-y-2">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Account Governance</label>
                 <div class="relative group">
                    <AlertCircle class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                    <select v-model="selectedUser.status" class="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold transition-all outline-none appearance-none" :class="selectedUser.status === 'suspenso' ? 'text-red-600' : 'text-green-600'">
                       <option value="ativo">Ativo (Acesso Pleno)</option>
                       <option value="suspenso">Suspenso (Lockout)</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-8 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-100">
           <button @click="deleteUser" class="flex items-center gap-2 text-xs font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-all">
              <Trash2 class="h-4 w-4" />
              Terminate Account
           </button>
           <div class="flex gap-4 w-full md:w-auto">
              <button @click="isEditModalOpen = false" class="flex-1 md:flex-none h-12 px-8 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 bg-white">Cancel</button>
              <button @click="saveUser" :disabled="isSaving" class="flex-1 md:flex-none h-12 px-10 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50">
                 {{ isSaving ? 'Committing...' : 'Commit Changes' }}
              </button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
