<script setup lang="ts">
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
      subtitle: 'Publique sua vaga e conecte-se com os melhores candidatos de Parauapebas.',
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
    subtitle: 'Conectamos você com os melhores prestadores de serviços e as melhores vagas de emprego da região.',
    placeholder: 'O que você procura? (Ex: Eletricista ou Vaga de TI)',
    button: 'Buscar',
    to: '/vagas'
  }
})
</script>

<template>
  <div
    class="bg-gradient-to-r from-green-700 to-teal-700 text-white text-center px-4 pt-32 h-[70vh] md:h-[80vh] flex flex-col justify-center items-center relative overflow-hidden"
  >
    <!-- Elementos Decorativos de Fundo -->
    <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
       <div class="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
       <div class="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
        {{ content.title.split(' ').slice(0, -1).join(' ') }} 
        <span class="text-green-300">{{ content.title.split(' ').pop() }}</span>
      </h1>

      <p class="text-lg md:text-2xl max-w-2xl mx-auto opacity-90 mb-12 leading-relaxed font-medium">
        {{ content.subtitle }}
      </p>

      <!-- Busca -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center w-full group/search">
        <div class="relative w-full sm:w-96 group">
          <input
            type="text"
            :placeholder="content.placeholder"
            class="w-full px-8 py-5 rounded-2xl text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-8 focus:ring-green-500/20 transition-all shadow-2xl border-2 border-transparent focus:border-green-400"
          />
          <svg class="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <NuxtLink
          :to="content.to"
          class="w-full sm:w-auto px-12 py-5 bg-white text-green-700 text-center font-black rounded-2xl hover:bg-green-50 transition-all shadow-2xl hover:shadow-green-900/20 active:scale-95 text-lg uppercase tracking-wider block"
        >
          {{ content.button }}
        </NuxtLink>
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
</style>
