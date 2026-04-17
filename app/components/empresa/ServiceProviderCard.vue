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
    <div class="absolute inset-0 bg-gradient-to-r from-[#0D2E5C] to-[#1787D4] rounded-[32px]"></div>
    <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-1000"></div>
    
    <div class="relative p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
      <div class="max-w-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#1FAE66]">
            <CheckCircle2 size="24" />
          </div>
          <span class="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Expanda sua Operação</span>
        </div>
        
        <h2 class="text-3xl font-black text-white tracking-tight leading-tight">
          Transforme sua Empresa em um <span class="text-[#1FAE66]">Prestador de Serviços</span>
        </h2>
        <p class="text-white/60 font-medium mt-4 text-sm leading-relaxed">
          Ative seu perfil de prestador para oferecer os serviços da sua empresa diretamente para outras mineradoras e corporações na PEBASPRO. Use os mesmos dados e fature mais.
        </p>

        <div class="flex flex-wrap items-center gap-6 mt-8">
          <div class="flex items-center gap-2 text-white/80">
            <div class="w-1.5 h-1.5 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest">Sem custos extras</span>
          </div>
          <div class="flex items-center gap-2 text-white/80">
            <div class="w-1.5 h-1.5 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest">Mesma conta</span>
          </div>
          <div class="flex items-center gap-2 text-white/80">
            <div class="w-1.5 h-1.5 rounded-full bg-[#1FAE66]"></div>
            <span class="text-[10px] font-bold uppercase tracking-widest">Leads Qualificados</span>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex flex-col items-center gap-4">
        <button class="px-10 py-5 bg-[#1FAE66] text-[#0D2E5C] rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-green-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          Ativar Agora <ArrowRight size="16" />
        </button>
        <span class="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Disponível para plano Corporativo</span>
      </div>
    </div>
  </div>
</template>
