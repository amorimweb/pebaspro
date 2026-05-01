<script setup lang="ts">
import { 
  Building, 
  Zap, 
  Lock, 
  Bell, 
  Globe, 
  Save, 
  X, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldAlert,
  Search,
  MapPin,
  ShieldCheck,
  Smartphone
} from 'lucide-vue-next'
import type { Database } from '~/types'

definePageMeta({
  layout: 'empresa-master'
})

const authStore = useAuthStore()
const user = useSupabaseUser()
const { translateError } = useTranslation()
const { mode, activePlan, company, setMode } = useEmpresaDashboard()

const activeTab = ref('geral')
const isSaving = ref(false)

const tabs = [
  { id: 'geral',    label: 'Geral',                  icon: Building },
  { id: 'plano',    label: 'Plano e Perfil',          icon: Zap },
  { id: 'usuarios', label: 'Usuários e Permissões',   icon: Lock },
  { id: 'notif',   label: 'Notificações',             icon: Bell },
  { id: 'integ',   label: 'Integrações eSocial',      icon: Globe },
]

const form = ref({
    nome: '',
    documento: '',
    telefone: '',
    endereco: '',
    sobre_mim: '',
    latitude: null as number | null,
    longitude: null as number | null
})

// Sync form with profile
watch(() => authStore.profile, (p) => {
    if (p) {
        form.value.nome = p.nome || ''
        form.value.documento = p.documento || ''
        form.value.telefone = p.telefone || ''
        form.value.endereco = p.endereco || ''
        form.value.sobre_mim = p.sobre_mim || ''
        form.value.latitude = p.latitude || null
        form.value.longitude = p.longitude || null
    }
}, { immediate: true })

const handleSave = async () => {
    isSaving.value = true
    try {
        const { error } = await authStore.updateProfile({
            nome: form.value.nome,
            documento: form.value.documento,
            telefone: form.value.telefone,
            endereco: form.value.endereco,
            sobre_mim: form.value.sobre_mim,
            latitude: form.value.latitude,
            longitude: form.value.longitude
        })
        if (error) throw error
        alert('Configurações salvas com sucesso!')
    } catch (e: any) {
        alert('Erro ao salvar: ' + translateError(e))
    } finally {
        isSaving.value = false
    }
}

const modes = [
  {
    id: 'essencial',
    label: 'Essencial',
    desc: 'Foco em recrutamento, admissão e documentos. Ideal para pequenos negócios.',
    color: '#1FAE66',
    modules: '6 módulos',
  },
  {
    id: 'operacional',
    label: 'Operacional',
    desc: 'Adiciona relatórios e alertas. Para empresas com rotina de contratação.',
    color: '#10b981',
    modules: '7 módulos',
  },
  {
    id: 'corporativo',
    label: 'Corporativo',
    desc: 'Todos os módulos: Compliance SST, eSocial e relatórios avançados.',
    color: '#059669',
    modules: '9 módulos',
  },
]
</script>

