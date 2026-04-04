<script setup lang="ts">
definePageMeta({
  noPadding: false
})
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database.types'

const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const route = useRoute()
const search = ref((route.query.search as string) || '')
const debouncedSearch = ref(search.value)
const selectedCategory = ref('')

// Debounce para a busca
let searchTimeout: any = null
watch(search, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 500) // 500ms de delay
})

// Buscar serviços reais com join no prestador
const { data: services, refresh, pending, error } = await useAsyncData<any[]>('services-list', async () => {
  let query = supabase
    .from('servicos')
    .select(`
      *,
      prestador:usuarios (
        nome,
        foto,
        regiao,
        profissao
      )
    `)
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  if (debouncedSearch.value) {
    query = query.ilike('titulo', `%${debouncedSearch.value}%`)
  }

  if (selectedCategory.value) {
    query = query.eq('categoria_id', selectedCategory.value)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}, {
  watch: [debouncedSearch, selectedCategory]
})

const handleSearch = () => {
  refresh()
}

// Buscar Categorias Reais
const { data: categoriesData } = await useAsyncData<any[]>('categorias-list', async () => {
  const { data, error } = await supabase.from('categorias').select('id, nome, slug, icone').order('nome')
  if (error) throw error
  return data || []
})
const categories = computed(() => categoriesData.value || [])

// Favorites Logic
const { toggleServiceFavorite, getMyFavoritedServiceIds } = useFavorites()
const favoritedServiceIds = ref<string[]>([])

const fetchServiceFavorites = async () => {
  if (authStore.profile?.id) {
    favoritedServiceIds.value = await getMyFavoritedServiceIds()
  }
}

const handleToggleFavorite = async (e: Event, serviceId: string) => {
  e.preventDefault() // Evita navegar para a página do serviço ao clicar na estrela
  e.stopPropagation()
  
  if (!authStore.profile) {
    return navigateTo('/login')
  }

  const result = await toggleServiceFavorite(serviceId)
  if (!result.error) {
    if (result.action === 'added') {
      favoritedServiceIds.value.push(serviceId)
    } else {
      favoritedServiceIds.value = favoritedServiceIds.value.filter(id => id !== serviceId)
    }
  }
}

onMounted(() => {
  fetchServiceFavorites()
})
</script>

<template>
  <div class="services-page min-h-screen bg-slate-50 pt-20 md:pt-24 pb-12 md:pb-20">
    <div class="container mx-auto px-4">
      
      <!-- HEADER DA PÁGINA -->
      <div class="mb-8 md:mb-12 text-center md:text-left">
        <h1 class="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 mb-3 md:mb-4 uppercase tracking-tight">
          Prestadores de <span class="text-green-600">Serviço</span>
        </h1>
        <p class="text-base md:text-lg text-slate-500 max-w-2xl font-medium">
          Encontre os melhores profissionais de toda a região para o seu projeto.
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6 md:gap-8">
        <!-- BARRA LATERAL / FILTROS -->
        <aside class="w-full lg:w-80 flex-shrink-0">
          <div class="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-sm border border-slate-100 sticky top-24 md:top-32">
            <div class="mb-6 md:mb-8">
              <h3 class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 md:mb-4">Busca rápida</h3>
              <div class="relative">
                <input 
                  v-model="search"
                  @keyup.enter="handleSearch"
                  type="text" 
                  placeholder="Ex: Pintura residencial" 
                  class="w-full pl-4 pr-12 py-3.5 md:py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 font-bold text-slate-800 text-sm md:text-base"
                />
                <button @click="handleSearch" class="absolute right-1.5 top-1.5 p-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20 active:scale-90 transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </div>
            </div>

            <div>
              <h3 class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 md:mb-4">Categorias</h3>
              <div class="flex flex-row overflow-x-auto pb-2 mb-[-8px] gap-2 lg:flex-col lg:overflow-visible lg:pb-0 lg:mb-0 lg:gap-2 custom-scrollbar">
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  class="text-left px-4 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink"
                  :class="selectedCategory === cat.id ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-50 lg:bg-transparent text-slate-600 hover:bg-slate-50'"
                  @click="selectedCategory = (selectedCategory === cat.id ? '' : cat.id)"
                >
                  <span v-if="cat.icone">{{ cat.icone }}</span>
                  {{ cat.nome }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- LISTAGEM -->
        <section class="flex-grow">
          <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div v-for="i in 4" :key="i" class="h-64 bg-white rounded-[24px] md:rounded-[32px] animate-pulse"></div>
          </div>

          <div v-else-if="services?.length === 0" class="bg-white rounded-[32px] md:rounded-[40px] p-12 md:p-20 text-center border-2 border-dashed border-slate-100">
            <div class="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl md:text-4xl opacity-50">🔍</div>
            <h3 class="text-xl md:text-2xl font-black text-slate-800 mb-2">Nenhum serviço encontrado</h3>
            <p class="text-sm md:text-base text-slate-500 font-medium">Tente ajustar seus filtros ou buscar por outra palavra-chave.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <NuxtLink 
              v-for="service in services" 
              :key="service.id"
              :to="`/servicos/${service.id}`"
              class="group bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div class="flex items-start gap-4 mb-6">
                <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                  <img v-if="service.prestador?.foto" :src="service.prestador.foto" class="w-full h-full object-cover" />
                  <span v-else class="text-2xl font-black text-slate-300">{{ service.prestador?.nome?.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors truncate">
                    {{ service.titulo }}
                  </h3>
                  <p class="text-sm font-bold text-slate-400 truncate">{{ service.prestador?.nome }}</p>
                </div>
                
                <!-- Favorite Toggle -->
                <button 
                  @click="handleToggleFavorite($event, service.id)"
                  class="p-2.5 rounded-xl transition-all active:scale-90 z-20"
                  :class="favoritedServiceIds.includes(service.id) ? 'bg-yellow-50 text-yellow-500 shadow-sm border border-yellow-100' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400'"
                  :title="favoritedServiceIds.includes(service.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                >
                  <svg class="w-5 h-5" :fill="favoritedServiceIds.includes(service.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </button>
              </div>

              <p class="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                {{ service.descricao }}
              </p>

              <div class="flex items-center justify-between pt-6 border-t border-slate-50">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">A partir de</span>
                  <span v-if="service.preco_inicial" class="text-lg font-black text-green-600">
                    {{ Number(service.preco_inicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                  </span>
                  <span v-else class="text-lg font-black text-slate-700 italic">
                    A combinar
                  </span>
                </div>
                <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

