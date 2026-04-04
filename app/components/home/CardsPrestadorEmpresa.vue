<template>
  <section class="py-12 md:py-20 bg-gradient-to-b from-white to-slate-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-10 md:mb-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4">
          O que você está procurando?
        </h2>
        <p class="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Escolha a opção ideal para você e comece agora mesmo
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 justify-center max-w-5xl mx-auto">
        <!-- Card Encontrar Profissional -->
        <NuxtLink
          to="/empresas"
          class="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 p-8 md:p-10 rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-3">
              Encontrar Profissional
            </h3>
            <p class="text-green-50 text-base md:text-lg mb-6 text-justify">
              Conecte-se com prestadores qualificados e avaliados pela comunidade
            </p>
            
            <div class="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
              <span>Explorar profissionais</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </NuxtLink>
        
        <!-- Card Buscar Trabalhos -->
        <NuxtLink
          to="/vagas"
          class="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-8 md:p-10 rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-3">
              Buscar Trabalhos
            </h3>
            <p class="text-blue-50 text-base md:text-lg mb-6 text-justify">
              Encontre oportunidades de trabalho na sua área de atuação
            </p>
            
            <div class="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
              <span>Ver vagas disponíveis</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
