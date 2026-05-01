<script setup lang="ts">
import {
  Briefcase, Plus, Search, Filter, Eye,
  Trash2, Users, Clock, CheckCircle2, AlertCircle, RefreshCw, X,
  MapPin, Banknote, CalendarDays, GraduationCap, Tag
} from 'lucide-vue-next'
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'empresa-master' })

type VagaRow = Database['public']['Tables']['vagas']['Row']
type VagaComCandidatos = VagaRow & { total_candidatos: number; candidatos_aprovados: number }

const supabase   = useSupabaseClient<Database>()
const authStore  = useAuthStore()
const { criarVaga } = useVagas()

// ─── Estado ───────────────────────────────────────────────────────────────────
const loading      = ref(true)
const salvando     = ref(false)
const excluindo    = ref<string | null>(null)
const vagaDetalhes = ref<VagaComCandidatos | null>(null)
const vagas      = ref<VagaComCandidatos[]>([])
const searchTerm = ref('')
const filtroStatus = ref<'todas' | 'ativas' | 'encerradas'>('ativas')
const isFormOpen = ref(false)
const toast      = ref<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

const hoje = () => new Date().toISOString().split('T')[0]

const form = reactive({
  titulo: '',
  descricao: '',
  tipo: 'CLT',         // CLT | PJ | Temporário | Estágio
  modalidade: 'Presencial',
  local: '',
  salario: '',
  jornada: '',
  nivel_experiencia: '',
  encerramento: '',
  requisitos: '',
  beneficios: '',
})

// ─── Fetch vagas com contagem de candidaturas ──────────────────────────────────
const fetchVagas = async () => {
  loading.value = true
  const empresaId = authStore.profile?.id
  if (!empresaId) { loading.value = false; return }

  try {
    // Primeiro tenta com status (pós-migração), se falhar faz sem status
    let data: any[] | null = null

    const { data: d1, error: e1 } = await supabase
      .from('vagas')
      .select(`*, candidaturas!candidaturas_vaga_id_fkey (id, status)`)
      .eq('empresa_id', empresaId)
      .order('data_publicacao', { ascending: false })

    if (e1) {
      // Coluna status ainda não existe — busca só os IDs
      const { data: d2, error: e2 } = await supabase
        .from('vagas')
        .select(`*, candidaturas!candidaturas_vaga_id_fkey (id)`)
        .eq('empresa_id', empresaId)
        .order('data_publicacao', { ascending: false })

      if (e2) throw e2
      data = d2
    } else {
      data = d1
    }

    vagas.value = (data ?? []).map((v: any) => ({
      ...v,
      total_candidatos:     (v.candidaturas ?? []).length,
      candidatos_aprovados: (v.candidaturas ?? []).filter((c: any) => c.status === 'Aprovado').length,
    }))
  } catch (e: any) {
    mostrarToast('Erro ao carregar vagas: ' + e.message, 'erro')
  } finally {
    loading.value = false
  }
}

onMounted(fetchVagas)

// ─── Filtros ──────────────────────────────────────────────────────────────────
const vagasFiltradas = computed(() => {
  let lista = vagas.value

  // Filtro status
  if (filtroStatus.value === 'ativas') {
    lista = lista.filter(v => !v.encerramento || v.encerramento >= hoje())
  } else if (filtroStatus.value === 'encerradas') {
    lista = lista.filter(v => v.encerramento && v.encerramento < hoje())
  }

  // Busca
  const q = searchTerm.value.toLowerCase().trim()
  if (q) {
    lista = lista.filter(v =>
      v.titulo.toLowerCase().includes(q) ||
      (v.local ?? '').toLowerCase().includes(q) ||
      (v.tipo ?? '').toLowerCase().includes(q)
    )
  }

  return lista
})

const isAtiva = (v: VagaRow) => !v.encerramento || v.encerramento >= hoje()

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = computed(() => ({
  total:      vagas.value.length,
  ativas:     vagas.value.filter(isAtiva).length,
  candidatos: vagas.value.reduce((s, v) => s + v.total_candidatos, 0),
  aprovados:  vagas.value.reduce((s, v) => s + v.candidatos_aprovados, 0),
}))

