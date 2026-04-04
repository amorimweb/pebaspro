<template>
  <section class="py-12 md:py-20 bg-slate-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-8 md:mb-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4">
          Empresas que <span class="text-green-600">confiam</span> em nós
        </h2>
        <p class="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Parceiros que escolheram nossa plataforma para conectar talentos
        </p>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
        <div
          v-for="(empresa, index) in empresas"
          :key="index"
          class="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex justify-center items-center hover:-translate-y-1 border border-gray-100"
        >
          <p class="text-xl md:text-2xl font-bold text-gray-400 group-hover:text-gray-700 font-mono transition-colors">
            {{ empresa.nome }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const empresas = [
  { nome: 'Slack' },
  { nome: 'Prudential' },
  { nome: 'Microsoft' },
  { nome: 'Zoover' },
]
</script>
