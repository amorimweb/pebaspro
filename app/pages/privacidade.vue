<script setup lang="ts">
definePageMeta({
  noPadding: true
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-32 pb-20">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100">
        <h1 class="text-3xl md:text-5xl font-black text-slate-900 mb-8">Política de <span class="text-green-600">Privacidade</span></h1>
        
        <div class="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed font-medium">
          <p>A sua privacidade é fundamental para nós. Esta política explica como coletamos, usamos e protegemos suas informações no PebasPro.</p>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">1. Coleta de Informações</h2>
            <p>Coletamos dados necessários para o funcionamento da plataforma, como nome, e-mail, telefone, CPF/CNPJ, fotos de perfil e informações profissionais fornecidas durante o cadastro ou preenchimento do currículo.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">2. Uso dos Dados</h2>
            <p>Seus dados são utilizados para:</p>
            <ul class="list-disc pl-5 space-y-2">
              <li>Criar e gerenciar sua conta;</li>
              <li>Exibir seu perfil profissional para contratantes;</li>
              <li>Facilitar a comunicação entre usuários;</li>
              <li>Melhorar nossos serviços e segurança.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">3. Compartilhamento</h2>
            <p>Ao criar um perfil público (como Talento ou Prestador), certas informações serão visíveis para outros usuários da plataforma. Nós não vendemos seus dados para terceiros.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">4. Segurança</h2>
            <p>Empregamos medidas técnicas para proteger seus dados contra acessos não autorizados. No entanto, nenhum sistema é 100% seguro; utilize senhas fortes e não as compartilhe.</p>
          </section>

          <section>
            <h2 class="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider">5. Seus Direitos</h2>
            <p>Você pode solicitar a correção ou exclusão dos seus dados a qualquer momento através das configurações de perfil ou entrando em contato com nosso suporte.</p>
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
