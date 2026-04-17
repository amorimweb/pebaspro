<script setup lang="ts">
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  CalendarCheck, 
  DollarSign, 
  ShieldAlert, 
  Headset, 
  MessageSquare, 
  Settings, 
  FileText, 
  MapPin,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  UserCircle
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const sidebarOpen = ref(false)
const route = useRoute()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuários', href: '/admin/usuarios', icon: Users, children: [
    { name: 'Talentos', href: '/admin/usuarios/talentos' },
    { name: 'Prestadores', href: '/admin/usuarios/prestadores' },
    { name: 'Empresas', href: '/admin/usuarios/empresas' },
  ]},
  { name: 'Painel RH', href: '/admin/rh', icon: Briefcase },
  { name: 'Integração Emp > Prest', href: '/admin/integracao', icon: Building2 },
  { name: 'Vagas', href: '/admin/vagas', icon: FileText },
  { name: 'Serviços & Agenda', href: '/admin/servicos', icon: CalendarCheck },
  { name: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
  { name: 'Moderação', href: '/admin/moderacao', icon: ShieldAlert },
  { name: 'Suporte', href: '/admin/suporte', icon: Headset },
  { name: 'Conteúdo', href: '/admin/conteudo', icon: MessageSquare },
  { name: 'Relatórios', href: '/admin/relatorios', icon: FileText },
  { name: 'Cidades', href: '/admin/cidades', icon: MapPin },
  { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

const isActive = (path: string) => {
  if (path === '/admin' && route.path !== '/admin') return false
  return route.path.startsWith(path)
}

const handleSignOut = async () => {
  await authStore.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex font-sans">
    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div 
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <div 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex h-16 shrink-0 items-center px-6 bg-slate-950 border-b border-white/5">
        <span class="text-xl font-bold tracking-tight">PEBASPRO <span class="text-green-500 font-medium">Master</span></span>
      </div>
      
      <div class="flex flex-1 flex-col overflow-y-auto pt-4 pb-4 scrollbar-hide">
        <nav class="flex-1 space-y-1 px-3">
          <div v-for="item in navigation" :key="item.name">
            <NuxtLink
              :to="item.href"
              :class="[
                isActive(item.href) ? 'bg-green-600/20 text-green-400 border-l-4 border-green-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent',
                'group flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-200'
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  isActive(item.href) ? 'text-green-500' : 'text-slate-500 group-hover:text-white',
                  'mr-3 h-5 w-5 shrink-0 transition-colors'
                ]"
                aria-hidden="true"
              />
              {{ item.name }}
            </NuxtLink>
            
            <!-- Submenu -->
            <Transition name="slide">
              <div v-if="item.children && isActive(item.href)" class="mt-1 space-y-1 pl-10 bg-slate-950/30 py-1">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.name"
                  :to="child.href"
                  :class="[
                    route.path === child.href ? 'text-green-400 font-bold' : 'text-slate-500 hover:text-white',
                    'block px-3 py-2 text-xs transition-colors font-medium border-l border-slate-800 ml-1'
                  ]"
                >
                  {{ child.name }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>
      </div>
      
      <!-- Sidebar Footer -->
      <div class="border-t border-white/5 p-4 bg-slate-950/50">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <UserCircle class="h-6 w-6 text-green-500" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-white truncate">{{ authStore.profile?.nome || 'Admin Master' }}</span>
            <span class="text-[10px] text-slate-500 uppercase tracking-widest font-black">{{ authStore.profile?.role || 'Diretoria' }}</span>
          </div>
          <button @click="handleSignOut" class="ml-auto p-1.5 text-slate-500 hover:text-red-400 transition-colors">
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
        <div class="flex items-center flex-1 gap-4">
          <button
            type="button"
            class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            @click="sidebarOpen = true"
          >
            <span class="sr-only">Open sidebar</span>
            <Menu class="h-6 w-6" aria-hidden="true" />
          </button>

          <div class="relative flex-1 max-w-md hidden md:block">
             <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 focus-within:text-green-600 transition-colors" />
             <input
                id="search-field"
                class="block w-full rounded-xl border-gray-200 pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:ring-green-500 focus:border-green-500 bg-gray-50/50"
                placeholder="Busca global..."
                type="search"
              />
          </div>
        </div>

        <div class="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" class="p-2 text-gray-400 hover:text-green-600 relative transition-colors">
            <span class="sr-only">View notifications</span>
            <Bell class="h-6 w-6" aria-hidden="true" />
            <span class="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div class="h-6 w-px bg-gray-200" aria-hidden="true" />

          <NuxtLink to="/" class="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-green-600 transition-colors">
            Ver Site
          </NuxtLink>
        </div>
      </header>

      <!-- Main area -->
      <main class="flex-1 overflow-y-auto bg-slate-50/50 scrollbar-hide">
        <div class="p-4 sm:p-6 lg:p-8">
           <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; max-height: 200px; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; transform: translateY(-10px); }
</style>
