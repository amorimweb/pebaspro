<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  pageTransition: false,
  layoutTransition: false,
  noPadding: true // Custom property to skip container padding
})

const authStore = useAuthStore()

useSeoMeta({
  title: 'PEBASPRO - Encontre o profissional ideal',
  description: 'Conectamos você com os melhores prestadores da região de forma rápida e segura.'
})

// Remove floating and malformed onMounted block
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
    <main class="flex-grow relative pb-16">
      <BannerHero />
      
      <!-- PERSONALIZAÇÃO PARA TALENTO (Perto do Topo) -->
      <div v-if="authStore.profile?.tipo_conta === 'talento' && authStore.profile?.cadastro_completo" class="container mx-auto px-4 py-12 -mt-16 relative z-20">
        <div class="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
           <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 class="text-3xl font-black text-slate-900 tracking-tight">Vagas recomendadas para você 🎯</h2>
                <p class="text-slate-500 font-medium">Com base no seu perfil e localização.</p>
              </div>
              <NuxtLink to="/vagas" class="text-green-600 font-black flex items-center gap-2 hover:underline">
                Ver todas as vagas 
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </NuxtLink>
           </div>
           <VagasRecomendadas />
        </div>
      </div>

      <StatsSection />
      
      <CardsPrestadorEmpresa />
      <CategoriasPopulares />
      <NossaPlataforma />
      <EmpresasParceiras />
    </main>
  </div>
</template>

