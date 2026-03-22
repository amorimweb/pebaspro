<script setup lang="ts">
import type { Database } from '~/types'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
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
    await fetchConversations()
    subscribeToConversations()

    // Handle direct navigation via ID in URL
    const route = useRoute()
    if (route.query.id) {
        selectConversation(route.query.id as string)
    }
})

onUnmounted(() => {
    supabase.channel('public:conversas').unsubscribe()
    if (selectedConversationId.value) {
         supabase.channel(`chat:${selectedConversationId.value}`).unsubscribe()
    }
})


// Methods
const fetchConversations = async () => {
    // Tenta pegar o ID de várias fontes para garantir
    const currentUserId = user.value?.id || authStore.user?.id || authStore.profile?.id
    
    if (!currentUserId) {
        if (authStore.initialized) {
            console.warn('fetchConversations: User session initialized but no ID found')
            loadingConversations.value = false
        } else {
            console.log('fetchConversations: Waiting for auth store initialization...')
        }
        return
    }
    
    if (loadingConversations.value && conversations.value.length > 0) return
    
    loadingConversations.value = true
    try {
        console.log('fetchConversations: Fetching for', currentUserId)
        // Fetch conversations
        const { data, error } = await supabase
            .from('conversas')
            .select(`
                *,
                p1:participante1_id(id, nome, foto, tipo_conta),
                p2:participante2_id(id, nome, foto, tipo_conta)
            `)
            .or(`participante1_id.eq.${currentUserId},participante2_id.eq.${currentUserId}`)
            .order('updated_at', { ascending: false })
        
        if (error) {
            console.error('Supabase error in fetchConversations:', error)
            loadingConversations.value = false
            return
        }

        console.log('fetchConversations: Data received:', data?.length || 0, 'rows')
        if (data) {
            console.log('fetchConversations: first row example:', data[0])
        }

        // Transform data
        conversations.value = data.map((c: any) => {
            const isP1 = c.participante1_id === currentUserId
            const other = isP1 ? c.p2 : c.p1
            
            if (!other) {
                console.warn('fetchConversations: Participant join failed for conversation', c.id)
            }

            return {
                ...c,
                otherUser: other,
                unreadCount: 0
            }
        })
        
        console.log('fetchConversations: Mapped conversations:', conversations.value.length)

    } catch (e) {
        console.error('Unexpected error in fetchConversations:', e)
    } finally {
        loadingConversations.value = false
    }
}

const hasApplied = ref(false)
const checkingCandidacy = ref(false)
const showVagasPopover = ref(false)
const companyJobs = ref<any[]>([])
const loadingJobs = ref(false)

const fetchCompanyJobs = async (companyId: string) => {
    if (!companyId) return
    loadingJobs.value = true
    try {
        const agoraStr = new Date().toISOString().split('T')[0]
        const { data } = await supabase
            .from('vagas')
            .select('*')
            .eq('empresa_id', companyId)
            .or(`encerramento.is.null,encerramento.gte.${agoraStr}`)
            .order('data_publicacao', { ascending: false })
        
        companyJobs.value = data || []
    } catch (error) {
        console.error('Erro ao buscar vagas:', error)
    } finally {
        loadingJobs.value = false
    }
}

const applyFromChat = async (vaga: any) => {
    if (authStore.profile?.tipo_conta !== 'talento') return
    
    try {
        const { error } = await (supabase
            .from('candidaturas' as any)
            .insert({
                vaga_id: vaga.id,
                talento_id: authStore.profile.id
            }) as any)
        
        if (error && error.code !== '23505') throw error
        
        // Enviar mensagem automática
        await sendMessage(`${authStore.profile.nome} acaba de se candidatar à vaga de "${vaga.titulo}"`)
        
        alert(`Candidatura para "${vaga.titulo}" enviada com sucesso!`)
        showVagasPopover.value = false
        checkCandidacy()
    } catch (error) {
        console.error('Erro ao candidatar-se:', error)
        alert('Erro ao enviar candidatura.')
    }
}

const checkCandidacy = async () => {
    if (!selectedConversation.value?.vaga_id || authStore.profile?.tipo_conta !== 'talento') {
        hasApplied.value = false
        return
    }
    
    checkingCandidacy.value = true
    try {
        const { data } = await (supabase
            .from('candidaturas' as any)
            .select('id')
            .eq('vaga_id', selectedConversation.value.vaga_id)
            .eq('talento_id', authStore.profile.id)
            .maybeSingle() as any)
        
        hasApplied.value = !!data
    } finally {
        checkingCandidacy.value = false
    }
}

