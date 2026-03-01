<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database.types'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()

// Observe o usuário para redirecionar assim que a sessão for confirmada
watch(user, async (newUser) => {
  if (newUser) {
    // Sincroniza o perfil antes de decidir o destino
    await authStore.fetchProfile()
    
    const profile = authStore.profile
    
    // 1. Se o perfil estiver incompleto, forçar onboarding
    if (!profile || !profile.cadastro_completo) {
      navigateTo('/cadastro/onboarding')
    } else {
      // 2. Redirecionar baseado no tipo de conta se o perfil estiver completo
      const redirectMap: Record<string, string> = {
        talento: '/',
        empresa: '/painel/empresa',
        prestador: '/painel/prestador',
        cliente: '/',
      }
      
      const target = redirectMap[profile.tipo_conta as keyof typeof redirectMap] || '/'
      navigateTo(target)
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
