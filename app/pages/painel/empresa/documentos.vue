<script setup lang="ts">
import { FileText, Upload, CheckCircle, XCircle, Clock, Download, MoreVertical } from 'lucide-vue-next'

definePageMeta({
  layout: 'empresa-master'
})

interface Doc {
  id: number
  name: string
  type: string
  candidate: string
  status: 'Aprovado' | 'Pendente' | 'Atenção'
  date: string
}

const tabs = ['Todos', 'Pendente', 'Aprovado', 'Atenção']
const activeTab = ref('Todos')

const docs: Doc[] = [
  { id: 1, name: 'RG_Ricardo_Santos.pdf',    type: 'Identidade',   candidate: 'Ricardo Santos',     status: 'Aprovado', date: '10/04/2026' },
  { id: 2, name: 'CPF_Ricardo_Santos.pdf',   type: 'Identidade',   candidate: 'Ricardo Santos',     status: 'Pendente', date: '09/04/2026' },
  { id: 3, name: 'ASO_Ana_Souza.pdf',        type: 'Saúde',        candidate: 'Ana Beatriz Souza',  status: 'Aprovado', date: '08/04/2026' },
  { id: 4, name: 'NR10_Certificado.pdf',     type: 'Treinamento',  candidate: 'Carlos Eduardo',     status: 'Atenção',  date: '07/04/2026' },
  { id: 5, name: 'Contrato_Operador.pdf',    type: 'Contratual',   candidate: 'Ricardo Santos',     status: 'Aprovado', date: '06/04/2026' },
  { id: 6, name: 'Diploma_Engenharia.pdf',   type: 'Escolaridade', candidate: 'Ana Beatriz Souza',  status: 'Pendente', date: '05/04/2026' },
]

const filteredDocs = computed(() =>
  activeTab.value === 'Todos' ? docs : docs.filter(d => d.status === activeTab.value)
)

const statusConfig: Record<string, { color: string; bg: string; text: string }> = {
  Aprovado: { color: 'text-[#1FAE66]', bg: 'bg-green-50',  text: 'border-[#1FAE66]' },
  Pendente: { color: 'text-[#1787D4]', bg: 'bg-blue-50',   text: 'border-[#1787D4]' },
  Atenção:  { color: 'text-red-500',   bg: 'bg-red-50',    text: 'border-red-400' },
}
const getCfg = (s: string) => statusConfig[s] ?? { color: 'text-slate-400', bg: 'bg-slate-50', text: 'border-slate-300' }
</script>

<template>
  <div class="space-y-8 animate-in">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Gestão de Documentos</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
          Centralize e valide documentos de colaboradores e candidatos em um único local seguro.
        </p>
      </div>
      <button class="flex items-center gap-2 px-8 py-3 bg-[#0D2E5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1787D4] transition-all shadow-lg shadow-blue-900/20">
        <Upload :size="18" /> Enviar Documento
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="pb-3 text-sm font-bold border-b-2 transition-all -mb-px"
        :class="activeTab === tab
          ? 'border-[#1FAE66] text-[#0D2E5C]'
          : 'border-transparent text-slate-400 hover:text-slate-600'"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Grid de Documentos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="doc in filteredDocs"
        :key="doc.id"
        class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between mb-5">
          <div class="p-3 rounded-xl bg-[#1E88E5]/5 border border-[#1E88E5]/10 text-[#1E88E5]">
            <FileText :size="24" />
          </div>
          <span
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
            :class="[getCfg(doc.status).color, getCfg(doc.status).bg, getCfg(doc.status).text]"
          >
            <CheckCircle v-if="doc.status === 'Aprovado'" :size="12" />
            <Clock       v-else-if="doc.status === 'Pendente'" :size="12" />
            <XCircle     v-else :size="12" />
            {{ doc.status }}
          </span>
        </div>

        <h4 class="text-sm font-black text-[#0D2E5C] mb-1 truncate">{{ doc.name }}</h4>
        <p class="text-xs text-slate-400 font-medium mb-5">
          {{ doc.candidate }} <span class="opacity-50 mx-1">•</span> {{ doc.type }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <span class="text-xs text-slate-400 font-medium">{{ doc.date }}</span>
          <div class="flex gap-2">
            <button class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-[#1E88E5] hover:border-[#1E88E5]/30 transition-all">
              <Download :size="15" />
            </button>
            <button class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 transition-all">
              <MoreVertical :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredDocs.length === 0" class="py-24 text-center text-slate-400 font-medium text-sm">
      Nenhum documento encontrado nesta categoria.
    </div>

  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
