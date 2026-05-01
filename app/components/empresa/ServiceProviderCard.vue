<script setup lang="ts">
import { 
  Briefcase, 
  ArrowRight, 
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-vue-next'

const { company } = useEmpresaDashboard()
</script>

<template>
  <div class="relative overflow-hidden mb-10 group">
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-700 rounded-[32px]"></div>
    <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-1000"></div>
    
    <div class="relative p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#1FAE66]">
            <CheckCircle2 size="18" />
          </div>
          <span class="text-[8px] font-black text-white/60 uppercase tracking-[0.15em]">Expanda sua Operação</span>
        </div>
        
        <h2 class="text-lg font-black text-white tracking-tight leading-snug">
          Transforme sua Empresa em um <span class="text-[#1FAE66]">Prestador de Serviços</span>
        </h2>
        <p class="text-white/60 font-medium mt-2 text-xs leading-tight">
          Ative seu perfil de prestador para oferecer os serviços da sua empresa diretamente na PEBASPRO.
        </p>

        <div class="flex flex-wrap items-center gap-3 mt-3">
          <div class="flex items-center gap-1.5 text-white/80">
            <div class="w-1 h-1 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Sem custos</span>
          </div>
          <div class="flex items-center gap-1.5 text-white/80">
            <div class="w-1 h-1 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Mesma conta</span>
          </div>
          <div class="flex items-center gap-1.5 text-white/80">
            <div class="w-1 h-1 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Leads</span>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex flex-col items-center gap-2">
        <button class="px-6 py-2 bg-[#1FAE66] text-green-900 rounded-xl font-black text-[10px] uppercase tracking-tight shadow-lg shadow-green-950/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          Ativar <ArrowRight size="12" />
        </button>
        <span class="text-[7px] font-black text-white/30 uppercase tracking-tighter">Plano Corporativo</span>
      </div>
    </div>
  </div>
</template>
