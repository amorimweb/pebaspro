<script setup lang="ts">
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Settings
} from 'lucide-vue-next'

const authStore = useAuthStore()
const loading = ref(false)

const isActive = computed(() => authStore.profile?.modo_prestador === true)

const activateProviderMode = async () => {
  if (isActive.value || loading.value) {
    await navigateTo('/painel/empresa/servicos')
    return
  }

  loading.value = true
  const { error } = await authStore.updateProfile({ modo_prestador: true })
  loading.value = false

  if (error) {
    alert('Nao foi possivel ativar o modo prestador agora.')
    return
  }

  await navigateTo('/painel/empresa/servicos')
}
</script>

<template>
  <div class="relative overflow-hidden mb-10 group">
    <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-[32px]"></div>
    <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-1000"></div>

    <div class="relative p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#1FAE66]">
            <CheckCircle2 size="18" />
          </div>
          <span class="text-[8px] font-black text-white/60 uppercase tracking-[0.15em]">Expanda sua Operacao</span>
        </div>

        <h2 class="text-lg font-black text-white tracking-tight leading-snug">
          {{ isActive ? 'Sua empresa tambem oferece' : 'Transforme sua Empresa em um' }}
          <span class="text-[#1FAE66]">Prestador de Servicos</span>
        </h2>
        <p class="text-white/60 font-medium mt-2 text-xs leading-tight">
          {{ isActive ? 'Gerencie os servicos da sua empresa e receba novos contatos pela PEBASPRO.' : 'Ative seu perfil de prestador para oferecer os servicos da sua empresa diretamente na PEBASPRO.' }}
        </p>

        <div class="flex flex-wrap items-center gap-3 mt-3">
          <div class="flex items-center gap-1.5 text-white/80">
            <div class="w-1 h-1 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Sem custos</span>
          </div>
          <div class="flex items-center gap-1.5 text-white/80">
            <div class="w-1 h-1 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Mesma conta</span>
          </div>
          <div class="flex items-center gap-1.5 text-white/80">
            <div class="w-1 h-1 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Leads</span>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex flex-col items-center gap-2">
        <button
          class="px-6 py-2 bg-[#1FAE66] text-green-900 rounded-xl font-black text-[10px] uppercase tracking-tight shadow-lg shadow-green-950/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          :disabled="loading"
          @click="activateProviderMode"
        >
          <Loader2 v-if="loading" size="12" class="animate-spin" />
          <Settings v-else-if="isActive" size="12" />
          <ArrowRight v-else size="12" />
          {{ loading ? 'Ativando' : isActive ? 'Gerenciar' : 'Ativar' }}
        </button>
        <span class="text-[7px] font-black text-white/30 uppercase tracking-tighter">Plano Corporativo</span>
      </div>
    </div>
  </div>
</template>
