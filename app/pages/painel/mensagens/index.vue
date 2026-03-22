<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const route = useRoute()
const { uploadFile, loading: uploadingFile } = useFileUpload()

// State
const conversations = ref<any[]>([])
const messages = ref<any[]>([])
const selectedConversationId = ref<string | null>(null)
const newMessage = ref('')
const searchQuery = ref('')
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Computed
const selectedConversation = computed(() => 
    conversations.value.find(c => c.id === selectedConversationId.value)
)

const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) return conversations.value
    const query = searchQuery.value.toLowerCase()
    return conversations.value.filter(c => 
        c.otherUser?.nome?.toLowerCase().includes(query)
    )
})

const orderedMessages = computed(() => {
    return [...messages.value].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
})

// Lifecycle
onMounted(async () => {
    // Preserva os query parameters (ex: ?id=...) ao redirecionar
    navigateTo({ path: '/mensagens', query: route.query }, { replace: true })
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

        // Transform data
        conversations.value = data.map((c: any) => {
            const isP1 = c.participante1_id === user.value?.id
            const other = isP1 ? c.p2 : c.p1
            return {
                ...c,
                otherUser: other,
                unreadCount: 0
            }
        })

        // Fetch unread counts for each
        await Promise.all(conversations.value.map(async (conv) => {
            const { count } = await supabase
                .from('mensagens')
                .select('*', { count: 'exact', head: true })
                .eq('conversa_id', conv.id)
                .neq('remetente_id', user.value?.id)
                .eq('lida', false)
            
            conv.unreadCount = count || 0
        }))

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
    
    // Mark messages as read
    markAsRead(id)
}

const fetchMessages = async (conversationId: string) => {
    loadingMessages.value = true
    try {
        const { data, error } = await supabase
            .from('mensagens')
            .select('*')
            .eq('conversa_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(100)
        
        if (error) throw error
        messages.value = data || []
        
    } catch (e) {
        console.error('Erro ao buscar mensagens:', e)
    } finally {
        loadingMessages.value = false
        scrollToBottom()
    }
}

const markAsRead = async (conversationId: string) => {
    if (!user.value) return
    try {
        await supabase
            .from('mensagens')
            .update({ lida: true })
            .eq('conversa_id', conversationId)
            .neq('remetente_id', user.value.id)
            .eq('lida', false)
        
        // Update local unread count
        const conv = conversations.value.find(c => c.id === conversationId)
        if (conv) conv.unreadCount = 0
    } catch (e) {
        console.error('Erro ao marcar como lida:', e)
    }
}

const sendMessage = async (text: string = newMessage.value) => {
    if (!text.trim() && !uploadingFile.value) return
    if (!user.value || !selectedConversationId.value) return
    
    const messageText = text.trim()
    newMessage.value = ''

    try {
        const { error } = await supabase
            .from('mensagens')
            .insert({
                conversa_id: selectedConversationId.value,
                remetente_id: user.value.id,
                conteudo: messageText,
                lida: false
            })
        
        if (error) throw error

        // Update conversation manually for immediate feedback
        updateLocalConversation(selectedConversationId.value, messageText)

    } catch (e) {
        console.error('Erro ao enviar mensagem:', e)
        newMessage.value = messageText
    }
}

const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files?.length || !selectedConversationId.value || !user.value) return

    const file = input.files[0]
    if (!file) return
    const fileName = `${Date.now()}-${file.name}`
    const path = `chats/${selectedConversationId.value}/${fileName}`

    // Attempt upload to 'documentos' bucket (common bucket name)
    const { publicUrl, error } = await uploadFile(file, path, 'documentos')

    if (error) {
        console.error('Erro no upload para bucket documentos, tentando avatars:', error)
        // Fallback to 'avatars' which we know is used elsewhere
        const { publicUrl: fallbackUrl, error: fallbackError } = await uploadFile(file, path, 'avatars')
        if (fallbackError) {
            alert('Erro ao fazer upload do arquivo. Verifique se existe um bucket chamado "documentos" ou "avatars" no seu Supabase.')
            return
        }
        sendAttachmentMessage(fallbackUrl, file)
    } else {
        sendAttachmentMessage(publicUrl, file)
    }
}

