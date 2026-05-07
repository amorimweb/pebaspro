<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const authStore = useAuthStore()
const tipo = computed(() => authStore.profile?.tipo_conta)

watch(
  tipo,
  async (t) => {
    if (!t) return
    if (t === 'empresa') return navigateTo('/painel/empresa/mensagens', { replace: true })
    if (t === 'prestador') return navigateTo('/painel/prestador/mensagens', { replace: true })
    return navigateTo('/painel/talento/mensagens', { replace: true })
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-h-[50vh] flex items-center justify-center text-slate-400">
    Redirecionando…
  </div>
</template>

