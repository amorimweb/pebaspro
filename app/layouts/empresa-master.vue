<script setup lang="ts">
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  BarChart3, 
  Settings, 
  Search, 
  Briefcase, 
  Zap, 
  ChevronRight,
  Bell,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronDown,
  MessageSquare
} from 'lucide-vue-next'

const authStore = useAuthStore()
const { mode, activePlan, company } = useEmpresaDashboard()
const sidebarOpen = ref(false)
const isUserDropdownOpen = ref(false)
const route = useRoute()

const ALL_MENU_ITEMS = [
  { id: 'dashboard',   icon: LayoutDashboard, label: 'Visão Geral',      path: '/painel/empresa' },
  { id: 'mensagens',   icon: MessageSquare,   label: 'Mensagens',        path: '/painel/empresa/mensagens' },
  { id: 'recrutamento',icon: Briefcase,       label: 'Recrutamento',     path: '/painel/empresa/vagas' },
  { id: 'talentos',    icon: Search,          label: 'Banco de Talentos',path: '/painel/empresa/buscar-talentos' },
  { id: 'admissao',    icon: UserPlus,        label: 'Admissão Digital', path: '/painel/empresa/admissao' },
  { id: 'documentos',  icon: FileText,        label: 'Documentos',       path: '/painel/empresa/documentos' },
  { id: 'relatorios',  icon: BarChart3,       label: 'Relatórios',       path: '/painel/empresa/relatorios' },
  { id: 'configuracoes',icon: Settings,        label: 'Configurações',    path: '/painel/empresa/configuracoes' },
]

const MODE_LABELS = {
  essencial:   { label: 'Essencial',   color: '#1FAE66' },
  operacional: { label: 'Operacional', color: '#10b981' },
  corporativo: { label: 'Corporativo', color: '#059669' },
}

// Mapeamento de módulos por modo (simplificado para demonstração inicial)
const modeModules = {
  essencial:    ['dashboard', 'mensagens', 'recrutamento', 'talentos', 'admissao', 'documentos', 'configuracoes'],
  operacional:  ['dashboard', 'mensagens', 'recrutamento', 'talentos', 'admissao', 'documentos', 'relatorios', 'configuracoes'],
  corporativo:  ['dashboard', 'mensagens', 'recrutamento', 'talentos', 'admissao', 'documentos', 'relatorios', 'configuracoes'],
}

const menuItems = computed(() => {
  const allowedIds = modeModules[mode.value] || modeModules.corporativo
  return ALL_MENU_ITEMS.filter(m => allowedIds.includes(m.id))
})

const modeDef = computed(() => MODE_LABELS[mode.value] || MODE_LABELS.corporativo)

const handleSignOut = async () => {
  await authStore.signOut()
  navigateTo('/login')
}

