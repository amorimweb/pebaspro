<script setup lang="ts">
const authStore = useAuthStore()
const redirecting = ref(true)

const routeByAccountType = (type?: string | null) => {
  if (type === 'empresa') return '/painel/empresa/mensagens'
  if (type === 'prestador') return '/painel/prestador/mensagens'
  return '/painel/talento/mensagens'
}

const resolveMessagesRoute = async () => {
  try {
    if (!authStore.profile?.id) {
      await authStore.loadProfile()
    }

    await navigateTo(routeByAccountType(authStore.profile?.tipo_conta), { replace: true })
  } finally {
    redirecting.value = false
  }
}

if (import.meta.client) {
  onMounted(resolveMessagesRoute)
}
</script>

<template>
  <div v-if="redirecting" class="min-h-[50vh] flex items-center justify-center text-slate-400">
    Redirecionando...
  </div>
</template>
