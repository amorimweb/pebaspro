<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useFavorites } from '~/composables/useFavorites'
import type { Database } from '~/types/database.types'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const { toggleUserFavorite, toggleServiceFavorite } = useFavorites()

const loading = ref(true)
const activeTab = ref('usuarios') // 'usuarios' ou 'servicos'
const userFavorites = ref<any[]>([])
const serviceFavorites = ref<any[]>([])

const fetchFavorites = async () => {
    loading.value = true
    try {
        const userId = authStore.profile?.id
        if (!userId) return

        // Buscar favoritos unificados
        const { data, error } = await supabase
            .from('favoritos')
            .select(`
                id,
                favorito_usuario_id,
                servico_id,
                favorito:usuarios!favoritos_favorito_usuario_id_fkey (
                    id,
                    nome,
                    foto,
                    profissao,
                    regiao
                ),
                servico:servicos (
                    id,
                    titulo,
                    descricao,
                    preco_inicial,
                    prestador:usuarios (
                        nome,
                        foto
                    )
                )
            `)
            .eq('usuario_id', userId)

        if (error) throw error
        
        userFavorites.value = data?.filter(f => f.favorito_usuario_id).map(f => f.favorito).filter(Boolean) || []
        serviceFavorites.value = data?.filter(f => f.servico_id).map(f => f.servico).filter(Boolean) || []
        
    } catch (e) {
        console.error('Erro ao buscar favoritos:', e)
    } finally {
        loading.value = false
    }
}

const handleRemoveFavorite = async (id: string, type: 'user' | 'service') => {
    const label = type === 'user' ? 'profissional' : 'serviço'
    if (!confirm(`Deseja realmente remover este ${label} dos seus favoritos?`)) return

    const { error } = type === 'user' ? await toggleUserFavorite(id) : await toggleServiceFavorite(id)
    if (!error) {
        if (type === 'user') {
            userFavorites.value = userFavorites.value.filter(f => f.id !== id)
        } else {
            serviceFavorites.value = serviceFavorites.value.filter(f => f.id !== id)
        }
    }
}

const getAvatarInitial = (name?: string) => name?.charAt(0) || 'U'

onMounted(() => {
    fetchFavorites()
})
</script>

<template>
    <div class="max-w-6xl mx-auto">
        <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 class="text-3xl font-black text-slate-900 mb-2">Meus Favoritos</h1>
                <p class="text-slate-500 font-medium">Gerencie professionals e serviços que você destacou.</p>
            </div>
            
            <!-- Tabs -->
            <div class="flex bg-slate-100 p-1.5 rounded-2xl">
                <button 
                    @click="activeTab = 'usuarios'"
                    class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    :class="activeTab === 'usuarios' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                    Profissionais ({{ userFavorites.length }})
                </button>
                <button 
                    @click="activeTab = 'servicos'"
                    class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    :class="activeTab === 'servicos' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                    Serviços ({{ serviceFavorites.length }})
                </button>
            </div>
        </header>

        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
            <div class="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <p class="font-bold">Carregando seus destaques...</p>
        </div>

        <template v-else>
            <!-- ABA USUÁRIOS -->
            <div v-if="activeTab === 'usuarios'" class="animate-in fade-in duration-300">
                <div v-if="userFavorites.length === 0" class="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100 mt-4">
                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-50">👤</div>
                    <h3 class="text-2xl font-black text-slate-800 mb-2">Nenhum profissional favoritado</h3>
                    <p class="text-slate-500 font-medium mb-10">Use a busca de talentos para encontrar os melhores profissionais para você.</p>
                    <NuxtLink to="/painel/empresa/buscar-talentos" class="px-8 py-4 bg-green-600 text-white font-black rounded-3xl shadow-xl shadow-green-600/20 hover:scale-105 transition-all inline-block">
                        Começar a Buscar
                    </NuxtLink>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        v-for="prof in userFavorites" 
                        :key="prof.id"
                        class="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative"
                    >
                        <button 
                            @click="handleRemoveFavorite(prof.id, 'user')"
                            class="absolute top-6 right-6 p-2.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remover dos favoritos"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div class="flex items-center gap-4 mb-8">
                            <img v-if="prof.foto" :src="prof.foto" class="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50" />
                            <div v-else class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-300 ring-4 ring-slate-50">
                                {{ getAvatarInitial(prof.nome) }}
                            </div>
                            <div class="min-w-0">
                                <h3 class="font-black text-slate-900 group-hover:text-green-700 transition-colors truncate">{{ prof.nome }}</h3>
                                <p class="text-sm text-green-600 font-bold truncate">{{ prof.profissao || 'Profissional' }}</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-6 border-t border-slate-50">
                            <span class="text-xs font-bold text-slate-400">📍 {{ prof.regiao || 'Na região' }}</span>
                            <NuxtLink 
                                to="/painel/empresa/buscar-talentos"
                                class="text-sm font-black text-slate-600 hover:text-green-600 flex items-center gap-1 transition-all"
                            >
                                Ver Perfil
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ABA SERVIÇOS -->
            <div v-if="activeTab === 'servicos'" class="animate-in fade-in duration-300">
                <div v-if="serviceFavorites.length === 0" class="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100 mt-4">
                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-50">🛠️</div>
                    <h3 class="text-2xl font-black text-slate-800 mb-2">Nenhum serviço favoritado</h3>
                    <p class="text-slate-500 font-medium mb-10">Explore os serviços disponíveis na nossa plataforma e guarde os que mais gostar.</p>
                    <NuxtLink to="/servicos" class="px-8 py-4 bg-green-600 text-white font-black rounded-3xl shadow-xl shadow-green-600/20 hover:scale-105 transition-all inline-block">
                        Explorar Serviços
                    </NuxtLink>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div 
                        v-for="service in serviceFavorites" 
                        :key="service.id"
                        class="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative"
                    >
                         <button 
                            @click="handleRemoveFavorite(service.id, 'service')"
                            class="absolute top-6 right-6 p-2.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-10"
                            title="Remover dos favoritos"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div class="flex items-start gap-4 mb-6 pr-10">
                            <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100">
                                <img v-if="service.prestador?.foto" :src="service.prestador.foto" class="w-full h-full object-cover" />
                                <span v-else class="text-2xl font-black text-slate-300">{{ service.prestador?.nome?.charAt(0) }}</span>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-lg font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors truncate">
                                    {{ service.titulo }}
                                </h3>
                                <p class="text-sm font-bold text-slate-400 truncate">{{ service.prestador?.nome }}</p>
                            </div>
                        </div>

                        <p class="text-slate-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">
                            {{ service.descricao }}
                        </p>

                        <div class="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                            <div class="flex flex-col">
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">A partir de</span>
                                <span v-if="service.preco_inicial" class="text-lg font-black text-green-600">
                                    {{ Number(service.preco_inicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                                </span>
                                <span v-else class="text-lg font-black text-slate-700 italic">A combinar</span>
                            </div>
                            <NuxtLink 
                                :to="`/servicos/${service.id}`"
                                class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
