<script setup lang="ts">
import {
  MessageSquare, Send, CheckCheck,
  Search, Paperclip, FileText, Phone, Image,
  CheckCircle2, AlertCircle, ArrowLeft, Download
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const user = useSupabaseUser()
const route = useRoute()
const participantId = computed(() => authStore.profile?.id || user.value?.id || null)

const {
  loading, loadingMessages, conversations, messages, activeConversationId,
  fetchConversations, fetchMessages, sendMessage,
  subscribeToMessages, subscribeToConversations
} = useMensagens(participantId)

const newMessage    = ref('')
const searchTerm    = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const fileInputPdf  = ref<HTMLInputElement | null>(null)
const fileInputImg  = ref<HTMLInputElement | null>(null)
const uploading     = ref(false)
const showAttachMenu = ref(false)
const toast = ref<{ msg: string; tipo: 'ok' | 'erro'; action?: { label: string, to: string } } | null>(null)
let unsubscribeMessages: (() => void) | null = null
let unsubscribeConversations: (() => void) | null = null

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

const orderedMessages = computed(() =>
  [...messages.value].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
)

const initMensagens = async () => {
  await fetchConversations()
  if (!unsubscribeConversations) {
    unsubscribeConversations = subscribeToConversations(() => fetchConversations())
  }
  const conversaId = (route.query.conversa || route.query.id) as string
  if (conversaId) await selectConversation(conversaId)
}

onMounted(() => {
  if (participantId.value) {
    initMensagens()
  } else {
    const stop = watch(() => participantId.value, (id) => { if (id) { stop(); initMensagens() } })
  }
})

onUnmounted(() => {
  if (unsubscribeMessages) unsubscribeMessages()
  if (unsubscribeConversations) unsubscribeConversations()
})

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
  } catch {
    newMessage.value = text
    mostrarToast('Erro ao enviar mensagem', 'erro')
  }
}

const handlePdfSelect = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !activeConversationId.value) return

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    mostrarToast('Apenas arquivos PDF são aceitos', 'erro')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    mostrarToast('Arquivo muito grande. Máximo 10 MB.', 'erro')
    return
  }

  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('conversa_id', activeConversationId.value)
    form.append('empresa_id', activeConv.value?.otherUser?.id || participantId.value || '')
    form.append('talento_id', participantId.value || '')
    await $fetch('/api/upload/documento', { method: 'POST', body: form })
    await fetchMessages(activeConversationId.value)
    scrollToBottom()
    mostrarToast('Documento enviado!', 'ok')
  } catch (err: any) {
    mostrarToast(err?.data?.statusMessage || 'Erro ao enviar documento', 'erro')
  } finally {
    uploading.value = false
    if (fileInputPdf.value) fileInputPdf.value.value = ''
  }
}

const handleImageSelect = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !activeConversationId.value) return

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED.includes(file.type)) {
    mostrarToast('Use JPG, PNG ou WebP', 'erro')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    mostrarToast('Imagem muito grande. Máximo 5 MB.', 'erro')
    return
  }

  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('conversa_id', activeConversationId.value)
    await $fetch('/api/upload/imagem', { method: 'POST', body: form })
    await fetchMessages(activeConversationId.value)
    scrollToBottom()
    mostrarToast('Imagem enviada!', 'ok')
  } catch (err: any) {
    mostrarToast(err?.data?.statusMessage || 'Erro ao enviar imagem', 'erro')
  } finally {
    uploading.value = false
    if (fileInputImg.value) fileInputImg.value.value = ''
  }
}

const formatBytes = (bytes: number) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const scrollToBottom = () => {
  nextTick(() => { if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight })
}

