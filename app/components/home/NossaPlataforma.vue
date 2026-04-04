<template>
  <section class="py-12 md:py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-10 md:mb-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4">
          Por que escolher <span class="text-green-600">nossa plataforma?</span>
        </h2>
        <p class="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
          Conectamos pessoas com segurança, rapidez e confiança
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-6xl mx-auto">
        <!-- Conexão Rápida -->
        <div class="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-green-100 flex flex-col items-center text-center">
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
            Conexão Rápida
          </h3>
          <p class="text-gray-600 leading-relaxed text-justify">
            Encontre profissionais qualificados em minutos. Nossa plataforma conecta você instantaneamente.
          </p>
        </div>
        
        <!-- Segurança Garantida -->
        <div class="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100 flex flex-col items-center text-center">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            Segurança Garantida
          </h3>
          <p class="text-gray-600 leading-relaxed text-justify">
            Todos os profissionais são verificados e avaliados pela nossa comunidade ativa.
          </p>
        </div>
        
        <!-- Avaliações Reais -->
        <div class="group bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-amber-100 flex flex-col items-center text-center">
          <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
            Avaliações Reais
          </h3>
          <p class="text-gray-600 leading-relaxed text-justify">
            Sistema de feedback transparente e confiável de clientes reais verificados.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