const applyToJob = async () => {
    if (!selectedConversation.value?.vaga_id || authStore.profile?.tipo_conta !== 'talento') return
    
    try {
        const { error } = await (supabase
            .from('candidaturas' as any)
            .insert({
                vaga_id: selectedConversation.value.vaga_id,
                talento_id: authStore.profile.id
            }) as any)
        
        if (error) {
            if (error.code === '23505') { // Unique violation
                hasApplied.value = true
                return
            }
            throw error
        }
        
        hasApplied.value = true
        alert('Candidatura enviada com sucesso! Boa sorte!')
    } catch (error) {
        console.error('Erro ao candidatar-se:', error)
        alert('Erro ao enviar candidatura. Tente novamente mais tarde.')
    }
}

const selectConversation = async (conv: any) => {
    const id = typeof conv === 'string' ? conv : conv.id; // Handle both string ID and conversation object
    if (selectedConversationId.value === id) return
    
    // Unsubscribe from previous if exists
    if (selectedConversationId.value) {
        supabase.channel(`chat:${selectedConversationId.value}`).unsubscribe()
    }

    selectedConversationId.value = id; // Update selectedConversationId
    messages.value = [] // Clear messages for new conversation
    await fetchMessages(id)
    await checkCandidacy()
    
    // Se for um talento falando com uma empresa, carrega as vagas
    if (authStore.profile?.tipo_conta === 'talento' && selectedConversation.value?.otherUser?.tipo_conta === 'empresa') {
        fetchCompanyJobs(selectedConversation.value.otherUser.id)
    }

    subscribeToMessages(id)
    
    // Mark messages as read
    markAsRead(id)
}

