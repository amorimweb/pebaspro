<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['admin'] as any })

const supabase = useSupabaseClient<Database>()
const search = ref('')
const filterTipo = ref('')
const users = ref<any[]>([])
const loading = ref(true)

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

onMounted(fetchUsers)

const suspendUser = async (id: string, currentStatus: string | null) => {
  const newStatus = currentStatus === 'suspenso' ? 'ativo' : 'suspenso'
  await supabase.from('usuarios').update({ status: newStatus } as never).eq('id', id)
  await fetchUsers()
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
                    <p class="text-xs text-gray-400">{{ u.email }}</p>
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
                  @click="suspendUser(u.id, u.status)"
                  :class="`text-xs font-bold px-3 py-1.5 rounded-lg transition ${u.status === 'suspenso' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`"
                >
                  {{ u.status === 'suspenso' ? 'Reativar' : 'Suspender' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
