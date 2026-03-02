<script setup lang="ts">
definePageMeta({
  noPadding: true
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-32 pb-20">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100">
        <h1 class="text-3xl md:text-5xl font-black text-slate-900 mb-8">Termos de <span class="text-green-600">Uso</span></h1>
        
        <div class="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed font-medium">
          <p>Bem-vindo ao PebasPro. Ao acessar ou usar nossa plataforma, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Leia-os atentamente.</p>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">1. Aceitação dos Termos</h2>
            <p>Ao utilizar os serviços do PebasPro, você declara ser maior de idade e capaz, aceitando integralmente estas condições. Caso discorde de qualquer parte, deve interromper o uso imediatamente.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">2. Descrição do Serviço</h2>
            <p>O PebasPro é uma plataforma de intermediação que conecta profissionais (TALENTOS e PRESTADORES) com tomadores de serviços (EMPRESAS e CLIENTES) em Parauapebas e região. Não somos empregadores, agenciadores ou representantes de nenhuma das partes.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">3. Cadastro e Segurança</h2>
            <p>O usuário é responsável pela veracidade dos dados informados e pela guarda de sua senha. Contas com informações falsas ou utilizadas para fins ilícitos serão suspensas sem aviso prévio.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">4. Responsabilidades</h2>
            <p>A responsabilidade pela execução do serviço, pagamentos e conduta profissional é exclusiva dos usuários. O PebasPro não se responsabiliza por danos, prejuízos ou inadimplência decorrentes das conexões feitas na plataforma.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">5. Modificações</h2>
            <p>Reservamo-nos o direito de alterar estes termos a qualquer momento. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.</p>
          </section>

          <p class="pt-8 text-sm text-slate-400">Última atualização: Março de 2026</p>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-50 flex justify-center">
          <NuxtLink to="/" class="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 text-sm uppercase tracking-widest">
            Voltar para a Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
