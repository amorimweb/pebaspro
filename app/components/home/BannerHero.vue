<script setup lang="ts">
import { SearchX } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const content = computed(() => {
  const tipo = authStore.profile?.tipo_conta
  
  if (tipo === 'talento') {
    return {
      title: 'A vaga dos seus sonhos está aqui',
      subtitle: 'Explore centenas de oportunidades nas melhores empresas da região.',
      placeholder: 'Buscar vagas ou empresas...',
      button: 'Buscar Vagas',
      to: '/vagas'
    }
  }

  if (tipo === 'empresa') {
    return {
      title: 'Encontre o talento certo agora',
      subtitle: 'Publique sua vaga e conecte-se com os melhores candidatos da nossa região.',
      placeholder: 'Buscar talentos (Ex: Vendedor, TI)...',
      button: 'Buscar Talentos',
      to: '/painel/empresa/buscar-talentos'
    }
  }

  if (tipo === 'prestador') {
    return {
      title: 'Aumente sua vitrine de serviços',
      subtitle: 'Receba propostas de clientes e gerencie sua agenda com facilidade.',
      placeholder: 'Ver novos serviços...',
      button: 'Ver Serviços',
      to: '/servicos'
    }
  }

  // VISITANTE (DEFAULT)
  return {
    title: 'Encontre o que você precisa',
    subtitle: 'Conectamos você com os melhores prestadores de serviços e as melhores empresas da região.'
  }
})

const searchQuery = ref('')
const results = ref<any[]>([])
const isSearching = ref(false)
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
let debounceTimeout: any = null

const onInput = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  if (searchQuery.value.trim().length < 2) {
    results.value = []
    showDropdown.value = false
    return
  }

  showDropdown.value = true
  isSearching.value = true

  debounceTimeout = setTimeout(async () => {
    try {
      const { data } = await useFetch('/api/search-unified', {
        query: { q: searchQuery.value.trim() }
      })
      results.value = (data.value as any[]) || []
    } catch (e) {
      console.error(e)
    } finally {
      isSearching.value = false
    }
  }, 400) // 400ms debounce
}

const selectResult = (url: string) => {
  showDropdown.value = false
  navigateTo(url)
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div
    class="bg-gradient-to-r from-green-700 to-teal-700 text-white text-center px-4 pt-32 pb-20 md:pt-44 md:pb-28 h-auto min-h-[640px] md:min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center relative overflow-visible"
  >
    <!-- Elementos Decorativos de Fundo -->
    <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
       <div class="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
       <div class="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto w-full">
      <h1 class="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-[1.1]">
        {{ content.title.split(' ').slice(0, -1).join(' ') }} 
        <span class="text-green-300">{{ content.title.split(' ').pop() }}</span>
      </h1>

      <p class="text-base sm:text-lg md:text-2xl max-w-2xl mx-auto opacity-90 mb-8 md:mb-12 leading-relaxed font-medium px-4">
        {{ content.subtitle }}
      </p>

      <!-- Busca Ao Vivo -->
      <div class="flex flex-col items-center w-full group/search relative mb-6 md:mb-8 z-50 px-2" ref="dropdownRef">
        <div class="relative w-full max-w-2xl mx-auto group z-50">
          <input
            v-model="searchQuery"
            @input="onInput"
            @focus="() => { if (results.length > 0) showDropdown = true }"
            type="text"
            placeholder="Busque serviços ou empresas..."
            class="w-full px-6 md:px-8 py-4 md:py-5 rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-8 focus:ring-green-500/20 transition-all shadow-2xl border-2 border-transparent focus:border-green-400 text-base md:text-lg"
          />
          <svg v-if="!isSearching" class="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-green-500 transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div v-else class="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>

        <!-- Dropdown de Resultados -->
        <div v-if="showDropdown && (results.length > 0 || searchQuery.length >= 2 && !isSearching)" class="absolute top-[80px] w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in text-left">
          
          <div v-if="results.length > 0" class="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            <button
              v-for="item in results"
              :key="item.type + item.id"
              @click="selectResult(item.url)"
              class="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
            >
              <div class="w-14 h-14 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                <span v-else class="text-xl font-bold text-slate-400 uppercase">{{ item.title.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900 text-lg truncate group-hover:text-green-600 transition-colors">{{ item.title }}</p>
                <p class="text-sm font-medium text-slate-500 truncate">{{ item.subtitle }}</p>
              </div>
              <div class="flex-shrink-0 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-black uppercase tracking-wider rounded-xl border border-green-100 hidden sm:block">
                {{ item.type === 'empresa' ? 'Empresa' : (item.type === 'prestador' ? 'Prestador' : 'Serviço') }}
              </div>
            </button>
          </div>

          <!-- Dica Padrão quando nenhum resultado exato -->
          <div v-else class="p-10 text-center text-slate-500">
            <SearchX :size="48" class="mx-auto mb-4 opacity-50" />
            <p class="font-black text-slate-800 text-xl">Nenhum resultado direto</p>
            <p class="font-medium text-slate-500 text-sm mt-2 mb-6">Tente outras palavras ou busque no diretório completo.</p>
            
            <div class="flex items-center justify-center gap-4 text-sm">
               <NuxtLink :to="`/servicos?search=${searchQuery}`" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Buscar em Serviços
               </NuxtLink>
               <NuxtLink :to="`/empresas?search=${searchQuery}`" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Buscar em Empresas
               </NuxtLink>
            </div>
          </div>

        </div>
      </div>

      <div v-if="authStore.user" class="mt-4 animate-fade-in delay-500">
         <p class="text-white/60 text-sm font-bold uppercase tracking-widest">Acesso rápido para {{ authStore.profile?.tipo_conta || 'você' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Adicionando um efeito de entrada suave */
h1, p, .group\/search {
  animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* Custom Scrollbar for Dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
