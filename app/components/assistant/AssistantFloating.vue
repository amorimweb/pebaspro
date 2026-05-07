<script setup lang="ts">
import { MessageSquare, X, Send, Bot, User, Loader2, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const isOpen = ref(false)
const isLoading = ref(false)
const input = ref('')
const messagesEl = ref<HTMLElement | null>(null)

type ChatMessage = { id: string; role: 'user' | 'model'; text: string; ts: number }

const supabaseUser = useSupabaseUser()
const authStore = useAuthStore()

const userContext = computed(() => ({
  id: authStore.profile?.id || supabaseUser.value?.id || undefined,
  name: authStore.profile?.nome || undefined,
  role: (authStore.profile?.tipo_conta as any) || (supabaseUser.value?.id ? 'cliente' : 'visitante'),
}))

const storageKey = computed(() => `pebaspro_assistente_history_v1_${userContext.value.id || 'default'}`)

const defaultGreeting = computed(() => {
  const nome = userContext.value.name
  return nome
    ? `Olá, ${nome}. Sou a Patrícia, Assistente Virtual do **PEBASPRO**. Como posso ajudar você hoje?`
    : 'Olá! Sou a Patrícia, Assistente Virtual do **PEBASPRO**. Como posso ajudar você hoje?'
})

const messages = ref<ChatMessage[]>([])

const loadHistory = () => {
  if (!process.client) return
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[]
      messages.value = parsed?.length ? parsed : [{ id: 'welcome', role: 'model', text: defaultGreeting.value, ts: Date.now() }]
      return
    }
  } catch {}
  messages.value = [{ id: 'welcome', role: 'model', text: defaultGreeting.value, ts: Date.now() }]
}

const saveHistory = () => {
  if (!process.client) return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(messages.value))
  } catch {}
}

watch(storageKey, () => loadHistory(), { immediate: true })
watch(messages, () => saveHistory(), { deep: true })

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

watch(isOpen, (v) => { if (v) scrollToBottom() })

const clearHistory = () => {
  messages.value = [{ id: 'welcome', role: 'model', text: defaultGreeting.value, ts: Date.now() }]
}

const toggle = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  const userMsg: ChatMessage = { id: crypto.randomUUID?.() || String(Date.now()), role: 'user', text, ts: Date.now() }
  messages.value = [...messages.value, userMsg]
  input.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const apiMessages = messages.value
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }))

    const resp = await $fetch<{ text: string }>('/api/assistente/chat', {
      method: 'POST',
      body: { messages: apiMessages, userContext: userContext.value },
    })

    const modelMsg: ChatMessage = {
      id: crypto.randomUUID?.() || String(Date.now() + 1),
      role: 'model',
      text: resp?.text || 'Não consegui gerar uma resposta agora. Tente novamente.',
      ts: Date.now(),
    }
    messages.value = [...messages.value, modelMsg]
  } catch (e: any) {
    messages.value = [
      ...messages.value,
      {
        id: crypto.randomUUID?.() || String(Date.now() + 2),
        role: 'model',
        text: 'Desculpe, ocorreu um erro ao falar com o assistente. Verifique sua conexão e tente novamente.',
        ts: Date.now(),
      },
    ]
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[120] print:hidden">
    <!-- Botão flutuante -->
    <button
      v-if="!isOpen"
      class="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 text-white shadow-2xl shadow-emerald-500/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      title="Abrir assistente"
      @click="toggle"
    >
      <MessageSquare :size="22" />
    </button>

    <!-- Painel -->
    <div
      v-else
      class="w-[92vw] max-w-[420px] h-[70vh] max-h-[720px] bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden"
    >
      <div class="h-12 bg-slate-900 flex items-center justify-between px-4">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-200">
          Assistente PEBASPRO
        </p>
        <div class="flex items-center gap-1">
          <button class="p-2 text-white/70 hover:text-white" @click="clearHistory" title="Limpar conversa">
            <Trash2 :size="16" />
          </button>
          <button class="p-2 text-white/70 hover:text-white" @click="toggle" title="Fechar">
            <X :size="18" />
          </button>
        </div>
      </div>

      <!-- Mensagens -->
      <div ref="messagesEl" class="h-[calc(70vh-3rem-92px)] max-h-[calc(720px-3rem-92px)] overflow-y-auto p-4 bg-slate-50">
        <div class="space-y-3">
          <div
            v-for="m in messages"
            :key="m.id"
            class="flex gap-2"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div v-if="m.role === 'model'" class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center text-white shrink-0 mt-1">
              <Bot :size="18" />
            </div>

            <div
              class="max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm whitespace-pre-wrap"
              :class="m.role === 'user'
                ? 'bg-gradient-to-r from-emerald-500 to-sky-600 text-white rounded-tr-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'"
            >
              {{ m.text }}
            </div>

            <div v-if="m.role === 'user'" class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-1">
              <User :size="18" />
            </div>
          </div>

          <div v-if="isLoading" class="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 class="animate-spin" :size="16" />
            Digitando...
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-3 bg-white border-t border-slate-200">
        <form class="flex items-end gap-2" @submit.prevent="sendMessage">
          <textarea
            v-model="input"
            rows="1"
            placeholder="Digite sua mensagem..."
            class="flex-1 max-h-28 min-h-[44px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <button
            type="submit"
            class="w-11 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50"
            :disabled="!input.trim() || isLoading"
            title="Enviar"
          >
            <Send :size="18" />
          </button>
        </form>
        <p class="mt-2 text-[10px] text-slate-400 text-center">
          O assistente pode cometer erros. Confirme informações importantes.
        </p>
      </div>
    </div>
  </div>
</template>