const mostrarToast = (msg: string, tipo: 'ok' | 'erro' = 'ok', action?: any) => {
  toast.value = { msg, tipo, action }
  setTimeout(() => { if (toast.value?.msg === msg) toast.value = null }, 6000)
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

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
        <button @click="toast = null" class="opacity-50 hover:opacity-100 transition-opacity">
          <ArrowLeft class="rotate-90" :size="16" />
        </button>
      </div>
    </Transition>

    <div class="flex-1 bg-white rounded-[32px] shadow-sm border border-slate-100 flex overflow-hidden">

      <!-- List Panel -->
      <aside class="w-full md:w-96 border-r border-slate-50 flex flex-col bg-slate-50/20 shrink-0" :class="{ 'hidden md:flex': activeConversationId }">
        <div class="p-6 bg-white border-b border-slate-50">
          <h2 class="text-xl font-black text-[#0D2E5C] mb-4">Mensagens</h2>
          <div class="relative group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" :size="18" />
            <input v-model="searchTerm" type="text" placeholder="Buscar contatos..."
              class="w-full h-11 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none" />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div v-if="loading && conversations.length === 0" class="p-10 text-center space-y-4">
            <div class="w-8 h-8 border-2 border-slate-200 border-t-[#1FAE66] rounded-full animate-spin mx-auto" />
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando...</p>
          </div>

          <div v-else-if="filteredConversations.length === 0" class="p-10 text-center space-y-3">
            <MessageSquare class="mx-auto text-slate-200" :size="40" />
            <p class="text-sm font-medium text-slate-400">Nenhuma conversa encontrada.</p>
          </div>

          <div v-else class="divide-y divide-slate-50/50">
            <div v-for="conv in filteredConversations" :key="conv.id"
              @click="selectConversation(conv.id)"
              class="group relative p-5 cursor-pointer transition-all hover:bg-white flex gap-4"
              :class="activeConversationId === conv.id ? 'bg-white shadow-[inset_4px_0_0_0_#1FAE66]' : ''">
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
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold text-slate-900 truncate group-hover:text-[#1FAE66] transition-colors">
                    {{ conv.otherUser?.nome || 'Contato' }}
                  </h3>
                  <span class="text-[10px] font-black text-slate-300 uppercase shrink-0 ml-2">{{ formatDate(conv.updated_at) }}</span>
                </div>
                <p v-if="conv.vaga" class="text-[10px] font-black text-green-600 uppercase tracking-widest truncate mb-1">{{ conv.vaga.titulo }}</p>
                <p class="text-sm text-slate-400 truncate font-medium h-5">{{ conv.ultima_mensagem || 'Inicie a conversa...' }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Chat Panel -->
      <main v-if="activeConversationId" class="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
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
              <span class="text-[9px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded tracking-widest uppercase">
                {{ activeConv?.otherUser?.tipo_conta || 'EMPRESA' }}
              </span>
            </div>
          </div>

          <!-- Attach Menu -->
          <div class="relative">
            <input ref="fileInputPdf" type="file" accept=".pdf,application/pdf" class="hidden" @change="handlePdfSelect" />
            <input ref="fileInputImg" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleImageSelect" />

            <button @click="showAttachMenu = !showAttachMenu" :disabled="uploading"
              class="p-2.5 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-40"
              title="Anexar arquivo">
              <div v-if="uploading" class="w-5 h-5 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
              <Paperclip v-else :size="20" />
            </button>

            <Transition name="menu">
              <div v-if="showAttachMenu" v-click-outside="() => showAttachMenu = false"
                class="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden min-w-[160px]">
                <button @click="fileInputPdf?.click(); showAttachMenu = false"
                  class="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                  <div class="p-1.5 rounded-lg bg-green-50 text-green-600"><FileText :size="14" /></div>
                  <span class="text-sm font-bold text-slate-700">Documento PDF</span>
                </button>
                <button @click="fileInputImg?.click(); showAttachMenu = false"
                  class="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                  <div class="p-1.5 rounded-lg bg-blue-50 text-blue-500"><Image :size="14" /></div>
                  <span class="text-sm font-bold text-slate-700">Imagem</span>
                </button>
              </div>
            </Transition>
          </div>
        </header>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 space-y-6 bg-slate-50/20 custom-scrollbar" ref="chatContainer">
          <div v-if="loadingMessages" class="flex items-center justify-center h-full">
            <div class="w-6 h-6 border-2 border-slate-100 border-t-green-600 rounded-full animate-spin" />
          </div>
          <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-300">
            <MessageSquare class="mb-4 opacity-50" :size="40" />
            <p class="text-sm font-semibold uppercase tracking-widest">Inicie a conversa</p>
          </div>

          <div v-for="msg in orderedMessages" :key="msg.id"
            class="flex flex-col w-full"
            :class="msg.remetente_id === participantId ? 'items-end' : 'items-start'">

            <!-- Image message -->
            <div v-if="msg.tipo === 'imagem'"
              class="max-w-[70%] rounded-[20px] overflow-hidden shadow-sm"
              :class="msg.remetente_id === participantId ? 'rounded-tr-none' : 'rounded-tl-none'">
              <a :href="msg.conteudo" target="_blank">
                <img :src="msg.conteudo" class="w-full h-auto max-h-72 object-cover hover:opacity-95 transition-opacity" />
              </a>
            </div>

            <!-- Document message -->
            <div v-else-if="msg.tipo === 'documento' && msg.documento"
              class="max-w-[75%] bg-white border border-slate-100 rounded-[20px] shadow-sm overflow-hidden"
              :class="msg.remetente_id === participantId ? 'rounded-tr-none' : 'rounded-tl-none'">
              <div class="flex items-center gap-3 p-4">
                <div class="p-2.5 rounded-xl bg-green-600/10 text-green-600 shrink-0"><FileText :size="20" /></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-800 truncate">{{ msg.documento.nome }}</p>
                  <p class="text-[10px] text-slate-400 font-medium mt-0.5">PDF {{ msg.documento.tamanho_bytes ? '· ' + formatBytes(msg.documento.tamanho_bytes) : '' }}</p>
                </div>
                <a :href="msg.documento.url" target="_blank" download class="p-2 rounded-xl text-slate-400 hover:text-green-600 hover:bg-slate-50 transition-all">
                  <Download :size="16" />
                </a>
              </div>
            </div>

            <!-- Text message -->
            <div v-else class="max-w-[75%] px-5 py-4 shadow-sm"
              :class="msg.remetente_id === participantId
                ? 'bg-[#1FAE66] text-white rounded-[24px] rounded-tr-none'
                : 'bg-white text-slate-700 rounded-[24px] rounded-tl-none border border-slate-50'">
              <p class="text-sm font-medium leading-relaxed">{{ msg.conteudo }}</p>
            </div>

            <div class="flex items-center gap-1.5 mt-1.5 px-1">
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-300">{{ formatTime(msg.created_at) }}</span>
              <CheckCheck v-if="msg.remetente_id === participantId" class="text-[#1FAE66]" :size="12" />
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-6 bg-white border-t border-slate-50">
          <form @submit.prevent="handleSendMessage" class="flex gap-4">
            <input v-model="newMessage" type="text" placeholder="Envie uma mensagem..."
              class="flex-1 h-14 bg-slate-50 border-none rounded-[20px] px-6 text-sm font-medium focus:ring-2 focus:ring-[#1FAE66]/10 focus:bg-white transition-all outline-none">
            <button type="submit" :disabled="!newMessage.trim() || loadingMessages"
              class="bg-[#1FAE66] text-white w-14 h-14 rounded-[20px] flex items-center justify-center hover:bg-[#17974d] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:grayscale">
              <Send :size="20" class="ml-1" />
            </button>
          </form>
        </div>
      </main>

      <!-- Empty State -->
      <main v-else class="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-300">
        <div class="w-32 h-32 bg-white rounded-[40px] shadow-sm border border-slate-100 flex items-center justify-center mb-8">
          <MessageSquare class="text-slate-200" :size="48" />
        </div>
        <h3 class="text-xl font-[900] text-[#0D2E5C] uppercase tracking-widest mb-2">Selecione uma Conversa</h3>
        <p class="text-sm font-medium text-slate-400 max-w-xs text-center leading-relaxed">
          Suas mensagens com clientes e contratantes aparecem aqui.
        </p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
.menu-enter-active, .menu-leave-active { transition: all 0.15s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