const isActive = (path: string) => {
    if (path === '/painel/empresa' && route.path !== '/painel/empresa') return false
    return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-[#F4F7FA] flex font-sans text-[#16324F]">
    
    <!-- Mobile Sidebar Overlay -->
    <Transition name="fade">
      <div 
        v-if="sidebarOpen"
        class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-[70] w-[280px] bg-[#064e3b] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="p-8 border-b border-white/5">
        <NuxtLink to="/painel/empresa" class="flex items-center gap-4 mb-4 group/logo transition-all hover:opacity-90">
          <div class="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#1FAE66] to-[#059669] flex items-center justify-center shadow-lg shadow-green-500/20 relative overflow-hidden group">
            <div class="absolute inset-0 bg-white/20 opacity-50 transition-opacity group-hover:opacity-100" />
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white" class="z-10 drop-shadow">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-[900] tracking-tighter leading-none">PEBASPRO</h1>
            <span class="text-[10px] text-[#1FAE66] font-bold uppercase tracking-widest mt-1 inline-block">Profissionais Locais</span>
          </div>
        </NuxtLink>
        
        <div class="mt-4 flex items-center justify-between">
           <span class="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1FAE66]">Painel Empresarial</span>
        </div>

        <!-- Mode Badge -->
        <div 
          class="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all"
          :style="{ borderColor: modeDef.color, color: modeDef.color }"
        >
          <Zap size="10" :fill="modeDef.color" />
          Modo {{ modeDef.label }}
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto pt-6 px-4 scrollbar-hide space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.id"
          :to="item.path"
          :class="[
            isActive(item.path) ? 'bg-green-600/20 text-green-400 border-l-4 border-green-500' : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent',
            'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all group'
          ]"
        >
          <component :is="item.icon" size="20" :class="isActive(item.path) ? 'text-green-400' : 'text-slate-500 group-hover:text-white'" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer Plan Card -->
      <div class="p-6 border-t border-white/5">
        <div class="bg-white/5 p-4 rounded-[20px] border border-white/10">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-300">Plano {{ activePlan }}</h4>
            <span class="text-[10px] font-bold text-green-400">ATIVO</span>
          </div>
          <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
            <div class="h-full bg-gradient-to-r from-green-400 to-emerald-400" style="width: 100%" />
          </div>
          <button @click="navigateTo('/painel/empresa/planos')" class="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
            Gerenciar Plano <ChevronRight size="12" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Section -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Header -->
      <header class="h-16 md:h-20 shrink-0 bg-white border-b border-[#DCE4EA] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-6 flex-1">
          <button @click="sidebarOpen = true" class="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <Menu size="24" />
          </button>
          
          <div class="relative flex-1 max-w-lg hidden md:block group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Busca global de recursos..." 
              class="w-full h-11 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div class="flex items-center gap-6">
          <!-- Site Link -->
          <NuxtLink to="/" class="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-green-600 transition-colors">
            Ver Site <ExternalLink size="12" />
          </NuxtLink>

          <!-- Notifications -->
          <button class="relative p-2.5 bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-white border-transparent hover:border-slate-100 border rounded-2xl transition-all">
            <Bell size="20" />
            <span class="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div class="w-px h-8 bg-[#DCE4EA]" />

          <!-- User -->
          <div class="relative">
            <div 
              @click="isUserDropdownOpen = !isUserDropdownOpen"
              class="flex items-center gap-4 pl-2 group cursor-pointer"
            >
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-sm font-bold tracking-tight">{{ authStore.profile?.nome || 'Empresa Host' }}</span>
                <span class="text-[9px] font-black text-[#1FAE66] uppercase tracking-widest line-clamp-1">Conta administrador</span>
              </div>
              <div class="relative">
                <div class="w-11 h-11 rounded-[16px] bg-green-600/10 flex items-center justify-center font-black text-xs text-green-600 border border-white shadow-sm ring-4 ring-transparent group-hover:ring-green-600/5 transition-all">
                  {{ authStore.profile?.nome?.charAt(0) || 'E' }}
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
            </div>

            <!-- Dropdown Menu -->
            <Transition name="dropdown">
              <div v-if="isUserDropdownOpen" class="absolute right-0 mt-4 w-60 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 z-[100]">
                <div class="px-4 py-3 border-b border-slate-50 mb-1">
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Acesso Rápido</p>
                </div>
                <NuxtLink to="/painel/empresa/configuracoes" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 rounded-xl transition-all">
                  <Settings size="16" /> Configurações
                </NuxtLink>
                <NuxtLink to="/" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 rounded-xl transition-all">
                  <ExternalLink size="16" /> Voltar ao Site
                </NuxtLink>
                <div class="h-px bg-slate-50 my-1" />
                <button @click="handleSignOut" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <LogOut size="16" /> Encerrar Sessão
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Tab View / Main Body -->
      <main class="flex-1 overflow-y-auto bg-[#F4F7FA] scroll-smooth p-4 md:p-8 scrollbar-hide">
        <slot />
      </main>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(10px) scale(0.95); }

.panel-tag {
  display: inline-block;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #1FAE66;
  background: rgba(31, 174, 102, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
}
</style>
