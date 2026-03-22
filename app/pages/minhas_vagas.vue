<script setup lang="ts">
import type { Database } from '~/types'
import VagasRecomendadas from '~/components/dashboard/VagasRecomendadas.vue'
import VisitasModal from '~/components/modals/VisitasModal.vue'

import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const { user, initialized } = storeToRefs(authStore)
const supabase = useSupabaseClient<Database>()

// UI State
const isViewsModalOpen = ref(false)
const isCandidaturasModalOpen = ref(false)
const fullViews = ref<any[]>([])
const fullCandidaturas = ref<any[]>([])
const loadingDetails = ref(false)

const openViewsModal = async () => {
    isViewsModalOpen.value = true
    if (fullViews.value.length === 0) {
        await fetchFullViews()
    }
}

const openCandidaturasModal = async () => {
    isCandidaturasModalOpen.value = true
    if (fullCandidaturas.value.length === 0) {
        await fetchFullCandidaturas()
    }
}

const fetchFullCandidaturas = async () => {
    if (!user.value) return
    loadingDetails.value = true
    const { data } = await (supabase as any)
        .from('candidaturas')
        .select(`
            id,
            status,
            created_at,
            vagas (
                id,
                titulo,
                local,
                empresa_nome
            )
        `)
        .eq('usuario_id', user.value.id)
        .order('created_at', { ascending: false })
    fullCandidaturas.value = data || []
    loadingDetails.value = false
}

const fetchFullViews = async () => {
    if (!user.value) return
    loadingDetails.value = true
    const { data } = await (supabase as any)
        .from('visualizacoes_vitrine')
        .select(`
            id,
            created_at,
            visitante:visitante_id (
                id,
                nome,
                foto,
                tipo_conta
            )
        `)
        .eq('vitrine_id', user.value.id)
        .order('created_at', { ascending: false })
    fullViews.value = data || []
    loadingDetails.value = false
}

// State
const stats = ref({
    candidaturas: 0,
    visualizacoes: 0
})
const recentApplications = ref<any[]>([])
const loadingStats = ref(true)

// Calculation for Curriculum Progress
const completeness = computed(() => {
    const profile = authStore.profile
    const curr = profile?.curriculo
    if (!profile) return 0
    
    let score = 0
    if (curr?.objetivo_profissional || profile.objetivo_profissional) score += 20
    if ((curr?.habilidades && curr.habilidades.length > 0) || (profile.habilidades && profile.habilidades.length > 0)) score += 20
    if ((curr?.experiencia_profissional && Array.isArray(curr.experiencia_profissional) && curr.experiencia_profissional.length > 0) || (profile.experiencia_profissional && Array.isArray(profile.experiencia_profissional) && profile.experiencia_profissional.length > 0)) score += 20
    if ((curr?.formacao_academica && Array.isArray(curr.formacao_academica) && curr.formacao_academica.length > 0) || (profile.formacao_academica && Array.isArray(profile.formacao_academica) && profile.formacao_academica.length > 0)) score += 20
    if (curr?.latitude || profile.latitude) score += 20
    return score
})

// React to initialization and user changes
watch([initialized, user], ([isInit, newUser]) => {
    if (isInit && newUser?.id) {
        fetchDashboardData()
    }
}, { immediate: true })

