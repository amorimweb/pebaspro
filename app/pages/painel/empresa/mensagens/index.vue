<script setup lang="ts">
import type { Database } from '~/types'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()

// State
const conversations = ref<any[]>([])
const messages = ref<any[]>([])
const selectedConversationId = ref<string | null>(null)
const newMessage = ref('')
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

// Computed
const selectedConversation = computed(() => 
    conversations.value.find(c => c.id === selectedConversationId.value)
)

const orderedMessages = computed(() => {
    return [...messages.value].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
})

// Lifecycle
onMounted(async () => {
    await fetchConversations()
    subscribeToConversations()
})

onUnmounted(() => {
    supabase.channel('public:conversas').unsubscribe()
    if (selectedConversationId.value) {
         supabase.channel(`chat:${selectedConversationId.value}`).unsubscribe()
    }
})

// Scroll to bottom watcher
watch(messages, () => {
    nextTick(() => {
        scrollToBottom()
    })
}, { deep: true })

// Methods
const fetchConversations = async () => {
    loadingConversations.value = true
    try {
        if (!user.value) return

        // Fetch conversations
        const { data, error } = await supabase
            .from('conversas')
            .select(`
                *,
                p1:participante1_id(id, nome, foto, tipo_conta),
                p2:participante2_id(id, nome, foto, tipo_conta)
            `)
            .or(`participante1_id.eq.${user.value.id},participante2_id.eq.${user.value.id}`)
            .order('updated_at', { ascending: false })
        
        if (error) throw error

        // Transform data to easily access "other" user
        conversations.value = data.map((c: any) => {
            const isP1 = c.participante1_id === user.value?.id
            const other = isP1 ? c.p2 : c.p1
            return {
                ...c,
                otherUser: other
            }
        })

    } catch (e) {
        console.error('Erro ao carregar conversas:', e)
    } finally {
        loadingConversations.value = false
    }
}

const selectConversation = async (id: string) => {
    if (selectedConversationId.value === id) return
    
    // Unsubscribe from previous if exists
    if (selectedConversationId.value) {
        supabase.channel(`chat:${selectedConversationId.value}`).unsubscribe()
    }

    selectedConversationId.value = id
    await fetchMessages(id)
    subscribeToMessages(id)
}

const fetchMessages = async (conversationId: string) => {
    loadingMessages.value = true
    try {
        const { data, error } = await supabase
            .from('mensagens')
            .select('*')
            .eq('conversa_id', conversationId)
            .order('created_at', { ascending: true }) // fetch old to new
            .limit(50) // limit for performance
        
        if (error) throw error
        messages.value = data || []
        
        // Mark as read (optional, can be implemented later)

    } catch (e) {
        console.error('Erro ao buscar mensagens:', e)
    } finally {
        loadingMessages.value = false
        scrollToBottom()
    }
}

const sendMessage = async () => {
    if (!newMessage.value.trim() || !user.value || !selectedConversationId.value) return
    
    const text = newMessage.value.trim()
    newMessage.value = '' // Optimistic clear

    try {
        const { error } = await supabase
            .from('mensagens')
            .insert({
                conversa_id: selectedConversationId.value,
                remetente_id: user.value.id,
                conteudo: text
            })
        
        if (error) throw error

        // Update conversation last message manually for immediate feedback (though realtime will do it too)
        const conv = conversations.value.find(c => c.id === selectedConversationId.value)
        if (conv) {
            conv.ultima_mensagem = text
            conv.updated_at = new Date().toISOString()
            // Reorder
            conversations.value.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
        }

    } catch (e) {
        console.error('Erro ao enviar mensagem:', e)
        newMessage.value = text // Restore on error
    }
}

const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

const updateStatus = async (status: string) => {
    if (!selectedConversationId.value) return
    
    try {
        const { error } = await supabase
            .from('conversas')
            .update({ status_contratacao: status })
            .eq('id', selectedConversationId.value)
        
        if (error) throw error
        
        // Atualiza estado local
        const idx = conversations.value.findIndex(c => c.id === selectedConversationId.value)
        if (idx !== -1) {
            conversations.value[idx].status_contratacao = status
        }
    } catch (e) {
        console.error('Erro ao atualizar status:', e)
    }
}

