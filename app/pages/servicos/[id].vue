<script setup lang="ts">
definePageMeta({
  noPadding: false
})
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const route = useRoute()
const id = route.params.id
const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const { translateError } = useTranslation()

// Buscar dados do serviço com join no prestador
const { data: service, error } = useAsyncData(`service-${id}`, async () => {
  const { data, error } = await supabase
    .from('servicos')
    .select(`
      *,
      prestador:usuarios (*)
    `)
    .eq('id', id as string)
    .single()
  
  if (error) throw error
  return data
}, { lazy: true })

const openInternalChat = async () => {
  if (!authStore.user) {
    alert('Você precisa estar logado para entrar em contato.')
    return navigateTo('/login')
  }

  try {
     if (!service.value || !service.value.prestador) return

     const [p1, p2] = [authStore.user.id, service.value.prestador.id].sort()
     
     // Find or create conversation
     const { data: existing } = await supabase
        .from('conversas')
        .select('id')
        .eq('participante1_id', p1)
        .eq('participante2_id', p2)
        .maybeSingle()

     let conversaId = existing?.id

     if (!conversaId) {
        const { data: newConv, error } = await supabase
            .from('conversas')
            .insert({
                participante1_id: p1,
                participante2_id: p2,
                tipo_contato: 'interno',
                status_contratacao: 'interessado',
                ultima_mensagem: `Interesse no serviço: ${service.value.titulo}`
            })
            .select('id')
            .single()
        
        if (error) throw error
        conversaId = newConv.id
     }

     return navigateTo(`/painel/mensagens?id=${conversaId}`)

  } catch (e) {
      console.error('Erro ao iniciar chat:', translateError(e))
  }
}

const openWhatsApp = async () => {
  if (!authStore.user) {
    alert('Você precisa estar logado para entrar em contato.')
    return navigateTo('/login')
  }

  // Registrar interesse em "Conversas" para o CRM do painel
  try {
     if (!service.value || !service.value.prestador) return

     const [p1, p2] = [authStore.user.id, service.value.prestador.id].sort()
     
     const { data: existing } = await supabase
        .from('conversas')
        .select('id')
        .eq('participante1_id', p1)
        .eq('participante2_id', p2)
        .maybeSingle()

     if (existing) {
        await supabase
            .from('conversas')
            .update({ 
                updated_at: new Date().toISOString(),
                tipo_contato: 'whatsapp',
                ultima_mensagem: `Interesse no serviço: ${service.value.titulo}`
            })
            .eq('id', existing.id)
     } else {
        await supabase
            .from('conversas')
            .insert({
                participante1_id: p1,
                participante2_id: p2,
                tipo_contato: 'whatsapp',
                status_contratacao: 'interessado',
                ultima_mensagem: `Interesse no serviço: ${service.value.titulo}`
            })
     }

     // Legado (opcional): mantém registro em solicitacoes_orcamento
     if (!service.value || !authStore.user) return

     await supabase.from('solicitacoes_orcamento').insert({
        servico_id: service.value.id,
        cliente_id: authStore.user.id,
        mensagem: 'Interesse via botão WhatsApp'
     })
  } catch (e) {
      console.error('Erro ao registrar interesse:', translateError(e))
  }

  const phone = service.value?.prestador?.telefone?.replace(/\D/g, '')
  if (!phone) {
      alert('Prestador sem telefone cadastrado.')
      return
  }
  const message = encodeURIComponent(`Olá ${service.value?.prestador?.nome || ''}, vi seu serviço de "${service.value?.titulo || ''}" no PEBASPRO e gostaria de um orçamento.`)
  window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')
}
</script>