const fetchDashboardData = async () => {
    loadingStats.value = true
    try {
        const userId = user.value?.id
        if (!userId) return

        // 1. Fetch Application Count
        const { count: appCount } = await (supabase as any)
            .from('candidaturas')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', userId)
        
        // 2. Fetch Profile Views
        const { count: viewCount } = await (supabase as any)
            .from('visualizacoes_perfil')
            .select('*', { count: 'exact', head: true })
            .eq('perfil_visitado_id', userId)

        stats.value = {
            candidaturas: appCount || 0,
            visualizacoes: viewCount || 0
        }

        // 3. Fetch Recent Applications
        const { data: apps } = await (supabase as any)
            .from('candidaturas')
            .select(`
                id,
                status,
                created_at,
                vagas (
                    id,
                    titulo,
                    local
                )
            `)
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false })
            .limit(3)

        recentApplications.value = apps || []
    } catch (e) {
        console.error('Erro ao carregar dados do dashboard:', e)
    } finally {
        loadingStats.value = false
    }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 pb-20 pt-8">
    <!-- Hero / Top Section -->
    <div class="bg-white border-b border-slate-200/60 pb-12 pt-8 rounded-[40px] mb-8 shadow-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div class="space-y-2">
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                        Minhas Vagas
                    </span>
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Olá, {{ authStore.profile?.nome?.split(' ').slice(0, 2).join(' ') || 'Candidato' }}! 👋
                    </h1>
                    <p class="text-slate-500 text-lg font-medium max-w-2xl">
                        Gerencie suas candidaturas e encontre novas oportunidades.
                    </p>
                </div>
                
                <div class="flex items-center gap-3">
                    <NuxtLink to="/vagas" class="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition shadow-xl shadow-green-600/20 active:scale-95 text-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        Explorar Vagas
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Quick Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <!-- Card: Completeness -->
            <div class="bg-white p-8 rounded-[38px] shadow-sm border border-slate-100 group transition-all hover:translate-y-[-4px]">
                <div class="flex items-center justify-between mb-6">
                    <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Currículo</p>
                        <span class="text-3xl font-black text-blue-600">{{ completeness }}%</span>
                    </div>
                </div>
                <div class="space-y-3">
                    <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000" :style="{ width: completeness + '%' }"></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-bold text-slate-500">Perfil Profissional</p>
                        <NuxtLink to="/curriculo/editar" class="text-sm font-black text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">
                            Editar
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Card Candidaturas -->
            <div @click="openCandidaturasModal" class="bg-white p-8 rounded-[38px] shadow-sm border border-slate-100 group transition-all hover:shadow-md hover:border-green-100 cursor-pointer hover-scale">
                <div class="flex items-start justify-between mb-4">
                  <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  </div>
                  <span class="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">Ver Todas</span>
                </div>
                <p class="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Candidaturas Realizadas</p>
                <h3 class="text-3xl font-black text-slate-900">{{ stats.candidaturas }}</h3>
            </div>

            <!-- Card Visitas -->
            <div @click="openViewsModal" class="bg-white p-6 rounded-[38px] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group hover-scale">
                <div class="flex items-start justify-between mb-4">
                  <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <span class="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Ver Detalhes</span>
                </div>
                <p class="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Visitas ao Perfil</p>
                <h3 class="text-3xl font-black text-slate-900">{{ stats.visualizacoes }}</h3>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- Left: Recommendations -->
            <div class="lg:col-span-2 space-y-8">
                <div class="flex items-center gap-3 mb-2 px-2">
                    <div class="w-2 h-8 bg-green-600 rounded-full"></div>
                    <h2 class="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">
                        Vagas Recomendadas
                    </h2>
                </div>
                <VagasRecomendadas />
            </div>

            <!-- Right: Activity -->
            <div class="space-y-8">
                <div class="bg-white rounded-[38px] border border-slate-100 p-8 shadow-sm">
                    <h3 class="font-black text-lg text-slate-900 mb-8 flex items-center gap-3">
                        <div class="p-2 bg-slate-100 rounded-xl text-slate-500">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        Atividade Recente
                    </h3>
                    
                    <div v-if="loadingStats" class="space-y-4">
                        <div v-for="i in 3" :key="i" class="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
                    </div>

                    <div v-else-if="recentApplications.length === 0" class="text-center py-10">
                        <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        </div>
                        <p class="text-slate-400 font-bold">Nenhuma candidatura ainda.</p>
                    </div>

                    <div v-else class="space-y-6">
                        <div v-for="app in recentApplications" :key="app.id" class="relative pl-6 border-l-2 border-slate-200 pb-1 last:pb-0">
                            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-green-500 shadow-sm"></div>
                            <h4 class="font-black text-slate-900 leading-tight mb-2">{{ (app.vagas as any)?.titulo }}</h4>
                            <div class="flex items-center gap-3">
                                <span :class="{
                                    'bg-green-100 text-green-700': app.status === 'selecionado',
                                    'bg-blue-100 text-blue-700': app.status === 'enviada',
                                    'bg-purple-100 text-purple-700': app.status === 'visualizada'
                                }" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                    {{ app.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Candidaturas -->
    <div v-if="isCandidaturasModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="isCandidaturasModalOpen = false"></div>
      <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-2xl font-black text-slate-900">Minhas Candidaturas</h3>
          <button @click="isCandidaturasModalOpen = false" class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-8 pt-4">
          <div v-if="loadingDetails" class="py-20 text-center">
            <div class="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-slate-500 font-bold">Carregando dados...</p>
          </div>
          <div v-else-if="fullCandidaturas.length === 0" class="py-20 text-center text-slate-400 font-bold">
            Nenhuma candidatura encontrada.
          </div>
          <div v-else class="space-y-4">
            <div v-for="app in fullCandidaturas" :key="app.id" class="p-5 border border-slate-100 rounded-3xl hover:border-green-100 hover:bg-green-50/30 transition-all group">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h4 class="font-black text-slate-900 group-hover:text-green-700 transition-colors">{{ app.vagas?.titulo }}</h4>
                  <p class="text-xs font-bold text-slate-500 uppercase">{{ app.vagas?.empresa_nome || 'Empresa Privada' }} • {{ app.vagas?.local }}</p>
                </div>
                <span :class="{
                  'bg-yellow-100 text-yellow-700': app.status === 'pendente',
                  'bg-green-100 text-green-700': app.status === 'aceito',
                  'bg-red-100 text-red-700': app.status === 'recusado'
                }" class="text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                  {{ app.status }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Candidatou-se em {{ new Date(app.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Visitas -->
    <div v-if="isViewsModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="isViewsModalOpen = false"></div>
      <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-2xl font-black text-slate-900">Visitas ao Perfil</h3>
          <button @click="isViewsModalOpen = false" class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-8 pt-4">
          <div v-if="loadingDetails" class="py-20 text-center">
            <div class="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-slate-500 font-bold">Carregando dados...</p>
          </div>
          <div v-else-if="fullViews.length === 0" class="py-20 text-center text-slate-400 font-bold">
            Nenhuma visita registrada recentemente.
          </div>
          <div v-else class="space-y-4">
            <div v-for="view in fullViews" :key="view.id" class="p-5 border border-slate-100 rounded-3xl flex items-center justify-between group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <img v-if="view.visitante?.foto" :src="view.visitante.foto" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-400 font-black">
                    {{ view.visitante?.nome?.charAt(0) || '?' }}
                  </div>
                </div>
                <div>
                  <h4 class="font-black text-slate-900">{{ view.visitante?.nome || 'Usuário Anônimo' }}</h4>
                  <p class="text-xs font-bold text-blue-600 uppercase tracking-wider">{{ view.visitante?.tipo_conta === 'empresa' ? 'Empresa' : 'Prestador' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Visualizado em</p>
                <p class="text-xs font-bold text-slate-600">{{ new Date(view.created_at).toLocaleDateString('pt-BR') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer !important;
}

.hover-scale {
    transition: all 0.2s ease-in-out;
}

.hover-scale:hover {
    transform: translateY(-4px) scale(1.01);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}
</style>
