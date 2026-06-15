<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database.types'
import { completeRegistrationRoute, profileHomeRoute } from '~/utils/authRedirect'
import { isProfileComplete } from '~/utils/profileCompletion'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const PENDING_PROFILE_KEY = 'pebas_pending_complete_profile'

const errorMsg = ref('')

const pendingProfile = () => {
  if (!import.meta.client) return null
  const raw = localStorage.getItem(PENDING_PROFILE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(PENDING_PROFILE_KEY)
    return null
  }
}

const finalizeSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const activeUser = session?.user || user.value

  if (!activeUser?.id) return false

  let result = await authStore.fetchProfile()
  let profile = result.data

  const cadastro = pendingProfile() || activeUser.user_metadata?.cadastro || null
  if (!profile && cadastro) {
    const saved = await authStore.saveCompleteProfile({
      id: activeUser.id,
      email: activeUser.email || null,
      ...cadastro,
    })

    if (saved.error) throw saved.error
    if (import.meta.client) localStorage.removeItem(PENDING_PROFILE_KEY)
    profile = saved.data
  }

  if (!profile) {
    await navigateTo(completeRegistrationRoute, { replace: true })
    return true
  }

  if (!isProfileComplete(profile)) {
    await navigateTo(completeRegistrationRoute, { replace: true })
    return true
  }

  await navigateTo(profileHomeRoute(profile), { replace: true })
  return true
}

onMounted(() => {
  setTimeout(async () => {
    const handled = await finalizeSession().catch(() => false)
    if (!handled && !user.value) await navigateTo('/login?error=auth', { replace: true })
  }, 10000)
})

watch(user, async () => {
  try {
    await finalizeSession()
  } catch (error: any) {
    console.error('Erro ao confirmar conta:', error)
    errorMsg.value = error?.data?.message || error?.message || 'Nao foi possivel confirmar sua conta.'
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-8">
      <div class="animate-pulse flex flex-col items-center">
        <div class="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-4.94-5.714a8 8 0 0115.386-2.452M7 11V5a5 5 0 0110 0v6" />
          </svg>
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Confirmando conta...</h1>
        <p class="text-slate-500 font-medium mt-2">So um momento, estamos preparando tudo para voce.</p>
        <p v-if="errorMsg" class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {{ errorMsg }}
        </p>
      </div>
    </div>
  </div>
</template>
