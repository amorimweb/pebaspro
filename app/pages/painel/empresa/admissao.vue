<script setup lang="ts">
import {
  UserPlus, Briefcase, CheckCircle2, Clock, ChevronRight,
  X, Send, FileText, AlertCircle, Users, UserCheck, UserX
} from 'lucide-vue-next'

definePageMeta({ layout: 'empresa-master' })

const {
  loading, error,
  fetchVagasParaContratar, fetchAdmissoes,
  iniciarAdmissao, atualizarStatusCandidatura, atualizarChecklist, gerarEventoS2200,
  checklistLabels, progressoAdmissao
} = useAdmissao()

// ─── Estado ──────────────────────────────────────────────────────────────────
const tab = ref<'contratar' | 'andamento' | 'historico'>('contratar')
const vagasParaContratar = ref<any[]>([])
const admissoes = ref<any[]>([])
const admissaoAberta = ref<any | null>(null)    // painel de checklist

// Modal de contratação
const modalAberto = ref(false)
const candidaturaAlvo = ref<any | null>(null)
const form = reactive({
  cargo: '', salario: '', regime: 'CLT', jornada: '8h/dia — 44h/semana', data_inicio: '', observacoes: ''
})
const salvando = ref(false)
const toast = ref<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

// ─── Status columns ───────────────────────────────────────────────────────────
const statusOrdem = ['Documentação', 'EmConferência', 'eSocial', 'Concluído']
const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  'Documentação':  { label: 'Documentação',   color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-400' },
  'EmConferência': { label: 'Em Conferência', color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-400' },
  'eSocial':       { label: 'eSocial',         color: 'text-teal-600',   bg: 'bg-teal-50',   dot: 'bg-teal-400' },
  'Concluído':     { label: 'Concluído',       color: 'text-green-600',  bg: 'bg-green-50',  dot: 'bg-green-500' },
}

const admissoesPorStatus = (s: string) => admissoes.value.filter(a => a.status === s)
const admissoesHistorico = computed(() => admissoes.value.filter(a => a.status === 'Concluído'))
const admissoesAtivas    = computed(() => admissoes.value.filter(a => a.status !== 'Concluído'))

// ─── Carregar dados ───────────────────────────────────────────────────────────
const carregar = async () => {
  const [vagas, adms] = await Promise.all([
    fetchVagasParaContratar(),
    fetchAdmissoes()
  ])
  vagasParaContratar.value = vagas
  admissoes.value = adms
}

onMounted(carregar)

// ─── Atualizar status do candidato ───────────────────────────────────────────
const definirStatus = async (candidaturaId: string, status: 'Aprovado' | 'Reprovado' | 'Pendente') => {
  try {
    await atualizarStatusCandidatura(candidaturaId, status)
    mostrarToast(status === 'Aprovado' ? 'Candidato aprovado!' : 'Status atualizado.', 'ok')
    await carregar()
  } catch (e: any) {
    mostrarToast('Erro ao atualizar status: ' + e.message, 'erro')
  }
}

// ─── Abrir modal de contratação ───────────────────────────────────────────────
const abrirModal = (candidatura: any, vaga: any) => {
  candidaturaAlvo.value = { ...candidatura, vaga }
  form.cargo = vaga.titulo ?? ''
  form.salario = vaga.salario ?? ''
  form.regime = 'CLT'
  form.jornada = vaga.jornada ?? '8h/dia — 44h/semana'
  form.data_inicio = ''
  form.observacoes = ''
  modalAberto.value = true
}

// ─── Confirmar contratação ────────────────────────────────────────────────────
const confirmarContratacao = async () => {
  if (!candidaturaAlvo.value || !form.cargo) return
  salvando.value = true
  const { error: err } = await iniciarAdmissao({
    talento_id: candidaturaAlvo.value.talento_id,
    vaga_id: candidaturaAlvo.value.vaga.id,
    candidatura_id: candidaturaAlvo.value.id,
    cargo: form.cargo,
    salario: form.salario,
    regime: form.regime,
    jornada: form.jornada,
    data_inicio: form.data_inicio || undefined,
    observacoes: form.observacoes,
  })
  salvando.value = false
  modalAberto.value = false
  if (err) {
    mostrarToast('Erro ao iniciar admissão: ' + err, 'erro')
  } else {
    mostrarToast('Admissão iniciada com sucesso!', 'ok')
    tab.value = 'andamento'
    await carregar()
  }
}

// ─── Checklist ────────────────────────────────────────────────────────────────
const toggleChecklist = async (adm: any, item: string) => {
  const novoValor = !adm.checklist[item]
  adm.checklist = await atualizarChecklist(adm.id, item, novoValor, adm.checklist)
  // Atualiza status na lista local
  const idx = admissoes.value.findIndex(a => a.id === adm.id)
  if (idx !== -1) admissoes.value[idx].checklist = adm.checklist
}

// ─── Gerar S-2200 ─────────────────────────────────────────────────────────────
const transmitirS2200 = async (adm: any) => {
  const pct = progressoAdmissao(adm.checklist)
  if (pct < 100) {
    mostrarToast('Complete todos os documentos antes de enviar ao eSocial.', 'erro'); return
  }
  const { error: err } = await gerarEventoS2200(adm)
  if (err) {
    mostrarToast('Erro ao gerar evento eSocial: ' + err, 'erro')
  } else {
    mostrarToast('Evento S-2200 enviado! Acesse eSocial para acompanhar.', 'ok')
    await carregar()
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const mostrarToast = (msg: string, tipo: 'ok' | 'erro' = 'ok') => {
  toast.value = { msg, tipo }
  setTimeout(() => { toast.value = null }, 4000)
}

const iniciais = (nome: string | null) =>
  (nome ?? 'T').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
</script>

<template>
  <div class="space-y-8 animate-in">

    <!-- Toast -->
    <Transition name="slide-down">
      <div
        v-if="toast"
        class="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold"
        :class="toast.tipo === 'ok' ? 'bg-[#1FAE66] text-white' : 'bg-red-500 text-white'"
      >
        <CheckCircle2 v-if="toast.tipo === 'ok'" :size="18" />
        <AlertCircle  v-else :size="18" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Admissão Digital</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
          Contratação, checklist de documentos e envio automático ao eSocial
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Em andamento</span>
          <span class="text-lg font-black text-[#0D2E5C]">{{ admissoesAtivas.length }}</span>
        </div>
        <button
          class="flex items-center gap-2 px-6 py-3 bg-[#0D2E5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1787D4] transition-all shadow-lg shadow-blue-900/20"
          @click="tab = 'contratar'"
        >
          <UserPlus :size="16" /> Contratar
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 border-b border-slate-200">
      <button
        v-for="t in [
          { id: 'contratar',  label: 'Prontos para Contratar', count: vagasParaContratar.reduce((s, v) => s + v.candidaturas.filter((c: any) => c.status === 'Aprovado').length, 0) },
          { id: 'andamento',  label: 'Em Andamento',           count: admissoesAtivas.length },
          { id: 'historico',  label: 'Histórico',              count: admissoesHistorico.length },
        ]"
        :key="t.id"
        class="flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all -mb-px"
        :class="tab === t.id ? 'border-[#1FAE66] text-[#0D2E5C]' : 'border-transparent text-slate-400 hover:text-slate-600'"
        @click="tab = (t.id as any)"
      >
        {{ t.label }}
        <span
          v-if="t.count > 0"
          class="px-2 py-0.5 rounded-full text-[10px] font-black"
          :class="tab === t.id ? 'bg-[#1FAE66]/15 text-[#1FAE66]' : 'bg-slate-100 text-slate-400'"
        >{{ t.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-16 flex items-center justify-center gap-3 text-slate-400">
      <div class="w-5 h-5 border-2 border-slate-200 border-t-[#1E88E5] rounded-full animate-spin" />
      <span class="text-sm font-medium">Carregando...</span>
    </div>

    <!-- ── TAB: CONTRATAR ── -->
    <div v-else-if="tab === 'contratar'" class="space-y-6">
      <div v-if="vagasParaContratar.length === 0" class="py-20 text-center">
        <Briefcase class="mx-auto mb-4 text-slate-200" :size="48" />
        <p class="text-slate-400 font-medium">Nenhuma vaga com candidatos no momento.</p>
        <NuxtLink to="/painel/empresa/vagas" class="mt-4 inline-block text-sm font-bold text-[#1E88E5] hover:underline">
          Ir para Vagas →
        </NuxtLink>
      </div>

      <div v-for="vaga in vagasParaContratar" :key="vaga.id" class="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <!-- Header da vaga -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#0D2E5C]/5 flex items-center justify-center text-[#0D2E5C]">
              <Briefcase :size="20" />
            </div>
            <div>
              <p class="font-black text-[#0D2E5C]">{{ vaga.titulo }}</p>
              <p class="text-xs text-slate-400 font-medium">{{ vaga.local ?? 'Parauapebas, PA' }} · {{ vaga.tipo ?? 'CLT' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 uppercase tracking-widest">
              {{ vaga.candidaturas.length }} candidato(s)
            </span>
            <span v-if="vaga.candidaturas_aprovadas > 0" class="px-3 py-1 rounded-full text-[10px] font-black bg-green-50 text-[#1FAE66] uppercase tracking-widest">
              {{ vaga.candidaturas_aprovadas }} aprovado(s)
            </span>
          </div>
        </div>

        <!-- Lista de candidatos -->
        <div class="divide-y divide-slate-50">
          <div
            v-for="cand in vaga.candidaturas"
            :key="cand.id"
            class="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
            :class="{ 'opacity-50 grayscale-[0.5]': cand.status === 'Reprovado' }"
          >
            <div class="flex items-center gap-4">
              <!-- Avatar -->
              <div
                class="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm transition-all"
                :class="[
                  cand.status === 'Aprovado' ? 'bg-green-50 text-[#1FAE66]' :
                  cand.status === 'Reprovado' ? 'bg-red-50 text-red-500' :
                  'bg-[#1E88E5]/10 text-[#1E88E5]'
                ]"
              >
                {{ iniciais(cand.talento?.nome) }}
              </div>
              <div class="min-w-0">
                <p class="font-bold text-slate-900 text-sm truncate">{{ cand.talento?.nome ?? 'Talento' }}</p>
                <div class="flex items-center gap-2">
                  <p class="text-xs text-slate-400 font-medium truncate">{{ cand.talento?.profissao ?? '—' }}</p>
                  <span v-if="cand.status !== 'Pendente' && cand.status !== 'Contratado'" class="w-1 h-1 rounded-full bg-slate-300" />
                  <span
                    v-if="cand.status !== 'Pendente' && cand.status !== 'Contratado'"
                    class="text-[10px] font-black uppercase tracking-widest"
                    :class="cand.status === 'Aprovado' ? 'text-[#1FAE66]' : 'text-red-400'"
                  >
                    {{ cand.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Ações Contextuais -->
            <div class="flex items-center gap-3">
              <!-- Pendente: Aprovar ou Reprovar -->
              <template v-if="cand.status === 'Pendente'">
                <button
                  class="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                  title="Reprovar"
                  @click="definirStatus(cand.id, 'Reprovado')"
                >
                  <UserX :size="18" />
                </button>
                <button
                  class="flex items-center gap-2 px-4 py-2 bg-[#1FAE66]/10 text-[#1FAE66] rounded-xl font-bold text-xs hover:bg-[#1FAE66] hover:text-white transition-all"
                  @click="definirStatus(cand.id, 'Aprovado')"
                >
                  <UserCheck :size="14" /> Aprovar
                </button>
              </template>

              <!-- Aprovado: Contratar ou Voltar atrás -->
              <template v-else-if="cand.status === 'Aprovado'">
                <button
                  class="text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors"
                  @click="definirStatus(cand.id, 'Pendente')"
                >
                  Anular
                </button>
                <button
                  class="flex items-center gap-2 px-6 py-2 bg-[#1FAE66] text-white rounded-xl font-black text-xs hover:bg-[#17974d] transition-all shadow-sm"
                  @click="abrirModal(cand, vaga)"
                >
                  <UserPlus :size="14" /> Contratar
                </button>
              </template>

              <!-- Reprovado: Anular status -->
              <template v-else-if="cand.status === 'Reprovado'">
                <button
                  class="px-4 py-2 border border-slate-200 text-slate-400 rounded-xl font-bold text-xs hover:text-slate-600 hover:border-slate-300 transition-all"
                  @click="definirStatus(cand.id, 'Pendente')"
                >
                  Anular reprovação
                </button>
              </template>

              <!-- Contratado (Histórico curto) -->
              <template v-else-if="cand.status === 'Contratado'">
                <span class="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[#1FAE66] rounded-lg text-[10px] font-black uppercase">
                  <CheckCircle2 :size="12" /> Contratado
                </span>
              </template>

              <NuxtLink
                :to="`/vitrine/${cand.talento_id}`"
                class="p-2 text-slate-400 hover:text-[#1E88E5] hover:bg-[#1E88E5]/5 rounded-xl transition-all"
                title="Ver perfil"
              >
                <ChevronRight :size="18" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TAB: EM ANDAMENTO (Pipeline) ── -->
    <div v-else-if="tab === 'andamento'">
      <div v-if="admissoesAtivas.length === 0" class="py-20 text-center">
        <Users class="mx-auto mb-4 text-slate-200" :size="48" />
        <p class="text-slate-400 font-medium">Nenhuma admissão em andamento.</p>
      </div>

      <!-- Kanban -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          v-for="status in ['Documentação', 'EmConferência', 'eSocial']"
          :key="status"
          class="bg-slate-50 rounded-[20px] p-4"
        >
          <!-- Column header -->
          <div class="flex items-center gap-2 mb-4 px-1">
            <span class="w-2 h-2 rounded-full" :class="statusConfig[status].dot" />
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-500">
              {{ statusConfig[status].label }}
            </h3>
            <span class="ml-auto text-xs font-black text-slate-400">{{ admissoesPorStatus(status).length }}</span>
          </div>

          <!-- Cards -->
          <div class="space-y-3">
            <div
              v-for="adm in admissoesPorStatus(status)"
              :key="adm.id"
              class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              @click="admissaoAberta = admissaoAberta?.id === adm.id ? null : adm"
            >
              <!-- Card header -->
              <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center font-black text-xs text-[#1E88E5] shrink-0">
                  {{ iniciais(adm.talento?.nome) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-black text-sm text-slate-900 truncate">{{ adm.talento?.nome ?? '—' }}</p>
                  <p class="text-xs text-slate-400 font-medium truncate">{{ adm.cargo }}</p>
                </div>
                <span class="text-[10px] font-bold px-2 py-1 rounded-lg" :class="[statusConfig[status].color, statusConfig[status].bg]">
                  {{ adm.regime }}
                </span>
              </div>

              <!-- Progress bar -->
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="progressoAdmissao(adm.checklist) === 100 ? 'bg-[#1FAE66]' : 'bg-[#1787D4]'"
                  :style="{ width: progressoAdmissao(adm.checklist) + '%' }"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-slate-400 font-medium">
                  {{ Object.values(adm.checklist).filter(Boolean).length }}/{{ Object.keys(adm.checklist).length }} docs
                </span>
                <span class="text-[10px] font-black" :class="statusConfig[status].color">
                  {{ progressoAdmissao(adm.checklist) }}%
                </span>
              </div>

              <!-- Checklist expandido -->
              <Transition name="slide-down">
                <div v-if="admissaoAberta?.id === adm.id" class="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Checklist de Documentos</p>
                  <div
                    v-for="(valor, item) in adm.checklist"
                    :key="item"
                    class="flex items-center gap-3 cursor-pointer group"
                    @click.stop="toggleChecklist(adm, item)"
                  >
                    <div
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0"
                      :class="valor ? 'bg-[#1FAE66] border-[#1FAE66]' : 'border-slate-300 group-hover:border-[#1FAE66]'"
                    >
                      <CheckCircle2 v-if="valor" :size="12" class="text-white" />
                    </div>
                    <span class="text-xs font-medium text-slate-700" :class="{ 'line-through text-slate-400': valor }">
                      {{ checklistLabels[item] ?? item }}
                    </span>
                  </div>

                  <!-- Botão eSocial -->
                  <button
                    v-if="status === 'eSocial'"
                    class="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    :class="progressoAdmissao(adm.checklist) === 100
                      ? 'bg-[#0D2E5C] text-white hover:bg-[#1787D4]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
                    @click.stop="transmitirS2200(adm)"
                  >
                    <Send :size="14" /> Enviar S-2200 ao eSocial
                  </button>

                  <!-- Info do contrato -->
                  <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                    <div><span class="text-slate-400 font-bold uppercase tracking-widest">Salário</span><p class="font-black text-slate-700 mt-0.5">{{ adm.salario || '—' }}</p></div>
                    <div><span class="text-slate-400 font-bold uppercase tracking-widest">Início</span><p class="font-black text-slate-700 mt-0.5">{{ adm.data_inicio || '—' }}</p></div>
                    <div class="col-span-2"><span class="text-slate-400 font-bold uppercase tracking-widest">Vaga</span><p class="font-black text-slate-700 mt-0.5">{{ adm.vaga?.titulo || '—' }}</p></div>
                  </div>
                </div>
              </Transition>
            </div>

            <div v-if="admissoesPorStatus(status).length === 0" class="py-8 text-center text-xs text-slate-300 font-medium">
              Nenhum aqui
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TAB: HISTÓRICO ── -->
    <div v-else-if="tab === 'historico'">
      <div v-if="admissoesHistorico.length === 0" class="py-20 text-center">
        <FileText class="mx-auto mb-4 text-slate-200" :size="48" />
        <p class="text-slate-400 font-medium">Nenhuma admissão concluída ainda.</p>
      </div>

      <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th class="px-6 py-4 text-left">Colaborador</th>
              <th class="px-6 py-4 text-left">Cargo / Vaga</th>
              <th class="px-6 py-4 text-left">Regime</th>
              <th class="px-6 py-4 text-left">Início</th>
              <th class="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="adm in admissoesHistorico"
              :key="adm.id"
              class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center font-black text-xs text-[#1FAE66]">
                    {{ iniciais(adm.talento?.nome) }}
                  </div>
                  <span class="font-bold text-sm text-slate-900">{{ adm.talento?.nome ?? '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ adm.cargo }}</td>
              <td class="px-6 py-4"><span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{{ adm.regime }}</span></td>
              <td class="px-6 py-4 text-sm text-slate-500 font-medium">{{ adm.data_inicio || '—' }}</td>
              <td class="px-6 py-4">
                <span class="flex items-center gap-1.5 text-[10px] font-black text-[#1FAE66]">
                  <CheckCircle2 :size="12" /> Concluído
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── MODAL DE CONTRATAÇÃO ── -->
    <Transition name="fade">
      <div
        v-if="modalAberto"
        class="fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="modalAberto = false"
      >
        <div class="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Modal header -->
          <div class="bg-[#0D2E5C] px-8 py-6 text-white flex items-start justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Iniciando Contratação</p>
              <h3 class="text-xl font-black">{{ candidaturaAlvo?.talento?.nome ?? 'Talento' }}</h3>
              <p class="text-sm opacity-70 mt-0.5">{{ candidaturaAlvo?.talento?.profissao ?? '' }}</p>
            </div>
            <button class="text-white/60 hover:text-white transition-colors" @click="modalAberto = false">
              <X :size="20" />
            </button>
          </div>

          <!-- Modal body -->
          <div class="p-8 space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cargo *</label>
                <input
                  v-model="form.cargo"
                  type="text"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all"
                  placeholder="Ex: Operador de Escavadeira"
                />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Regime *</label>
                <select
                  v-model="form.regime"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all bg-white"
                >
                  <option>CLT</option>
                  <option>PJ</option>
                  <option>Temporário</option>
                  <option>Estágio</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salário</label>
                <input
                  v-model="form.salario"
                  type="text"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all"
                  placeholder="R$ 2.500,00"
                />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jornada</label>
                <input
                  v-model="form.jornada"
                  type="text"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all"
                  placeholder="8h/dia — 44h/semana"
                />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data de Início</label>
                <input
                  v-model="form.data_inicio"
                  type="date"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observações</label>
                <textarea
                  v-model="form.observacoes"
                  rows="2"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all resize-none"
                  placeholder="Informações adicionais sobre a contratação..."
                />
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                class="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                @click="modalAberto = false"
              >
                Cancelar
              </button>
              <button
                class="flex-1 py-3 bg-[#1FAE66] text-white rounded-2xl font-black text-sm hover:bg-[#17974d] transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                :disabled="!form.cargo || salvando"
                @click="confirmarContratacao"
              >
                {{ salvando ? 'Iniciando...' : 'Confirmar Contratação' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 600px; }
</style>