<template>
  <div class="animate-in fade-in duration-700">
    <div class="mb-10">
      <h2 class="text-3xl font-black text-slate-900 tracking-tight">Portal Central</h2>
      <p class="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Gerencie dados da empresa, plano, usuários e preferências de sistema.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation: scroll horizontal no mobile, vertical no desktop -->
      <nav class="lg:col-span-1 flex lg:flex-col overflow-x-auto gap-1 pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id ? 'bg-green-600/10 text-green-600 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900',
            'shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl text-xs lg:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap'
          ]"
        >
          <component :is="tab.icon" size="16" />
          {{ tab.label }}
        </button>
      </nav>

      <!-- Main Content Area -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-[24px] lg:rounded-[40px] border border-slate-100 shadow-sm p-5 md:p-8 lg:p-10">
          
          <!-- TAB: GERAL -->
          <div v-if="activeTab === 'geral'" class="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome Institucional</label>
                  <div class="relative group">
                    <Building class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                    <input v-model="form.nome" type="text" class="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">CNPJ / Documento</label>
                  <div class="relative group">
                    <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                    <input v-model="form.documento" type="text" class="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none" placeholder="00.000.000/0001-00" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">WhatsApp de Contato</label>
                  <div class="relative group">
                    <Smartphone class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                    <input v-model="form.telefone" type="text" class="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-500/10 focus:bg-white transition-all outline-none" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Endereço Matriz</label>
                  <div class="relative group">
                    <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                    <input v-model="form.endereco" type="text" class="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none" placeholder="Cidade, Estado" />
                  </div>
                </div>
             </div>

             <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Proposta de Valor / Sobre a Empresa</label>
                <textarea v-model="form.sobre_mim" rows="5" class="w-full p-6 bg-slate-50 border-none rounded-[32px] text-sm font-medium text-slate-600 focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none leading-relaxed"></textarea>
             </div>

             <div class="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button @click="handleSave" :disabled="isSaving" class="px-10 py-5 bg-green-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50">
                  {{ isSaving ? 'Committing...' : 'Salvar Alterações' }}
                </button>
             </div>
          </div>

          <!-- TAB: PLANO E PERFIL -->
          <div v-if="activeTab === 'plano'" class="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
             <div>
               <h3 class="text-xl font-black text-slate-900 tracking-tight">Modo de Experiência do Painel</h3>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">O modo adapta quais módulos ficam visíveis no menu</p>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  v-for="m in modes"
                  :key="m.id"
                  @click="setMode(m.id)"
                  :class="[
                    mode === m.id ? 'border-2 bg-slate-50/50' : 'border-transparent bg-white hover:bg-slate-50',
                    'p-6 rounded-[32px] text-left transition-all border group relative'
                  ]"
                  :style="{ borderColor: mode === m.id ? m.color : 'transparent' }"
                >
                  <div v-if="mode === m.id" class="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" :style="{ background: m.color }">
                    <Check size="12" class="text-white" />
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: m.color }">{{ m.label }}</p>
                  <p class="text-sm font-black text-slate-900 mb-2">{{ m.modules }} ativos</p>
                  <p class="text-[10px] font-medium text-slate-500 leading-relaxed">{{ m.desc }}</p>
                </button>
             </div>

             <div class="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plano Atual</p>
                  <h4 class="text-xl font-black text-slate-900 uppercase tracking-tighter">Plano {{ activePlan }}</h4>
                </div>
                <button class="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2">
                  Mudar Plano <ArrowRight size="14" />
                </button>
             </div>
          </div>

          <!-- TAB: USUARIOS (Mock) -->
          <div v-if="activeTab === 'usuarios'" class="animate-in fade-in slide-in-from-right-4 duration-500">
             <div class="flex items-center justify-between mb-8">
               <div>
                 <h3 class="text-xl font-black text-slate-900 tracking-tight">Gestão de Acessos</h3>
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Controle quem tem acesso à plataforma e suas permissões</p>
               </div>
               <button class="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2">
                 <Plus size="16" /> Novo Usuário
               </button>
             </div>

             <div class="overflow-x-auto">
               <table class="w-full text-left border-collapse">
                 <thead>
                   <tr class="bg-slate-50/50">
                     <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                     <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Papel</th>
                     <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-50">
                   <tr v-for="usr in ['Admin Global', 'Gestor RH']" :key="usr" class="group hover:bg-slate-50/50 transition-all">
                     <td class="px-6 py-5">
                       <div class="flex items-center gap-3">
                         <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">{{ usr.charAt(0) }}</div>
                         <div>
                            <p class="text-sm font-black text-slate-900 tracking-tight">{{ usr === 'Admin Global' ? authStore.profile?.nome : 'Patrícia Mendes' }}</p>
                            <p class="text-[10px] font-bold text-slate-400">{{ usr === 'Admin Global' ? user?.email : 'rh@pebaspro.com.br' }}</p>
                         </div>
                       </div>
                     </td>
                     <td class="px-6 py-5">
                       <span class="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">{{ usr }}</span>
                     </td>
                      <td class="px-6 py-5">
                         <button class="p-2 text-slate-400 hover:text-green-600 transition-colors"><Edit2 size="16" /></button>
                      </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          <!-- TAB: NOTIFICAÇÕES -->
          <div v-if="activeTab === 'notif'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <div>
               <h3 class="text-xl font-black text-slate-900 tracking-tight">Preferências de Alertas</h3>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configurações de notificações em tempo real</p>
             </div>

             <div class="space-y-4">
                 <div v-for="item in ['Novos Candidatos', 'Alertas de SST (ASO / NR)', 'Transmissão eSocial']" :key="item" class="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                       <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                          <Bell size="18" />
                       </div>
                      <div>
                         <p class="text-sm font-black text-slate-900 tracking-tight">{{ item }}</p>
                         <p class="text-[10px] font-medium text-slate-500 leading-tight">Receber alerta crítico via e-mail e push</p>
                      </div>
                    </div>
                    <input type="checkbox" checked class="w-5 h-5 accent-green-600" />
                 </div>
             </div>
          </div>

          <!-- TAB: ESOCIAL -->
          <div v-if="activeTab === 'integ'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <div class="flex items-center justify-between">
               <div>
                 <h3 class="text-xl font-black text-slate-900 tracking-tight">Integração Governo</h3>
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configurações atreladas ao envio de eventos XML</p>
               </div>
               <span class="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-2 animate-pulse">
                  <Globe size="14" /> Produção Ativa
               </span>
             </div>

             <div class="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6">
                <div class="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-green-600 shadow-sm border border-slate-100">
                   <ShieldAlert size="32" />
                </div>
                <div class="flex-1">
                   <h4 class="text-lg font-black text-slate-900 tracking-tighter">Certificado Digital A1</h4>
                   <p class="text-sm font-medium text-slate-500">Válido até <strong>21/11/2026</strong>. Emitido por AC Certifica.</p>
                </div>
                <button class="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">Substituir</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeInDown 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
