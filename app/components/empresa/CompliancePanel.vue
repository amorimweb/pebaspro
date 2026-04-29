<script setup lang="ts">
import { 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  ShieldAlert,
  HeartPulse,
  Flame
} from 'lucide-vue-next'
import { computed } from 'vue'

const alerts = [
  { id: 101, title: 'ASO Vencendo (Ricardo S.)', date: 'Vence em 2 dias', status: 'crítico', type: 'Saúde Ocupacional', icon: HeartPulse },
  { id: 102, title: 'Treinamento NR-10 Pendente', date: 'Hoje', status: 'crítico', type: 'Segurança', icon: Flame },
  { id: 103, title: 'Exame Periódico (Ana B.)', date: 'Vence em 15 dias', status: 'atenção', type: 'Saúde', icon: Activity },
  { id: 104, title: 'Função com Risco s/ Revisão', date: 'Vence em 30 dias', status: 'atenção', type: 'SST', icon: ShieldAlert },
]

const getStatusStyles = (status: string) => {
  return status === 'crítico' 
    ? 'text-red-600 bg-red-50 border-red-100' 
    : 'text-amber-600 bg-amber-50 border-amber-100'
}

const currentScore = computed(() => {
  const base = 82
  return Math.min(100, base + (6 - alerts.length) * 3)
})

const scoreLabel = computed(() => {
  if (currentScore.value > 90) return 'Nível Excelente'
  if (currentScore.value > 80) return 'Nível Regular'
  return 'Nível Crítico'
})
</script>

<template>
  <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">Compliance SST + eSocial</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de conformidade ativa</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
        <AlertTriangle size="20" />
      </div>
    </div>

    <div class="space-y-4 flex-1">
      <div 
        v-for="a in alerts" 
        :key="a.id"
        class="group flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer bg-slate-50/30"
      >
        <div class="flex items-center gap-4">
          <div :class="[getStatusStyles(a.status), 'w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110']">
            <component :is="a.icon" size="18" />
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 leading-tight">{{ a.title }}</p>
            <div class="flex items-center gap-2 mt-0.5">
               <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ a.type }}</span>
               <span class="w-1 h-1 bg-slate-300 rounded-full" />
               <span :class="[a.status === 'crítico' ? 'text-red-500' : 'text-amber-500', 'text-[9px] font-bold uppercase tracking-widest']">{{ a.date }}</span>
            </div>
          </div>
        </div>
        <ChevronRight size="14" class="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
      </div>
    </div>

    <div class="mt-8 rounded-[24px] border border-slate-100 bg-slate-50 p-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-black text-slate-900">Índice de Conformidade</span>
        <span class="text-sm font-black text-emerald-600">{{ currentScore }}%</span>
      </div>
      <div class="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div class="h-full rounded-full bg-emerald-500 transition-all duration-1000" :style="{ width: currentScore + '%' }" />
      </div>
      <p class="mt-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">{{ scoreLabel }}</p>
    </div>

    <button class="mt-8 py-4 bg-[#0D2E5C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1787D4] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10">
      Acessar Central SST <ChevronRight size="12" />
    </button>
  </div>
</template>
