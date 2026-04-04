<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  pageTransition: false,
  layoutTransition: false,
  noPadding: true // Custom property to skip container padding
})

const authStore = useAuthStore()

const parallaxSections = ref([] as HTMLElement[])

onMounted(() => {
  const handleScroll = () => {
    parallaxSections.value.forEach((section, index) => {
      if (!section) return
      
      const rect = section.getBoundingClientRect()
      const scrolled = window.scrollY
      const rate = scrolled * (0.3 + index * 0.05) // Different speeds for each section
      
      // Only apply parallax when section is in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        section.style.transform = `translateY(${rate * 0.15}px)`
      }
    })
  }

  // Get all parallax sections
  const sections = document.querySelectorAll('.parallax-section')
  parallaxSections.value = Array.from(sections) as HTMLElement[]
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

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
      <div v-if="authStore.profile?.tipo_conta === 'talento'" class="container mx-auto px-4 py-12 -mt-16 relative z-20">
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
      
      <div class="parallax-section">
        <CardsPrestadorEmpresa />
      </div>
      <div class="parallax-section">
        <CategoriasPopulares />
      </div>
      <div class="parallax-section">
        <NossaPlataforma />
      </div>
      <div class="parallax-section">
        <EmpresasParceiras />
      </div>
    </main>
  </div>
</template>

<style scoped>
.parallax-section {
  will-change: transform;
  transition: transform 0.1s ease-out;
}
</style>
