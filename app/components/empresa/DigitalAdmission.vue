<script setup lang="ts">
import { UserPlus, ChevronRight, CheckCircle2, Clock } from 'lucide-vue-next'

const props = defineProps<{
  admissions?: any[]
  loading?: boolean
}>()

const getStepStatus = (checklist: any, step: string) => {
  if (!checklist) return ''
  // Mapeamento simplificado para os badges visuais
  const mapping: Record<string, string[]> = {
    'Matriz': ['rg', 'cpf'],
    'Exames': ['aso_admissional'],
    'Docs': ['comprovante_residencia', 'foto_3x4', 'ctps'],
    'eSocial': ['esocial_enviado'],
    'Liberação': ['contrato_assinado']
  }
  
  const fields = mapping[step] || []
  const done = fields.filter(f => !!checklist[f]).length
  if (done === fields.length) return 'completed'
  if (done > 0) return 'active'
  return ''
}

const getProgress = (checklist: any) => {
  if (!checklist) return 0
  const keys = Object.keys(checklist)
  const done = Object.values(checklist).filter(v => !!v).length
  return Math.round((done / keys.length) * 100)
}
</script>

<template>
  <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">Admissão Digital</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acompanhamento de onboarding e eSocial</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
        <UserPlus size="20" />
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-10 text-slate-400 gap-3 flex-1">
      <div class="w-6 h-6 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
      <span class="text-[10px] font-black uppercase tracking-widest">Carregando admissões...</span>
    </div>

    <div v-else-if="!admissions || admissions.length === 0" class="flex-1 flex flex-col items-center justify-center py-10 text-slate-300">
      <UserPlus :size="40" class="mb-4 opacity-20" />
      <p class="text-xs font-bold uppercase tracking-widest">Nenhuma admissão ativa</p>
    </div>

    <div v-else class="flex flex-col gap-4 flex-1">
      <div class="grid grid-cols-[2fr_2.5fr_1.2fr_0.8fr] gap-4 px-4 py-3 rounded-3xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
        <span>Colaborador</span>
        <span>Etapas</span>
        <span>Progresso</span>
        <span class="text-right">Ação</span>
      </div>

      <div class="space-y-4">
        <div v-for="adm in admissions" :key="adm.id" class="group rounded-[28px] border border-slate-100 bg-slate-50 p-4 cursor-pointer hover:bg-white hover:shadow-sm transition-all" @click="navigateTo('/painel/empresa/admissao')">
          <div class="grid grid-cols-[2fr_2.5fr_1.2fr_0.8fr] items-center gap-4">
            <div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-500 overflow-hidden shrink-0">
                  <img v-if="adm.talento?.foto" :src="adm.talento.foto" class="w-full h-full object-cover">
                  <span v-else>{{ adm.talento?.nome?.charAt(0) }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-900 leading-tight truncate">{{ adm.talento?.nome }}</p>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">{{ adm.cargo }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <span v-for="step in ['Matriz', 'Exames', 'Docs', 'eSocial', 'Liberação']" :key="step"
                :class="['rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest', 
                  getStepStatus(adm.checklist, step) === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                  getStepStatus(adm.checklist, step) === 'active' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                  'bg-slate-100 text-slate-500 border-slate-200']"
              >
                {{ step }}
              </span>
            </div>

            <div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div :class="['h-full rounded-full bg-green-500 transition-all duration-1000']" :style="{ width: getProgress(adm.checklist) + '%' }" />
              </div>
              <p class="mt-2 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{{ getProgress(adm.checklist) }}%</p>
            </div>

            <div class="text-right">
              <button class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-all">
                Ver
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
