<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFavorites } from '~/composables/useFavorites'
import type { Database } from '~/types/database.types'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'empresa-master'
})

const authStore = useAuthStore()
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

// Favorites logic
const { toggleUserFavorite, getMyFavoritedUserIds } = useFavorites()
const favoritedIds = ref<string[]>([])

const fetchFavorites = async () => {
    favoritedIds.value = await getMyFavoritedUserIds()
}

const handleToggleFavorite = async (candidateId: string) => {
    const result = await toggleUserFavorite(candidateId)
    if (!result.error) {
        // Atualiza a lista local para refletir a mudança instantaneamente
        if (result.action === 'added') {
            favoritedIds.value.push(candidateId)
        } else {
            favoritedIds.value = favoritedIds.value.filter(id => id !== candidateId)
        }
    }
}

// Fetch candidates
const fetchCandidates = async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        let query = supabase
            .from('talento_curriculos')
            .select('*')
        
        if (searchQuery.value) {
            const term = `%${searchQuery.value}%`
            query = query.or(`nome.ilike.${term},profissao.ilike.${term},objetivo_profissional.ilike.${term},biografia.ilike.${term}`)
        }

        if (selectedRole.value) {
            query = query.eq('profissao', selectedRole.value)
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

const openChat = async (candidate: any) => {
    // Diagnóstico: Verificar o estado dos IDs
    const myId = authStore.profile?.id
    const candidateId = candidate?.id

    console.log('[openChat] Iniciando chat:', { 
        me: myId, 
        target: candidateId, 
        candidateName: candidate?.nome,
        authInitialized: authStore.initialized
    })

    if (!candidateId || !myId) {
        console.error('[openChat] Falha na identificação:', { myId, candidateId, candidate })
        alert(`Não foi possível identificar o usuário.\nMeu ID: ${myId || 'ausente'}\nID Alvo: ${candidateId || 'ausente'}`)
        return
    }
    
    try {
        // IDs ordenados para manter a unicidade (p1 sempre menor que p2)
        const [p1, p2] = [myId, candidateId].sort()
        
        // Verifica se já existe uma conversa
        const { data: existing } = await supabase
            .from('conversas')
            .select('id')
            .eq('participante1_id', p1)
            .eq('participante2_id', p2)
            .maybeSingle()

        let conversaId: string

        if (existing) {
            conversaId = existing.id
        } else {
            console.log('[openChat] Criando nova conversa entre:', p1, p2)
            // Cria uma nova conversa
            const { data: created, error: createError } = await supabase
                .from('conversas')
                .insert({
                    participante1_id: p1,
                    participante2_id: p2,
                    tipo_contato: 'chat',
                    status_contratacao: 'interessado',
                    ultima_mensagem: ''
                })
                .select('id')
                .single()

            if (createError || !created) {
                console.error('[openChat] Erro ao criar conversa:', createError)
                throw createError
            }
            conversaId = created.id
        }

        // Navega para o chat interno
        console.log('[openChat] Navegando para conversa:', conversaId)
        navigateTo(`/painel/empresa/mensagens?conversa=${conversaId}`)
        
    } catch (e) {
        console.error('Erro ao abrir chat:', e)
        alert('Não foi possível abrir o chat. Verifique se as permissões (RLS) foram aplicadas.')
    }
}


// React to initialization and user changes
watch(() => [authStore.initialized, authStore.user], ([isInit, newUser]) => {
    if (isInit && (newUser as any)?.id) {
        fetchCandidates()
        fetchFavorites()
    }
}, { immediate: true })

// Tab state
const activeTab = ref('curriculo') // curriculo, pebaspro, avaliacoes

// Distance calculation (Haversine)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
}

