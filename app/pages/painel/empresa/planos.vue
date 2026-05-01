<script setup lang="ts">
import { Check, Zap, Building2, Rocket, ArrowRight, Shield } from 'lucide-vue-next'

definePageMeta({
  layout: 'empresa-master'
})

const { company } = useEmpresaDashboard()
const currentPlan = computed(() => company.value?.plan || 'corporativo')

interface PlanFeature { text: string; ok: boolean }
interface Plan {
  id: string
  label: string
  description: string
  price: string
  color: string
  highlight: boolean
}

const plans: Plan[] = [
  {
    id: 'essencial',
    label: 'Essencial',
    description: 'Para pequenas empresas que estão começando a contratar localmente.',
    price: 'R$ 197',
    color: '#1FAE66',
    highlight: false,
  },
  {
    id: 'operacional',
    label: 'Operacional',
    description: 'Para empresas em crescimento com demandas contínuas de RH.',
    price: 'R$ 497',
    color: '#10b981',
    highlight: false,
  },
  {
    id: 'corporativo',
    label: 'Corporativo',
    description: 'Para grandes operações com necessidades avançadas de compliance.',
    price: 'R$ 997',
    color: '#064e3b',
    highlight: true,
  },
]

const planFeatures: Record<string, PlanFeature[]> = {
  essencial: [
    { text: '3 vagas ativas simultâneas',   ok: true  },
    { text: '1 usuário administrador',       ok: true  },
    { text: 'Banco de Talentos',             ok: true  },
    { text: 'Admissão Digital simples',      ok: true  },
    { text: 'Gestão de Documentos',          ok: true  },
    { text: 'Relatórios avançados',          ok: false },
    { text: 'Compliance SST',                ok: false },
    { text: 'eSocial integrado',             ok: false },
    { text: 'Prestação de serviço',          ok: false },
  ],
  operacional: [
    { text: '15 vagas ativas simultâneas',       ok: true  },
    { text: 'Até 5 usuários internos',           ok: true  },
    { text: 'Banco de Talentos avançado',        ok: true  },
    { text: 'Admissão Digital completa',         ok: true  },
    { text: 'Gestão de Documentos',              ok: true  },
    { text: 'Relatórios operacionais',           ok: true  },
    { text: 'Compliance SST',                    ok: false },
    { text: 'eSocial integrado',                 ok: false },
    { text: 'Prestação de serviço (add-on)',     ok: true  },
  ],
  corporativo: [
    { text: 'Vagas ilimitadas',                      ok: true },
    { text: 'Usuários ilimitados',                   ok: true },
    { text: 'Banco de Talentos premium',             ok: true },
    { text: 'Admissão Digital multifilial',          ok: true },
    { text: 'Gestão de Documentos',                  ok: true },
    { text: 'Relatórios avançados + exportação',     ok: true },
    { text: 'Compliance SST completo',               ok: true },
    { text: 'eSocial integrado',                     ok: true },
    { text: 'Prestação de serviço incluída',         ok: true },
  ],
}

const planIcons: Record<string, any> = {
  essencial:   Zap,
  operacional: Building2,
  corporativo: Rocket,
}

const selectPlan = (id: string) => {
  if (id === currentPlan.value) return
  console.log('Selecionando plano:', id)
}
</script>

<template>
  <div class="space-y-12 animate-in">

    <!-- Hero -->
    <div class="text-center max-w-2xl mx-auto">
      <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-4">
        Escolha o plano ideal para sua empresa
      </h2>
      <p class="text-slate-500 font-medium leading-relaxed">
        Do pequeno comércio à grande operação — o PEBASPRO escala com você.
        Mude de plano quando precisar, sem perder dados.
      </p>
    </div>

    <!-- Cards de Planos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="relative rounded-[24px] p-8 border transition-all hover:-translate-y-1"
        :class="plan.highlight
          ? 'bg-gradient-to-br from-[#064e3b] to-[#0d9488] text-white border-transparent shadow-2xl shadow-green-900/30'
          : 'bg-white border-slate-100 shadow-sm hover:shadow-xl'"
      >
        <!-- Badge Mais Popular -->
        <div
          v-if="plan.highlight"
          class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1FAE66] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
        >
          Mais Popular
        </div>

        <!-- Badge Plano Atual -->
        <div
          v-if="plan.id === currentPlan"
          class="absolute -top-3.5 right-5 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase"
          :style="{ background: plan.color }"
        >
          Plano Atual
        </div>

        <!-- Ícone + Info -->
        <div class="mb-6">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            :class="plan.highlight ? 'bg-white/15' : 'bg-slate-50'"
            :style="plan.highlight ? {} : { color: plan.color }"
          >
            <component :is="planIcons[plan.id]" :size="28" :class="plan.highlight ? 'text-white' : ''" />
          </div>
          <h3 class="text-2xl font-black mb-1">{{ plan.label }}</h3>
          <p class="text-sm leading-relaxed mb-4" :class="plan.highlight ? 'opacity-75' : 'text-slate-400'">
            {{ plan.description }}
          </p>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black">{{ plan.price }}</span>
            <span class="text-sm opacity-60">/mês</span>
          </div>
        </div>

        <!-- Features -->
        <ul class="space-y-2.5 mb-8">
          <li
            v-for="(feat, idx) in planFeatures[plan.id]"
            :key="idx"
            class="flex items-center gap-3 text-sm"
            :class="feat.ok ? '' : 'opacity-35'"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              :class="feat.ok
                ? (plan.highlight ? 'bg-white/20' : 'bg-[#1FAE66]/15')
                : 'border border-slate-200'"
            >
              <Check v-if="feat.ok" :size="10" stroke-width="3" :class="plan.highlight ? 'text-white' : 'text-[#1FAE66]'" />
            </div>
            {{ feat.text }}
          </li>
        </ul>

        <!-- Botão -->
        <button
          class="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          :class="plan.id === currentPlan
            ? (plan.highlight ? 'border border-white/40 text-white' : 'border text-green-900')
            : (plan.highlight ? 'bg-green-600 text-white hover:bg-green-700' : 'text-white hover:opacity-90')"
          :style="plan.id !== currentPlan && !plan.highlight ? { background: plan.color } : {}"
          @click="selectPlan(plan.id)"
        >
          <template v-if="plan.id === currentPlan">
            <Check :size="16" /> Plano Atual
          </template>
          <template v-else>
            Assinar {{ plan.label }} <ArrowRight :size="16" />
          </template>
        </button>

        <!-- Suporte premium -->
        <div v-if="plan.id === 'corporativo'" class="mt-4 flex items-center justify-center gap-1.5 text-xs opacity-60">
          <Shield :size="12" /> Suporte premium incluído
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
</style>
