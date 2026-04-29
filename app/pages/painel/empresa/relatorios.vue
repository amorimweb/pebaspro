<script setup lang="ts">
import { FileDown, Printer } from 'lucide-vue-next'

definePageMeta({
  layout: 'empresa-master'
})

const exportData = (label: string) => {
  console.log('Exportando:', label)
}
</script>

<template>
  <div class="space-y-8 animate-in">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Relatórios Operacionais</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
          Análise de performance, contratação e indicadores estratégicos da PEBASPRO.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          @click="() => window.print()"
        >
          <Printer :size="16" /> Imprimir
        </button>
        <button
          class="flex items-center gap-2 px-8 py-3 bg-[#0D2E5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1787D4] transition-all shadow-lg shadow-blue-900/20"
          @click="exportData('Dados Operacionais (XLSX)')"
        >
          <FileDown :size="16" /> Exportar Dados
        </button>
      </div>
    </div>

    <!-- Componente de relatórios -->
    <EmpresaOperationalReports />

  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
