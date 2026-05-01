<script setup lang="ts">
import {
  FileDown, TrendingUp, Users, Briefcase,
  CheckCircle2, FileText, MessageSquare,
  BarChart2, RefreshCw
} from 'lucide-vue-next'

definePageMeta({ layout: 'empresa-master' })

const supabase  = useSupabaseClient()
const authStore = useAuthStore()
const user      = useSupabaseUser()
const empresaId = computed(() => authStore.profile?.id || user.value?.id)

// ─── Período ──────────────────────────────────────────────────────────────────
const periodos = [
  { label: '7 dias',   days: 7   },
  { label: '30 dias',  days: 30  },
  { label: '90 dias',  days: 90  },
  { label: '12 meses', days: 365 },
]
const periodoSel = ref(30)
const dataInicio = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() - periodoSel.value)
  return d.toISOString()
})

// ─── Estado ───────────────────────────────────────────────────────────────────
const loading      = ref(true)
const vagas        = ref<any[]>([])
const candidaturas = ref<any[]>([])
const conversas    = ref<any[]>([])
const documentos   = ref<any[]>([])

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  if (!empresaId.value) return
  loading.value = true
  try {
    const id = empresaId.value

    const { data: vagasData } = await supabase
      .from('vagas').select('id,titulo,status,created_at,cidade,area').eq('empresa_id', id)
    vagas.value = vagasData || []

    const vagaIds = vagas.value.map((v: any) => v.id)

    const [cands, convs, docs] = await Promise.all([
      vagaIds.length
        ? supabase.from('candidaturas').select('id,vaga_id,status,created_at').in('vaga_id', vagaIds)
        : Promise.resolve({ data: [] }),
      supabase.from('conversas').select('id,status_contratacao,created_at,updated_at')
        .or(`participante1_id.eq.${id},participante2_id.eq.${id}`),
      supabase.from('documentos').select('id,status,created_at').eq('empresa_id', id),
    ])

    candidaturas.value = cands.data || []
    conversas.value    = convs.data || []
    documentos.value   = docs.data  || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (empresaId.value) fetchAll()
  else {
    const stop = watch(() => empresaId.value, (id) => { if (id) { stop(); fetchAll() } })
  }
})

watch(periodoSel, () => fetchAll())

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const inPeriod = (iso: string) => new Date(iso) >= new Date(dataInicio.value)

const kpis = computed(() => {
  const vagasTotal    = vagas.value.length
  const vagasPeriodo  = vagas.value.filter((v: any) => inPeriod(v.created_at)).length
  const candsTotal    = candidaturas.value.length
  const candsPeriodo  = candidaturas.value.filter((c: any) => inPeriod(c.created_at)).length
  const contratados   = conversas.value.filter((c: any) => c.status_contratacao === 'contratado').length
  const contratadosPer= conversas.value.filter((c: any) => c.status_contratacao === 'contratado' && inPeriod(c.updated_at)).length
  const taxa          = candsTotal > 0 ? ((contratados / candsTotal) * 100).toFixed(1) : '0.0'
  const docsAtencao   = documentos.value.filter((d: any) => d.status === 'Atenção').length

  return [
    { label: 'Vagas Publicadas',  value: vagasTotal,       delta: vagasPeriodo,   icon: Briefcase,    color: 'blue'   },
    { label: 'Candidaturas',      value: candsTotal,        delta: candsPeriodo,   icon: Users,        color: 'green'  },
    { label: 'Contratados',       value: contratados,       delta: contratadosPer, icon: CheckCircle2, color: 'emerald'},
    { label: 'Taxa de Conversão', value: taxa + '%',        delta: null,           icon: TrendingUp,   color: 'violet' },
    { label: 'Docs Pendentes',    value: docsAtencao,       delta: null,           icon: FileText,     color: 'amber'  },
    { label: 'Em Negociação',     value: conversas.value.filter((c: any) => c.status_contratacao === 'negociando').length, delta: null, icon: MessageSquare, color: 'sky' },
  ]
})

