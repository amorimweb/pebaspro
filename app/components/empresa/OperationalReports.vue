<script setup lang="ts">
import { Filter, Download } from 'lucide-vue-next'

const chartData = [
  { name: 'Operacional', value: 45, color: 'bg-emerald-500' },
  { name: 'Técnico', value: 30, color: 'bg-green-500' },
  { name: 'Engenharia', value: 15, color: 'bg-green-700' },
  { name: 'ADM', value: 25, color: 'bg-teal-500' },
  { name: 'Logística', value: 20, color: 'bg-emerald-800' },
]

const stats = [
  { label: 'Taxa de Conversão', value: '28.4%', subtext: '+2.1% este mês' },
  { label: 'Admissões Finalizadas', value: '142', subtext: 'Meta anual: 200' },
  { label: 'Candidatos em Processo', value: '582', subtext: 'Ativos em todos os fluxos' },
  { label: 'Documentos Pendentes', value: '12', subtext: 'Ação necessária imediata' },
  { label: 'Colaboradores Aptos', value: '3.2k', subtext: 'Base PEBASPRO' },
  { label: 'Bloqueios SST', value: '02', subtext: 'Monitoramento ativo' },
]
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

    <div class="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div class="rounded-[32px] bg-slate-50 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h4 class="text-sm font-black text-slate-900">Vagas por Setor</h4>
          </div>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Últimos 30 dias</span>
        </div>
        <div class="space-y-5">
          <div v-for="entry in chartData" :key="entry.name" class="space-y-2">
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
            <span class="text-sm font-bold text-slate-500">{{ stat.subtext }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
