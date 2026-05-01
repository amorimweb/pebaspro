<script setup lang="ts">
import { 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star 
} from 'lucide-vue-next'

const props = defineProps<{
  candidates: any[]
  loading?: boolean
}>()

const stages = ['Pendente', 'Em Análise', 'Entrevista', 'Aprovado']

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase()
  if (s === 'aprovado' || s === 'aceita') return 'bg-green-600 text-white'
  if (s === 'pendente') return 'bg-emerald-100 text-emerald-600'
  if (s === 'reprovado' || s === 'rejeitada') return 'bg-red-100 text-red-600'
  return 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">Pipeline de Recrutamento</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status em tempo real das candidaturas</p>
      </div>
      <button class="p-3 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-2xl transition-all">
        <Users size="20" />
      </button>
    </div>

    <!-- Pipeline Stages Horizontal Scroll -->
    <div class="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
      <div v-for="stage in stages" :key="stage" class="min-w-[140px] flex-1 flex flex-col gap-2">
        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div :class="['h-full transition-all duration-1000', getStatusColor(stage).split(' ')[0].replace('100', '500')]" style="width: 100%"></div>
        </div>
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ stage }}</span>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
      <div class="w-6 h-6 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
      <span class="text-[10px] font-black uppercase tracking-widest">Carregando pipeline...</span>
    </div>

    <div v-else-if="candidates.length === 0" class="flex-1 flex flex-col items-center justify-center py-10 text-slate-300">
      <Users :size="40" class="mb-4 opacity-20" />
      <p class="text-xs font-bold uppercase tracking-widest">Nenhuma candidatura recente</p>
    </div>

    <div v-else class="flex-1 space-y-4">
      <div 
        v-for="c in candidates" 
        :key="c.id"
        class="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer"
        @click="navigateTo(`/painel/empresa/vagas`)"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 group-hover:border-green-600/30 transition-all">
            <img v-if="c.talento?.foto" :src="c.talento.foto" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center font-black text-slate-300 text-sm">
              {{ c.talento?.nome?.charAt(0) }}
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-black text-slate-900 leading-tight">{{ c.talento?.nome }}</p>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ c.vaga?.titulo }}</p>
            <div class="flex items-center gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
              <span class="flex items-center gap-1"><MapPin size="10" /> {{ c.talento?.regiao || 'Parauapebas' }}</span>
              <span class="flex items-center gap-1 text-slate-500"><Clock size="10" /> {{ new Date(c.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span :class="[getStatusColor(c.status), 'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-transparent']">
            {{ c.status }}
          </span>
          <ChevronRight size="14" class="text-slate-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>

    <button class="mt-8 w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
      Ver Todos os Candidatos
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
