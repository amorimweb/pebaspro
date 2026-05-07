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
  <div class="fixed bottom-4 right-4 z-[120] print:hidden sm:bottom-6 sm:right-6">
    <button
      v-if="!isOpen"
      class="group relative flex h-[60px] w-[60px] items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-600 text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-1 hover:shadow-sky-600/30 active:translate-y-0"
      title="Abrir assistente"
      @click="toggle"
    >
      <span class="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-300 shadow-sm" />
      <MessageSquare :size="22" />
    </button>

    <div
      v-else
      class="flex h-[min(76vh,680px)] w-[calc(100vw-2rem)] max-w-[430px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5"
    >
      <div class="relative overflow-hidden bg-slate-950 px-4 py-4 text-white">
        <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-500/25 via-teal-400/10 to-sky-500/25" />
        <div class="relative flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 shadow-lg shadow-emerald-500/20">
              <Bot :size="22" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-black uppercase tracking-wide text-white">
                Patrícia
              </p>
              <div class="mt-1 flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(110,231,183,0.14)]" />
                <p class="text-[11px] font-bold text-slate-300">
                  Assistente PEBASPRO
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button class="rounded-xl p-2 text-white/65 transition hover:bg-white/10 hover:text-white" @click="clearHistory" title="Limpar conversa">
              <Trash2 :size="16" />
            </button>
            <button class="rounded-xl p-2 text-white/65 transition hover:bg-white/10 hover:text-white" @click="toggle" title="Fechar">
              <X :size="18" />
            </button>
          </div>
        </div>

        <div class="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3">
          <p class="text-xs font-semibold leading-relaxed text-slate-200">
            Tire dúvidas sobre vagas, serviços, cadastro, mensagens e currículo.
          </p>
        </div>
      </div>

      <div ref="messagesEl" class="assistant-scroll min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#eefdf6_48%,#f8fafc_100%)] px-4 py-5">
        <div class="space-y-4">
          <div
            v-for="m in messages"
            :key="m.id"
            class="flex items-end gap-2.5"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div v-if="m.role === 'model'" class="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-md shadow-emerald-500/20">
              <Bot :size="17" />
            </div>

            <div
              class="max-w-[78%] whitespace-pre-wrap px-4 py-3 text-sm font-semibold leading-relaxed shadow-sm"
              :class="m.role === 'user'
                ? 'rounded-[20px] rounded-br-md bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-sky-600/15'
                : 'rounded-[20px] rounded-bl-md border border-slate-200/80 bg-white text-slate-800 shadow-slate-200/70'"
            >
              {{ m.text }}
            </div>

            <div v-if="m.role === 'user'" class="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <User :size="17" />
            </div>
          </div>

          <div v-if="isLoading" class="flex items-center gap-2.5 pl-1 text-sm font-bold text-slate-500">
            <span class="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
              <Loader2 class="animate-spin" :size="16" />
            </span>
            Patrícia está digitando...
          </div>
        </div>
      </div>

      <div class="border-t border-slate-200/80 bg-white px-3 py-3">
        <form class="flex items-end gap-2" @submit.prevent="sendMessage">
          <textarea
            v-model="input"
            rows="1"
            placeholder="Digite sua mensagem..."
            class="min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <button
            type="submit"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="!input.trim() || isLoading"
            title="Enviar"
          >
            <Send :size="19" />
          </button>
        </form>
        <p class="mt-2 text-center text-[10px] font-medium text-slate-400">
          O assistente pode cometer erros. Confirme informações importantes.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assistant-scroll {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 transparent;
}

.assistant-scroll::-webkit-scrollbar {
  width: 8px;
}

.assistant-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.assistant-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}
</style>
