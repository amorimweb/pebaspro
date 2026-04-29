<script setup lang="ts">
import { ShieldCheck, CheckCircle, Clock, Send, ShieldAlert, Info, Filter, Download, Wifi, RefreshCw, AlertCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'empresa-master' })

const { fetchEventosEsocial, loading, error } = useAdmissao()

const eventos = ref<any[]>([])
const toast   = ref<{ msg: string; tipo: 'ok' | 'erro' } | null>(null)

const services = [
  { label: 'Ambiente de Produção',   status: 'ONLINE',      ok: true },
  { label: 'Certificado Digital',    status: 'VÁLIDO',      ok: true },
  { label: 'Webservices Governo',    status: 'OPERACIONAL', ok: true },
]

const statusConfig: Record<string, { color: string; border: string; bg: string }> = {
  Transmitido: { color: 'text-[#1FAE66]',  border: 'border-[#1FAE66]',  bg: 'bg-green-50' },
  Pendente:    { color: 'text-red-500',     border: 'border-red-400',    bg: 'bg-red-50' },
  Processando: { color: 'text-[#1787D4]',  border: 'border-[#1787D4]',  bg: 'bg-blue-50' },
  Erro:        { color: 'text-orange-500', border: 'border-orange-400', bg: 'bg-orange-50' },
}
const getCfg = (s: string) => statusConfig[s] ?? { color: 'text-slate-400', border: 'border-slate-200', bg: 'bg-slate-50' }

// KPIs reativos
const kpis = computed(() => ({
  total:       eventos.value.length,
  transmitido: eventos.value.filter(e => e.status === 'Transmitido').length,
  pendente:    eventos.value.filter(e => e.status === 'Pendente').length,
  conformidade: eventos.value.length === 0 ? 100 : Math.round((eventos.value.filter(e => e.status === 'Transmitido').length / eventos.value.length) * 100),
}))

const carregar = async () => {
  eventos.value = await fetchEventosEsocial()
}

onMounted(carregar)

const transmitirLote = async () => {
  // Simula transmissão dos pendentes — com API real, chamaria endpoint do governo
  mostrarToast('Transmissão em lote iniciada! Acompanhe o status abaixo.', 'ok')
}

const mostrarToast = (msg: string, tipo: 'ok' | 'erro' = 'ok') => {
  toast.value = { msg, tipo }
  setTimeout(() => { toast.value = null }, 4000)
}

