<script setup lang="ts">
import { 
  MessageSquare, Send, CheckCheck, Clock, 
  User, Search, MoreVertical, Phone,
  CheckCircle2, AlertCircle, ArrowLeft,
  ChevronRight, Briefcase, Zap
} from 'lucide-vue-next'

definePageMeta({ layout: 'empresa-master' })

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()
const participantId = computed(() => authStore.profile?.id || user.value?.id || null)

const {
  loading, loadingMessages, conversations, messages, activeConversationId,
  fetchConversations, fetchMessages, sendMessage, updateStatus,
  subscribeToMessages, subscribeToConversations
} = useMensagens(participantId)

const { atualizarStatusCandidatura } = useAdmissao()

// State
const newMessage = ref('')
const searchTerm = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const toast = ref<{ msg: string; tipo: 'ok' | 'erro'; action?: { label: string, to: string } } | null>(null)
let unsubscribeMessages: (() => void) | null = null
let unsubscribeConversations: (() => void) | null = null

// Computed
const filteredConversations = computed(() => {
  if (!searchTerm.value) return conversations.value
  const term = searchTerm.value.toLowerCase()
  return conversations.value.filter(c => 
    c.otherUser?.nome?.toLowerCase().includes(term) || 
    c.vaga?.titulo?.toLowerCase().includes(term)
  )
})

const activeConv = computed(() => 
  conversations.value.find(c => c.id === activeConversationId.value)
)

const orderedMessages = computed(() => {
  return [...messages.value].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
})

// Init — carregar conversas e tratar query param ?conversa=
const initMensagens = async () => {
  await fetchConversations()
  if (!unsubscribeConversations) {
    unsubscribeConversations = subscribeToConversations(() => fetchConversations())
  }
  const conversaId = (route.query.conversa || route.query.id) as string
  if (conversaId) {
    await selectConversation(conversaId)
  }
}

// Lifecycle — aguarda user.id estar pronto (auth pode ter objeto parcial sem id)
onMounted(() => {
  if (participantId.value) {
    initMensagens()
  } else {
    const stop = watch(
      () => participantId.value,
      (id) => {
        if (id) { stop(); initMensagens() }
      }
    )
  }
})

onUnmounted(() => {
  if (unsubscribeMessages) unsubscribeMessages()
  if (unsubscribeConversations) unsubscribeConversations()
})

// Methods
const selectConversation = async (id: string) => {
  if (activeConversationId.value === id) return
  
  if (unsubscribeMessages) unsubscribeMessages()
  activeConversationId.value = id
  
  await fetchMessages(id)
  unsubscribeMessages = subscribeToMessages(id, (msg) => {
    messages.value.push(msg)
    scrollToBottom()
  })
  
  scrollToBottom()
}

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !activeConversationId.value) return
  const text = newMessage.value
  newMessage.value = ''
  
  try {
    await sendMessage(activeConversationId.value, text)
    scrollToBottom()
  } catch (e: any) {
    newMessage.value = text
    mostrarToast('Erro ao enviar mensagem', 'erro')
  }
}

const handleUpdateStatus = async (status: string) => {
  if (!activeConversationId.value || !activeConv.value) return
  
  try {
    await updateStatus(activeConversationId.value, status)
    
    // Se marcou como contratado, tentar vincular com Admissão Digital
    if (status === 'contratado') {
      await vincularComAdmissao()
    } else {
      mostrarToast(`Status atualizado para ${status}`, 'ok')
    }
  } catch (e) {
    mostrarToast('Erro ao atualizar status', 'erro')
  }
}

