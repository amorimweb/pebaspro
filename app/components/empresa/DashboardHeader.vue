<script setup lang="ts">
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Briefcase, 
  FileCheck, 
  AlertTriangle, 
  Send 
} from 'lucide-vue-next'

const kpis = [
  { 
    icon: Briefcase, 
    label: 'Vagas Abertas', 
    value: '24', 
    trend: 'up', 
    trendValue: '12%', 
    color: 'text-green-600 bg-green-50',
    path: '/painel/empresa/vagas'
  },
  { 
    icon: Users, 
    label: 'Candidatos Ativos', 
    value: '158', 
    trend: 'up', 
    trendValue: '8%', 
    color: 'text-green-600 bg-green-50',
    path: '/painel/empresa/buscar-talentos'
  },
  { 
    icon: FileCheck, 
    label: 'Admissões / Onboarding', 
    value: '12', 
    trend: 'down', 
    trendValue: '4%', 
    color: 'text-emerald-600 bg-emerald-50',
    path: '/painel/empresa/admissao'
  },
  
  { 
    icon: Clock, 
    label: 'Média Contratação', 
    value: '14d', 
    trend: 'down', 
    trendValue: '1d', 
    color: 'text-slate-600 bg-slate-50',
    path: '/painel/empresa/relatorios'
  },
]
</script>

<template>
  <div class="space-y-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Dashboard Empresarial Integrado</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Recrutamento, admissão, compliance SST e eSocial em um único painel</p>
      </div>
      <div class="flex items-center gap-4">
        <button class="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          Exportar Relatórios
        </button>
        <button @click="navigateTo('/painel/empresa/vagas/nova')" class="px-8 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">
          + Nova Vaga
        </button>
      </div>
    </div>

    <!-- KPIs Grid - 2 linhas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <NuxtLink 
        v-for="kpi in kpis" 
        :key="kpi.label"
        :to="kpi.path"
        class="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col gap-4"
      >
        <div class="flex items-center gap-4">
          <div :class="[kpi.color, 'w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110']">
            <component :is="kpi.icon" size="20" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{{ kpi.label }}</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-xl font-black text-slate-900 leading-tight">{{ kpi.value }}</h3>
              <span :class="[kpi.trend === 'up' ? 'text-green-500' : 'text-red-500', 'flex items-center text-[10px] font-black']">
                <TrendingUp v-if="kpi.trend === 'up'" size="10" />
                <TrendingDown v-else size="10" />
                {{ kpi.trendValue }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeInDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
