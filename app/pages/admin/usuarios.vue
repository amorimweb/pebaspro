<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['admin'] as any })

const supabase = useSupabaseClient<Database>()
const search = ref('')
const filterTipo = ref('')
const users = ref<any[]>([])
const loading = ref(true)
const providers = ref<Record<string, string>>({})

const fetchUsers = async () => {
  loading.value = true
  try {
    let query = (supabase.from('usuarios').select('*').order('created_at', { ascending: false }) as any)
    if (search.value) query = query.ilike('nome', `%${search.value}%`)
    if (filterTipo.value) query = query.eq('tipo_conta', filterTipo.value)
    const { data } = await query
    users.value = data || []
  } finally {
    loading.value = false
  }
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

const statusBadge = (status: string | null) =>
  status === 'suspenso'
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700'

const tipoBadge = (tipo: string | null) => {
  const map: Record<string, string> = {
    talento: 'bg-blue-100 text-blue-700',
    prestador: 'bg-teal-100 text-teal-700',
    empresa: 'bg-indigo-100 text-indigo-700',
    cliente: 'bg-gray-100 text-gray-600',
  }
  return map[tipo || ''] || 'bg-gray-100 text-gray-500'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap gap-3 items-center">
      <input
        v-model="search"
        @keyup.enter="fetchUsers"
        type="text"
        placeholder="Buscar por nome..."
        class="flex-1 min-w-48 h-10 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
      />
      <select
        v-model="filterTipo"
        @change="fetchUsers"
        class="h-10 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 bg-white"
      >
        <option value="">Todos os tipos</option>
        <option value="talento">Talento</option>
        <option value="prestador">Prestador</option>
        <option value="empresa">Empresa</option>
        <option value="cliente">Cliente</option>
      </select>
      <button @click="fetchUsers" class="h-10 px-5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
        Buscar
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
          {{ users.length }} usuário(s) encontrado(s)
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
            <tr>
              <th class="px-6 py-4">Usuário</th>
              <th class="px-6 py-4">Tipo</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Cadastrado em</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" v-for="i in 5" :key="i">
              <td class="px-6 py-4" colspan="6"><div class="h-4 bg-gray-200 rounded w-full animate-pulse"/></td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-gray-400">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-else v-for="u in users" :key="u.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm overflow-hidden flex-shrink-0">
                    <img v-if="u.foto" :src="u.foto" class="w-full h-full object-cover"/>
                    <span v-else>{{ u.nome?.charAt(0) || '?' }}</span>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ u.nome || '—' }}</p>
                    <div class="flex flex-col gap-0.5">
                      <p class="text-xs text-gray-400">{{ u.email }}</p>
                      <span v-if="providers[u.id]" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md inline-block w-max font-medium">
                        Logado via: {{ providers[u.id] }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${tipoBadge(u.tipo_conta)}`">
                  {{ u.tipo_conta || 'sem tipo' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' || u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`">
                  {{ u.role || 'user' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge(u.status)}`">
                  {{ u.status || 'ativo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-400">{{ new Date(u.created_at).toLocaleDateString('pt-BR') }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="openEditModal(u)"
                  class="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-indigo-50"
                  title="Editar Usuário"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Modal Editar Usuário -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isEditModalOpen = false"></div>
      <div class="bg-white rounded-[24px] shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 class="font-bold text-gray-900 text-lg">Editar Usuário</h3>
          <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto" v-if="selectedUser">
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
              <input type="text" v-model="selectedUser.nome" disabled class="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
              <input type="email" v-model="selectedUser.email" disabled class="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Permissão</label>
                <select v-model="selectedUser.role" class="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10">
                  <option value="user">Usuário Padrão</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status da Conta</label>
                <select v-model="selectedUser.status" class="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" :class="selectedUser.status === 'suspenso' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso (Bloqueado)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <button @click="deleteUser" :disabled="isSaving" class="w-full sm:w-auto text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Deletar Usuário
          </button>
          
          <div class="flex w-full sm:w-auto gap-3">
            <button @click="isEditModalOpen = false" :disabled="isSaving" class="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors disabled:opacity-50">Cancelar</button>
            <button @click="saveUser" :disabled="isSaving" class="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap">{{ isSaving ? 'Salvando...' : 'Salvar Tudo' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
</style>
