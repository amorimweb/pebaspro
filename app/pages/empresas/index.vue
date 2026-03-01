<script setup lang="ts">
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const search = ref((route.query.search as string) || '')
const debouncedSearch = ref(search.value)

// Debounce para a busca
let searchTimeout: any = null
watch(search, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 500)
})

// Busca todas as empresas (usuários do tipo empresa) que completaram o cadastro
const { data: companies, refresh, pending } = await useAsyncData('companies-list', async () => {
  let query = supabase
    .from('usuarios')
    .select('*')
    .in('tipo_conta', ['empresa', 'prestador'])
    .eq('cadastro_completo', true)
  
  if (debouncedSearch.value) {
    query = query.or(`nome.ilike.%${debouncedSearch.value}%,profissao.ilike.%${debouncedSearch.value}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}, {
  watch: [debouncedSearch]
})

const handleSearch = () => {
  refresh()
}

// SEO
useHead({
  title: 'Vitrine de Empresas - PebasPro',
  meta: [
    { name: 'description', content: 'Conheça as empresas parceiras da PebasPro e veja as vagas abertas.' }
  ]
})
</script>

<template>
  <div class="bg-slate-50 min-h-screen pt-24 pb-20">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Empresas e <span class="text-green-600">Profissionais</span></h1>
        <p class="text-lg text-slate-500 font-medium">Conheça quem está contratando e prestando serviços na nossa região.</p>
      </header>

      <!-- Barra de Busca -->
      <div class="max-w-2xl mx-auto mb-16">
        <div class="bg-white p-2 rounded-2xl flex shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
          <input 
            v-model="search" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Buscar por nome ou profissão..." 
            class="flex-1 bg-transparent border-none px-6 outline-none text-slate-700 font-medium placeholder:text-slate-400"
          />
          <button @click="handleSearch" class="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 active:scale-95 transition-all">
            Buscar
          </button>
        </div>
      </div>

      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div v-for="i in 3" :key="i" class="h-64 bg-white rounded-[24px] animate-pulse shadow-sm border border-slate-100"></div>
      </div>

      <!-- Grid de Empresas -->
      <div v-else-if="companies && companies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink v-for="company in companies" :key="company.id" :to="`/empresas/${company.id}`" class="group bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 hover:border-green-500/30 transition-all duration-300 flex flex-col">
          <div class="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl font-black text-green-600 mb-6 overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform">
            <img v-if="company.foto" :src="company.foto" :alt="company.nome || ''" class="w-full h-full object-cover" />
            <span v-else>{{ company.nome?.charAt(0) }}</span>
          </div>
          <div class="flex-1">
            <div class="text-xs font-black text-green-600 uppercase tracking-widest mb-2">
              {{ company.profissao || (company.tipo_conta === 'prestador' ? 'Prestador de Serviço' : 'Empresa Parceira') }}
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-2 group-hover:text-green-700 transition-colors">{{ company.nome }}</h3>
            <p class="text-sm font-bold text-slate-500 mb-4">📍 {{ company.regiao || 'Localização não informada' }}</p>
            <p class="text-slate-600 font-medium leading-relaxed line-clamp-2">{{ company.sobre_mim || 'Clique para ver o perfil completo e vagas desta empresa.' }}</p>
          </div>
          <div class="mt-8 pt-6 border-t border-slate-50">
            <span class="flex items-center gap-2 text-green-600 font-bold text-sm">
              Ver Detalhes e Vagas
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-20">
        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-50">🏢</div>
        <p class="text-xl font-bold text-slate-600 mb-2">Nenhuma empresa encontrada</p>
        <p class="text-slate-400 font-medium">Tente ajustar os termos da sua busca.</p>
      </div>
    </main>
  </div>
</template>
