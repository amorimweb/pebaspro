<script setup lang="ts">
import { UserPlus, ChevronRight, CheckCircle2, Clock } from 'lucide-vue-next'

const admissions = [
  { id: 7, name: 'Fernanda Rocha', role: 'Auxiliar de Almoxarifado', progress: 65, status: 'Em Conferência', pending: 'Aguardando ASO' },
  { id: 8, name: 'Gabriel Souza', role: 'Motorista Off-Road', progress: 30, status: 'Documentação', pending: 'Certificado MOPP' },
  { id: 9, name: 'Lúcia Ferreira', role: 'Técnica de Planejamento', progress: 90, status: 'eSocial', pending: 'Envio S-2200' },
]

const getStatusColor = (status: string) => {
  if (status === 'eSocial') return 'text-teal-600'
  if (status === 'Documentação') return 'text-amber-600'
  return 'text-indigo-600'
}

const getStepStatus = (progress: number, threshold: number) => {
  if (progress >= threshold) return 'completed'
  if (progress >= threshold - 20) return 'active'
  return ''
}
</script>

<template>
  <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">Admissão Digital</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acompanhamento de onboarding e eSocial</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
        <UserPlus size="20" />
      </div>
    </div>

    <div class="flex flex-col gap-4 flex-1">
      <div class="grid grid-cols-[2fr_2.5fr_1.2fr_0.8fr] gap-4 px-4 py-3 rounded-3xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
        <span>Colaborador</span>
        <span>Etapas</span>
        <span>Progresso</span>
        <span class="text-right">Ação</span>
      </div>

      <div class="space-y-4">
        <div v-for="adm in admissions" :key="adm.id" class="group rounded-[28px] border border-slate-100 bg-slate-50 p-4">
          <div class="grid grid-cols-[2fr_2.5fr_1.2fr_0.8fr] items-center gap-4">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-500">
                  {{ adm.name.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-black text-slate-900 leading-tight">{{ adm.name }}</p>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ adm.role }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <span :class="['rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest', getStepStatus(adm.progress, 20) === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : getStepStatus(adm.progress, 20) === 'active' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200']">Matriz</span>
              <span :class="['rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest', getStepStatus(adm.progress, 40) === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : getStepStatus(adm.progress, 40) === 'active' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200']">Exames</span>
              <span :class="['rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest', getStepStatus(adm.progress, 60) === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : getStepStatus(adm.progress, 60) === 'active' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200']">Docs</span>
              <span :class="['rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest', getStepStatus(adm.progress, 80) === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : getStepStatus(adm.progress, 80) === 'active' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200']">eSocial</span>
              <span :class="['rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest', adm.progress >= 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : adm.progress > 80 ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200']">Liberação</span>
            </div>

            <div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div :class="['h-full rounded-full bg-teal-500 transition-all duration-1000']" :style="{ width: adm.progress + '%' }" />
              </div>
              <p class="mt-2 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{{ adm.progress }}%</p>
            </div>

            <div class="text-right">
              <button class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-100 transition-all">
                {{ adm.progress >= 100 ? 'Finalizado' : 'Avançar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="mt-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
      Gerenciar Admissões <ChevronRight size="12" />
    </button>
  </div>
</template>
