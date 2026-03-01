<script setup lang="ts">
useHead({
  title: 'Divulgar Serviço - PebasPro',
  meta: [
    { name: 'description', content: 'Em breve você poderá divulgar seus serviços na PebasPro.' }
  ]
})
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <span class="text-4xl">🚀</span>
      </div>
      
      <h1 class="text-3xl font-black text-slate-900 tracking-tight">Novidades em Breve!</h1>
      
      <p class="text-lg text-slate-500 font-medium leading-relaxed">
        Estamos preparando um novo espaço incrível para você divulgar os seus serviços e atrair mais clientes na região.
      </p>

      <div class="pt-8">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-green-600 rounded-2xl hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20 active:scale-95"
        >
          Voltar para o Início
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
