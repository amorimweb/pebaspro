<script setup lang="ts">
import { 
  UserPlus, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  FileText,
  Send
} from 'lucide-vue-next'

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

    <div class="space-y-6 flex-1">
      <div v-for="adm in admissions" :key="adm.id" class="group cursor-pointer">
        <div class="flex items-center justify-between mb-2">
           <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[10px] text-slate-400 border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                {{ adm.name.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-black text-slate-900 leading-tight">{{ adm.name }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ adm.role }}</p>
              </div>
           </div>
           <div class="text-right">
              <span class="text-[10px] font-black" :class="getStatusColor(adm.status)">{{ adm.progress }}%</span>
           </div>
        </div>
        
        <div class="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mb-2">
          <div 
            class="h-full bg-teal-500 rounded-full transition-all duration-1000" 
            :style="{ width: adm.progress + '%' }"
          />
        </div>

        <div class="flex items-center justify-between">
           <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
             <Clock size="10" /> {{ adm.pending }}
           </span>
           <span class="text-[9px] font-black uppercase text-slate-600 tracking-widest">{{ adm.status }}</span>
        </div>
      </div>
    </div>

    <button class="mt-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
      Gerenciar Admissões <ChevronRight size="12" />
    </button>
  </div>
</template>