// ─── Publicar Vaga ────────────────────────────────────────────────────────────
const publicarVaga = async () => {
  if (!form.titulo) return
  salvando.value = true
  const { error } = await criarVaga({
    titulo:            form.titulo,
    descricao:         form.descricao || null,
    tipo:              form.tipo,
    modalidade:        form.modalidade,
    local:             form.local || null,
    salario:           form.salario || null,
    jornada:           form.jornada || null,
    nivel_experiencia: form.nivel_experiencia || null,
    encerramento:      form.encerramento || null,
    requisitos:        form.requisitos || null,
    beneficios:        form.beneficios || null,
    data_publicacao:   hoje(),
  })
  salvando.value = false
  if (error) {
    mostrarToast('Erro ao publicar: ' + error, 'erro')
  } else {
    mostrarToast('Vaga publicada com sucesso!', 'ok')
    isFormOpen.value = false
    Object.assign(form, {
      titulo: '', descricao: '', tipo: 'CLT', modalidade: 'Presencial',
      local: '', salario: '', jornada: '', nivel_experiencia: '',
      encerramento: '', requisitos: '', beneficios: '',
    })
    await fetchVagas()
  }
}

// ─── Encerrar / Excluir ───────────────────────────────────────────────────────
const encerrarVaga = async (id: string) => {
  excluindo.value = id
  const { error } = await supabase
    .from('vagas')
    .update({ encerramento: hoje() })
    .eq('id', id)
  excluindo.value = null
  if (error) {
    mostrarToast('Erro ao encerrar vaga.', 'erro')
  } else {
    mostrarToast('Vaga encerrada.', 'ok')
    await fetchVagas()
  }
}