const sendAttachmentMessage = async (url: string | null, file: File) => {
    if (!url || !selectedConversationId.value || !user.value) return
    
    try {
        const isImage = file.type.startsWith('image/')
        const { error: msgError } = await supabase
            .from('mensagens')
            .insert({
                conversa_id: selectedConversationId.value,
                remetente_id: user.value.id,
                conteudo: isImage ? '📷 Foto' : `📄 ${file.name}`,
                url_anexo: url,
                tipo_anexo: isImage ? 'image' : 'document',
                lida: false
            } as any)
        
        if (msgError) throw msgError
        
        updateLocalConversation(selectedConversationId.value, isImage ? 'Foto' : file.name)
    } catch (e) {
        console.error('Erro ao enviar anexo:', e)
    } finally {
        if (fileInput.value) fileInput.value.value = ''
    }
}

const updateLocalConversation = (id: string, text: string) => {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
        conv.ultima_mensagem = text
        conv.updated_at = new Date().toISOString()
        conversations.value.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
    }
}

const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
}

// Realtime
const subscribeToMessages = (conversationId: string) => {
    supabase.channel(`chat:${conversationId}`)
    .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `conversa_id=eq.${conversationId}` },
        (payload) => {
            if (!messages.value.find(m => m.id === payload.new.id)) {
                messages.value.push(payload.new)
                // If message from others, mark as read if chat is active
                if (payload.new.remetente_id !== user.value?.id) {
                    markAsRead(conversationId)
                }
            }
        }
    )
    .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mensagens', filter: `conversa_id=eq.${conversationId}` },
        (payload) => {
            const idx = messages.value.findIndex(m => m.id === payload.new.id)
            if (idx !== -1) messages.value[idx] = payload.new
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
        (payload: any) => {
            const idx = conversations.value.findIndex(c => c.id === payload.new.id)
            if (idx !== -1) {
                conversations.value[idx].ultima_mensagem = payload.new.ultima_mensagem
                conversations.value[idx].updated_at = payload.new.updated_at
                
                // If the message is not from me and the conversation is not selected, we could increment unreadCount
                // But since we don't have the message sender here easily without another sub, 
                // we just mark it as potentially having new messages by resetting the list
                
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
            if (payload.new.participante1_id === user.value?.id || payload.new.participante2_id === user.value?.id) {
                await fetchConversations()
            }
        }
    )
    .subscribe()
}
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50 overflow-hidden">
    
    <!-- Sidebar -->
    <div 
        class="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0"
        :class="selectedConversationId ? 'hidden md:flex' : 'flex'"
    >
        <div class="p-4 bg-white sticky top-0 z-10">
            <h1 class="text-xl font-black text-slate-800 mb-4 px-1">Mensagens</h1>
            <div class="relative">
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Buscar conexões..." 
                    class="w-full bg-slate-100 border-none rounded-2xl px-10 py-3 text-sm focus:ring-2 focus:ring-green-500 transition-all font-medium"
                />
                <div class="absolute left-3 top-3.5 text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto mt-2">
            <div v-if="loadingConversations" class="p-8 text-center">
                <div class="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <div v-else-if="filteredConversations.length === 0" class="p-8 text-center text-slate-400">
                <p class="text-sm font-medium">Nenhuma conversa encontrada.</p>
            </div>

            <div v-else>
                <div 
                    v-for="conv in filteredConversations" 
                    :key="conv.id"
                    @click="selectConversation(conv.id)"
                    class="mx-2 mb-1 p-3 rounded-2xl cursor-pointer transition-all flex gap-3 items-center group"
                    :class="selectedConversationId === conv.id ? 'bg-green-50 text-green-900 border-green-100' : 'hover:bg-slate-50'"
                >
                    <div class="shrink-0 relative">
                        <div class="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-white shadow-sm border border-slate-200">
                            <img v-if="conv.otherUser?.foto" :src="conv.otherUser.foto" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center text-slate-400 font-black text-lg">
                                {{ conv.otherUser?.nome?.charAt(0) || '?' }}
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-0.5">
                            <h3 class="font-bold text-slate-900 truncate" :class="selectedConversationId === conv.id ? 'text-green-900' : ''">
                                {{ conv.otherUser?.nome || 'Conexão' }}
                            </h3>
                            <span class="text-[10px] font-bold text-slate-400">{{ formatDateShort(conv.updated_at) }}</span>
                        </div>
                        <div class="flex justify-between items-center gap-2">
                            <p class="text-sm text-slate-500 truncate font-medium flex items-center gap-1">
                                {{ conv.ultima_mensagem || 'Diga olá! 👋' }}
                            </p>
                            <div v-if="conv.unreadCount > 0" class="shrink-0 w-5 h-5 bg-green-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-green-600/20">
                                {{ conv.unreadCount }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Chat Area -->
    <div v-if="selectedConversationId" class="flex-1 flex flex-col bg-white">
        <!-- Header -->
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div class="flex items-center gap-3">
                <button @click="selectedConversationId = null" class="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <div class="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                    <img v-if="selectedConversation?.otherUser?.foto" :src="selectedConversation.otherUser.foto" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-slate-400 font-black">
                        {{ selectedConversation?.otherUser?.nome?.charAt(0) || '?' }}
                    </div>
                </div>
                <div>
                    <h3 class="font-black text-slate-900 leading-none mb-1">{{ selectedConversation?.otherUser?.nome }}</h3>
                    <div class="flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ selectedConversation?.otherUser?.tipo_conta }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6" ref="chatContainer">
            <div v-if="loadingMessages" class="flex justify-center py-8">
                <div class="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <template v-else>
                <div 
                    v-for="msg in orderedMessages" 
                    :key="msg.id" 
                    class="flex flex-col"
                    :class="msg.remetente_id === user?.id ? 'items-end' : 'items-start'"
                >
                    <div 
                        class="max-w-[85%] md:max-w-[70%] p-4 shadow-sm transition-all"
                        :class="msg.remetente_id === user?.id 
                            ? 'bg-slate-900 text-white rounded-3xl rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-3xl rounded-tl-none border border-slate-100'"
                    >
                        <!-- Attachment -->
                        <div v-if="msg.url_anexo" class="mb-3">
                            <a v-if="msg.tipo_anexo === 'image'" :href="msg.url_anexo" target="_blank" class="block rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                <img :src="msg.url_anexo" class="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-500" />
                            </a>
                            <a v-else :href="msg.url_anexo" target="_blank" class="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5">
                                <div class="p-2 bg-white/20 rounded-lg">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <span class="text-xs font-bold truncate max-w-[150px]">Baixar Anexo</span>
                            </a>
                        </div>

                        <p class="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{{ msg.conteudo }}</p>
                        
                        <div 
                            class="flex items-center gap-2 mt-2"
                            :class="msg.remetente_id === user?.id ? 'justify-end text-slate-400' : 'justify-start text-slate-400'"
                        >
                            <span class="text-[10px] font-black uppercase tracking-tighter">
                                {{ new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                            </span>
                            <div v-if="msg.remetente_id === user?.id" class="flex">
                                <svg 
                                    class="w-3.5 h-3.5" 
                                    :class="msg.lida ? 'text-green-500' : 'text-slate-600'" 
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                    <path v-if="msg.lida" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" class="-translate-x-1"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Input -->
        <div class="px-6 py-4 bg-white border-t border-slate-100">
            <form @submit.prevent="sendMessage()" class="flex items-center gap-3">
                <input 
                    type="file" 
                    ref="fileInput" 
                    class="hidden" 
                    @change="handleFileUpload"
                    accept="image/*,.pdf,.doc,.docx"
                />
                <button 
                    type="button"
                    @click="fileInput?.click()"
                    class="p-4 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95"
                    :disabled="uploadingFile"
                >
                    <div v-if="uploadingFile" class="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </button>

                <div class="flex-1 relative">
                    <input 
                        v-model="newMessage" 
                        type="text" 
                        placeholder="Escreva sua mensagem..." 
                        class="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-green-600 transition-all placeholder:text-slate-400"
                    />
                </div>

                <button 
                    type="submit" 
                    class="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95 disabled:opacity-50"
                    :disabled="!newMessage.trim() && !uploadingFile"
                >
                    <svg class="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
        <div class="w-32 h-32 bg-white rounded-[40px] shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center mb-8">
            <svg class="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-2">Suas Conversas</h2>
        <p class="max-w-xs font-medium text-slate-500">Selecione uma conexão ao lado para iniciar ou continuar uma conversa.</p>
    </div>

  </div>
</template>

<style scoped>
/* Transições suaves */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
