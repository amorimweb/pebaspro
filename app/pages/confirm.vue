<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useProfileStore } from '~/stores/profile'
import type { Database } from '~/types/database.types'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const PENDING_PROFILE_KEY = 'pebas_pending_complete_profile'

// Estado para exibir mensagem de conflito de conta
const conflictError = ref<string | null>(null)

// Fallback: se após 10 segundos o usuário ainda não chegou, redireciona para login
onMounted(() => {
  setTimeout(() => {
    if (!user.value && !conflictError.value) navigateTo('/login?error=auth')
  }, 10000)
})

// Observe o usuário para redirecionar assim que a sessão for confirmada
watch(user, async (newUser) => {
  if (!newUser) return

  const { data: { session } } = await supabase.auth.getSession()

  // ─── Detecção de conflito de provider ───────────────────────────────────
  // Verifica se o e-mail já está vinculado a uma conta criada com email/senha.
  // Isso evita que o usuário crie uma conta Google duplicada sem perceber.
  if (newUser.email) {
    try {
      const { conflict } = await $fetch<{ conflict: boolean }>('/api/auth/check-email-conflict', {
        method: 'POST',
        body: { email: newUser.email },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      })

      if (conflict) {
        // Desloga a conta Google recém-criada para não deixar conta fantasma ativa
        await authStore.signOut()
        conflictError.value = newUser.email
        return
      }
    } catch {
      // Se o endpoint falhar, deixa o fluxo normal continuar
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  let result = await authStore.fetchProfile(session?.access_token)
  let profile = result?.data
  let hadPendingRegistration = false

  if (!profile && newUser.user_metadata?.cadastro) {
    hadPendingRegistration = true
    const { error } = await profileStore.createProfile({
      id: newUser.id,
      email: newUser.email || null,
      ...newUser.user_metadata.cadastro
    })
    if (!error) {
      result = await authStore.fetchProfile(session?.access_token)
      profile = result?.data
    }
  }

  if (!profile && import.meta.client) {
    const storedProfile = localStorage.getItem(PENDING_PROFILE_KEY)
    if (storedProfile) {
      hadPendingRegistration = true
      try {
        const cadastro = JSON.parse(storedProfile)
        const { error } = await profileStore.createProfile({
          id: newUser.id,
          email: newUser.email || null,
          ...cadastro
        })
        if (!error) {
          localStorage.removeItem(PENDING_PROFILE_KEY)
          result = await authStore.fetchProfile(session?.access_token)
          profile = result?.data
        }
      } catch (error) {
        console.error('Erro ao concluir cadastro com Google:', error)
      }
    }
  }

  if (!profile && !hadPendingRegistration) {
    await authStore.signOut()
    navigateTo('/cadastro?complete=required')
    return
  }

  if (!profile || !profile.cadastro_completo || !profile.tipo_conta) {
    navigateTo('/cadastro/onboarding')
  } else {
    const redirectMap: Record<string, string> = {
      talento: '/',
      empresa: '/painel/empresa',
      prestador: '/painel/prestador',
      cliente: '/',
    }
    navigateTo(redirectMap[profile.tipo_conta] || '/')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-8">

      <!-- Estado normal: carregando -->
      <div v-if="!conflictError" class="animate-pulse flex flex-col items-center">
        <div class="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-4.94-5.714a8 8 0 0115.386-2.452M7 11V5a5 5 0 0110 0v6" />
          </svg>
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Confirmando conta...</h1>
        <p class="text-slate-500 font-medium mt-2">Só um momento, estamos preparando tudo para você.</p>
      </div>

      <!-- Estado de conflito: conta já existe com email/senha -->
      <div v-else class="flex flex-col items-center gap-6">
        <div class="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center">
          <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight mb-2">Conta já existente</h1>
          <p class="text-slate-600 font-medium">
            O e-mail <strong>{{ conflictError }}</strong> já está cadastrado com
            <strong>e-mail e senha</strong>.
          </p>
          <p class="text-slate-500 text-sm mt-2">
            Faça login normalmente com seu e-mail e senha. Se esqueceu a senha, use "Esqueceu a senha?" na tela de login.
          </p>
        </div>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
        >
          Ir para o login
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