const fetchMessages = async (conversationId: string, limit = 20) => {
    if (!conversationId) return
    loadingMessages.value = true
    try {
        // Busca as ÚLTIMAS 20 mensagens (ordenadas por data DESC)
        const { data, error } = await supabase
            .from('mensagens')
            .select('*')
            .eq('conversa_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(limit)
        
        if (error) throw error
        
        // Inverte para exibir cronologicamente (mais antiga em cima, mais nova embaixo)
        messages.value = data ? [...data].reverse() : []
        
    } catch (e) {
        console.error('Erro ao buscar mensagens:', e)
    } finally {
        loadingMessages.value = false
        // Aguarda o DOM atualizar para dar scroll
        nextTick(() => {
            scrollToBottom()
        })
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
    
    const senderId = user.value?.id || authStore.user?.id || authStore.profile?.id
    if (!senderId || !selectedConversationId.value) {
        console.error('sendMessage: Requisitos ausentes', { senderId, convId: selectedConversationId.value })
        return
    }
    
    const messageText = text.trim()
    newMessage.value = ''

    try {
        const { error } = await supabase
            .from('mensagens')
            .insert({
                conversa_id: selectedConversationId.value,
                remetente_id: senderId,
                conteudo: messageText,
                lida: false
            })
        
        if (error) throw error

        // Update conversation manually for immediate feedback
        updateLocalConversation(selectedConversationId.value, messageText)

    } catch (e: any) {
        console.error('Erro ao enviar mensagem:', e)
        alert('Erro ao enviar mensagem: ' + (e.message || 'Verifique sua conexão.'))
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

    const { publicUrl, error } = await uploadFile(file, path, 'documentos')

    if (error) {
        console.error('Erro no upload para bucket documentos, tentando avatars:', error)
        const { publicUrl: fallbackUrl, error: fallbackError } = await uploadFile(file, path, 'avatars')
        if (fallbackError) {
            alert('Erro ao fazer upload do arquivo.')
            return
        }
        sendAttachmentMessage(fallbackUrl, file)
    } else {
        sendAttachmentMessage(publicUrl, file)
    }
}

const sendAttachmentMessage = async (url: string | null, file: File) => {
    const senderId = user.value?.id || authStore.user?.id || authStore.profile?.id
    if (!url || !selectedConversationId.value || !senderId) return
    
    try {
        const isImage = file.type.startsWith('image/')
        const { error: msgError } = await supabase
            .from('mensagens')
            .insert({
                conversa_id: selectedConversationId.value,
                remetente_id: senderId,
                conteudo: isImage ? '📷 Foto' : `📄 ${file.name}`,
                url_anexo: url,
                tipo_anexo: isImage ? 'image' : 'document',
                lida: false
            } as any)
        
        if (msgError) throw msgError
        
        updateLocalConversation(selectedConversationId.value, isImage ? 'Foto' : file.name)
    } catch (e: any) {
        console.error('Erro ao enviar anexo:', e)
        alert('Erro ao enviar anexo: ' + (e.message || 'O arquivo pode ser muito grande ou você não tem permissão.'))
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

// Status Management
const updateStatus = async (status: string) => {
    if (!selectedConversationId.value) return
    
    try {
        const { error } = await supabase
            .from('conversas')
            .update({ status_contratacao: status })
            .eq('id', selectedConversationId.value)
        
        if (error) throw error
        
        // Update local state
        const idx = conversations.value.findIndex(c => c.id === selectedConversationId.value)
        if (idx !== -1) {
            conversations.value[idx].status_contratacao = status
        }
    } catch (e) {
        console.error('Erro ao atualizar status:', e)
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

onMounted(() => {
    if (authStore.profile?.id || user.value?.id) {
        fetchConversations()
        subscribeToConversations()
    }
    // Lock scroll for this page only
    document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
    // Unlock scroll
    document.body.style.overflow = ''
})

// Watch for auth state changes
watch(
    [() => user.value?.id, () => authStore.initialized],
    ([newId, isInit]) => {
        if (newId && isInit && conversations.value.length === 0) {
            console.log('Reactivity detected: Fetching conversations for', newId)
            fetchConversations()
            subscribeToConversations()
        }
    },
    { immediate: true }
)

// Scroll to bottom watcher
watch(messages, () => {
    nextTick(() => {
        scrollToBottom()
    })
}, { deep: true })
</script>

<template>
  <div class="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50/50">
    <!-- Sidebar: Conversas -->
    <div 
        class="w-full md:w-80 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 relative z-30"
        :class="selectedConversationId ? 'hidden md:flex' : 'flex'"
    >
        <!-- Header Sidebar -->
        <div class="p-6 border-b border-slate-100 bg-white">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight mb-4">Mensagens</h1>
            <div class="relative group">
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Buscar conexões..." 
                    class="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-400 transition-all"
                />
                <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
        </div>

        <!-- Lista de Conversas (Scrollable) -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div v-if="loadingConversations" class="p-8 text-center">
                <div class="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>

            <div v-else-if="filteredConversations.length === 0" class="p-8 text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <p class="text-slate-400 text-sm font-bold">Nenhuma conversa encontrada.</p>
                <p v-if="user" class="text-[10px] text-slate-300 font-mono mt-2 truncate">ID: {{ user.id }}</p>
            </div>

            <div v-else class="divide-y divide-slate-50">
                <div 
                    v-for="conv in filteredConversations" 
                    :key="conv.id" 
                    @click="selectConversation(conv.id)"
                    class="group p-4 hover:bg-green-50/50 cursor-pointer transition-all border-l-4"
                    :class="selectedConversationId === conv.id ? 'bg-green-50 border-green-500' : 'border-transparent'"
                >
                    <div class="flex gap-3 items-center">
                        <div class="shrink-0 relative">
                            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
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
    </div>

    <!-- Chat Area -->
    <div v-if="selectedConversationId" class="flex-1 flex flex-col bg-white overflow-hidden relative">
        <!-- Chat Header -->
        <div class="shrink-0 p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
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
                <div class="flex flex-col">
                    <h2 class="text-lg font-black text-slate-900 leading-tight">{{ selectedConversation?.otherUser?.nome }}</h2>
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ selectedConversation?.otherUser?.tipo_conta || 'Usuário' }}</span>
                    </div>
                </div>
            </div>

            <!-- Botões de Ação do Chat -->
            <div class="flex items-center gap-3 relative">
                <!-- Botão Ver Vagas (Apenas para Talentos falando com Empresa) -->
                <button 
                    v-if="authStore.profile?.tipo_conta === 'talento' && selectedConversation?.otherUser?.tipo_conta === 'empresa'"
                    @click="showVagasPopover = !showVagasPopover"
                    class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-600/20 active:scale-95"
                >
                    🔍 Ver Vagas
                </button>

                <!-- Popover de Vagas -->
                <div 
                    v-if="showVagasPopover" 
                    class="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div class="p-3 border-b border-slate-50">
                        <h4 class="text-sm font-black text-slate-900">Vagas da Empresa</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase">Selecione para se candidatar</p>
                    </div>
                    
                    <div class="max-h-64 overflow-y-auto custom-scrollbar p-1">
                        <div v-if="loadingJobs" class="p-4 text-center">
                            <div class="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                        <div v-else-if="companyJobs.length === 0" class="p-4 text-center text-xs text-slate-400 font-medium">
                            Nenhuma vaga ativa no momento.
                        </div>
                        <button 
                            v-else
                            v-for="vaga in companyJobs" 
                            :key="vaga.id"
                            @click="applyFromChat(vaga)"
                            class="w-full text-left p-3 hover:bg-green-50 rounded-xl transition-colors group flex flex-col gap-1 border border-transparent hover:border-green-100 mb-1"
                        >
                            <span class="text-sm font-bold text-slate-800 group-hover:text-green-700">{{ vaga.titulo }}</span>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ vaga.local || 'Presencial' }}</span>
                                <span class="text-[10px] font-black text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">QUERO ESTA VAGA →</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Badge de Candidatura Realizada (se já houver vínculo direto) -->
                <div 
                    v-if="selectedConversation?.vaga_id && hasApplied"
                    class="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-black shrink-0"
                >
                    ✅ CANDIDATADO
                </div>
            </div>
        </div>
        
        <!-- Status Bar (CRM for Empresa) - Fixed inside header area -->
        <div v-if="useAuthStore().profile?.tipo_conta === 'empresa'" class="shrink-0 px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</span>
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
                <button v-if="selectedConversation?.status_contratacao !== 'contratado'" @click="updateStatus('contratado')" class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-green-600/20 active:scale-95">Contratei! ✅</button>
                <button v-if="selectedConversation?.status_contratacao === 'interessado' || !selectedConversation?.status_contratacao" @click="updateStatus('negociando')" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 active:scale-95">Negociar</button>
                <button v-if="selectedConversation?.status_contratacao !== 'recusado' && selectedConversation?.status_contratacao !== 'contratado'" @click="updateStatus('recusado')" class="px-3 py-1.5 bg-white text-slate-400 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Sem Interesse</button>
            </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref="chatContainer">
            <div v-if="loadingMessages" class="flex justify-center py-8">
                <div class="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <template v-else>
                <div 
                    v-for="msg in orderedMessages" 
                    :key="msg.id" 
                    class="flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300"
                    :class="msg.remetente_id === user?.id ? 'items-end' : 'items-start'"
                >
                    <!-- Bubble Container -->
                    <div 
                        class="relative max-w-[85%] md:max-w-[70%] p-4 transition-all duration-300 hover:shadow-xl"
                        :class="msg.remetente_id === user?.id 
                            ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-[24px] rounded-tr-[4px] shadow-lg shadow-green-600/20' 
                            : 'bg-white text-slate-800 rounded-[24px] rounded-tl-[4px] border border-slate-100 shadow-lg shadow-slate-200/50'"
                    >
                        <!-- Attachment Link -->
                        <div v-if="msg.url_anexo" class="mb-3">
                            <a v-if="msg.tipo_anexo === 'image'" :href="msg.url_anexo" target="_blank" class="block rounded-2xl overflow-hidden border border-white/10 shadow-lg group/img relative">
                                <img :src="msg.url_anexo" class="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-700" />
                                <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
                            </a>
                            <a v-else :href="msg.url_anexo" target="_blank" class="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5 backdrop-blur-sm">
                                <div class="p-2 bg-white/20 rounded-lg">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <span class="text-xs font-bold truncate max-w-[150px]">Baixar Anexo</span>
                            </a>
                        </div>

                        <!-- Message Text -->
                        <p 
                            class="text-[14px] md:text-[15px] leading-relaxed font-semibold whitespace-pre-wrap select-text"
                            :class="msg.remetente_id === user?.id ? 'text-white/95' : 'text-slate-700'"
                        >
                            {{ msg.conteudo }}
                        </p>

                        <!-- Footer Bubble (Time + Read Receipt) -->
                        <div 
                            class="flex items-center gap-2 mt-2" 
                            :class="msg.remetente_id === user?.id ? 'justify-end text-white/50' : 'justify-start text-slate-400'"
                        >
                            <span class="text-[9px] font-black uppercase tracking-widest leading-none">
                                {{ new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                            </span>
                            <div v-if="msg.remetente_id === user?.id" class="flex items-center">
                                <svg v-if="msg.lida" class="w-3 h-3 text-cyan-300" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172 5.414 8.586a2 2 0 00-2.828 2.828l3 3a2 2 0 002.828 0l9-9a2 2 0 000-2.828z"></path><path d="M12.414 7.586L10 10.172 8.414 8.586a2 2 0 10-2.828 2.828l3 3a2 2 0 002.828 0l4-4a2 2 0 00-2.828-2.828z"></path></svg>
                                <svg v-else class="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Input -->
        <div class="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
            <form @submit.prevent="sendMessage()" class="flex items-center gap-3">
                <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" accept="image/*,.pdf,.doc,.docx" />
                <button type="button" @click="fileInput?.click()" class="p-4 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95" :disabled="uploadingFile">
                    <div v-if="uploadingFile" class="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </button>
                <div class="flex-1 relative">
                    <input v-model="newMessage" type="text" placeholder="Escreva sua mensagem..." class="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-green-600 transition-all" />
                </div>
                <button type="submit" class="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95 disabled:opacity-50" :disabled="!newMessage.trim() && !uploadingFile">
                    <svg class="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
        <div class="w-32 h-32 bg-white rounded-[40px] shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center mb-8">
            <svg class="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-slate-800 mb-2">Suas Conversas</h2>
        <p class="max-w-xs font-medium text-slate-500">Selecione uma conexão ao lado para iniciar ou continuar uma conversa.</p>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* For Firefox */
.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 transparent;
}
</style>
