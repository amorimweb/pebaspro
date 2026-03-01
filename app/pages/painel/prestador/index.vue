<script setup lang="ts">
import type { Database } from '~/types'
import type { Servico } from '~/types/servicos.types'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const stats = ref({ servicos: 0, solicitacoes: 0, views: 0 })
const recentServices = ref<Servico[]>([])
const loading = ref(true)

const fetchDashboard = async () => {
  const userId = authStore.profile?.id || user.value?.id
  if (!userId) return

  loading.value = true
  try {
    // 1. Total de serviços ativos
    const { count: servicosCount } = await supabase
      .from('servicos')
      .select('*', { count: 'exact', head: true })
      .eq('prestador_id', userId)
      .eq('ativo', true)
    
    // Fallback if network or rule failure
    stats.value.servicos = servicosCount || 0

    // 2. Total de solicitações de orçamento recebidas
    const { data: meusServicos } = await supabase
      .from('servicos')
      .select('id')
      .eq('prestador_id', userId)

    if (meusServicos && meusServicos.length > 0) {
      const ids = meusServicos.map(s => s.id)
      const { count: solCount } = await supabase
        .from('solicitacoes_orcamento')
        .select('*', { count: 'exact', head: true })
        .in('servico_id', ids)
      stats.value.solicitacoes = solCount || 0
    }

    // 3. Serviços recentes
    const { data: services } = await supabase
      .from('servicos')
      .select('*')
      .eq('prestador_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (services) recentServices.value = services as Servico[]

  } catch (e) {
    console.error('Erro ao carregar dashboard do prestador:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.profile?.id || user.value?.id) {
    fetchDashboard()
  }
})

watch(() => authStore.profile, (newProfile) => {
  if (newProfile?.id) {
    fetchDashboard()
  }
}, { immediate: true })

</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-teal-100">
          🛠️ Vitrine de Serviços
        </div>
        <h1 class="text-2xl font-bold text-gray-900">
          Olá, {{ authStore.profile?.nome?.split(' ')[0] || 'Prestador' }}! 👋
        </h1>
        <p class="text-gray-500 mt-1">Aqui está o resumo da sua vitrine hoje.</p>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <NuxtLink
          to="/painel/prestador/servicos/novo"
          class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 active:scale-95 transition-all text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Novo Serviço
        </NuxtLink>
        <NuxtLink
          :to="`/empresas/${authStore.profile?.id}`"
          class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Ver Vitrine
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Serviços Ativos -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Serviços Ativos</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.servicos }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-2 inline-block">na plataforma</span>
        </div>
        <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
      </div>

      <!-- Solicitações de Orçamento -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Solicitações Recebidas</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.solicitacoes }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">de orçamento</span>
        </div>
        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </div>
      </div>

      <!-- Visualizações -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Visualizações da Vitrine</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.views }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full mt-2 inline-block">em breve disponível</span>
        </div>
        <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Serviços Recentes - ocupa 2 colunas -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-6 bg-teal-500 rounded-full"></span>
            Meus Serviços Recentes
          </h2>
          <NuxtLink to="/painel/prestador/servicos" class="text-sm text-teal-600 hover:text-teal-700 font-medium">Ver todos</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-500">
            <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
              <tr>
                <th class="px-6 py-4">Serviço</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading" v-for="i in 3" :key="i">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-40 animate-pulse"/></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-16 animate-pulse"/></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-12 animate-pulse ml-auto"/></td>
              </tr>
              <tr v-else-if="recentServices.length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-gray-400">
                  Nenhum serviço cadastrado ainda.
                  <NuxtLink to="/painel/prestador/servicos/novo" class="text-teal-600 underline ml-1">Criar o primeiro</NuxtLink>.
                </td>
              </tr>
              <tr v-else v-for="s in recentServices" :key="s.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900">{{ s.titulo }}</td>
                <td class="px-6 py-4">
                  <span v-if="s.ativo" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">Ativo</span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inativo</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <NuxtLink :to="`/painel/prestador/servicos/${s.id}`" class="text-gray-400 hover:text-teal-600 font-medium transition-colors">Editar</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dica Pro - 1 coluna -->
      <div class="bg-gradient-to-br from-teal-600 to-cyan-700 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-110 transition-transform duration-700"/>
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">Dica Pro</div>
          <h3 class="text-xl font-bold mb-2">Melhore sua visibilidade</h3>
          <p class="text-teal-50 text-sm leading-relaxed">Prestadores com foto e descrição detalhada recebem 3× mais contatos dos clientes.</p>
        </div>
        <NuxtLink to="/perfil" class="relative z-10 mt-6 w-fit px-5 py-2.5 bg-white text-teal-700 font-bold rounded-xl shadow hover:bg-teal-50 transition-colors text-sm">
          Editar meu Perfil
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
