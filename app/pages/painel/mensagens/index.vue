<script setup lang="ts">
import type { Database } from '~/types'

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
  <div class="max-w-6xl mx-auto px-4 md:px-8 py-8 h-[calc(100vh-6rem)]">
  <div class="h-full bg-white rounded-xl shadow-sm border border-gray-200 flex overflow-hidden">
    
    <!-- Sidebar (Conversations List) -->
    <div class="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 bg-white">
            <h2 class="font-bold text-gray-800">Conexões</h2>
        </div>
        
        <!-- List -->
        <div class="flex-1 overflow-y-auto">
            <div v-if="loadingConversations" class="p-4 text-center text-gray-400 text-sm">
                Carregando conversas...
            </div>
            <div v-else-if="conversations.length === 0" class="p-4 text-center text-gray-500 text-sm">
                Nenhuma conversa iniciada.
            </div>
            <div v-else>
                <div 
                    v-for="conv in conversations" 
                    :key="conv.id"
                    @click="selectConversation(conv.id)"
                    class="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors flex gap-3"
                    :class="selectedConversationId === conv.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''"
                >
                    <!-- Avatar -->
                    <div class="shrink-0 relative">
                        <div class="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                            <img v-if="conv.otherUser?.foto" :src="conv.otherUser.foto" class="w-full h-full object-cover">
                            <div v-else class="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                {{ conv.otherUser?.nome?.charAt(0) || '?' }}
                            </div>
                        </div>
                         <!-- Status indicator (optional) -->
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <h3 class="font-semibold text-gray-900 truncate">{{ conv.otherUser?.nome || 'Usuário' }}</h3>
                            <span class="text-xs text-gray-400">{{ new Date(conv.updated_at).toLocaleDateString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                        </div>
                        <p class="text-sm text-gray-500 truncate">
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
        <div class="p-4 border-b border-gray-200 flex items-center gap-3 bg-white shadow-sm z-10">
             <div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                <img v-if="selectedConversation?.otherUser?.foto" :src="selectedConversation.otherUser.foto" class="w-full h-full object-cover">
                 <div v-else class="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                    {{ selectedConversation?.otherUser?.nome?.charAt(0) || '?' }}
                </div>
            </div>
            <div>
                <h3 class="font-bold text-gray-900">{{ selectedConversation?.otherUser?.nome }}</h3>
                <p class="text-xs text-gray-500 capitalize">{{ selectedConversation?.otherUser?.tipo_conta }}</p>
            </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref="chatContainer">
            <div v-if="loadingMessages" class="text-center py-4 text-gray-400">Carregando mensagens...</div>
            
            <div 
                v-for="msg in orderedMessages" 
                :key="msg.id" 
                class="flex"
                :class="msg.remetente_id === user?.id ? 'justify-end' : 'justify-start'"
            >
                <div 
                    class="max-w-[70%] rounded-2xl p-4 shadow-sm text-sm"
                    :class="msg.remetente_id === user?.id 
                        ? 'bg-green-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'"
                >
                    <p>{{ msg.conteudo }}</p>
                    <p 
                        class="text-[10px] mt-1 text-right"
                        :class="msg.remetente_id === user?.id ? 'text-green-100' : 'text-gray-400'"
                    >
                        {{ new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Input -->
        <div class="p-4 bg-white border-t border-gray-200">
            <form @submit.prevent="sendMessage" class="flex gap-2">
                <input 
                    v-model="newMessage" 
                    type="text" 
                    placeholder="Digite sua mensagem..." 
                    class="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                <button 
                    type="submit" 
                    class="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!newMessage.trim()"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Empty State (No conversation selected) -->
    <div v-else class="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <svg class="w-24 h-24 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        <p class="text-lg font-medium">Selecione uma Conexão para começar</p>
    </div>

  </div>
  </div>
</template>