// ─── Funil ────────────────────────────────────────────────────────────────────
const statusMap: Record<string, string> = {
  'Pendente':   'Recebidas',
  'Em análise': 'Em Análise',
  'Aprovado':   'Aprovadas',
  'Recusado':   'Recusadas',
}
const funnelData = computed(() => {
  const counts: Record<string, number> = {}
  candidaturas.value.forEach((c: any) => {
    const s = statusMap[c.status] || c.status || 'Recebidas'
    counts[s] = (counts[s] || 0) + 1
  })
  const order = ['Recebidas','Em Análise','Aprovadas','Recusadas']
  return order.filter(s => counts[s]).map(s => ({ label: s, value: counts[s] }))
})

// ─── Vagas por área ───────────────────────────────────────────────────────────
const vagasPorArea = computed(() => {
  const counts: Record<string, number> = {}
  vagas.value.forEach((v: any) => { const a = v.area || 'Outros'; counts[a] = (counts[a] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
})

// ─── Conversas por status ─────────────────────────────────────────────────────
const conversasPorStatus = computed(() => {
  const map: Record<string, number> = { interessado: 0, negociando: 0, contratado: 0, recusado: 0 }
  conversas.value.forEach((c: any) => { const s = c.status_contratacao || 'interessado'; if (s in map) map[s]++ })
  return map
})

// ─── Vagas por mês (últimos 6) ────────────────────────────────────────────────
const vagasPorMes = computed(() => {
  const meses: Record<string, number> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    meses[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
  }
  vagas.value.forEach((v: any) => {
    const key = new Date(v.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    if (key in meses) meses[key]++
  })
  return { labels: Object.keys(meses), values: Object.values(meses) }
})

// ─── ApexCharts ───────────────────────────────────────────────────────────────
const chartLine = computed(() => ({
  type: 'area', height: 230,
  options: {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0, stops: [0, 100] } },
    colors: ['#1FAE66'],
    xaxis: { categories: vagasPorMes.value.labels, labels: { style: { fontSize: '11px', fontWeight: 700, colors: Array(6).fill('#94a3b8') } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: '11px', fontWeight: 700, colors: ['#94a3b8'] } }, min: 0, tickAmount: 4 },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, padding: { left: 4, right: 4 } },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
    markers: { size: 5, colors: ['#1FAE66'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
  },
  series: [{ name: 'Vagas', data: vagasPorMes.value.values }],
}))

const chartDonut = computed(() => ({
  type: 'donut', height: 230,
  options: {
    chart: { background: 'transparent', fontFamily: 'inherit' },
    colors: ['#1FAE66', '#f59e0b', '#0D2E5C', '#e2e8f0'],
    labels: ['Interessado', 'Negociando', 'Contratado', 'Sem interesse'],
    legend: { position: 'bottom', fontWeight: 700, fontSize: '11px', labels: { colors: '#64748b' } },
    plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Total', fontWeight: 900, fontSize: '13px', color: '#0D2E5C' } } } } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' },
  },
  series: [
    conversasPorStatus.value.interessado,
    conversasPorStatus.value.negociando,
    conversasPorStatus.value.contratado,
    conversasPorStatus.value.recusado,
  ],
}))

const chartBar = computed(() => ({
  type: 'bar', height: 230,
  options: {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
    colors: ['#0D2E5C'],
    plotOptions: { bar: { borderRadius: 5, horizontal: true, barHeight: '55%' } },
    xaxis: { categories: vagasPorArea.value.map(([k]) => k), labels: { style: { fontSize: '11px', fontWeight: 700, colors: Array(8).fill('#94a3b8') } } },
    yaxis: { labels: { style: { fontSize: '11px', fontWeight: 700, colors: ['#64748b'] }, maxWidth: 120 } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 900, colors: ['#fff'] } },
    tooltip: { theme: 'light' },
  },
  series: [{ name: 'Vagas', data: vagasPorArea.value.map(([, v]) => v) }],
}))

// ─── Top vagas ────────────────────────────────────────────────────────────────
const topVagas = computed(() => {
  const map: Record<string, number> = {}
  candidaturas.value.forEach((c: any) => { map[c.vaga_id] = (map[c.vaga_id] || 0) + 1 })
  return vagas.value
    .map((v: any) => ({ ...v, candidatos: map[v.id] || 0 }))
    .sort((a: any, b: any) => b.candidatos - a.candidatos)
    .slice(0, 8)
})

// ─── Export CSV ───────────────────────────────────────────────────────────────
const exportCSV = () => {
  const rows = [
    ['Vaga','Área','Cidade','Candidatos','Publicada'],
    ...topVagas.value.map((v: any) => [
      v.titulo, v.area || '-', v.cidade || '-', v.candidatos,
      new Date(v.created_at).toLocaleDateString('pt-BR'),
    ])
  ]
  const csv  = rows.map(r => r.join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `relatorio-${new Date().toISOString().slice(0,10)}.csv` })
  a.click(); URL.revokeObjectURL(url)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  blue:    'bg-blue-50   text-blue-600   border-blue-100',
  green:   'bg-green-50  text-green-600  border-green-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  violet:  'bg-violet-50 text-violet-600 border-violet-100',
  amber:   'bg-amber-50  text-amber-600  border-amber-100',
  sky:     'bg-sky-50    text-sky-600    border-sky-100',
}
const funnelColors: Record<string, string> = {
  Recebidas:   'bg-blue-500',
  'Em Análise':'bg-amber-500',
  Aprovadas:   'bg-emerald-500',
  Recusadas:   'bg-red-400',
}
const statusDot: Record<string, string> = {
  interessado: 'bg-[#1FAE66]',
  negociando:  'bg-amber-400',
  contratado:  'bg-[#0D2E5C]',
  recusado:    'bg-slate-300',
}
</script>