const excluirVaga = async (id: string) => {
  if (!confirm('Deseja excluir permanentemente esta vaga? Os candidatos perderão o acesso.')) return
  excluindo.value = id
  const { error } = await supabase.from('vagas').delete().eq('id', id)
  excluindo.value = null
  if (error) {
    mostrarToast('Erro ao excluir vaga.', 'erro')
  } else {
    mostrarToast('Vaga excluída.', 'ok')
    await fetchVagas()
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const mostrarToast = (msg: string, tipo: 'ok' | 'erro' = 'ok') => {
  toast.value = { msg, tipo }
  setTimeout(() => { toast.value = null }, 4000)
}

const formatData = (dt: string | null) =>
  dt ? new Date(dt).toLocaleDateString('pt-BR') : '—'
</script>

<template>
  <div class="space-y-8 animate-in">

    <!-- Toast -->
    <Transition name="slide-top">
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
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Gestão de Vagas</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
          Publique, gerencie e acompanhe candidatos em tempo real.
        </p>
      </div>
      <div class="flex items-center gap-3 self-start sm:self-auto">
        <button
          class="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-[#1E88E5] hover:border-[#1E88E5]/30 transition-all shadow-sm shrink-0"
          :class="{ 'animate-spin': loading }"
          @click="fetchVagas"
        >
          <RefreshCw :size="16" />
        </button>
        <button
          class="flex items-center gap-2 px-5 sm:px-8 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-900/20"
          @click="isFormOpen = !isFormOpen"
        >
          <Plus :size="18" /> Nova Vaga
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Vagas</p>
        <div class="text-3xl font-black text-green-700">{{ kpis.total }}</div>
      </div>
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vagas Ativas</p>
        <div class="text-3xl font-black text-[#1FAE66]">{{ kpis.ativas }}</div>
      </div>
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Candidatos</p>
        <div class="text-3xl font-black text-green-500">{{ kpis.candidatos }}</div>
      </div>
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aprovados</p>
        <div class="text-3xl font-black text-amber-500">{{ kpis.aprovados }}</div>
      </div>
    </div>

    <!-- Formulário Nova Vaga -->
    <Transition name="slide-down">
      <div v-if="isFormOpen" class="bg-[#064e3b] rounded-[24px] p-8 text-white shadow-xl shadow-green-900/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black">Publicar Nova Vaga</h3>
          <button class="text-white/50 hover:text-white transition-colors" @click="isFormOpen = false">
            <X :size="20" />
          </button>
        </div>
        <form class="space-y-5" @submit.prevent="publicarVaga">
          <!-- Linha 1 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Título do Cargo *</label>
              <input
                v-model="form.titulo"
                type="text"
                required
                placeholder="Ex: Operador de Escavadeira"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Regime</label>
              <select
                v-model="form.tipo"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#064e3b] text-white outline-none focus:ring-2 focus:ring-white/20 transition-all"
              >
                <option>CLT</option><option>PJ</option><option>Temporário</option><option>Estágio</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Modalidade</label>
              <select
                v-model="form.modalidade"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#064e3b] text-white outline-none focus:ring-2 focus:ring-white/20 transition-all"
              >
                <option>Presencial</option><option>Híbrido</option><option>Remoto</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Local</label>
              <input
                v-model="form.local"
                type="text"
                placeholder="Ex: Parauapebas, PA"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Salário</label>
              <input
                v-model="form.salario"
                type="text"
                placeholder="R$ 2.500,00 ou A combinar"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Experiência</label>
              <select
                v-model="form.nivel_experiencia"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#064e3b] text-white outline-none focus:ring-2 focus:ring-white/20 transition-all"
              >
                <option value="">Não especificado</option>
                <option>Sem experiência</option>
                <option>Júnior</option>
                <option>Pleno</option>
                <option>Sênior</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Encerramento</label>
              <input
                v-model="form.encerramento"
                type="date"
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Descrição</label>
              <textarea
                v-model="form.descricao"
                rows="2"
                placeholder="Descreva as responsabilidades da função..."
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Requisitos</label>
              <textarea
                v-model="form.requisitos"
                rows="2"
                placeholder="CNH categoria B, NR-10..."
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-75">Benefícios</label>
              <textarea
                v-model="form.beneficios"
                rows="2"
                placeholder="VT, VR, Plano de saúde..."
                class="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              class="px-6 py-3 border border-white/30 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              @click="isFormOpen = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-8 py-3 bg-[#1FAE66] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#17954f] transition-all disabled:opacity-50"
              :disabled="!form.titulo || salvando"
            >
              {{ salvando ? 'Publicando...' : 'Publicar Vaga' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Filtros + tabela -->
    <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">

      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
        <!-- Filtro de status -->
        <div class="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
          <button
            v-for="f in [{ id: 'todas', label: 'Todas' }, { id: 'ativas', label: 'Ativas' }, { id: 'encerradas', label: 'Encerradas' }]"
            :key="f.id"
            class="px-4 py-2 transition-all"
            :class="filtroStatus === f.id ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-50'"
            @click="filtroStatus = (f.id as any)"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="flex-1" />

        <!-- Busca -->
        <div class="relative w-full sm:w-52">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="14" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar vagas..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all"
          />
        </div>

        <span class="text-xs font-bold text-slate-400">
          {{ vagasFiltradas.length }} vaga{{ vagasFiltradas.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="py-16 flex items-center justify-center gap-3 text-slate-400">
        <div class="w-5 h-5 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin" />
        <span class="text-sm font-medium">Carregando vagas...</span>
      </div>

      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead>
            <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th class="px-6 py-4 text-left">Vaga</th>
              <th class="px-6 py-4 text-left">Tipo / Local</th>
              <th class="px-6 py-4 text-left">Status</th>
              <th class="px-6 py-4 text-left">Candidatos</th>
              <th class="px-6 py-4 text-left">Publicação</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="vaga in vagasFiltradas"
              :key="vaga.id"
              class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
            >
              <!-- Vaga -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-green-600/10 flex items-center justify-center text-green-600 shrink-0">
                    <Briefcase :size="18" />
                  </div>
                  <div>
                    <p class="font-bold text-green-900 text-sm">{{ vaga.titulo }}</p>
                    <p v-if="vaga.salario" class="text-xs text-slate-400 font-medium">{{ vaga.salario }}</p>
                  </div>
                </div>
              </td>

              <!-- Tipo / Local -->
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-700">{{ vaga.tipo ?? '—' }}</p>
                <p class="text-xs text-slate-400 font-medium">{{ vaga.local ?? 'Não informado' }}</p>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                  :class="isAtiva(vaga)
                    ? 'bg-green-50 text-[#1FAE66]'
                    : 'bg-slate-100 text-slate-500'"
                >
                  {{ isAtiva(vaga) ? 'Ativa' : 'Encerrada' }}
                </span>
                <p v-if="vaga.encerramento" class="text-[10px] text-slate-400 mt-0.5">
                  até {{ formatData(vaga.encerramento) }}
                </p>
              </td>

              <!-- Candidatos -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex items-baseline gap-1">
                    <span class="text-base font-black text-green-700">{{ vaga.total_candidatos }}</span>
                    <span class="text-xs text-slate-400 font-medium">total</span>
                  </div>
                  <span v-if="vaga.candidatos_aprovados > 0" class="text-xs font-black text-[#1FAE66]">
                    · {{ vaga.candidatos_aprovados }} aprovado{{ vaga.candidatos_aprovados !== 1 ? 's' : '' }}
                  </span>
                </div>
              </td>

              <!-- Publicação -->
              <td class="px-6 py-4 text-xs text-slate-400 font-medium">
                {{ formatData(vaga.data_publicacao) }}
              </td>

              <!-- Ações -->
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <!-- Ver candidatos → admissão -->
                  <NuxtLink
                    v-if="vaga.candidatos_aprovados > 0"
                    to="/painel/empresa/admissao"
                    class="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-[#1FAE66] rounded-lg text-[10px] font-black hover:bg-green-100 transition-all"
                    :title="`${vaga.candidatos_aprovados} pronto(s) para contratar`"
                  >
                    <Users :size="12" /> Contratar
                  </NuxtLink>


                  <!-- Ver detalhes → modal -->
                  <button
                    class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-600/30 transition-all"
                    title="Ver detalhes da vaga"
                    @click="vagaDetalhes = vaga"
                  >
                    <Eye :size="15" />
                  </button>

                  <!-- Encerrar -->
                  <button
                    v-if="isAtiva(vaga)"
                    class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all"
                    title="Encerrar vaga"
                    :disabled="excluindo === vaga.id"
                    @click="encerrarVaga(vaga.id)"
                  >
                    <Clock :size="15" />
                  </button>

                  <!-- Excluir -->
                  <button
                    class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                    title="Excluir vaga"
                    :disabled="excluindo === vaga.id"
                    @click="excluirVaga(vaga.id)"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Vazio -->
        <div v-if="!loading && vagasFiltradas.length === 0" class="py-20 text-center">
          <Briefcase class="mx-auto mb-4 text-slate-200" :size="48" />
          <p class="text-slate-400 font-medium text-sm">
            {{ searchTerm ? 'Nenhuma vaga encontrada para essa busca.' : 'Nenhuma vaga publicada ainda.' }}
          </p>
          <button
            class="mt-4 text-sm font-bold text-[#1E88E5] hover:underline"
            @click="isFormOpen = true; searchTerm = ''"
          >
            Publicar primeira vaga →
          </button>
        </div>
      </div>
    </div>

    <!-- ── MODAL DETALHES DA VAGA ── -->
    <Transition name="drawer">
      <div
        v-if="vagaDetalhes"
        class="fixed inset-0 z-[150] flex items-start justify-end"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          @click="vagaDetalhes = null"
        />

        <!-- Drawer -->
        <div class="relative z-10 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">

          <!-- Header do drawer -->
          <div class="bg-[#064e3b] px-8 py-6 text-white flex items-start justify-between shrink-0">
            <div class="flex-1 pr-4">
              <span
                class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                :class="isAtiva(vagaDetalhes) ? 'bg-[#1FAE66]/20 text-[#1FAE66]' : 'bg-white/10 text-white/60'"
              >
                {{ isAtiva(vagaDetalhes) ? 'Ativa' : 'Encerrada' }}
              </span>
              <h3 class="text-2xl font-black mt-2 leading-tight">{{ vagaDetalhes.titulo }}</h3>
            </div>
            <button
              class="text-white/50 hover:text-white transition-colors shrink-0 mt-1"
              @click="vagaDetalhes = null"
            >
              <X :size="22" />
            </button>
          </div>

          <!-- Chips de info -->
          <div class="flex flex-wrap gap-2 px-8 py-4 border-b border-slate-100 shrink-0">
            <span v-if="vagaDetalhes.tipo" class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold">
              <Tag :size="12" /> {{ vagaDetalhes.tipo }}
            </span>
            <span v-if="vagaDetalhes.modalidade" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
              {{ vagaDetalhes.modalidade }}
            </span>
            <span v-if="vagaDetalhes.local" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
              <MapPin :size="12" /> {{ vagaDetalhes.local }}
            </span>
            <span v-if="vagaDetalhes.salario" class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-[#1FAE66] rounded-xl text-xs font-bold">
              <Banknote :size="12" /> {{ vagaDetalhes.salario }}
            </span>
            <span v-if="vagaDetalhes.nivel_experiencia" class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold">
              <GraduationCap :size="12" /> {{ vagaDetalhes.nivel_experiencia }}
            </span>
            <span v-if="vagaDetalhes.encerramento" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
              <CalendarDays :size="12" /> Até {{ formatData(vagaDetalhes.encerramento) }}
            </span>
          </div>

          <!-- Corpo com scroll -->
          <div class="flex-1 overflow-y-auto px-8 py-6 space-y-6">

            <!-- Candidatos -->
            <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div class="text-center">
                <div class="text-2xl font-black text-green-800">{{ vagaDetalhes.total_candidatos }}</div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidatos</div>
              </div>
              <div class="w-px h-10 bg-slate-200" />
              <div class="text-center">
                <div class="text-2xl font-black text-[#1FAE66]">{{ vagaDetalhes.candidatos_aprovados }}</div>
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aprovados</div>
              </div>
              <div class="flex-1" />
              <NuxtLink
                v-if="vagaDetalhes.candidatos_aprovados > 0"
                to="/painel/empresa/admissao"
                class="flex items-center gap-2 px-4 py-2 bg-[#1FAE66] text-white rounded-xl text-xs font-black hover:bg-[#17974d] transition-all"
                @click="vagaDetalhes = null"
              >
                <Users :size="14" /> Contratar
              </NuxtLink>
            </div>

            <!-- Descrição -->
            <div v-if="vagaDetalhes.descricao">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição</h4>
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">{{ vagaDetalhes.descricao }}</p>
            </div>

            <!-- Requisitos -->
            <div v-if="vagaDetalhes.requisitos">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requisitos</h4>
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">{{ vagaDetalhes.requisitos }}</p>
            </div>

            <!-- Benefícios -->
            <div v-if="vagaDetalhes.beneficios">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Benefícios</h4>
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">{{ vagaDetalhes.beneficios }}</p>
            </div>

            <!-- Jornada -->
            <div v-if="vagaDetalhes.jornada">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jornada</h4>
              <p class="text-sm text-slate-700 font-medium">{{ vagaDetalhes.jornada }}</p>
            </div>

            <!-- Publicação -->
            <div class="pt-4 border-t border-slate-100">
              <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Publicado em {{ formatData(vagaDetalhes.data_publicacao) }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button
              v-if="isAtiva(vagaDetalhes)"
              class="flex-1 py-3 border border-amber-200 text-amber-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
              @click="encerrarVaga(vagaDetalhes.id); vagaDetalhes = null"
            >
              <Clock :size="14" /> Encerrar vaga
            </button>
            <button
              class="flex-1 py-3 border border-red-200 text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              @click="excluirVaga(vagaDetalhes.id); vagaDetalhes = null"
            >
              <Trash2 :size="14" /> Excluir
            </button>
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
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
.slide-top-enter-active, .slide-top-leave-active { transition: all 0.3s ease; }
.slide-top-enter-from, .slide-top-leave-to { opacity: 0; transform: translateY(-16px); }

/* Drawer lateral */
.drawer-enter-active { transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.drawer-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 1, 1); }
.drawer-enter-from .drawer-leave-to { opacity: 0; }
.drawer-enter-from > div:last-child, .drawer-leave-to > div:last-child {
  transform: translateX(100%);
}

</style>
