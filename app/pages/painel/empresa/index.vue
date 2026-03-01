<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Database } from '~/types'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()
const { user, initialized } = storeToRefs(authStore)

// Stats state
const stats = ref({
  activeJobs: 0,
  totalCandidates: 0,
  views: 0
})

const recentJobs = ref<any[]>([])
const loading = ref(true)

const fetchDashboard = async () => {
  const userId = authStore.profile?.id || user.value?.id
  if (!userId || userId === 'undefined') {
    console.warn('Dashboard: ID do usuário inválido, abortando busca.')
    return
  }
    
  loading.value = true
  try {
    // 1. Fetch active jobs count
    const { count: jobsCount, error: jobsError } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', userId)
      .is('encerramento', null)
        
    if (!jobsError) stats.value.activeJobs = jobsCount || 0

    // 2. Fetch total candidates (applications for my jobs)
    const { data: myJobs } = await supabase
      .from('vagas')
      .select('id')
      .eq('empresa_id', userId)
        
    if (myJobs && myJobs.length > 0) {
      const jobIds = (myJobs as any[]).map(j => j.id)
      const { count: candCount } = await supabase
        .from('candidaturas')
        .select('*', { count: 'exact', head: true })
        .in('vaga_id', jobIds)
      stats.value.totalCandidates = candCount || 0
    }

    // 3. Fetch recent jobs
    const { data: jobs } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', userId)
      .order('data_publicacao', { ascending: false })
      .limit(5)
        
    if (jobs) recentJobs.value = jobs

    // 4. Fetch total views (if applicable for companies)
    // For now, keeping it at 0 or implementing a simple count if visualizacoes_vitrine exists
    const { count: viewsCount } = await supabase
      .from('visualizacoes_vitrine')
      .select('*', { count: 'exact', head: true })
      .eq('vitrine_id', userId)
    
    stats.value.views = viewsCount || 0

  } catch (e) {
    console.error('Error loading dashboard:', e)
  } finally {
    loading.value = false
  }
}

// React to initialization and user changes
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
        <div class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-indigo-100">
          🏢 Painel da Empresa
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Olá, {{ authStore.profile?.nome?.split(' ')[0] || 'Empresa' }}!</h1>
        <p class="text-gray-500">Gerencie suas vagas e acompanhe candidaturas.</p>
      </div>
      <div>
        <NuxtLink to="/painel/empresa/vagas/nova" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Criar Nova Vaga
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Vagas Ativas</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.activeJobs }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 inline-block">publicadas</span>
        </div>
        <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Candidaturas</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.totalCandidates }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">recebidas</span>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Visualizações</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.views }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-2 inline-block">em breve</span>
        </div>
        <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
      </div>
    </div>

    <!-- Recent Jobs -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Vagas Recentes
            </h2>
            <NuxtLink to="/painel/empresa/vagas" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Ver todas</NuxtLink>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-500">
                <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
                    <tr>
                        <th class="px-6 py-4">Título</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4">Publicada em</th>
                        <th class="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading" v-for="i in 3" :key="i">
                        <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-48 animate-pulse"></div></td>
                        <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                        <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                        <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-8 animate-pulse ml-auto"></div></td>
                    </tr>
                    <tr v-else-if="recentJobs.length === 0">
                        <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                            Nenhuma vaga criada ainda. <NuxtLink to="/painel/empresa/vagas/nova" class="text-green-600 underline">Criar a primeira</NuxtLink>.
                        </td>
                    </tr>
                    <tr v-else v-for="job in recentJobs" :key="job.id" class="hover:bg-gray-50 transition-colors group">
                        <td class="px-6 py-4 font-medium text-gray-900">{{ job.titulo }}</td>
                        <td class="px-6 py-4">
                            <span v-if="!job.encerramento" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Ativa
                            </span>
                            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Fechada
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            {{ new Date(job.data_publicacao).toLocaleDateString('pt-BR') }}
                        </td>
                        <td class="px-6 py-4 text-right">
                             <NuxtLink :to="`/painel/empresa/vagas/${job.id}`" class="text-gray-400 hover:text-indigo-600 font-medium transition-colors">
                                Editar
                            </NuxtLink>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>