const vincularComAdmissao = async () => {
  const conv = activeConv.value
  if (!conv.vaga_id || !conv.otherUser?.id) {
    mostrarToast('Candidato marcado como contratado!', 'ok')
    return
  }

  try {
    // 1. Buscar a candidatura vinculada
    const { data: cand } = await supabase
      .from('candidaturas')
      .select('id')
      .eq('vaga_id', conv.vaga_id)
      .eq('talento_id', conv.otherUser.id)
      .single()

    if (cand) {
      // 2. Atualizar status da candidatura para 'Aprovado' (que desbloqueia o botão de Admissão Digital)
      await atualizarStatusCandidatura(cand.id, 'Aprovado')
      mostrarToast('Candidato aprovado para contratação!', 'ok', { 
        label: 'Ir para Admissão', 
        to: '/painel/empresa/admissao' 
      })
    } else {
       mostrarToast('Candidato marcado como contratado!', 'ok')
    }
  } catch (e) {
    console.warn('Não foi possível vincular automaticamente com a Candidatura', e)
    mostrarToast('Candidato marcado como contratado!', 'ok')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const mostrarToast = (msg: string, tipo: 'ok' | 'erro' = 'ok', action?: any) => {
  toast.value = { msg, tipo, action }
  setTimeout(() => { if (toast.value?.msg === msg) toast.value = null }, 6000)
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (date: string) => {
  const d = new Date(date)
  if (new Date().toDateString() === d.toDateString()) return 'Hoje'
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
}
</script>

<template>
  <div class="h-[calc(100vh-5rem)] md:h-[calc(100vh-9rem)] flex flex-col animate-in">
    
    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="toast" class="fixed bottom-8 right-8 z-[200] flex items-center justify-between gap-6 px-6 py-4 rounded-2xl shadow-2xl bg-slate-900 text-white min-w-[320px]">
        <div class="flex items-center gap-3">
          <CheckCircle2 v-if="toast.tipo === 'ok'" class="text-green-400" :size="20" />
          <AlertCircle v-else class="text-red-400" :size="20" />
          <span class="text-sm font-bold">{{ toast.msg }}</span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink v-if="toast.action" :to="toast.action.to" class="text-xs font-black uppercase tracking-widest text-[#1FAE66] hover:text-green-300 transition-colors">
            {{ toast.action.label }}
          </NuxtLink>
          <button @click="toast = null" class="opacity-50 hover:opacity-100 transition-opacity"><ArrowLeft class="rotate-90" :size="16" /></button>
        </div>
      </div>
    </Transition>

    <div class="flex-1 bg-white rounded-[32px] shadow-sm border border-slate-100 flex overflow-hidden">
      
      <!-- List Panel -->
      <aside class="w-full md:w-96 border-r border-slate-50 flex flex-col bg-slate-50/20 shrink-0" :class="{ 'hidden md:flex': activeConversationId }">
        <!-- Header -->
        <div class="p-6 bg-white border-b border-slate-50">
          <h2 class="text-xl font-black text-[#0D2E5C] mb-4">Mensagens</h2>
          <div class="relative group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" :size="18" />
            <input 
              v-model="searchTerm"
              type="text" 
              placeholder="Buscar contatos ou vagas..." 
              class="w-full h-11 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <!-- Scrollable List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div v-if="loading && conversations.length === 0" class="p-10 text-center space-y-4">
            <div class="w-8 h-8 border-2 border-slate-200 border-t-[#1FAE66] rounded-full animate-spin mx-auto" />
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando conexões...</p>
          </div>

          <div v-else-if="filteredConversations.length === 0" class="p-10 text-center space-y-3">
            <MessageSquare class="mx-auto text-slate-200" :size="40" />
            <p class="text-sm font-medium text-slate-400">Nenhuma conversa encontrada.</p>
          </div>

          <div v-else class="divide-y divide-slate-50/50">
            <div 
              v-for="conv in filteredConversations" 
              :key="conv.id"
              @click="selectConversation(conv.id)"
              class="group relative p-5 cursor-pointer transition-all hover:bg-white flex gap-4"
              :class="activeConversationId === conv.id ? 'bg-white shadow-[inset_4px_0_0_0_#1FAE66]' : ''"
            >
              <!-- Avatar -->
              <div class="shrink-0 relative">
                <div class="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden group-hover:border-[#1FAE66]/30 transition-all">
                  <img v-if="conv.otherUser?.foto" :src="conv.otherUser.foto" class="w-full h-full object-cover">
                  <div v-else class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 font-black text-xl">
                    {{ conv.otherUser?.nome?.charAt(0) || '?' }}
                  </div>
                </div>
                <div v-if="conv.tipo_contato === 'whatsapp'" class="absolute -bottom-1 -right-1 w-6 h-6 bg-[#25D366] text-white rounded-lg flex items-center justify-center shadow-md ring-2 ring-white">
                  <Phone :size="12" fill="currentColor" />
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold text-slate-900 truncate group-hover:text-[#1FAE66] transition-colors">
                    {{ conv.otherUser?.nome || 'Talento' }}
                  </h3>
                  <span class="text-[10px] font-black text-slate-300 uppercase shrink-0 ml-2">
                    {{ formatDate(conv.updated_at) }}
                  </span>
                </div>

                <p v-if="conv.vaga" class="text-[10px] font-black text-green-600 uppercase tracking-widest truncate mb-1">
                  {{ conv.vaga.titulo }}
                </p>

                <div class="flex items-center justify-between">
                  <p class="text-sm text-slate-400 truncate pr-4 font-medium h-5">
                    {{ conv.ultima_mensagem || 'Inicie a conversa...' }}
                  </p>
                  <span v-if="conv.status_contratacao === 'contratado'" class="w-2 h-2 rounded-full bg-[#1FAE66]" title="Contratado" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Chat Panel -->
      <main v-if="activeConversationId" class="flex-1 flex flex-col bg-white relative z-10" :class="{ 'fixed inset-0 h-full w-full': activeConversationId && false }">
        <!-- Header -->
        <header class="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div class="flex items-center gap-4">
            <button @click="activeConversationId = null" class="md:hidden p-2 text-slate-400 hover:text-slate-600">
              <ArrowLeft :size="20" />
            </button>
            <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
               <img v-if="activeConv?.otherUser?.foto" :src="activeConv.otherUser.foto" class="w-full h-full object-cover">
               <div v-else class="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
                  {{ activeConv?.otherUser?.nome?.charAt(0) || '?' }}
              </div>
            </div>
            <div>
              <h3 class="font-black text-[#0D2E5C] leading-tight">{{ activeConv?.otherUser?.nome }}</h3>
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded tracking-widest uppercase">
                  {{ activeConv?.otherUser?.tipo_conta || 'TALENTO' }}
                </span>
                <span v-if="activeConv?.vaga" class="text-[9px] font-black text-green-600 uppercase tracking-wider">
                  Vaga: {{ activeConv.vaga.titulo }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
             <button class="p-2.5 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all">
               <Phone :size="20" />
             </button>
             <button class="p-2.5 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all">
               <MoreVertical :size="20" />
             </button>
          </div>
        </header>

        <!-- CRM Status Bar -->
        <div class="px-4 py-3 bg-[#0D2E5C]/5 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2 shrink-0">
            <Zap class="text-amber-500 shrink-0" :size="13" />
            <span class="text-[10px] font-black uppercase tracking-widest text-green-900/60 whitespace-nowrap">Status:</span>
            <div
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white transition-all"
              :class="{
                  'bg-green-600 text-white': activeConv?.status_contratacao === 'interessado' || !activeConv?.status_contratacao,
                  'bg-orange-500 text-white': activeConv?.status_contratacao === 'negociando',
                  'bg-[#1FAE66] text-white': activeConv?.status_contratacao === 'contratado',
                  'bg-slate-400 text-white': activeConv?.status_contratacao === 'recusado'
              }"
            >
              {{ activeConv?.status_contratacao || 'interessado' }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2 ml-auto">
            <button
              v-if="activeConv?.status_contratacao !== 'contratado'"
              @click="handleUpdateStatus('contratado')"
              class="flex items-center gap-1 px-3 py-1.5 bg-[#1FAE66] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#17974d] transition-all shadow-md shadow-green-500/20 active:scale-95 whitespace-nowrap"
            >
              <CheckCircle2 :size="11" /> Contratei!
            </button>
            <button
              v-if="activeConv?.status_contratacao !== 'recusado' && activeConv?.status_contratacao !== 'contratado'"
              @click="handleUpdateStatus('recusado')"
              class="px-3 py-1.5 bg-white text-slate-400 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 whitespace-nowrap"
            >
              Sem Interesse
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar" ref="chatContainer">
          <div v-if="loadingMessages" class="flex items-center justify-center h-full">
             <div class="w-6 h-6 border-2 border-slate-100 border-t-green-600 rounded-full animate-spin" />
          </div>
          
          <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-300">
             <MessageSquare class="mb-4 opacity-50" :size="40" />
             <p class="text-sm font-semibold uppercase tracking-widest">Inicie a conversa</p>
          </div>

          <div 
            v-for="msg in orderedMessages" 
            :key="msg.id" 
            class="flex flex-col"
            :class="msg.remetente_id === participantId ? 'items-end' : 'items-start'"
          >
            <div 
              class="max-w-[75%] px-5 py-4 shadow-sm"
              :class="msg.remetente_id === participantId 
                ? 'bg-[#1FAE66] text-white rounded-[24px] rounded-tr-none' 
                : 'bg-white text-slate-700 rounded-[24px] rounded-tl-none border border-slate-50'"
            >
              <p class="text-sm font-medium leading-relaxed">{{ msg.conteudo }}</p>
            </div>
            <div class="flex items-center gap-1.5 mt-1.5 px-1">
               <span class="text-[9px] font-black uppercase tracking-widest text-slate-300">
                {{ formatTime(msg.created_at) }}
               </span>
               <CheckCheck v-if="msg.remetente_id === participantId" class="text-[#1FAE66]" :size="12" />
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-6 bg-white border-t border-slate-50">
          <form @submit.prevent="handleSendMessage" class="flex gap-4">
            <div class="flex-1 relative group">
              <input 
                v-model="newMessage" 
                type="text" 
                placeholder="Envie uma mensagem profissional..." 
                class="w-full h-14 bg-slate-50 border-none rounded-[20px] px-6 text-sm font-medium focus:ring-2 focus:ring-[#1FAE66]/10 focus:bg-white transition-all outline-none"
              >
            </div>
            <button 
              type="submit" 
              class="bg-[#1FAE66] text-white w-14 h-14 rounded-[20px] flex items-center justify-center hover:bg-[#17974d] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:grayscale"
              :disabled="!newMessage.trim() || loadingMessages"
            >
              <Send :size="20" class="ml-1" />
            </button>
          </form>
        </div>
      </main>

      <!-- Empty Chat State -->
      <main v-else class="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-300">
        <div class="w-32 h-32 bg-white rounded-[40px] shadow-sm border border-slate-100 flex items-center justify-center mb-8 relative group">
          <MessageSquare class="text-slate-200 group-hover:scale-110 group-hover:text-[#1FAE66]/20 transition-all" :size="48" />
          <div class="absolute -top-2 -right-2 w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-[#1FAE66]">
            <Zap :size="20" fill="currentColor" />
          </div>
        </div>
        <h3 class="text-xl font-[900] text-[#0D2E5C] uppercase tracking-widest mb-2">Selecione uma Conexão</h3>
        <p class="text-sm font-medium text-slate-400 max-w-xs text-center leading-relaxed">
          Seu histórico de mensagens, candidatos interessados e negociações diretas aparece aqui.
        </p>
      </main>

    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
