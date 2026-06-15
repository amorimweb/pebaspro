<script setup lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  Download,
  FileText,
  Image,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Send,
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const user = useSupabaseUser()
const route = useRoute()
const supabase = useSupabaseClient()
const participantId = computed(() => authStore.profile?.id || user.value?.id || null)

const {
  loading,
  loadingMessages,
  conversations,
  messages,
  activeConversationId,
  fetchConversations,
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  subscribeToConversations,
} = useMensagens(participantId)

const newMessage = ref('')
const searchTerm = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const fileInputPdf = ref<HTMLInputElement | null>(null)
const fileInputImg = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const showAttachMenu = ref(false)
const toast = ref<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)
let unsubscribeMessages: (() => void) | null = null
let unsubscribeConversations: (() => void) | null = null

const filteredConversations = computed(() => {
  if (!searchTerm.value) return conversations.value
  const term = searchTerm.value.toLowerCase()
  return conversations.value.filter((conversation) =>
    conversation.otherUser?.nome?.toLowerCase().includes(term) ||
    conversation.vaga?.titulo?.toLowerCase().includes(term) ||
    conversation.ultima_mensagem?.toLowerCase().includes(term)
  )
})

const activeConv = computed(() =>
  conversations.value.find((conversation) => conversation.id === activeConversationId.value)
)

const orderedMessages = computed(() =>
  [...messages.value].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
)

const hasActiveConversation = computed(() => Boolean(activeConversationId.value))

const authHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : undefined
}

const initMensagens = async () => {
  await fetchConversations()

  if (!unsubscribeConversations) {
    unsubscribeConversations = subscribeToConversations(() => fetchConversations())
  }

  const conversationId = (route.query.conversa || route.query.id) as string
  if (conversationId) await selectConversation(conversationId)
}

onMounted(() => {
  if (participantId.value) {
    initMensagens()
  } else {
    const stop = watch(() => participantId.value, (id) => {
      if (!id) return
      stop()
      initMensagens()
    })
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
  unsubscribeMessages = subscribeToMessages(id, (message) => {
    messages.value.push(message)
    scrollToBottom()
  })
  scrollToBottom()
}

const closeConversation = () => {
  activeConversationId.value = null
  messages.value = []
  if (unsubscribeMessages) {
    unsubscribeMessages()
    unsubscribeMessages = null
  }
}

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !activeConversationId.value) return
  const text = newMessage.value
  newMessage.value = ''

  try {
    await sendMessage(activeConversationId.value, text)
    await fetchMessages(activeConversationId.value)
    scrollToBottom()
  } catch {
    newMessage.value = text
    mostrarToast('Erro ao enviar mensagem.', 'erro')
  }
}

const handlePdfSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !activeConversationId.value) return

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    mostrarToast('Apenas arquivos PDF sao aceitos.', 'erro')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    mostrarToast('Arquivo muito grande. Maximo 10 MB.', 'erro')
    return
  }

  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('conversa_id', activeConversationId.value)
    form.append('empresa_id', activeConv.value?.otherUser?.id || '')
    form.append('talento_id', participantId.value || '')

    await $fetch('/api/upload/documento', {
      method: 'POST',
      body: form,
      headers: await authHeaders(),
    })
    await fetchMessages(activeConversationId.value)
    scrollToBottom()
    mostrarToast('Documento enviado.', 'ok')
  } catch (err: any) {
    mostrarToast(err?.data?.statusMessage || 'Erro ao enviar documento.', 'erro')
  } finally {
    uploading.value = false
    if (fileInputPdf.value) fileInputPdf.value.value = ''
  }
}

const handleImageSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !activeConversationId.value) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    mostrarToast('Use JPG, PNG ou WebP.', 'erro')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    mostrarToast('Imagem muito grande. Maximo 5 MB.', 'erro')
    return
  }

  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('conversa_id', activeConversationId.value)

    await $fetch('/api/upload/imagem', {
      method: 'POST',
      body: form,
      headers: await authHeaders(),
    })
    await fetchMessages(activeConversationId.value)
    scrollToBottom()
    mostrarToast('Imagem enviada.', 'ok')
  } catch (err: any) {
    mostrarToast(err?.data?.statusMessage || 'Erro ao enviar imagem.', 'erro')
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
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

const mostrarToast = (msg: string, tipo: 'ok' | 'erro' = 'ok') => {
  toast.value = { msg, tipo }
  setTimeout(() => {
    if (toast.value?.msg === msg) toast.value = null
  }, 5000)
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const formatDate = (date: string) => {
  const parsed = new Date(date)
  if (new Date().toDateString() === parsed.toDateString()) return 'Hoje'
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-20 pt-8">
    <Transition name="slide-up">
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 z-[220] flex max-w-sm items-center justify-between gap-4 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 v-if="toast.tipo === 'ok'" class="text-green-400" :size="20" />
          <AlertCircle v-else class="text-red-400" :size="20" />
          <span class="text-sm font-bold">{{ toast.msg }}</span>
        </div>
        <button class="text-white/50 transition hover:text-white" @click="toast = null">
          <ArrowLeft class="rotate-90" :size="16" />
        </button>
      </div>
    </Transition>

    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span class="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-green-700">
              Mensagens
            </span>
            <h1 class="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Conversas com empresas
            </h1>
            <p class="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-500 md:text-lg">
              Acompanhe retornos de candidaturas, combine detalhes e mantenha seu historico organizado.
            </p>
          </div>

          <NuxtLink
            to="/vagas"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-green-600/20 transition hover:bg-green-700 active:scale-95"
          >
            Buscar vagas
          </NuxtLink>
        </div>
      </div>

      <div class="messages-shell">
        <aside class="conversation-list" :class="{ 'is-hidden-mobile': hasActiveConversation }">
          <div class="list-header">
            <div>
              <p class="section-kicker">Caixa de entrada</p>
              <h2>Minhas conversas</h2>
            </div>
            <span class="conversation-count">{{ filteredConversations.length }}</span>
          </div>

          <div class="search-box">
            <Search :size="18" />
            <input v-model="searchTerm" type="text" placeholder="Buscar contato ou vaga" />
          </div>

          <div class="conversation-scroll">
            <div v-if="loading && conversations.length === 0" class="empty-list">
              <div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />
              <p>Carregando conversas...</p>
            </div>

            <div v-else-if="filteredConversations.length === 0" class="empty-list">
              <MessageSquare class="mx-auto mb-4 text-slate-200" :size="42" />
              <p>Nenhuma conversa encontrada.</p>
            </div>

            <button
              v-for="conversation in filteredConversations"
              v-else
              :key="conversation.id"
              type="button"
              class="conversation-card"
              :class="{ active: activeConversationId === conversation.id }"
              @click="selectConversation(conversation.id)"
            >
              <div class="avatar">
                <img v-if="conversation.otherUser?.foto" :src="conversation.otherUser.foto" alt="" />
                <span v-else>{{ conversation.otherUser?.nome?.charAt(0) || '?' }}</span>
                <span v-if="conversation.tipo_contato === 'whatsapp'" class="whatsapp-dot">
                  <Phone :size="12" />
                </span>
              </div>

              <div class="conversation-info">
                <div class="conversation-topline">
                  <strong>{{ conversation.otherUser?.nome || 'Contato' }}</strong>
                  <small>{{ formatDate(conversation.updated_at) }}</small>
                </div>
                <p v-if="conversation.vaga" class="job-label">{{ conversation.vaga.titulo }}</p>
                <p class="last-message">{{ conversation.ultima_mensagem || 'Inicie a conversa...' }}</p>
              </div>
            </button>
          </div>
        </aside>

        <main class="chat-panel" :class="{ 'is-visible-mobile': hasActiveConversation }">
          <template v-if="activeConversationId">
            <header class="chat-header">
              <div class="flex min-w-0 items-center gap-3">
                <button class="back-button" type="button" @click="closeConversation">
                  <ArrowLeft :size="20" />
                </button>
                <div class="chat-avatar">
                  <img v-if="activeConv?.otherUser?.foto" :src="activeConv.otherUser.foto" alt="" />
                  <span v-else>{{ activeConv?.otherUser?.nome?.charAt(0) || '?' }}</span>
                </div>
                <div class="min-w-0">
                  <h3>{{ activeConv?.otherUser?.nome || 'Contato' }}</h3>
                  <p>{{ activeConv?.vaga?.titulo || activeConv?.otherUser?.tipo_conta || 'Empresa' }}</p>
                </div>
              </div>

              <div class="relative">
                <input ref="fileInputPdf" type="file" accept=".pdf,application/pdf" class="hidden" @change="handlePdfSelect" />
                <input ref="fileInputImg" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleImageSelect" />

                <button
                  class="attach-button"
                  type="button"
                  :disabled="uploading"
                  @click="showAttachMenu = !showAttachMenu"
                >
                  <span v-if="uploading" class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />
                  <Paperclip v-else :size="20" />
                </button>

                <div v-if="showAttachMenu" class="attach-menu">
                  <button type="button" @click="fileInputPdf?.click(); showAttachMenu = false">
                    <FileText :size="16" />
                    PDF
                  </button>
                  <button type="button" @click="fileInputImg?.click(); showAttachMenu = false">
                    <Image :size="16" />
                    Imagem
                  </button>
                </div>
              </div>
            </header>

            <div ref="chatContainer" class="messages-area">
              <div v-if="loadingMessages" class="flex h-full items-center justify-center">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />
              </div>

              <div v-else-if="messages.length === 0" class="empty-chat">
                <MessageSquare :size="42" />
                <p>Inicie a conversa</p>
              </div>

              <div
                v-for="message in orderedMessages"
                v-else
                :key="message.id"
                class="message-row"
                :class="{ mine: message.remetente_id === participantId }"
              >
                <div
                  v-if="message.tipo === 'imagem'"
                  class="message-image"
                  :class="{ mine: message.remetente_id === participantId }"
                >
                  <a :href="message.conteudo" target="_blank">
                    <img :src="message.conteudo" alt="Imagem enviada" />
                  </a>
                </div>

                <div
                  v-else-if="message.tipo === 'documento' && message.documento"
                  class="message-document"
                  :class="{ mine: message.remetente_id === participantId }"
                >
                  <FileText class="shrink-0 text-green-600" :size="22" />
                  <div class="min-w-0 flex-1">
                    <strong>{{ message.documento.nome }}</strong>
                    <span>PDF {{ message.documento.tamanho_bytes ? '- ' + formatBytes(message.documento.tamanho_bytes) : '' }}</span>
                  </div>
                  <a :href="message.documento.url" target="_blank" download>
                    <Download :size="16" />
                  </a>
                </div>

                <div
                  v-else
                  class="message-bubble"
                  :class="{ mine: message.remetente_id === participantId }"
                >
                  {{ message.conteudo }}
                </div>

                <div class="message-time">
                  <span>{{ formatTime(message.created_at) }}</span>
                  <CheckCheck v-if="message.remetente_id === participantId" :size="13" />
                </div>
              </div>
            </div>

            <form class="message-form" @submit.prevent="handleSendMessage">
              <input v-model="newMessage" type="text" placeholder="Digite sua mensagem..." />
              <button type="submit" :disabled="!newMessage.trim() || loadingMessages">
                <Send :size="20" />
              </button>
            </form>
          </template>

          <div v-else class="select-state">
            <div class="select-icon">
              <MessageSquare :size="48" />
            </div>
            <h3>Selecione uma conversa</h3>
            <p>Suas mensagens com empresas e recrutadores aparecem aqui.</p>
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<style scoped>
.messages-shell {
  display: grid;
  grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
  min-height: 680px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 32px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.06);
}

.conversation-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border-right: 1px solid #f1f5f9;
  background: #ffffff;
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 18px;
}

.section-kicker {
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #16a34a;
}

.list-header h2 {
  color: #0f172a;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.conversation-count {
  min-width: 34px;
  border-radius: 999px;
  background: #f0fdf4;
  padding: 6px 10px;
  color: #166534;
  text-align: center;
  font-size: 12px;
  font-weight: 900;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 28px 20px;
  border-radius: 20px;
  background: #f8fafc;
  padding: 0 18px;
  color: #94a3b8;
}

.search-box input {
  min-width: 0;
  width: 100%;
  height: 54px;
  border: 0;
  background: transparent;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  outline: none;
}

.conversation-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0 18px 22px;
}

