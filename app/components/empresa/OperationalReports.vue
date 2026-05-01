<script setup lang="ts">
import { Filter, Download } from 'lucide-vue-next'

const props = defineProps<{
  categoryStats?: { name: string; value: number; color: string }[]
  statsOverview?: {
    activeJobs: number
    totalCandidates: number
    activeAdmissions: number
    views: number
  }
  loading?: boolean
}>()

const stats = computed(() => [
  { label: 'Candidatos em Processo', value: props.statsOverview?.totalCandidates.toString() || '0', subtext: 'Ativos em todos os fluxos' },
  { label: 'Admissões Ativas', value: props.statsOverview?.activeAdmissions.toString() || '0', subtext: 'Meta mensal: 10' },
  { label: 'Vagas Abertas', value: props.statsOverview?.activeJobs.toString() || '0', subtext: 'Disponíveis no portal' },
  { label: 'Visualizações', value: props.statsOverview?.views.toString() || '0', subtext: 'Perfil da empresa' },
])
</script>

<template>
  <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">Relatórios Operacionais</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análise avançada de performance e produtividade</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
          <Filter size="16" /> Filtrar
        </button>
        <button class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          <Download size="16" /> Exportar
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
      <div class="w-6 h-6 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
      <span class="text-[10px] font-black uppercase tracking-widest">Calculando estatísticas...</span>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div class="rounded-[32px] bg-slate-50 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h4 class="text-sm font-black text-slate-900">Vagas por Setor</h4>
          </div>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Geral</span>
        </div>
        <div v-if="!categoryStats || categoryStats.length === 0" class="py-10 text-center text-slate-400">
           <p class="text-xs font-bold uppercase tracking-widest">Nenhum dado disponível</p>
        </div>
        <div v-else class="space-y-5">
          <div v-for="entry in categoryStats" :key="entry.name" class="space-y-2">
            <div class="flex items-center justify-between text-sm font-bold text-slate-600">
              <span>{{ entry.name }}</span>
              <span>{{ entry.value }}%</span>
            </div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-white/70 shadow-inner">
              <div :class="['h-full rounded-full', entry.color]" :style="{ width: `${entry.value}%` }" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-4">
        <div v-for="stat in stats" :key="stat.label" class="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <span class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{{ stat.label }}</span>
          <div class="mt-3 flex items-center justify-between gap-4">
            <h4 class="text-2xl font-black text-slate-900">{{ stat.value }}</h4>
            <span class="text-sm font-bold text-slate-500 line-clamp-1">{{ stat.subtext }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
