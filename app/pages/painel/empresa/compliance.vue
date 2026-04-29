<script setup lang="ts">
import { Download, AlertTriangle } from 'lucide-vue-next'

definePageMeta({
  layout: 'empresa-master'
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Compliance SST / eSocial</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
          Central de riscos, exames ocupacionais e conformidade legal PEBASPRO.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Download :size="16" /> Exportar LNT
        </button>
        <button class="flex items-center gap-2 px-8 py-3 bg-[#0D2E5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1787D4] transition-all shadow-lg shadow-blue-900/20">
          <AlertTriangle :size="16" /> Novo Alerta
        </button>
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Coluna Principal -->
      <div class="lg:col-span-8 flex flex-col gap-6">

        <!-- Visão Geral de Regulamentação -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="text-lg font-black text-[#0D2E5C] mb-5">Visão Geral de Regulamentação</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- ASOs Pendentes -->
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ASOs Pendentes</span>
              <div class="text-4xl font-black text-red-500 mt-1">14</div>
              <p class="text-xs text-slate-400 font-medium mt-2">Necessário agendamento imediato</p>
            </div>
            <!-- CIPA / Brigada -->
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">CIPA / Brigada</span>
              <div class="text-4xl font-black text-[#1FAE66] mt-1">100%</div>
              <p class="text-xs text-slate-400 font-medium mt-2">Certificações em dia</p>
            </div>
          </div>
        </div>

        <!-- Histórico de Inspeções -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="text-lg font-black text-[#0D2E5C] mb-4">Histórico de Inspeções</h3>
          <p class="text-sm text-slate-400 font-medium">Nenhuma inspeção recente registrada no sistema.</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4">
        <EmpresaCompliancePanel />
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