<template>
  <div class="space-y-8 animate-in">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Relatórios</h2>
        <p class="text-slate-400 font-medium mt-1 text-sm">Análise de performance, recrutamento e indicadores estratégicos.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
          <button v-for="p in periodos" :key="p.days" @click="periodoSel = p.days"
            class="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            :class="periodoSel === p.days ? 'bg-white text-[#0D2E5C] shadow-sm' : 'text-slate-400 hover:text-slate-600'">
            {{ p.label }}
          </button>
        </div>
        <button @click="fetchAll" title="Atualizar"
          class="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200 transition-all">
          <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button @click="exportCSV"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#0D2E5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0a2347] transition-all shadow-lg shadow-slate-900/20">
          <FileDown :size="15" /> Exportar CSV
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-2 border-slate-200 border-t-[#1FAE66] rounded-full animate-spin" />
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando dados...</p>
      </div>
    </div>

    <template v-else>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div v-for="kpi in kpis" :key="kpi.label"
          class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div class="flex items-center justify-between">
            <div class="p-2 rounded-xl border" :class="colorMap[kpi.color]">
              <component :is="kpi.icon" :size="16" />
            </div>
            <span v-if="kpi.delta !== null && kpi.delta > 0"
              class="flex items-center gap-0.5 text-[10px] font-black text-green-600">
              <TrendingUp :size="11" /> +{{ kpi.delta }}
            </span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 leading-none">{{ kpi.value }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-tight">{{ kpi.label }}</p>
          </div>
        </div>
      </div>

      <!-- Row 1: Linha + Donut -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-black text-[#0D2E5C]">Vagas Publicadas</h3>
              <p class="text-[11px] text-slate-400 font-medium">Últimos 6 meses</p>
            </div>
            <div class="p-2 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <BarChart2 :size="16" />
            </div>
          </div>
          <ClientOnly>
            <apexchart v-bind="chartLine" />
          </ClientOnly>
        </div>

        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="font-black text-[#0D2E5C] mb-1">Pipeline de Contratação</h3>
          <p class="text-[11px] text-slate-400 font-medium mb-6">Por status da conversa</p>
          <ClientOnly>
            <apexchart v-if="conversas.length > 0" v-bind="chartDonut" />
            <div v-else class="flex flex-col items-center justify-center h-44 text-slate-300">
              <MessageSquare :size="32" class="opacity-40 mb-2" />
              <p class="text-xs font-bold uppercase tracking-widest">Sem dados</p>
            </div>
          </ClientOnly>
        </div>
      </div>

      <!-- Row 2: Bar + Funil -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="font-black text-[#0D2E5C] mb-1">Vagas por Área</h3>
          <p class="text-[11px] text-slate-400 font-medium mb-6">Distribuição por categoria</p>
          <ClientOnly>
            <apexchart v-if="vagasPorArea.length > 0" v-bind="chartBar" />
            <div v-else class="flex flex-col items-center justify-center h-44 text-slate-300">
              <Briefcase :size="32" class="opacity-40 mb-2" />
              <p class="text-xs font-bold uppercase tracking-widest">Sem dados</p>
            </div>
          </ClientOnly>
        </div>

        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="font-black text-[#0D2E5C] mb-1">Funil de Candidaturas</h3>
          <p class="text-[11px] text-slate-400 font-medium mb-6">Progressão por etapa</p>
          <div v-if="funnelData.length > 0" class="space-y-5">
            <div v-for="item in funnelData" :key="item.label" class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-slate-600 uppercase tracking-widest">{{ item.label }}</span>
                <span class="text-sm font-black text-slate-900">{{ item.value }}</span>
              </div>
              <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                  :class="funnelColors[item.label] || 'bg-slate-400'"
                  :style="{ width: ((item.value / candidaturas.length) * 100).toFixed(1) + '%' }" />
              </div>
              <p class="text-[10px] text-slate-400 font-medium">
                {{ ((item.value / candidaturas.length) * 100).toFixed(1) }}% do total
              </p>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center h-44 text-slate-300">
            <Users :size="32" class="opacity-40 mb-2" />
            <p class="text-xs font-bold uppercase tracking-widest">Sem candidaturas</p>
          </div>
        </div>
      </div>

      <!-- Tabela Top Vagas -->
      <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-50">
          <h3 class="font-black text-[#0D2E5C]">Performance por Vaga</h3>
          <p class="text-[11px] text-slate-400 font-medium mt-0.5">Ranking por número de candidaturas</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[580px]">
            <thead>
              <tr class="border-b border-slate-50">
                <th class="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th class="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaga</th>
                <th class="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Área</th>
                <th class="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade</th>
                <th class="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Publicada</th>
                <th class="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidatos</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="topVagas.length === 0">
                <td colspan="6" class="py-16 text-center text-sm text-slate-400 font-medium">Nenhuma vaga encontrada.</td>
              </tr>
              <tr v-for="(vaga, i) in topVagas" :key="vaga.id" class="hover:bg-slate-50/40 transition-colors">
                <td class="px-6 py-4 text-xs font-black text-slate-300">{{ String(i + 1).padStart(2, '0') }}</td>
                <td class="px-4 py-4 font-bold text-sm text-slate-800 max-w-[180px] truncate">{{ vaga.titulo }}</td>
                <td class="px-4 py-4">
                  <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{{ vaga.area || '-' }}</span>
                </td>
                <td class="px-4 py-4 text-xs text-slate-500 font-medium">{{ vaga.cidade || '-' }}</td>
                <td class="px-4 py-4 text-xs text-slate-400 font-medium">{{ new Date(vaga.created_at).toLocaleDateString('pt-BR') }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <div class="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-[#1FAE66] rounded-full transition-all"
                        :style="{ width: topVagas[0]?.candidatos > 0 ? ((vaga.candidatos / topVagas[0].candidatos) * 100) + '%' : '0%' }" />
                    </div>
                    <span class="text-sm font-black text-slate-900 w-5 text-right">{{ vaga.candidatos }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sumários: Documentos + Pipeline -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="font-black text-[#0D2E5C] mb-5">Documentos</h3>
          <div class="space-y-3">
            <div v-for="[status, dot] in [['Aprovado','bg-emerald-500'],['Pendente','bg-amber-400'],['Atenção','bg-red-400']]"
              :key="status" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="dot" />
                <span class="text-xs font-bold text-slate-600">{{ status }}</span>
              </div>
              <span class="text-sm font-black text-slate-900">{{ documentos.filter((d: any) => d.status === status).length }}</span>
            </div>
            <div class="pt-3 border-t border-slate-50 flex justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              <span class="text-sm font-black text-slate-900">{{ documentos.length }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h3 class="font-black text-[#0D2E5C] mb-5">Conversas por Etapa</h3>
          <div class="space-y-3">
            <div v-for="[key, label] in [['interessado','Interessado'],['negociando','Negociando'],['contratado','Contratado'],['recusado','Sem interesse']]"
              :key="key" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="statusDot[key]" />
                <span class="text-xs font-bold text-slate-600">{{ label }}</span>
              </div>
              <span class="text-sm font-black text-slate-900">{{ conversasPorStatus[key] }}</span>
            </div>
            <div class="pt-3 border-t border-slate-50 flex justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              <span class="text-sm font-black text-slate-900">{{ conversas.length }}</span>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
</style>