<template>
  <div class="service-detail-page min-h-screen bg-slate-50 pt-16 md:pt-24 pb-20">
    <div v-if="service" class="container mx-auto px-4">
      
       <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
        <!-- ÁREA PRINCIPAL -->
        <div class="flex-grow space-y-6 md:space-y-8">
          <!-- CARD PRINCIPAL -->
          <div class="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-sm border border-slate-100">
            <div class="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
              <span class="px-3 py-1 md:px-4 md:py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
                Serviço Verificado
              </span>
              <span class="text-slate-400 text-xs md:text-sm font-bold">Postado em {{ new Date(service.created_at).toLocaleDateString() }}</span>
            </div>
 
            <h1 class="text-2xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 leading-tight">
              {{ service.titulo }}
            </h1>
 
            <div class="prose prose-slate max-w-none mb-8 md:mb-12">
               <div class="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium">
                 {{ service.descricao }}
               </div>
            </div>

            <!-- Preço e CTA Mobile -->
            <div class="lg:hidden p-6 md:p-8 bg-slate-50 rounded-[28px] md:rounded-[32px] border border-slate-100 text-center">
               <p class="text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2">Orçamento inicial</p>
               <div class="text-3xl md:text-4xl font-black text-green-600 mb-4 md:mb-6">
                 {{ Number(service.preco_inicial || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
               </div>
               <button @click="openInternalChat" class="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all mb-3">
                 Conversar Agora
               </button>
               <button @click="openWhatsApp" class="w-full py-4 md:py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-600/20 active:scale-95 transition-all">
                 Chamar no WhatsApp
               </button>
            </div>
          </div>

          <!-- CARD DO PRESTADOR -->
          <div class="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-sm border border-slate-100">
            <h3 class="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-green-600 mb-6 md:mb-8 flex items-center gap-2">
                <span class="w-6 md:w-8 h-px bg-green-200"></span> Sobre o Profissional
            </h3>
            
            <div class="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <div class="w-28 h-28 md:w-40 md:h-40 bg-slate-100 rounded-[24px] md:rounded-[40px] overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                <img v-if="service.prestador?.foto" :src="service.prestador.foto" class="w-full h-full object-cover" />
                <span v-else class="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black text-slate-300">{{ service.prestador?.nome?.charAt(0) }}</span>
              </div>
              
              <div class="flex-1 text-center md:text-left">
                <h4 class="text-xl md:text-2xl font-black text-slate-900 mb-1 md:mb-2">{{ service.prestador?.nome }}</h4>
                <p class="text-green-600 font-bold mb-3 md:mb-4 uppercase text-xs md:text-sm tracking-wider">{{ service.prestador?.profissao }}</p>
                <p class="text-slate-500 font-medium leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                  {{ service.prestador?.sobre_mim || 'Profissional qualificado pronto para atender suas necessidades com excelência e pontualidade.' }}
                </p>
                <div class="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                  <div class="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 rounded-xl text-slate-600 text-[11px] md:text-sm font-bold">📍 {{ service.prestador?.regiao || 'Nossa Região' }}</div>
                  <div class="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 rounded-xl text-slate-600 text-[11px] md:text-sm font-bold">✅ Perfil Verificado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR DESKTOP -->
        <aside class="hidden lg:block w-96 flex-shrink-0">
          <div class="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 sticky top-32">
             <div class="mb-8">
                <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Preço Inicial</p>
                <div class="text-4xl font-black text-green-600">
                  {{ Number(service.preco_inicial || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                </div>
                <p class="text-slate-400 text-xs mt-2 font-medium">* Valor base, solicite orçamento para detalhes.</p>
             </div>

             <button @click="openInternalChat" class="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all mb-3 flex items-center justify-center gap-3">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               Chat Interno
             </button>

             <button @click="openWhatsApp" class="w-full py-5 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-500 active:scale-95 transition-all mb-6 flex items-center justify-center gap-3">
               <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
               WhatsApp
             </button>

             <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
               <h4 class="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Garantias PEBASPRO</h4>
               <ul class="space-y-3">
                 <li class="flex items-center gap-3 text-sm text-slate-500 font-bold">
                   <span class="text-green-500">✔</span> Profissional Verificado
                 </li>
                 <li class="flex items-center gap-3 text-sm text-slate-500 font-bold">
                   <span class="text-green-500">✔</span> Contato Direto
                 </li>
                 <li class="flex items-center gap-3 text-sm text-slate-500 font-bold">
                   <span class="text-green-500">✔</span> Suporte da Plataforma
                 </li>
               </ul>
             </div>
          </div>
        </aside>
      </div>

    </div>
  </div>
</template>

