<script setup lang="ts">
import { FileText, Upload, CheckCircle, XCircle, Clock, Download, MoreVertical } from 'lucide-vue-next'

definePageMeta({ layout: 'empresa-master' })

const supabase = useSupabaseClient()
const authStore = useAuthStore()
const user = useSupabaseUser()
const empresaId = computed(() => authStore.profile?.id || user.value?.id)

const tabs = ['Todos', 'Pendente', 'Aprovado', 'Atenção']
const activeTab = ref('Todos')
const docs = ref<any[]>([])
const loading = ref(false)

const fetchDocs = async () => {
  if (!empresaId.value) return
  loading.value = true
  try {
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .or(`empresa_id.eq.${empresaId.value},enviado_por.eq.${empresaId.value}`)
      .order('created_at', { ascending: false })
    docs.value = data || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (empresaId.value) fetchDocs()
  else {
    const stop = watch(() => empresaId.value, (id) => { if (id) { stop(); fetchDocs() } })
  }
})

const filteredDocs = computed(() =>
  activeTab.value === 'Todos' ? docs.value : docs.value.filter(d => d.status === activeTab.value)
)

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Aprovado: { color: 'text-[#1FAE66]',    bg: 'bg-green-50',   border: 'border-[#1FAE66]' },
  Pendente: { color: 'text-emerald-600',  bg: 'bg-emerald-50', border: 'border-emerald-600' },
  Atenção:  { color: 'text-red-500',      bg: 'bg-red-50',     border: 'border-red-400' },
}
const getCfg = (s: string) => statusConfig[s] ?? { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-300' }

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const formatBytes = (b: number) => {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

const updateStatus = async (id: string, status: string) => {
  const { error } = await supabase.from('documentos').update({ status }).eq('id', id)
  if (!error) {
    const idx = docs.value.findIndex(d => d.id === id)
    if (idx !== -1) docs.value[idx].status = status
  }
}
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
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="pb-3 text-sm font-bold border-b-2 transition-all -mb-px"
        :class="activeTab === tab
          ? 'border-green-600 text-green-900'
          : 'border-transparent text-slate-400 hover:text-slate-600'"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-20 text-center">
      <div class="w-8 h-8 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin mx-auto" />
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        v-for="doc in filteredDocs"
        :key="doc.id"
        class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between mb-5">
          <div class="p-3 rounded-xl bg-green-600/5 border border-green-600/10 text-green-600">
            <FileText :size="24" />
          </div>
          <span
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
            :class="[getCfg(doc.status).color, getCfg(doc.status).bg, getCfg(doc.status).border]"
          >
            <CheckCircle v-if="doc.status === 'Aprovado'" :size="12" />
            <Clock       v-else-if="doc.status === 'Pendente'" :size="12" />
            <XCircle     v-else :size="12" />
            {{ doc.status }}
          </span>
        </div>

        <h4 class="text-sm font-black text-green-900 mb-1 truncate">{{ doc.nome }}</h4>
        <p class="text-xs text-slate-400 font-medium mb-5">
          {{ doc.tipo }}
          <span v-if="doc.tamanho_bytes" class="opacity-50 mx-1">•</span>
          {{ formatBytes(doc.tamanho_bytes) }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <span class="text-xs text-slate-400 font-medium">{{ formatDate(doc.created_at) }}</span>
          <div class="flex gap-2">
            <a
              :href="doc.url"
              target="_blank"
              download
              class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-600/30 transition-all"
            >
              <Download :size="15" />
            </a>
            <!-- Status quick-actions -->
            <div class="relative group">
              <button class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 transition-all">
                <MoreVertical :size="15" />
              </button>
              <div class="hidden group-hover:flex absolute right-0 top-full mt-1 z-10 bg-white border border-slate-100 rounded-xl shadow-lg flex-col min-w-[130px] overflow-hidden text-xs font-bold">
                <button @click="updateStatus(doc.id, 'Aprovado')" class="px-4 py-2.5 hover:bg-green-50 text-left text-green-700">Aprovar</button>
                <button @click="updateStatus(doc.id, 'Pendente')" class="px-4 py-2.5 hover:bg-slate-50 text-left text-slate-600">Pendente</button>
                <button @click="updateStatus(doc.id, 'Atenção')"  class="px-4 py-2.5 hover:bg-red-50 text-left text-red-500">Atenção</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && filteredDocs.length === 0" class="py-24 text-center text-slate-400 font-medium text-sm">
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
