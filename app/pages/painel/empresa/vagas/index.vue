<script setup lang="ts">
import type { Database } from '~/types/database.types'

import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()
const { user, initialized } = storeToRefs(authStore)
const loading = ref(true)
const jobs = ref<any[]>([])

// Carregar vagas da empresa
const fetchJobs = async () => {
  const userId = authStore.profile?.id || user.value?.id
  if (!userId || userId === 'undefined') return
  
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    jobs.value = data || []
  } catch (error) {
    console.error('Erro ao carregar vagas:', error)
  } finally {
    loading.value = false
  }
}

// React to initialization and user changes
onMounted(() => {
  if (authStore.profile?.id || user.value?.id) {
    fetchJobs()
  }
})

watch(() => authStore.profile, (newProfile) => {
  if (newProfile?.id) {
    fetchJobs()
  }
}, { immediate: true })
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Minhas Vagas</h1>
        <p class="text-gray-500">Gerencie todas as suas oportunidades publicadas</p>
      </div>
      <div>
        <NuxtLink to="/painel/empresa/vagas/nova" class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Criar Nova Vaga
        </NuxtLink>
      </div>
    </div>

    <!-- Job List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center space-y-4">
        <div class="animate-pulse space-y-3">
            <div class="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
            <div class="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="jobs.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga criada</h3>
        <p class="text-gray-500 mb-6 max-w-sm mx-auto">Comece a anunciar suas oportunidades para encontrar os melhores profissionais da região.</p>
        <NuxtLink to="/painel/empresa/vagas/nova" class="text-green-600 font-bold hover:text-green-700 hover:underline">
            Criar minha primeira vaga &rarr;
        </NuxtLink>
      </div>

      <!-- Table Section -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500">
            <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
                <tr>
                    <th class="px-6 py-4">Título da Vaga</th>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4">Localização</th>
                    <th class="px-6 py-4">Publicada em</th>
                    <th class="px-6 py-4 text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">
                        {{ job.titulo }}
                        <div class="text-xs text-gray-400 font-normal mt-0.5">ID: #{{ job.id.toString().slice(0,8) }}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span v-if="!job.encerramento" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ativa
                        </span>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Encerrada
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        {{ job.cidade || 'Parauapebas' }}
                    </td>
                    <td class="px-6 py-4">
                        {{ new Date(job.created_at).toLocaleDateString('pt-BR') }}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-3">
                            <NuxtLink :to="`/painel/empresa/vagas/${job.id}`" class="text-blue-600 hover:text-blue-800 font-medium">Editar</NuxtLink>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
