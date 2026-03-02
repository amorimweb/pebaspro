<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database.types'

import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const { user, initialized } = storeToRefs(authStore)
const supabase = useSupabaseClient<Database>()
const route = useRoute()

// State
const searchQuery = ref((route.query.search as string) || '')
const selectedRole = ref('')
const selectedCandidate = ref<any>(null)
const loading = ref(false)
const candidates = ref<any[]>([])
const showMobileList = ref(true) // Mobile navigation control
const errorMsg = ref('')

// Mock filters suitable for the region
const roles = ['Eletricista', 'Mecânico', 'Pedreiro', 'Técnico em Segurança', 'Administrativo', 'Vendas', 'Motorista', 'Enfermeiro']

// Fetch candidates
const fetchCandidates = async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        let query = supabase
            .from('talento_curriculos')
            .select('*')
        
        if (searchQuery.value) {
            // Busca aprimorada: nome ou profissão ou biografia ou objetivo
            const term = `%${searchQuery.value}%`
            query = query.or(`nome.ilike.${term},profissao.ilike.${term},objetivo_profissional.ilike.${term},biografia.ilike.${term}`)
        }

        const { data, error } = await query
            .order('updated_at', { ascending: false })
            .limit(50)

        if (error) throw error
        
        candidates.value = data || []
        
        // Auto-selecionar o primeiro se for desktop e nada estiver selecionado
        if (!selectedCandidate.value && candidates.value.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
            selectedCandidate.value = candidates.value[0]
        }
    } catch (e) {
        console.error('Error fetching candidates:', e)
    } finally {
        loading.value = false
    }
}

// Watchers for filters
let searchTimeout: any = null
watch(searchQuery, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchCandidates()
    }, 500)
})

watch(selectedRole, () => {
    fetchCandidates()
})

