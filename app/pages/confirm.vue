<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useProfileStore } from '~/stores/profile'
import type { Database } from '~/types/database.types'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const PENDING_PROFILE_KEY = 'pebas_pending_complete_profile'

// Observe o usuário para redirecionar assim que a sessão for confirmada
watch(user, async (newUser) => {
  if (newUser) {
    // Sincroniza o perfil antes de decidir o destino
    const { data: { session } } = await supabase.auth.getSession()
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
        <p class="text-slate-500 font-medium mt-2">Só um momento, estamos preparando tudo para você.</p>
      </div>
    </div>
  </div>
</template>