// Realtime
const subscribeToMessages = (conversationId: string) => {
    supabase.channel(`chat:${conversationId}`)
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `conversa_id=eq.${conversationId}` },
        (payload) => {
            messages.value.push(payload.new)
        }
    )
    .subscribe()
}

const subscribeToConversations = () => {
    if (!user.value) return

    supabase.channel('public:conversas')
    .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversas' },
        (payload) => {
            // Find and update
            const idx = conversations.value.findIndex(c => c.id === payload.new.id)
            if (idx !== -1) {
                // Update fields
                conversations.value[idx].ultima_mensagem = payload.new.ultima_mensagem
                conversations.value[idx].updated_at = payload.new.updated_at
                conversations.value[idx].status_contratacao = payload.new.status_contratacao
                conversations.value[idx].tipo_contato = payload.new.tipo_contato
                // Re-sort
                conversations.value.sort((a, b) => 
                 new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )
            }
        }
    )
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversas' },
        async (payload) => {
            // Check if I am involved
            if (payload.new.participante1_id === user.value?.id || payload.new.participante2_id === user.value?.id) {
                // New conversation started, reload list to get details
                await fetchConversations()
            }
        }
    )
    .subscribe()
}
</script>

<template>
  <div class="h-[calc(100vh-12rem)] min-h-[600px]">
    <div class="h-full bg-white rounded-[32px] shadow-sm border border-slate-100 flex overflow-hidden">
      
      <!-- Sidebar (Conversations List) -->
      <div class="w-full md:w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
          <!-- Header -->
          <div class="p-6 border-b border-slate-50 bg-white/50 backdrop-blur-sm">
              <h2 class="text-xl font-black text-slate-800">Conexões</h2>
          </div>
          
          <!-- List -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
              <div v-if="loadingConversations" class="p-10 text-center text-slate-400 italic text-sm">
                  Carregando conversas...
              </div>
              <div v-else-if="conversations.length === 0" class="p-10 text-center text-slate-400 text-sm italic">
                  Nenhuma conversa iniciada.
              </div>
              <div v-else>
                  <div 
                      v-for="conv in conversations" 
                      :key="conv.id"
                      @click="selectConversation(conv.id)"
                      class="p-5 border-b border-slate-50 cursor-pointer hover:bg-white transition-all flex gap-4 group"
                      :class="selectedConversationId === conv.id ? 'bg-white shadow-[inset_4px_0_0_0_#16a34a]' : ''"
                  >
                      <!-- Avatar -->
                      <div class="shrink-0 relative">
                          <div class="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden group-hover:border-green-200 transition-colors">
                              <img v-if="conv.otherUser?.foto" :src="conv.otherUser.foto" class="w-full h-full object-cover">
                              <div v-else class="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
                                  {{ conv.otherUser?.nome?.charAt(0) || '?' }}
                              </div>
                          </div>
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-baseline mb-1">
                              <h3 class="font-bold text-slate-900 truncate group-hover:text-green-700 transition-colors">{{ conv.otherUser?.nome || 'Usuário' }}</h3>
                              <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">{{ new Date(conv.updated_at).toLocaleDateString() }}</span>
                          </div>
                          <div class="flex items-center gap-2 mb-1">
                              <span v-if="conv.tipo_contato === 'whatsapp'" class="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">WhatsApp</span>
                              <span v-if="conv.status_contratacao === 'contratado'" class="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Contratado ✅</span>
                          </div>
                          <p class="text-sm text-slate-500 truncate font-medium">
                              {{ conv.ultima_mensagem || 'Inicie a conversa...' }}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Chat Area -->
      <div v-if="selectedConversationId" class="flex-1 flex flex-col bg-white">
          <!-- Header -->
          <div class="p-6 border-b border-slate-50 flex items-center gap-4 bg-white/80 backdrop-blur-md z-10">
               <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                  <img v-if="selectedConversation?.otherUser?.foto" :src="selectedConversation.otherUser.foto" class="w-full h-full object-cover">
                   <div v-else class="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
                      {{ selectedConversation?.otherUser?.nome?.charAt(0) || '?' }}
                  </div>
              </div>
              <div>
                  <h3 class="font-black text-slate-900 leading-tight">{{ selectedConversation?.otherUser?.nome }}</h3>
                  <p class="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">{{ selectedConversation?.otherUser?.tipo_conta }}</p>
              </div>
          </div>

          <!-- Status Bar (CRM) -->
          <div v-if="authStore.profile?.tipo_conta === 'empresa'" class="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Status da Negociação:</span>
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-white"
                    :class="{
                        'bg-blue-500 text-white': selectedConversation?.status_contratacao === 'interessado' || !selectedConversation?.status_contratacao,
                        'bg-orange-500 text-white': selectedConversation?.status_contratacao === 'negociando',
                        'bg-green-600 text-white': selectedConversation?.status_contratacao === 'contratado',
                        'bg-slate-400 text-white': selectedConversation?.status_contratacao === 'recusado'
                    }"
                  >
                    {{ selectedConversation?.status_contratacao || 'interessado' }}
                  </span>
              </div>
              
              <div class="flex gap-2">
                  <button 
                    v-if="selectedConversation?.status_contratacao !== 'contratado'"
                    @click="updateStatus('contratado')"
                    class="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                  >
                    Contratei! ✅
                  </button>
                  <button 
                    v-if="selectedConversation?.status_contratacao === 'interessado' || !selectedConversation?.status_contratacao"
                    @click="updateStatus('negociando')"
                    class="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    Negociar
                  </button>
                  <button 
                    v-if="selectedConversation?.status_contratacao !== 'recusado' && selectedConversation?.status_contratacao !== 'contratado'"
                    @click="updateStatus('recusado')"
                    class="px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Sem Interesse
                  </button>
              </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar" ref="chatContainer">
              <div v-if="loadingMessages" class="text-center py-10 text-slate-300 italic">Carregando mensagens...</div>
              
              <div 
                  v-for="msg in orderedMessages" 
                  :key="msg.id" 
                  class="flex"
                  :class="msg.remetente_id === user?.id ? 'justify-end' : 'justify-start'"
              >
                  <div 
                      class="max-w-[75%] rounded-[24px] p-5 shadow-sm"
                      :class="msg.remetente_id === user?.id 
                          ? 'bg-green-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'"
                  >
                      <p class="text-sm font-medium leading-relaxed">{{ msg.conteudo }}</p>
                      <div 
                          class="flex items-center gap-2 mt-2"
                          :class="msg.remetente_id === user?.id ? 'justify-end' : 'justify-start'"
                      >
                          <span class="text-[10px] font-black uppercase tracking-widest" :class="msg.remetente_id === user?.id ? 'text-green-100/50' : 'text-slate-300'">
                              {{ new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Input -->
          <div class="p-6 bg-white border-t border-slate-50">
              <form @submit.prevent="sendMessage" class="flex gap-4">
                  <div class="flex-1 relative">
                      <input 
                          v-model="newMessage" 
                          type="text" 
                          placeholder="Digite sua mensagem especial..." 
                          class="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 focus:ring-2 focus:ring-green-500/20 text-slate-900 font-medium transition-all"
                      >
                  </div>
                  <button 
                      type="submit" 
                      class="bg-green-600 text-white w-14 h-14 rounded-[20px] flex items-center justify-center hover:bg-green-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                      :disabled="!newMessage.trim()"
                  >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
              </form>
          </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center bg-slate-50/30 text-slate-300">
          <div class="w-24 h-24 bg-white rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-center mb-6 opacity-50">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <p class="text-lg font-black uppercase tracking-widest text-slate-400">Selecione uma Conexão</p>
          <p class="text-sm font-medium text-slate-400 mt-2">Seu histórico de contatos e negociações aparece aqui.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