const selectCandidate = (candidate: any) => {
    selectedCandidate.value = candidate
    showMobileList.value = false
    // Scroll to top on mobile details view
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const backToList = () => {
    showMobileList.value = true
    selectedCandidate.value = null
}

const openWhatsApp = (phone?: string) => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}`, '_blank')
}

// React to initialization and user changes
watch([initialized, user], ([isInit, newUser]) => {
    if (isInit && newUser?.id) {
        fetchCandidates()
    }
}, { immediate: true })

// Avatar helper
const getAvatarInitial = (name?: string) => name?.charAt(0) || 'U'

// Tab state
const activeTab = ref('curriculo') // curriculo, pebaspro, avaliacoes
</script>

<template>
  <div class="h-[calc(100vh-80px)] overflow-hidden bg-slate-50 flex flex-col md:flex-row">
    
    <!-- LEFT COLUMN: Filters & List -->
    <aside 
        class="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-slate-200 flex flex-col h-full transition-transform duration-300 absolute md:relative z-10"
        :class="{ '-translate-x-full md:translate-x-0': !showMobileList && selectedCandidate }"
    >
        <!-- Search Header -->
        <div class="p-6 border-b border-slate-100 bg-white z-20">
            <h1 class="text-xl font-bold text-slate-800 mb-4">Buscar Talentos</h1>
            
            <div class="space-y-3">
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Buscar por nome ou profissão..." 
                        class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-base transition-all font-medium"
                    />
                </div>
            </div>
        </div>

        <!-- Candidates List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            <div v-if="loading" class="text-center py-10 text-slate-400">
                <div class="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Buscando...
            </div>

            <div v-else-if="candidates.length === 0" class="text-center py-10 text-slate-400">
                <p>Nenhum candidato encontrado.</p>
            </div>

            <div 
                v-else
                v-for="candidate in candidates" 
                :key="candidate.id"
                @click="selectCandidate(candidate)"
                class="group p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                :class="selectedCandidate?.id === candidate.id ? 'bg-green-50 border-green-200 ring-1 ring-green-200' : 'bg-white border-slate-100 hover:border-green-200'"
            >
                <div class="flex items-start gap-4">
                    <!-- Avatar -->
                    <div class="relative">
                        <img 
                            v-if="candidate.foto" 
                            :src="candidate.foto" 
                            class="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-100"
                        />
                        <div v-else class="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg">
                            {{ getAvatarInitial(candidate.nome) }}
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Disponível"></div>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-slate-900 truncate group-hover:text-green-700 transition-colors">
                            {{ candidate.nome }}
                        </h3>
                        <p class="text-xs text-slate-500 font-medium truncate mb-1">
                            {{ candidate.profissao || 'Profissional' }}
                        </p>
                        <div class="flex items-center gap-2 text-xs text-slate-400">
                            <span>📍 {{ candidate.regiao || 'Na região' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Fake Match Score/Badge -->
                <div v-if="candidate.habilidades && candidate.habilidades.length > 0" class="mt-3 flex flex-wrap gap-1">
                     <span 
                        v-for="skill in candidate.habilidades.slice(0, 3)" 
                        :key="skill"
                        class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-medium"
                    >
                        {{ skill }}
                    </span>
                    <span v-if="candidate.habilidades.length > 3" class="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] rounded-md">+{{ candidate.habilidades.length - 3 }}</span>
                </div>
            </div>
        </div>
    </aside>

    <!-- RIGHT COLUMN: Details View -->
    <main 
        class="flex-1 h-full overflow-y-auto bg-slate-50 relative w-full transition-transform duration-300"
        :class="{ 'translate-x-full md:translate-x-0 absolute inset-0 md:static': showMobileList && !selectedCandidate }"
    >
        <!-- Empty State -->
        <div v-if="!selectedCandidate" class="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center hidden md:flex">
            <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 opacity-50">👤</div>
            <h2 class="text-xl font-bold text-slate-700 mb-2">Selecione um candidato</h2>
            <p class="max-w-xs mx-auto">Navegue pela lista ao lado para ver os detalhes completos do perfil.</p>
        </div>

        <!-- Profile Detail -->
        <div v-if="selectedCandidate" class="min-h-full pb-20 md:pb-0">
            
            <!-- Mobile Back Header -->
            <div class="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                <button @click="backToList" class="p-2 -ml-2 hover:bg-slate-100 rounded-full">
                    <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span class="font-bold text-slate-800">Perfil do Candidato</span>
            </div>

            <!-- Profile Content -->
            <div class="p-6 md:p-10 max-w-4xl mx-auto">
                
                <!-- Profile Header -->
                <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                    <div class="relative group">
                         <img 
                            v-if="selectedCandidate.foto" 
                            :src="selectedCandidate.foto" 
                            class="w-32 h-32 rounded-3xl object-cover shadow-lg ring-4 ring-white"
                        />
                         <div v-else class="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-300 shadow-lg ring-4 ring-white">
                            {{ getAvatarInitial(selectedCandidate.nome) }}
                        </div>
                    </div>
                    
                    <div class="flex-1">
                        <div class="flex flex-col md:flex-row justify-between items-center md:items-start mb-4">
                            <div>
                                <h1 class="text-3xl font-black text-slate-900 mb-2">{{ selectedCandidate.nome }}</h1>
                                <p class="text-lg text-green-600 font-bold mb-1">{{ selectedCandidate.profissao }}</p>
                                <p class="text-slate-500 flex items-center justify-center md:justify-start gap-1">
                                    📍 {{ selectedCandidate.regiao || 'Na região' }}
                                </p>
                            </div>
                            <!-- Actions -->
                            <div class="flex gap-3 mt-4 md:mt-0">
                                <button 
                                    @click="openWhatsApp(selectedCandidate.telefone)"
                                    class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    WhatsApp
                                </button>
                                <button class="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
                                    ⭐
                                </button>
                            </div>
                        </div>
                        
                        <!-- Objective / Bio -->
                        <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                            <p class="text-slate-600 leading-relaxed text-sm md:text-base">
                                {{ selectedCandidate.biografia || selectedCandidate.objetivo_profissional || 'Este candidato ainda não adicionou uma biografia.' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex border-b border-slate-200 mb-8">
                    <button 
                        @click="activeTab = 'curriculo'"
                        class="px-6 py-3 font-bold text-sm border-b-2 transition-colors"
                        :class="activeTab === 'curriculo' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'"
                    >
                        Currículo
                    </button>
                    <button 
                         @click="activeTab = 'pebaspro'"
                        class="px-6 py-3 font-bold text-sm border-b-2 transition-colors"
                         :class="activeTab === 'pebaspro' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'"
                    >
                        PebasPro Info
                    </button>
                </div>

                <!-- Tab Content: Curriculo -->
                <div v-if="activeTab === 'curriculo'" class="space-y-8 animate-in fade-in duration-300">
                    
                    <!-- Experiência -->
                    <section>
                        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                            <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">💼</span>
                            Experiência Profissional
                        </h3>
                        
                        <div v-if="selectedCandidate.experiencia_profissional?.length" class="space-y-4">
                            <div v-for="(exp, idx) in selectedCandidate.experiencia_profissional" :key="idx" class="pl-4 border-l-2 border-slate-100 ml-4 relative">
                                <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                                <h4 class="font-bold text-slate-800">{{ exp.cargo }}</h4>
                                <p class="text-sm font-medium text-slate-500 mb-1">{{ exp.empresa }}</p>
                                <p class="text-xs text-slate-400 mb-2">{{ exp.inicio }} - {{ exp.atual ? 'Atualmente' : exp.fim }}</p>
                                <p class="text-sm text-slate-600">{{ exp.descricao }}</p>
                            </div>
                        </div>
                        <p v-else class="text-slate-400 italic text-sm">Nenhuma experiência registrada.</p>
                    </section>
                    
                    <!-- Formação -->
                    <section>
                        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                            <span class="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">🎓</span>
                            Formação Acadêmica
                        </h3>
                        
                         <div v-if="selectedCandidate.formacao_academica?.length" class="space-y-4">
                            <div v-for="(edu, idx) in selectedCandidate.formacao_academica" :key="idx" class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <h4 class="font-bold text-slate-800">{{ edu.curso }}</h4>
                                <p class="text-sm text-slate-500">{{ edu.instituicao }} • {{ edu.nivel }}</p>
                                <p class="text-xs text-slate-400 mt-1">{{ edu.status }} ({{ edu.inicio }} - {{ edu.fim }})</p>
                            </div>
                        </div>
                        <p v-else class="text-slate-400 italic text-sm">Nenhuma formação registrada.</p>
                    </section>

                    <!-- Habilidades -->
                    <section>
                        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">⚡</span>
                            Habilidades e Competências
                        </h3>
                        <div class="flex flex-wrap gap-2">
                            <span 
                                v-for="skill in selectedCandidate.habilidades" 
                                :key="skill"
                                class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200"
                            >
                                {{ skill }}
                            </span>
                            <span v-if="!selectedCandidate.habilidades?.length" class="text-slate-400 italic text-sm">Nenhuma habilidade cadastrada.</span>
                        </div>
                    </section>
                </div>

                <!-- Tab Content: PebasPro Info -->
                 <div v-if="activeTab === 'pebaspro'" class="animate-in fade-in duration-300">
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-32 bg-green-500 rounded-full filter blur-[80px] opacity-20"></div>
                        
                        <div class="relative z-10">
                            <h3 class="text-2xl font-bold mb-6">Dados da Plataforma</h3>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <p class="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Membro desde</p>
                                    <p class="text-xl font-medium">{{ new Date(selectedCandidate.created_at).toLocaleDateString() }}</p>
                                </div>
                                 <div>
                                    <p class="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Status do Perfil</p>
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                                        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                        Verificado
                                    </span>
                                </div>
                                <div>
                                    <p class="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Último Acesso</p>
                                    <p class="text-xl font-medium">Hoje</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
  </div>
</template>

<style scoped>
/* Scrollbar custom */
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
</style>
