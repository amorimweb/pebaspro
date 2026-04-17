<script setup lang="ts">
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Mail, 
  CreditCard, 
  Database, 
  Lock, 
  Save, 
  RotateCcw, 
  Activity,
  ArrowRight,
  Eye,
  Trash2
} from 'lucide-vue-next'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { useAdminAudit } from '~/composables/useAdminAudit'

definePageMeta({
  layout: 'admin-master',
  middleware: 'admin'
})

const { canPerformAction } = useAdminPermissions()
const { logAction } = useAdminAudit()

// UI State
const activeTab = ref('geral')
const isLoading = ref(true)

const tabs = [
  { id: 'geral', label: 'Configurações Globais', icon: Settings, desc: 'Identidade e parâmetros de sistema' },
  { id: 'permissoes', label: 'Segurança & Perfis', icon: Shield, desc: 'RBAC e níveis de privilégio' },
  { id: 'notificacoes', label: 'Fluxo de Alertas', icon: Bell, desc: 'Push, e-mail e webhooks' },
  { id: 'pagamentos', label: 'Financeiro & Taxas', icon: CreditCard, desc: 'Gateway e regras de comissão' },
  { id: 'emails', label: 'Comunicação', icon: Mail, desc: 'Templates transacionais' },
  { id: 'integracoes', label: 'Ecossistema (API)', icon: Database, desc: 'Chaves e webhooks externos' },
  { id: 'seguranca', label: 'Audit Log', icon: Lock, desc: 'Segurança avançada e logs' }
]

onMounted(() => {
  setTimeout(() => isLoading.value = false, 500)
})

const handleSave = () => {
  if (!canPerformAction('edit', 'configuracoes')) {
    alert('Ação negada: privilégios insuficientes para alteração global.')
    return
  }
  logAction('update_global_settings', 'configuracoes', { tab: activeTab.value })
  alert('Parâmetros salvos e propagados com sucesso.')
}

