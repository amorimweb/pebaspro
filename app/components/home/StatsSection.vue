<template>
  <section class="py-16 bg-white border-b border-slate-100">
    <div class="container mx-auto px-4">
      <!-- Cabeçalho da Seção Discreto -->
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-3 tracking-tight">
          Números que <span class="text-green-600">impressionam</span>
        </h2>
        <p class="text-slate-400 font-medium text-base">
          Resultados comprovados pela nossa comunidade
        </p>
      </div>

      <!-- Grid de Cards Elegante e Discreto -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <!-- Card 1 -->
        <div class="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-green-100 transition-all duration-300 text-center">
          <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-slate-800 mb-1">500+</div>
          <div class="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Profissionais</div>
        </div>

        <!-- Card 2 -->
        <div class="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-green-100 transition-all duration-300 text-center">
          <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.7-1.838-.097-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-slate-800 mb-1">4.8</div>
          <div class="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Avaliação Média</div>
        </div>

        <!-- Card 3 -->
        <div class="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-green-100 transition-all duration-300 text-center">
          <div class="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-slate-800 mb-1">24h</div>
          <div class="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Suporte</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Adicionar animação simples se necessário
</script>

<style scoped>
/* Estilos adicionais */
</style>
