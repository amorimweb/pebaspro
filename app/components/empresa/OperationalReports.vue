<script setup lang="ts">
import { 
  BarChart3, 
  ChevronRight, 
  ArrowUpRight, 
  TrendingUp,
  FileText
} from 'lucide-vue-next'

const props = defineProps<{
  recentJobs: any[]
  loading: boolean
}>()

const isVagaAtiva = (encerramento: string | null) => {
  if (!encerramento) return true
  const agora = new Date()
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const parts = encerramento.split('-')
  if (parts.length !== 3) return true
  const [year, month, day] = parts.map(Number)
  const dataEnc = new Date(year, month - 1, day)
  return dataEnc >= hoje
}
</script>

<template>
  <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">Vagas Recentes</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status operacional das suas posições</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <FileText size="20" />
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-x-auto scrollbar-hide">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-50">
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Título</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th class="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="loading" v-for="i in 3" :key="i">
             <td colspan="3" class="py-6"><div class="h-4 bg-slate-50 w-full animate-pulse rounded-full"></div></td>
          </tr>
          <tr v-else-if="recentJobs.length === 0">
             <td colspan="3" class="py-10 text-center">
                <p class="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhuma vaga registrada</p>
             </td>
          </tr>
          <tr v-else v-for="job in recentJobs" :key="job.id" class="group hover:bg-slate-50/50 transition-all">
            <td class="py-4">
              <p class="text-xs font-black text-slate-900 truncate max-w-[150px] leading-tight">{{ job.titulo }}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ job.modalidade || 'Presencial' }}</p>
            </td>
            <td class="py-4">
              <span v-if="isVagaAtiva(job.encerramento)" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                Aberta
              </span>
              <span v-else class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400">
                Encerrada
              </span>
            </td>
            <td class="py-4 text-right">
              <button @click="navigateTo(`/painel/empresa/vagas/${job.id}`)" class="p-2 text-slate-300 hover:text-[#1E88E5] transition-colors">
                <ChevronRight size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button class="mt-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
      Relatório Detalhado de Performance
    </button>
  </div>
</template>