const handleAction = (type: string, data?: any) => {
  if (!canPerformAction('edit', 'configuracoes')) return
  logAction(`${type}_settings`, 'configuracoes', data)
  alert(`Operação "${type}" processada.`)
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">System Core</h1>
        <p class="text-slate-500 font-medium mt-1">Controle central de parâmetros, integrações e governança da plataforma.</p>
      </div>
      <div v-if="canPerformAction('edit', 'configuracoes')" class="flex gap-3">
         <button @click="handleAction('restore')" class="rounded-2xl bg-white border border-slate-100 px-6 py-3 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2">
           <RotateCcw class="h-4 w-4" />
           Reset
        </button>
        <button @click="handleSave" class="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
           <Save class="h-4 w-4" />
           Commit Changes
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
       <!-- Tab Navigation -->
       <div class="lg:col-span-4 space-y-3">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-100 hover:border-slate-200',
              'w-full flex items-center gap-4 p-5 rounded-[28px] border text-left transition-all group relative'
            ]"
          >
             <div :class="[
               activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-600',
               'h-12 w-12 rounded-2xl flex items-center justify-center transition-all'
             ]">
                <component :is="tab.icon" class="h-6 w-6" />
             </div>
             <div>
                <p :class="[activeTab === tab.id ? 'text-white' : 'text-slate-900', 'text-sm font-black tracking-tight']">{{ tab.label }}</p>
                <p :class="[activeTab === tab.id ? 'text-indigo-100' : 'text-slate-400', 'text-[10px] font-bold uppercase tracking-wider']">{{ tab.desc }}</p>
             </div>
             <ArrowRight v-if="activeTab === tab.id" class="absolute right-6 h-5 w-5 text-white/50" />
          </button>
       </div>

       <!-- Tab Content -->
       <div class="lg:col-span-8 flex flex-col gap-6">
          <div v-if="isLoading" class="p-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
             <div class="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Heurística...</p>
          </div>

          <template v-else>
             <!-- GENERAL TAB -->
             <div v-if="activeTab === 'geral'" class="animate-in slide-in-from-right-4 duration-500 space-y-6">
                <!-- Branding Section -->
                <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                   <div class="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Branding & Identidade</h3>
                      <div class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   </div>
                   <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div v-for="field in [
                         { label: 'Nome da Plataforma', value: 'PEBASPRO', type: 'text' },
                         { label: 'E-mail Institucional', value: 'contato@pebaspro.com.br', type: 'email' },
                         { label: 'URL de Homologação', value: 'https://pebaspro.com.br', type: 'url' },
                         { label: 'Timezone Operacional', value: 'America/Sao_Paulo (GMT-3)', type: 'select' }
                       ]" :key="field.label">
                          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ field.label }}</label>
                          <input :type="field.type" :value="field.value" :disabled="!canPerformAction('edit', 'configuracoes')" class="w-full bg-slate-50 border-transparent rounded-[18px] px-5 py-3 text-sm font-bold text-slate-900 focus:ring-indigo-600 focus:bg-white transition-all border outline-none disabled:opacity-50" />
                       </div>
                   </div>
                </div>

                <!-- Technical Mode -->
                <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex items-center justify-between group hover:border-indigo-100 transition-all">
                   <div class="space-y-1">
                      <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest">Modo de Manutenção (Maintenance)</h4>
                      <p class="text-xs font-medium text-slate-500 max-w-md">Ao ativar, o acesso público será suspenso e apenas administradores MASTER poderão operar o sistema.</p>
                   </div>
                   <button @click="handleAction('maintenance')" :class="[
                     false ? 'bg-indigo-600' : 'bg-slate-200',
                     'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-600'
                   ]">
                      <span class="translate-x-1 inline-block h-6 w-6 transform rounded-full bg-white transition-transform" />
                   </button>
                </div>
             </div>

             <!-- PERMISSIONS TAB -->
             <div v-if="activeTab === 'permissoes'" class="animate-in slide-in-from-right-4 duration-500 space-y-6">
                <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                   <div class="p-8 border-b border-slate-50 flex items-center justify-between">
                      <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Matriz de Privilégios (RBAC)</h3>
                      <button v-if="canPerformAction('create', 'configuracoes')" class="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">Criar Layer Access</button>
                   </div>
                   <div class="divide-y divide-slate-50">
                      <div v-for="role in [
                        { name: 'Admin Master', level: 'Level 100', desc: 'Acesso absoluto a núcleos e financeiro.', count: '2 Operadores' },
                        { name: 'Financial Auditor', level: 'Level 80', desc: 'Leitura e escrita em transações e faturas.', count: '3 Operadores' },
                        { name: 'CX Moderator', level: 'Level 50', desc: 'Gestão de tickets, usuários e compliance.', count: '8 Operadores' }
                      ]" :key="role.name" class="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group">
                         <div class="flex items-center gap-5">
                            <div class="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:shadow-md transition-all">
                               <Shield class="h-6 w-6" />
                            </div>
                            <div>
                               <div class="flex items-center gap-3 mb-1">
                                  <h4 class="text-base font-black text-slate-900 tracking-tight">{{ role.name }}</h4>
                                  <span class="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase italic">{{ role.level }}</span>
                               </div>
                               <p class="text-xs font-medium text-slate-500">{{ role.desc }}</p>
                            </div>
                         </div>
                         <div class="flex flex-col items-end gap-2">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ role.count }}</span>
                            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button class="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit class="h-4 w-4" /></button>
                               <button class="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 class="h-4 w-4" /></button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- PAYMENTS TAB -->
             <div v-if="activeTab === 'pagamentos'" class="animate-in slide-in-from-right-4 duration-500 space-y-6">
                 <div class="bg-indigo-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/30">
                    <div class="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
                       <CreditCard class="h-16 w-16 text-indigo-400 mb-2 animate-bounce" />
                       <h3 class="text-2xl font-black italic tracking-tight uppercase">Economic Engine Config</h3>
                       <p class="text-indigo-200 text-sm font-medium leading-relaxed max-w-sm">Ajuste as engrenagens de faturamento, comissionamento e retenção tributária global.</p>
                       
                       <div class="grid grid-cols-2 gap-4 w-full mt-8">
                          <div class="bg-white/10 backdrop-blur-md p-6 rounded-[24px] border border-white/5">
                             <p class="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">Comissão Admin</p>
                             <div class="flex items-center justify-center gap-2">
                                <span class="text-4xl font-black">15</span>
                                <span class="text-xl font-bold text-indigo-400">%</span>
                             </div>
                          </div>
                          <div class="bg-white/10 backdrop-blur-md p-6 rounded-[24px] border border-white/5">
                             <p class="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">SLA Repasse</p>
                             <div class="flex items-center justify-center gap-2">
                                <span class="text-4xl font-black">D+14</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    <!-- Decorative BG -->
                    <div class="absolute -bottom-20 -right-20 h-80 w-80 bg-white/5 rounded-full blur-[80px]"></div>
                 </div>
             </div>

             <!-- OTHER TABS (SIMPLIFIED FOR MASTER AESTHETIC) -->
             <div v-if="!['geral', 'permissoes', 'pagamentos'].includes(activeTab)" class="animate-in fade-in zoom-in-95 duration-500 p-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm border-dashed">
                <div class="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mx-auto mb-6">
                   <component :is="tabs.find(t => t.id === activeTab)?.icon" class="h-10 w-10" />
                </div>
                <h4 class="text-xl font-black text-slate-900 tracking-tight italic">{{ tabs.find(t => t.id === activeTab)?.label }}</h4>
                <p class="text-sm font-medium text-slate-500 mt-2 mb-8">Esta seção está programada para o ciclo de deploy v4.3.</p>
                <button @click="handleAction('test')" class="px-8 py-3 bg-slate-50 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 transition-all uppercase tracking-widest">Ativar Heurística de Teste</button>
             </div>
          </template>
       </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