const getAvatarInitial = (name?: string | null) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)] overflow-hidden bg-slate-50 flex flex-col md:flex-row">
    
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

                <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button 
                        @click="selectedRole = ''"
                        class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                        :class="selectedRole === '' ? 'bg-green-600 text-white shadow-md shadow-green-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                    >
                        Todos
                    </button>
                    <button 
                        v-for="role in roles" 
                        :key="role"
                        @click="selectedRole = role"
                        class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
                        :class="selectedRole === role ? 'bg-green-600 text-white shadow-md shadow-green-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                    >
                        {{ role }}
                    </button>
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
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-slate-900 truncate group-hover:text-green-700 transition-colors">
                                {{ candidate.nome }}
                            </h3>
                            <span v-if="favoritedIds.includes(candidate.id)" class="text-yellow-400 text-xs">⭐</span>
                        </div>
                        <p class="text-xs text-slate-500 font-medium truncate mb-1">
                            {{ candidate.profissao || 'Profissional' }}
                        </p>
                        <div class="flex items-center gap-2 text-xs text-slate-400">
                            <span>📍 {{ candidate.regiao || 'Na região' }}</span>
                            <span v-if="authStore.profile?.latitude && candidate.latitude" class="text-green-600 font-bold">
                                • {{ getDistance(authStore.profile.latitude, authStore.profile.longitude!, candidate.latitude, candidate.longitude).toFixed(1) }} km
                            </span>
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
            <div class="p-4 md:p-8 max-w-4xl mx-auto">
                
                <!-- Profile Header -->
                <div class="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-slate-100 mb-6 md:mb-8 flex flex-col sm:flex-row items-start gap-4 md:gap-8">
                    <div class="relative group shrink-0 self-center sm:self-start">
                         <img
                            v-if="selectedCandidate.foto"
                            :src="selectedCandidate.foto"
                            class="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl object-cover shadow-lg ring-4 ring-white"
                        />
                         <div v-else class="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-slate-100 flex items-center justify-center text-2xl md:text-4xl font-bold text-slate-300 shadow-lg ring-4 ring-white">
                            {{ getAvatarInitial(selectedCandidate.nome) }}
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <!-- Nome + botões na mesma linha, quebra se necessário -->
                        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div class="min-w-0">
                                <h1 class="text-lg md:text-2xl font-black text-slate-900 leading-tight truncate">{{ selectedCandidate.nome }}</h1>
                                <p class="text-sm md:text-base text-green-600 font-bold mt-0.5">{{ selectedCandidate.profissao }}</p>
                                <p class="text-sm text-slate-500 flex items-center gap-1 mt-0.5 flex-wrap">
                                    📍 {{ selectedCandidate.regiao || 'Na região' }}
                                    <span v-if="authStore.profile?.latitude && selectedCandidate.latitude" class="bg-green-50 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        A {{ getDistance(authStore.profile.latitude, authStore.profile.longitude!, selectedCandidate.latitude, selectedCandidate.longitude).toFixed(1) }} km
                                    </span>
                                </p>
                            </div>
                            <!-- Actions -->
                            <div class="flex gap-2 shrink-0">
                                <button
                                    @click="openChat(selectedCandidate)"
                                    class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all whitespace-nowrap"
                                >
                                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    <span class="hidden sm:inline">Enviar Mensagem</span>
                                    <span class="sm:hidden">Contato</span>
                                </button>
                                <button
                                    @click="handleToggleFavorite(selectedCandidate.id)"
                                    class="p-2 rounded-xl transition-all active:scale-95 shrink-0"
                                    :class="favoritedIds.includes(selectedCandidate.id) ? 'bg-yellow-50 text-yellow-500 border border-yellow-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
                                    :title="favoritedIds.includes(selectedCandidate.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                                >
                                    <svg class="w-5 h-5" :fill="favoritedIds.includes(selectedCandidate.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Objective / Bio -->
                        <div class="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100/50">
                            <p class="text-slate-600 leading-relaxed text-sm">
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
                        PEBASPRO Info
                    </button>
                </div>

                <!-- Tab Content: Curriculo -->
                <div v-if="activeTab === 'curriculo'" class="space-y-8 animate-in fade-in duration-300">
                    
                    <!-- Experiência -->
                    <section>
                        <h3 class="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                            <span class="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">💼</span>
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