.conversation-card {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: 14px;
  border: 1px solid transparent;
  border-radius: 24px;
  padding: 16px;
  text-align: left;
  transition: all 0.2s ease;
}

.conversation-card:hover,
.conversation-card.active {
  border-color: #dcfce7;
  background: #f7fef9;
}

.avatar,
.chat-avatar {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #16a34a;
  font-weight: 900;
}

.avatar {
  width: 54px;
  height: 54px;
  border-radius: 18px;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
}

.avatar img,
.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.whatsapp-dot {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  border-radius: 9px;
  background: #22c55e;
  color: #ffffff;
}

.conversation-info {
  min-width: 0;
  flex: 1;
}

.conversation-topline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.conversation-topline strong {
  min-width: 0;
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.conversation-topline small {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.job-label,
.last-message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-label {
  margin-bottom: 4px;
  color: #16a34a;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.last-message {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}

.chat-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  background: #ffffff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding: 22px 26px;
}

.chat-header h3 {
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 900;
}

.chat-header p {
  overflow: hidden;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 800;
}

.back-button {
  display: none;
  flex-shrink: 0;
  border-radius: 14px;
  padding: 10px;
  color: #64748b;
}

.back-button:hover {
  background: #f8fafc;
  color: #0f172a;
}

.attach-button {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #64748b;
  transition: all 0.2s ease;
}

.attach-button:hover {
  background: #f8fafc;
  color: #16a34a;
}

.attach-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 30;
  min-width: 150px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.attach-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.attach-menu button:hover {
  background: #f8fafc;
}

.messages-area {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%);
  padding: 28px;
}

.message-row {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18px;
}

.message-row.mine {
  align-items: flex-end;
}

.message-bubble {
  max-width: min(620px, 76%);
  overflow-wrap: anywhere;
  border: 1px solid #e2e8f0;
  border-radius: 24px 24px 24px 8px;
  background: #ffffff;
  padding: 14px 18px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.65;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}

.message-bubble.mine {
  border-color: transparent;
  border-radius: 24px 24px 8px 24px;
  background: #16a34a;
  color: #ffffff;
}

.message-image,
.message-document {
  max-width: min(520px, 78%);
  overflow: hidden;
  border-radius: 24px 24px 24px 8px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.message-image.mine,
.message-document.mine {
  border-radius: 24px 24px 8px 24px;
}

.message-image img {
  display: block;
  max-height: 320px;
  width: 100%;
  object-fit: cover;
}

.message-document {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
  padding: 14px;
}

.message-document strong,
.message-document span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-document strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.message-document span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.message-document a {
  flex-shrink: 0;
  border-radius: 12px;
  padding: 8px;
  color: #64748b;
}

.message-document a:hover {
  background: #f0fdf4;
  color: #16a34a;
}

.message-time {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 0 6px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.message-form {
  display: flex;
  gap: 14px;
  border-top: 1px solid #f1f5f9;
  padding: 20px;
}

.message-form input {
  min-width: 0;
  flex: 1;
  border: 0;
  border-radius: 20px;
  background: #f8fafc;
  padding: 0 20px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  outline: none;
}

.message-form input:focus {
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

.message-form button {
  display: flex;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #16a34a;
  color: #ffffff;
  transition: all 0.2s ease;
}

.message-form button:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-1px);
}

.message-form button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.select-state,
.empty-chat,
.empty-list {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-weight: 800;
}

.select-icon {
  display: flex;
  width: 132px;
  height: 132px;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  background: #ffffff;
  color: #cbd5e1;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.05);
}

.select-state h3 {
  margin-bottom: 10px;
  color: #0f172a;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.select-state p {
  max-width: 360px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.6;
}

.empty-chat {
  min-height: 420px;
  color: #cbd5e1;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 767px) {
  .messages-shell {
    display: block;
    min-height: 680px;
    border-radius: 26px;
  }

  .conversation-list {
    min-height: 680px;
    border-right: 0;
  }

  .conversation-list.is-hidden-mobile {
    display: none;
  }

  .chat-panel {
    display: none;
    min-height: 680px;
  }

  .chat-panel.is-visible-mobile {
    display: flex;
  }

  .back-button {
    display: flex;
  }

  .list-header,
  .chat-header {
    padding: 22px 18px 16px;
  }

  .search-box {
    margin: 0 18px 16px;
  }

  .conversation-scroll {
    padding: 0 12px 18px;
  }

  .messages-area {
    padding: 18px 14px;
  }

  .message-bubble,
  .message-image,
  .message-document {
    max-width: 88%;
  }

  .message-form {
    padding: 14px;
  }

  .message-form button {
    width: 52px;
    height: 52px;
  }
}
</style>
