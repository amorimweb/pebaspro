<script setup lang="ts">
import { 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star 
} from 'lucide-vue-next'

const candidates = [
  { id: 1, name: 'Ricardo Santos', role: 'Operador de Escavadeira', location: 'Parauapebas', score: 92, status: 'Triagem', pending: 'Avaliação técnica', category: 'Operacional' },
  { id: 2, name: 'Ana Beatriz Souza', role: 'Engenheira de Minas', location: 'Canaã dos Carajás', score: 88, status: 'Triagem', pending: 'Nenhuma', category: 'Engenharia' },
  { id: 3, name: 'Carlos Eduardo', role: 'Técnico em Segurança', location: 'Parauapebas', score: 95, status: 'Entrevista', pending: 'Feedback RH', category: 'Técnico' },
  { id: 4, name: 'Juliana Lima', role: 'Assistente Administrativo', location: 'Parauapebas', score: 84, status: 'Documentação', pending: 'RG e CPF', category: 'ADM' },
  { id: 5, name: 'Marcos Oliveira', role: 'Mecânico Pesado', location: 'Parauapebas', score: 90, status: 'Documentação', pending: 'Certificados', category: 'Operacional' },
  { id: 6, name: 'Patrícia Mendes', role: 'Gerente de Projetos', location: 'Parauapebas', score: 98, status: 'Contratação', pending: 'Exame de Admissão', category: 'Engenharia' },
]

const stages = ['Triagem', 'Entrevista', 'Documentação', 'Contratação']

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'Triagem': 'bg-emerald-100 text-emerald-600',
    'Entrevista': 'bg-green-100 text-green-600',
    'Documentação': 'bg-teal-100 text-teal-600',
    'Contratação': 'bg-green-600 text-white',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
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

    <div class="flex-1 space-y-4">
      <div 
        v-for="c in candidates" 
        :key="c.id"
        class="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm border border-slate-100 group-hover:bg-green-600/5 group-hover:text-green-600 transition-colors">
            {{ c.name.charAt(0) }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-black text-slate-900 leading-tight">{{ c.name }}</p>
              <div class="flex items-center gap-0.5 text-[#F9C74F]">
                <Star size="10" fill="currentColor" />
                <span class="text-[10px] font-black">{{ (c.score / 20).toFixed(1) }}</span>
              </div>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ c.role }}</p>
            <div class="flex items-center gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
              <span class="flex items-center gap-1"><MapPin size="10" /> {{ c.location }}</span>
              <span class="flex items-center gap-1 text-slate-500"><Clock size="10" /> {{ c.pending }}</span>
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
