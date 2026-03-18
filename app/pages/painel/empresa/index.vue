<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Database } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()

// Stats state
const stats = ref({
  activeJobs: 0,
  totalCandidates: 0,
  views: 0
})

const recentJobs = ref<any[]>([])
const loading = ref(true)

// Modals
const showVagasModal = ref(false)
const showViewsModal = ref(false)
const activeJobsList = ref<any[]>([])
const viewsList = ref<any[]>([])
const loadingModal = ref(false)

const fetchDashboard = async () => {
  const userId = authStore.profile?.id || user.value?.id
  if (!userId || userId === 'undefined') {
    console.warn('Dashboard: ID do usuário inválido, abortando busca.')
    return
  }
    
  loading.value = true
  try {
    const agoraStr = new Date().toISOString().split('T')[0]
    const { count: jobsCount, error: jobsError } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', userId)
      .or(`encerramento.is.null,encerramento.gte.${agoraStr}`)
        
    if (!jobsError) stats.value.activeJobs = jobsCount || 0

    const { data: myJobs } = await supabase
      .from('vagas')
      .select('id')
      .eq('empresa_id', userId)
        
    if (myJobs && myJobs.length > 0) {
      const jobIds = (myJobs as any[]).map(j => j.id)
      const { count: candCount } = await (supabase
        .from('candidaturas' as any)
        .select('*', { count: 'exact', head: true }) as any)
        .in('vaga_id', jobIds)
      stats.value.totalCandidates = candCount || 0
    }

    const { data: jobs } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', userId)
      .order('data_publicacao', { ascending: false })
      .limit(5)
        
    if (jobs) recentJobs.value = jobs

    const { count: viewsCount } = await (supabase
      .from('visualizacoes_vitrine' as any)
      .select('*', { count: 'exact', head: true }) as any)
      .eq('vitrine_id', userId)
    
    stats.value.views = viewsCount || 0

  } catch (e) {
    console.error('Error loading dashboard:', e)
  } finally {
    loading.value = false
  }
}

const isVagaAtiva = (encerramento: string | null) => {
  if (!encerramento) return true
  const agora = new Date()
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const parts = encerramento.split('-')
  if (parts.length !== 3) return true
  const [year, month, day] = parts.map(Number)
  const dataEnc = new Date(year, month - 1, day)
  return dataEnc >= hoje
}

const openVagasModal = async () => {
  showVagasModal.value = true
  const userId = authStore.profile?.id || user.value?.id
  if (!userId) return
  loadingModal.value = true
  try {
    const agoraStr = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('vagas')
      .select('id, titulo, modalidade, encerramento, data_publicacao')
      .eq('empresa_id', userId)
      .or(`encerramento.is.null,encerramento.gte.${agoraStr}`)
      .order('data_publicacao', { ascending: false })
    activeJobsList.value = data || []
  } finally {
    loadingModal.value = false
  }
}

const openViewsModal = async () => {
  showViewsModal.value = true
  const userId = authStore.profile?.id || user.value?.id
  if (!userId) return
  loadingModal.value = true
  try {
    const { data } = await (supabase
      .from('visualizacoes_vitrine' as any)
      .select('*')
      .eq('vitrine_id', userId)
      .order('created_at', { ascending: false })
      .limit(50) as any)
    viewsList.value = data || []
  } finally {
    loadingModal.value = false
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
        <div class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-indigo-100">
          🏢 Painel da Empresa
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Olá, {{ authStore.profile?.nome || 'Empresa' }}!</h1>
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
      <!-- Vagas Ativas → abre modal -->
      <button
        type="button"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer text-left w-full group"
        @click="openVagasModal"
      >
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Vagas Ativas</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.activeJobs }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 inline-block">publicadas</span>
        </div>
        <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
      </button>

      <!-- Candidaturas → navega para vagas -->
      <NuxtLink
        to="/painel/empresa/vagas"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-pointer group"
      >
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Candidaturas</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.totalCandidates }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">recebidas</span>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
      </NuxtLink>

      <!-- Visualizações → abre modal -->
      <button
        type="button"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-md hover:border-violet-100 transition-all duration-300 cursor-pointer text-left w-full group"
        @click="openViewsModal"
      >
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Visualizações</p>
          <div v-if="loading" class="h-8 w-16 bg-gray-200 rounded animate-pulse"/>
          <h3 v-else class="text-3xl font-bold text-gray-900">{{ stats.views }}</h3>
          <span v-if="!loading" class="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mt-2 inline-block">do perfil</span>
        </div>
        <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
          <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
      </button>
    </div>

    <!-- Modal: Vagas Ativas -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showVagasModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showVagasModal = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showVagasModal = false"/>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col z-10">
            <div class="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Vagas Ativas
              </h2>
              <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="showVagasModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="loadingModal" class="space-y-3">
                <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-xl animate-pulse"/>
              </div>
              <div v-else-if="activeJobsList.length === 0" class="text-center py-10 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <p>Nenhuma vaga ativa no momento.</p>
                <NuxtLink to="/painel/empresa/vagas/nova" class="mt-3 inline-block text-indigo-600 font-medium hover:underline">Criar nova vaga</NuxtLink>
              </div>
              <ul v-else class="space-y-3">
                <li
                  v-for="vaga in activeJobsList"
                  :key="vaga.id"
                  class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 hover:bg-indigo-50 transition-colors group"
                >
                  <div>
                    <p class="font-semibold text-gray-800">{{ vaga.titulo }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ vaga.modalidade || 'Presencial' }}
                      <span v-if="vaga.encerramento"> · Encerra {{ new Date(vaga.encerramento).toLocaleDateString('pt-BR') }}</span>
                      <span v-else> · Sem data de encerramento</span>
                    </p>
                  </div>
                  <NuxtLink
                    :to="`/painel/empresa/vagas/${vaga.id}`"
                    class="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors opacity-0 group-hover:opacity-100"
                    @click="showVagasModal = false"
                  >Ver</NuxtLink>
                </li>
              </ul>
            </div>
            <div class="p-4 border-t border-gray-100">
              <NuxtLink to="/painel/empresa/vagas" class="block text-center text-sm text-indigo-600 font-medium hover:underline" @click="showVagasModal = false">Ver todas as vagas →</NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal: Visualizações -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showViewsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showViewsModal = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showViewsModal = false"/>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col z-10">
            <div class="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="w-2 h-6 bg-violet-500 rounded-full"></span>
                Visualizações do Perfil
              </h2>
              <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="showViewsModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="overflow-y-auto flex-1 p-6">
              <div v-if="loadingModal" class="space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded-xl animate-pulse"/>
              </div>
              <div v-else-if="viewsList.length === 0" class="text-center py-10 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <p>Ainda não há registros de visualizações.</p>
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="(view, idx) in viewsList"
                  :key="idx"
                  class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                      {{ idx + 1 }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ view.viewer_nome || view.viewer_id || 'Visitante anônimo' }}</p>
                      <p class="text-xs text-gray-400">{{ view.created_at ? new Date(view.created_at).toLocaleString('pt-BR') : '' }}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
                            <span v-if="isVagaAtiva(job.encerramento)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
