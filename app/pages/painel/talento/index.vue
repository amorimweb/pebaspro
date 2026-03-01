<script setup lang="ts">
import type { Database } from '~/types'
import VagasRecomendadas from '~/components/dashboard/VagasRecomendadas.vue'

import { storeToRefs } from 'pinia'

// definePageMeta removed as auth.global handles this

const authStore = useAuthStore()
const { user, initialized } = storeToRefs(authStore)
const supabase = useSupabaseClient<Database>()

// State
const stats = ref({
    candidaturas: 0,
    visualizacoes: 0
})
const recentApplications = ref<any[]>([])
const loadingStats = ref(true)

// Calculation for Curriculum Progress (same logic as curriculo.vue)
const completeness = computed(() => {
    const profile = authStore.profile
    if (!profile) return 0
    let score = 0
    if (profile.objetivo_profissional) score += 20
    if (profile.habilidades && profile.habilidades.length > 0) score += 20
    if (profile.experiencia_profissional && Array.isArray(profile.experiencia_profissional) && profile.experiencia_profissional.length > 0) score += 20
    if (profile.formacao_academica && Array.isArray(profile.formacao_academica) && profile.formacao_academica.length > 0) score += 20
    if (profile.latitude) score += 20
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
        const { count: appCount } = await supabase
            .from('candidaturas')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', userId)
        
        // 2. Fetch Profile Views
        const { count: viewCount } = await supabase
            .from('visualizacoes_perfil')
            .select('*', { count: 'exact', head: true })
            .eq('perfil_visitado_id', userId)

        stats.value = {
            candidaturas: appCount || 0,
            visualizacoes: viewCount || 0
        }

        // 3. Fetch Recent Applications
        const { data: apps } = await supabase
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
  <div class="min-h-screen bg-slate-50/50 pb-20">
    <!-- Hero / Top Section -->
    <div class="bg-white border-b border-slate-200/60 pb-12 pt-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div class="space-y-2">
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                        Área do Candidato
                    </span>
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Olá, {{ authStore.profile?.nome?.split(' ')[0] || 'Candidato' }}! 👋
                    </h1>
                    <p class="text-slate-500 text-lg font-medium max-w-2xl">
                        Acompanhe suas candidaturas e encontre as melhores oportunidades na região.
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

    <div class="container mx-auto px-4 -mt-8">
        <!-- Quick Stats Cards (Integrated) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <!-- Card: Completeness -->
            <div class="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 group transition-all hover:translate-y-[-4px]">
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
                        <NuxtLink to="/painel/talento/curriculo" class="text-sm font-black text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">
                            Editar
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Card: Applications -->
            <div class="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:translate-y-[-4px]">
                <div class="flex items-center justify-between mb-6">
                    <div class="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ativo</p>
                        <span v-if="loadingStats" class="block h-8 w-12 bg-slate-100 animate-pulse rounded-lg ml-auto"></span>
                        <span v-else class="text-3xl font-black text-slate-900">{{ stats.candidaturas }}</span>
                    </div>
                </div>
                <div>
                    <h3 class="font-black text-slate-900 text-lg">Candidaturas</h3>
                    <p class="text-sm font-medium text-slate-500">Histórico de vagas aplicadas</p>
                </div>
            </div>

            <!-- Card: Views -->
            <div class="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:translate-y-[-4px]">
                <div class="flex items-center justify-between mb-6">
                    <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Visibilidade</p>
                        <span v-if="loadingStats" class="block h-8 w-12 bg-slate-100 animate-pulse rounded-lg ml-auto"></span>
                        <span v-else class="text-3xl font-black text-slate-900">{{ stats.visualizacoes }}</span>
                    </div>
                </div>
                <div>
                    <h3 class="font-black text-slate-900 text-lg">Visitas ao Perfil</h3>
                    <p class="text-sm font-medium text-slate-500">Empresas que viram você</p>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- Left: Recommendations (2/3) -->
            <div class="lg:col-span-2 space-y-8">
                <div class="flex items-center gap-3 mb-2 px-2">
                    <div class="w-2 h-8 bg-green-600 rounded-full"></div>
                    <h2 class="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">
                        Recomendadas para você
                    </h2>
                </div>
                <VagasRecomendadas />
            </div>

            <!-- Right: Secondary Info (1/3) -->
            <div class="space-y-8">
                <!-- Recent Applications Activity -->
                <div class="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
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
                        <NuxtLink to="/vagas" class="mt-4 text-green-600 font-black text-sm hover:underline">Buscar minha primeira vaga</NuxtLink>
                    </div>

                    <div v-else class="space-y-6">
                        <div v-for="app in recentApplications" :key="app.id" class="relative pl-6 border-l-2 border-slate-100 pb-1 last:pb-0">
                            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-green-500 shadow-sm"></div>
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors">{{ (app.vagas as any)?.titulo }}</h4>
                            </div>
                            <div class="flex items-center gap-3">
                                <span :class="{
                                    'bg-green-100 text-green-700': app.status === 'selecionado',
                                    'bg-blue-100 text-blue-700': app.status === 'enviada',
                                    'bg-purple-100 text-purple-700': app.status === 'visualizada'
                                }" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                    {{ app.status }}
                                </span>
                                <span class="text-[10px] font-bold text-slate-400 uppercase">{{ (app.vagas as any)?.local }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Strategic Callout -->
                <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/20"></div>
                    <div class="relative z-10">
                        <h4 class="font-black text-2xl mb-4 italic tracking-tight">Impulsione seu Perfil 🚀</h4>
                        <p class="text-slate-300 text-sm leading-relaxed mb-8">
                            Complete 100% do seu currículo e aumente em até **5x as chances** de ser chamado por empresas da região.
                        </p>
                        <NuxtLink to="/painel/talento/curriculo" class="flex items-center justify-center gap-2 w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-green-600/10 translate-y-0 hover:translate-y-[-2px]">
                            Completar Agora
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}
</style>
