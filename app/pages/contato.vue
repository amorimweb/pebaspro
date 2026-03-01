<script setup lang="ts">
const form = ref({
  nome: '',
  email: '',
  assunto: '',
  mensagem: ''
})

const loading = ref(false)
const success = ref(false)

const handleSubmit = async () => {
  loading.value = true
  // Simulação de envio
  await new Promise(resolve => setTimeout(resolve, 1500))
  loading.value = false
  success.value = true
  form.value = { nome: '', email: '', assunto: '', mensagem: '' }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">

    <main class="flex-grow py-16 md:py-24">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="flex flex-col lg:flex-row gap-16 items-start">
          
          <!-- Informações de Contato -->
          <section class="w-full lg:w-1/2 space-y-12">
            <div class="space-y-4">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Vamos <span class="text-green-600">conversar!</span>
              </h1>
              <p class="text-lg text-slate-500 max-w-md leading-relaxed">
                Tem alguma dúvida, sugestão ou precisa de suporte técnico? Nossa equipe está pronta para te ouvir.
              </p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div class="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-100 transition-colors">📍</div>
                <h3 class="font-bold text-slate-900 mb-1">Localização</h3>
                <p class="text-sm text-slate-500">Atendendo toda a região</p>
              </div>
              
              <div class="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-100 transition-colors">📧</div>
                <h3 class="font-bold text-slate-900 mb-1">E-mail</h3>
                <p class="text-sm text-slate-500 break-all">contato.pebaspro@gmail.com</p>
              </div>
              
              <div class="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-100 transition-colors">📞</div>
                <h3 class="font-bold text-slate-900 mb-1">Telefone</h3>
                <p class="text-sm text-slate-500">(94) 98402-5172</p>
              </div>
              
              <div class="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-100 transition-colors">🕒</div>
                <h3 class="font-bold text-slate-900 mb-1">Atendimento</h3>
                <p class="text-sm text-slate-500">Seg a Sex, 8h às 18h</p>
              </div>
            </div>

            <div class="p-8 bg-green-600 rounded-[32px] text-white overflow-hidden relative group">
              <div class="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
              <h3 class="text-xl font-bold mb-2">Precisa de algo urgente?</h3>
              <p class="text-green-50 mb-6 opacity-90">Fale diretamente com nosso time pelo WhatsApp agora mesmo.</p>
              <a href="https://wa.me/5594984025172" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-bold rounded-2xl shadow-lg hover:shadow-green-900/20 transition-all active:scale-95">
                Chamar no WhatsApp <span>→</span>
              </a>
            </div>
          </section>

          <!-- Formulário -->
          <section class="w-full lg:w-1/2">
            <div class="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
              <div v-if="success" class="py-12 flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div class="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mb-8 animate-bounce">
                  ✓
                </div>
                <h2 class="text-3xl font-black text-slate-900 mb-4">Mensagem Enviada!</h2>
                <p class="text-slate-500 mb-10 max-w-xs">Agradecemos o seu contato. Nossa equipe retornará em até 24 horas úteis.</p>
                <button @click="success = false" class="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors">
                  Enviar outra mensagem
                </button>
              </div>

              <form v-else @submit.prevent="handleSubmit" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Seu Nome</label>
                    <input v-model="form.nome" type="text" placeholder="Ex: João Silva" required 
                      class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 transition-all outline-none font-medium" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Seu E-mail</label>
                    <input v-model="form.email" type="email" placeholder="joao@exemplo.com" required 
                      class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 transition-all outline-none font-medium" />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Assunto</label>
                  <select v-model="form.assunto" required 
                    class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 transition-all outline-none font-medium appearance-none">
                    <option value="" disabled selected>Sobre o que quer falar?</option>
                    <option value="duvida">Dúvida Geral</option>
                    <option value="suporte">Suporte Técnico</option>
                    <option value="vagas">Sobre as Vagas</option>
                    <option value="outro">Outros Assuntos</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Sua Mensagem</label>
                  <textarea v-model="form.mensagem" rows="5" placeholder="Como podemos te ajudar hoje?" required 
                    class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-400 transition-all outline-none font-medium resize-none"></textarea>
                </div>

                <button type="submit" :disabled="loading" 
                  class="w-full py-5 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95">
                  {{ loading ? 'Enviando...' : 'Enviar Mensagem' }}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>

  </div>
</template>

<style scoped>
/* Transições e toques extras */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
  background-size: 1.5em;
}
</style>
