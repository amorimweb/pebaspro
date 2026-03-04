<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const supabase = useSupabaseClient<Database>()
const stats = ref({ usuarios: 0, vagas: 0, servicos: 0, solicitacoes: 0 })
const recentUsers = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [usersRes, vagasRes, servicosRes, solRes, recentRes] = await Promise.all([
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('vagas').select('*', { count: 'exact', head: true }),
      supabase.from('servicos').select('*', { count: 'exact', head: true }),
      supabase.from('solicitacoes_orcamento').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('id, nome, email, tipo_conta, role, created_at')
        .order('created_at', { ascending: false }).limit(8)
    ])
    stats.value.usuarios    = usersRes.count || 0
    stats.value.vagas       = vagasRes.count || 0
    stats.value.servicos    = servicosRes.count || 0
    stats.value.solicitacoes = solRes.count || 0
    recentUsers.value       = recentRes.data || []
  } finally {
    loading.value = false
  }
})

const statCards = computed(() => [
  { label: 'Usuários',     value: stats.value.usuarios,     icon: '👥', color: 'indigo' },
  { label: 'Vagas',        value: stats.value.vagas,        icon: '💼', color: 'blue'   },
  { label: 'Serviços',     value: stats.value.servicos,     icon: '🛠️', color: 'teal'   },
  { label: 'Orçamentos',   value: stats.value.solicitacoes, icon: '📋', color: 'violet' },
])

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  blue:   'bg-blue-50   text-blue-600',
  teal:   'bg-teal-50   text-teal-600',
  violet: 'bg-violet-50 text-violet-600',
}

const tipoBadge = (tipo: string | null) => {
  const map: Record<string, string> = {
    talento:   'bg-blue-100 text-blue-700',
    prestador: 'bg-teal-100 text-teal-700',
    empresa:   'bg-indigo-100 text-indigo-700',
    cliente:   'bg-gray-100 text-gray-600',
  }
  return map[tipo || ''] || 'bg-gray-100 text-gray-500'
}
</script>

<template>
  <div class="space-y-8">
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="s in statCards" :key="s.label"
        class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between"
      >
        <div>
          <p class="text-sm font-semibold text-gray-500 mb-1">{{ s.label }}</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-black text-gray-900">{{ s.value }}</h3>
        </div>
        <div :class="`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorMap[s.color]}`">
          {{ s.icon }}
        </div>
      </div>
    </div>

    <!-- Ações Rápidas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <NuxtLink to="/admin/usuarios" class="quick-action group">
        <span class="text-2xl">👥</span>
        <div>
          <p class="font-bold text-gray-900 group-hover:text-indigo-700 transition">Gerenciar Usuários</p>
          <p class="text-sm text-gray-500">Suspender, alterar roles</p>
        </div>
      </NuxtLink>
      <NuxtLink to="/admin/vagas" class="quick-action group">
        <span class="text-2xl">💼</span>
        <div>
          <p class="font-bold text-gray-900 group-hover:text-indigo-700 transition">Moderar Vagas</p>
          <p class="text-sm text-gray-500">Remover conteúdo inadequado</p>
        </div>
      </NuxtLink>
      <NuxtLink to="/admin/servicos" class="quick-action group">
        <span class="text-2xl">🛠️</span>
        <div>
          <p class="font-bold text-gray-900 group-hover:text-indigo-700 transition">Moderar Serviços</p>
          <p class="text-sm text-gray-500">Revisar serviços cadastrados</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Usuários Recentes -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2">
          <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Últimos Cadastros
        </h2>
        <NuxtLink to="/admin/usuarios" class="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Ver todos</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
            <tr>
              <th class="px-6 py-4">Nome</th>
              <th class="px-6 py-4">E-mail</th>
              <th class="px-6 py-4">Tipo</th>
              <th class="px-6 py-4">Cadastro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" v-for="i in 4" :key="i">
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32 animate-pulse"/></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-40 animate-pulse"/></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-20 animate-pulse"/></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24 animate-pulse"/></td>
            </tr>
            <tr v-else v-for="u in recentUsers" :key="u.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-900">{{ u.nome || '—' }}</td>
              <td class="px-6 py-4 text-gray-500">{{ u.email }}</td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${tipoBadge(u.tipo_conta)}`">
                  {{ u.tipo_conta || 'sem tipo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-400">{{ new Date(u.created_at).toLocaleDateString('pt-BR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-action {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.quick-action:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 16px rgba(99,102,241,0.1);
  transform: translateY(-2px);
}
</style>
