<template>
  <section class="py-12 md:py-20 bg-slate-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-8 md:mb-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4">
          Categorias <span class="text-green-600">Populares</span>
        </h2>
        <p class="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Profissionais qualificados nas áreas mais procuradas
        </p>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
        <!-- Eletricista -->
        <NuxtLink to="/servicos?search=Eletricista" class="group cursor-pointer">
          <div class="bg-white p-6 md:p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-center font-bold text-gray-800 text-sm md:text-base group-hover:text-yellow-600 transition-colors">
              Eletricista
            </h3>
          </div>
        </NuxtLink>
        
        <!-- Pintor -->
        <NuxtLink to="/servicos?search=Pintor" class="group cursor-pointer">
          <div class="bg-white p-6 md:p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-400">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 class="text-center font-bold text-gray-800 text-sm md:text-base group-hover:text-purple-600 transition-colors">
              Pintor
            </h3>
          </div>
        </NuxtLink>
        
        <!-- Diarista -->
        <NuxtLink to="/servicos?search=Diarista" class="group cursor-pointer">
          <div class="bg-white p-6 md:p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-400">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 class="text-center font-bold text-gray-800 text-sm md:text-base group-hover:text-blue-600 transition-colors">
              Diarista
            </h3>
          </div>
        </NuxtLink>
        
        <!-- Mecânico -->
        <NuxtLink to="/servicos?search=Mecânico" class="group cursor-pointer">
          <div class="bg-white p-6 md:p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-400">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-center font-bold text-gray-800 text-sm md:text-base group-hover:text-red-600 transition-colors">
              Mecânico
            </h3>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
