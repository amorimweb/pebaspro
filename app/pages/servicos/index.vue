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
</script>

<template>
  <div class="services-page min-h-screen bg-slate-50 pt-24 pb-20">
    <div class="container mx-auto px-4">
      
      <!-- HEADER DA PÁGINA -->
      <div class="mb-12 text-center md:text-left">
        <h1 class="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
          Prestadores de <span class="text-green-600">Serviço</span>
        </h1>
        <p class="text-lg text-slate-500 max-w-2xl font-medium">
          Encontre os melhores profissionais de Parauapebas e região para o seu projeto.
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- BARRA LATERAL / FILTROS -->
        <aside class="w-full lg:w-80 flex-shrink-0">
          <div class="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 sticky top-32">
            <div class="mb-8">
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Busca rápida</h3>
              <div class="relative">
                <input 
                  v-model="search"
                  @keyup.enter="handleSearch"
                  type="text" 
                  placeholder="Ex: Pintura residencial" 
                  class="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 font-bold text-slate-800"
                />
                <button @click="handleSearch" class="absolute right-2 top-2 p-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20 active:scale-90 transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Categorias</h3>
              <div class="flex flex-col gap-2">
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  class="text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                  :class="selectedCategory === cat.id ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-slate-600 hover:bg-slate-50'"
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
          <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="h-64 bg-white rounded-[32px] animate-pulse"></div>
          </div>

          <div v-else-if="services?.length === 0" class="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-50">🔍</div>
            <h3 class="text-2xl font-black text-slate-800 mb-2">Nenhum serviço encontrado</h3>
            <p class="text-slate-500 font-medium">Tente ajustar seus filtros ou buscar por outra palavra-chave.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