const formatData = (dt: string) =>
  new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
        <CheckCircle v-if="toast.tipo === 'ok'" :size="18" />
        <AlertCircle v-else :size="18" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Monitoramento eSocial</h2>
        <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">
          Transmissão e conformidade dos eventos SST e Trabalhistas em tempo real
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-[#1E88E5] hover:border-[#1E88E5]/30 transition-all shadow-sm"
          :class="{ 'animate-spin': loading }"
          @click="carregar"
        >
          <RefreshCw :size="16" />
        </button>
        <button
          class="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          @click="mostrarToast('Gerando relatório eSocial...', 'ok')"
        >
          <Download :size="16" /> Relatório
        </button>
        <button
          class="flex items-center gap-2 px-8 py-3 bg-[#0D2E5C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1787D4] transition-all shadow-lg shadow-blue-900/20"
          @click="transmitirLote"
        >
          <Send :size="16" /> Transmitir Lote
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Eventos</p>
        <div class="text-3xl font-black text-[#0D2E5C]">{{ kpis.total }}</div>
      </div>
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transmitidos</p>
        <div class="text-3xl font-black text-[#1FAE66]">{{ kpis.transmitido }}</div>
      </div>
      <div class="bg-white rounded-[20px] border border-slate-100 shadow-sm p-5">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendentes</p>
        <div class="text-3xl font-black text-red-500">{{ kpis.pendente }}</div>
      </div>
      <div class="bg-[#0D2E5C] rounded-[20px] p-5 text-white shadow-xl shadow-blue-900/20">
        <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Conformidade</p>
        <div class="text-3xl font-black">{{ kpis.conformidade }}%</div>
        <div class="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-[#1FAE66] rounded-full transition-all" :style="{ width: kpis.conformidade + '%' }" />
        </div>
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Timeline de Eventos -->
      <div class="lg:col-span-8">
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-black text-[#0D2E5C]">Linha do Tempo de Eventos</h3>
            <div class="flex items-center gap-2">
              <NuxtLink
                to="/painel/empresa/admissao"
                class="text-xs font-bold text-[#1E88E5] hover:underline"
              >
                + Nova admissão
              </NuxtLink>
              <button class="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-[#1E88E5] transition-all">
                <Filter :size="16" />
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="py-12 flex items-center justify-center gap-3 text-slate-400">
            <div class="w-5 h-5 border-2 border-slate-200 border-t-[#1E88E5] rounded-full animate-spin" />
          </div>

          <!-- Vazio -->
          <div v-else-if="eventos.length === 0" class="py-16 text-center">
            <Send class="mx-auto mb-4 text-slate-200" :size="40" />
            <p class="text-slate-400 font-medium text-sm">Nenhum evento eSocial registrado ainda.</p>
            <p class="text-slate-300 text-xs mt-1">
              Os eventos aparecem aqui quando você conclui uma admissão digital.
            </p>
            <NuxtLink
              to="/painel/empresa/admissao"
              class="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1E88E5] hover:underline"
            >
              Iniciar uma admissão →
            </NuxtLink>
          </div>

          <!-- Timeline -->
          <div v-else class="relative">
            <div class="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-100" />

            <div
              v-for="(evento, idx) in eventos"
              :key="evento.id"
              class="relative pl-12 mb-8 last:mb-0"
            >
              <!-- Ícone -->
              <div
                class="absolute left-0 top-0 w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center z-10 shadow-sm"
                :class="getCfg(evento.status).border"
              >
                <CheckCircle v-if="evento.status === 'Transmitido'" :size="14" class="text-[#1FAE66]" />
                <ShieldAlert v-else-if="evento.status === 'Pendente'" :size="14" class="text-red-500" />
                <Clock       v-else-if="evento.status === 'Processando'" :size="14" class="text-[#1787D4]" />
                <AlertCircle v-else-if="evento.status === 'Erro'" :size="14" class="text-orange-500" />
                <Info        v-else :size="14" class="text-slate-400" />
              </div>

              <!-- Card -->
              <div class="rounded-2xl border p-5" :class="[getCfg(evento.status).bg, getCfg(evento.status).border]">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <span class="text-[10px] font-black uppercase tracking-wider" :class="getCfg(evento.status).color">
                      {{ evento.evento_id }} • {{ evento.status }}
                    </span>
                    <h4 class="text-base font-black text-[#0D2E5C] mt-0.5">{{ evento.titulo }}</h4>
                  </div>
                  <span class="text-xs text-slate-400 font-semibold shrink-0 ml-4">
                    {{ formatData(evento.created_at) }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 pt-3 border-t border-white/60 text-sm">
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</span>
                    <p class="font-bold text-[#0D2E5C] mt-0.5">{{ evento.responsavel ?? '—' }}</p>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo</span>
                    <p class="font-bold font-mono text-[#0D2E5C] mt-0.5 text-xs">{{ evento.protocolo ?? '---' }}</p>
                  </div>
                </div>

                <!-- Ação: transmitir manualmente se pendente -->
                <button
                  v-if="evento.status === 'Pendente'"
                  class="mt-3 flex items-center gap-2 text-xs font-black text-[#1E88E5] hover:underline"
                  @click="mostrarToast('Transmissão manual iniciada para ' + evento.evento_id, 'ok')"
                >
                  <Send :size="12" /> Transmitir agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 flex flex-col gap-6">

        <!-- Atalho para Admissão Digital -->
        <NuxtLink
          to="/painel/empresa/admissao"
          class="bg-gradient-to-br from-[#1FAE66] to-[#1787D4] rounded-[24px] p-6 text-white shadow-xl hover:-translate-y-1 transition-all block"
        >
          <ShieldCheck :size="24" class="mb-3 opacity-80" />
          <h4 class="text-sm font-black mb-1">Admissão Digital</h4>
          <p class="text-xs opacity-75">Gerencie contratos e envie S-2200 automaticamente</p>
          <span class="mt-4 flex items-center gap-1 text-xs font-black opacity-90">Acessar →</span>
        </NuxtLink>

        <!-- Serviços externos -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h4 class="text-sm font-black text-[#0D2E5C] mb-5 flex items-center gap-2">
            <Wifi :size="18" class="text-[#1787D4]" /> Serviços Externos
          </h4>
          <div class="flex flex-col gap-4">
            <div
              v-for="(svc, i) in services"
              :key="i"
              class="flex items-center justify-between"
              :class="{ 'pb-4 border-b border-slate-100': i < services.length - 1 }"
            >
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full" :class="svc.ok ? 'bg-[#1FAE66]' : 'bg-red-400'" />
                <span class="text-sm font-semibold text-slate-700">{{ svc.label }}</span>
              </div>
              <span class="text-[10px] font-black" :class="svc.ok ? 'text-[#1FAE66]' : 'text-red-500'">{{ svc.status }}</span>
            </div>
          </div>
        </div>

        <!-- Referência rápida de eventos eSocial -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <h4 class="text-sm font-black text-[#0D2E5C] mb-4">Eventos Disponíveis</h4>
          <div class="space-y-3">
            <div
              v-for="ev in [
                { id: 'S-2200', desc: 'Admissão de Trabalhador', cor: 'text-[#1FAE66]' },
                { id: 'S-2205', desc: 'Alteração de Dados',       cor: 'text-[#1787D4]' },
                { id: 'S-2210', desc: 'Acidentes do Trabalho',    cor: 'text-red-500' },
                { id: 'S-2220', desc: 'Saúde do Trabalhador',     cor: 'text-teal-500' },
                { id: 'S-2240', desc: 'Condições Ambientais',     cor: 'text-amber-500' },
                { id: 'S-2299', desc: 'Desligamento',             cor: 'text-slate-500' },
              ]"
              :key="ev.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="font-black text-[10px]" :class="ev.cor">{{ ev.id }}</span>
              <span class="text-slate-500 font-medium text-xs">{{ ev.desc }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-top-enter-active, .slide-top-leave-active { transition: all 0.3s ease; }
.slide-top-enter-from, .slide-top-leave-to { opacity: 0; transform: translateY(-16px); }
</style>
