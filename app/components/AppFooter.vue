<script setup lang="ts">
const ano = new Date().getFullYear()
</script>

<template>
  <footer class="bg-slate-900 mt-10 md:mt-20 pt-12 md:pt-20 pb-10 overflow-hidden relative print:hidden">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-green-500 opacity-[0.03] rounded-full blur-[100px] -ml-48 -mt-48"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 opacity-[0.03] rounded-full blur-[100px] -mr-48 -mb-48"></div>
 
    <div class="container mx-auto px-4 relative z-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-16 md:mb-20">
        <!-- Brand & Info -->
        <div class="space-y-6">
          <img src="/PEBASPRO-logo.png" alt="PebasPro Logo" class="h-14 w-auto rounded-2xl shadow-sm" />
          <p class="text-slate-400 leading-relaxed text-sm md:text-base">
            Uma plataforma completa de conexão entre profissionais, empresas e cidadãos.
O PEBASPRO integra a economia local, facilitando o acesso a serviços, oportunidades de trabalho e recrutamento, com eficiência, transparência e impacto social direto.
          </p>
          <div class="flex items-center gap-2 text-green-400 font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Profissionais Verificados</span>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h4 class="text-white font-bold mb-6 text-lg tracking-tight">Navegação</h4>
          <ul class="space-y-4">
            <li><NuxtLink to="/vagas" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Vagas</NuxtLink></li>
            <li><NuxtLink to="/servicos" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Serviços</NuxtLink></li>
            <li><NuxtLink to="/empresas" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Empresas</NuxtLink></li>
            <li><NuxtLink to="/sobre" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sobre Nós</NuxtLink></li>
            <li><NuxtLink to="/contato" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Fale Conosco</NuxtLink></li>
            <li><NuxtLink to="/termos" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Termos de Uso</NuxtLink></li>
            <li><NuxtLink to="/privacidade" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Privacidade</NuxtLink></li>
          </ul>
        </div>

        <!-- Categorias -->
        <div>
          <h4 class="text-white font-bold mb-6 text-lg tracking-tight">Especialidades</h4>
          <ul class="space-y-4">
            <li><NuxtLink to="/vagas?q=Doméstica" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Serviços Domésticos</NuxtLink></li>
            <li><NuxtLink to="/vagas?q=Técnico" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Suporte Técnico</NuxtLink></li>
            <li><NuxtLink to="/vagas?q=Comércio" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Varejo e Comércio</NuxtLink></li>
            <li><NuxtLink to="/vagas?q=Construção" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">Construção Civil</NuxtLink></li>
          </ul>
        </div>

        <!-- Contato -->
        <div>
          <h4 class="text-white font-bold mb-6 text-lg tracking-tight">Onde Estamos</h4>
          <ul class="space-y-4">
            <li class="flex items-start gap-3 text-slate-400">
              <span class="text-green-500 mt-1">📍</span>
              <p class="text-sm">Conectando talentos e empresas da região.</p>
            </li>
            <li class="flex items-center gap-3 text-slate-400">
              <span class="text-green-500">📧</span>
              <a href="mailto:contato.pebaspro@gmail.com" class="text-sm hover:text-white truncate">contato.pebaspro@gmail.com</a>
            </li>
            <li class="flex items-center gap-3 text-slate-400">
              <span class="text-green-500">📞</span>
              <a href="tel:+5594984025172" class="text-sm hover:text-white">(94) 98402-5172</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <p class="text-slate-500 text-sm text-center md:text-left font-medium">
            © {{ ano }} PEBASPRO. Desenvolvido com ❤️ na nossa região.
          </p>
          <div class="flex gap-6">
            <NuxtLink to="/termos" class="text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium">Termos de Uso</NuxtLink>
            <NuxtLink to="/privacidade" class="text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium">Privacidade</NuxtLink>
          </div>
        </div>
        <div class="flex gap-4">
          <a href="#" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">IG</a>
          <a href="#" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">LK</a>
          <a href="#" class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all transform hover:-translate-y-1">TW</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Page-specific overrides */
</style>
