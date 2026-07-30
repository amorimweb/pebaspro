<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotifications } from '~/composables/useNotifications'
import { Bell, Briefcase, MessageSquare } from 'lucide-vue-next'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const profile = computed(() => authStore.profile)
const initialized = computed(() => authStore.initialized)
// A primeira renderização do cliente (comparada pela hidratação) precisa
// ficar idêntica ao SSR mesmo que `initialized` já tenha virado `true` nesse
// meio-tempo — por isso o gate depende também de `mounted`, que só é setado
// em onMounted (ou seja, estritamente depois da hidratação).
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const ready = computed(() => mounted.value && initialized.value)
const router = useRouter()
const avatarFailed = ref(false)
const avatarUrl = computed(() => avatarFailed.value ? null : profile.value?.foto || null)

watch(() => profile.value?.foto, () => {
  avatarFailed.value = false
})

// UI State
const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isScrolled = ref(false)
const route = useRoute()

// Notificações
const { notifications, unreadCount, markAsRead, loading: loadingNotifications } = useNotifications()
const showNotifications = ref(false)
const notificationRef = ref<HTMLElement | null>(null)

// Fechar ao clicar fora
if (process.client) {
  window.addEventListener('click', (e) => {
    if (showNotifications.value && notificationRef.value && !notificationRef.value.contains(e.target as Node)) {
      showNotifications.value = false
    }
  })
}
const isHomePage = computed(() => route.path === '/')

interface MenuItem {
  label: string
  to: string
  isCTA?: boolean
  onClick?: () => void
}

// Scroll Listener
if (process.client) {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
}

// Actions
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const closeMenus = () => {
  isMobileMenuOpen.value = false
  isUserDropdownOpen.value = false
}

const handleLogout = async () => {
  closeMenus()
  const { error } = await authStore.signOut()
  if (!error) {
    // Redirecionar para home de forma limpa
    await navigateTo('/', { replace: true })
  } else {
    alert('Erro ao sair: ' + error.message)
  }
}

// Menu Definitions
const menus: Record<string, MenuItem[]> = {
  public: [
    { label: 'Vagas', to: '/vagas' },
    { label: 'Serviços', to: '/servicos' },
    { label: 'Para Empresas', to: '/cadastro', onClick: () => { useCookie('pebas_pending_type').value = 'empresa' } },
  ],
  talento: [
    { label: 'Buscar Vagas', to: '/vagas' },
    { label: 'Minhas Vagas', to: '/minhas_vagas' },
    { label: 'Meu Currículo', to: '/curriculo' },
    { label: 'Mensagens', to: '/mensagens' },
    { label: 'Perfil', to: '/perfil' },
  ],
  prestador: [
    { label: 'Dashboard', to: '/painel/prestador' },
    { label: 'Meus Serviços', to: '/painel/prestador/servicos' },
    { label: 'Favoritos', to: '/painel/favoritos' },
    { label: 'Mensagens', to: '/mensagens' },
    { label: 'Perfil', to: '/perfil' },
    { label: 'Divulgar Serviço', to: '/divulgar-servico', isCTA: true },
  ],
  empresa: [
    { label: 'Dashboard', to: '/painel/empresa' },
    { label: 'Minhas Vagas', to: '/painel/empresa/vagas' },
    { label: 'Buscar Talentos', to: '/painel/empresa/buscar-talentos' },
    { label: 'Favoritos', to: '/painel/empresa/favoritos' },
    { label: 'Mensagens', to: '/mensagens' },
    { label: 'Perfil', to: '/perfil' },
    { label: 'Anunciar Vaga', to: '/divulgar-vaga', isCTA: true },
  ],
  cliente: [
    { label: 'Início', to: '/' },
    { label: 'Serviços', to: '/servicos' },
    { label: 'Perfil', to: '/perfil' },
    { label: 'Suporte', to: '/contato' },
  ]
}

const activeMenu = computed<MenuItem[]>(() => {
  if (!user.value) return menus.public || []
  const tipo = (profile.value?.tipo_conta as string) || 'cliente'
  return menus[tipo] || menus.cliente || []
})

// Navigation Guard (close menus on route change)
watch(() => router.currentRoute.value.path, closeMenus)

// Click Outside for Desktop User Dropdown
if (process.client) {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.user-dropdown-trigger')) {
      isUserDropdownOpen.value = false
    }
  }
  onMounted(() => window.addEventListener('click', handleClickOutside))
  onUnmounted(() => window.removeEventListener('click', handleClickOutside))
}

// Scroll Lock for Mobile Menu
watch(isMobileMenuOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})
</script>

<template>
  <header 
    :class="[
      'fixed top-0 left-0 right-0 z-[100] h-24 transition-all duration-500 backdrop-blur-md print:hidden',
      isHomePage 
        ? (isScrolled ? 'bg-green-950/80 shadow-xl' : 'bg-transparent') 
        : 'bg-green-950/90 shadow-lg'
    ]"
  >
    <div class="container mx-auto h-full px-4 md:px-6 flex items-center justify-between">
      
      <!-- LOGO -->
      <NuxtLink to="/" class="flex items-center gap-3 active:scale-95 transition-transform group" aria-label="Home">
        <img 
          src="/PEBASPRO-logo.png" 
          alt="PebasPro" 
          class="h-14 md:h-20 w-auto object-contain drop-shadow-md"
        />
      </NuxtLink>

      <!-- DESKTOP NAV -->
      <nav class="hidden lg:flex items-center gap-1">
        <!-- Main Dynamic Menu -->
        <div class="flex items-center gap-1 min-h-[40px]">
          <div v-if="!ready" key="nav-loading" class="flex gap-2">
            <div v-for="i in 4" :key="i" class="h-8 w-24 bg-white/10 rounded-xl animate-pulse mx-1"></div>
          </div>
          <div v-else key="nav-ready" class="flex gap-1">
            <template v-for="item in activeMenu" :key="item.label">
              <NuxtLink
                :to="item.to"
                @click="item.onClick?.()"
                :class="[
                  'px-4 py-2 text-sm font-bold transition-all rounded-xl tracking-wide uppercase',
                  item.isCTA
                    ? 'is-cta ml-3 bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-green-400/20 active:scale-95'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                ]"
              >
                {{ item.label }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>

      <!-- AUTH / USER DROPDOWN (DESKTOP) -->
      <div class="hidden lg:flex items-center gap-2 min-w-[230px] shrink-0 justify-end">
          <div v-if="!ready" key="auth-loading" class="h-10 w-28 bg-white/10 rounded-xl animate-pulse"></div>
          
          <template v-else-if="!user">
            <NuxtLink to="/login" class="shrink-0 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors rounded-xl">Entrar</NuxtLink>
            <NuxtLink to="/cadastro" class="shrink-0 px-5 py-2.5 text-sm font-bold bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-green-400/20 active:scale-95 transition-all rounded-xl">Cadastrar</NuxtLink>
          </template>

          <div v-else key="auth-user" class="flex items-center gap-4 shrink-0">
            <!-- Notificações Desktop -->
            <div class="relative" ref="notificationRef">
              <button @click="showNotifications = !showNotifications" class="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all relative group">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-green-950 group-hover:scale-110 transition-transform">
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Dropdown Notificações Desktop -->
              <div v-if="showNotifications" class="absolute right-0 mt-4 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div class="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <span class="font-black text-slate-800 text-xs uppercase tracking-widest">Notificações</span>
                  <button v-if="unreadCount > 0" @click="markAsRead()" class="text-[10px] font-bold text-green-600 hover:text-green-500 uppercase tracking-wider">Marcar todas como lidas</button>
                </div>
                <div class="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div v-if="loadingNotifications" class="p-10 text-center text-slate-400 italic text-sm">Carregando...</div>
                  <div v-else-if="notifications.length === 0" class="p-10 text-center text-slate-400 text-sm italic">Nenhuma notificação recente.</div>
                  <div 
                    v-for="n in notifications" 
                    :key="n.id" 
                    :class="{'bg-green-50/40': !n.lida}" 
                    class="p-5 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group/item"
                    @click="markAsRead(n.id); if(n.link) navigateTo(n.link); showNotifications = false"
                  >
                    <div class="flex gap-4">
                      <div class="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover/item:border-green-200 transition-colors text-green-600">
                        <Briefcase v-if="n.tipo === 'vaga'" :size="18" />
                        <MessageSquare v-else :size="18" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-900 mb-1 leading-tight text-left">{{ n.titulo }}</p>
                        <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2 text-left">{{ n.mensagem }}</p>
                        <div class="flex items-center gap-2">
                           <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">{{ new Date(n.created_at).toLocaleDateString() }}</span>
                           <span v-if="!n.lida" class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <NuxtLink v-if="notifications.length > 0" to="/painel/notificacoes" class="block p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-green-600 transition-colors border-t border-slate-50">
                  Ver todo o histórico
                </NuxtLink>
              </div>
            </div>

            <div class="relative user-dropdown-trigger">
              <button 
                @click.stop="toggleUserDropdown" 
                class="flex items-center gap-2 p-1 rounded-xl transition-all active:scale-95 group/btn"
              >
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white font-black text-sm uppercase overflow-hidden ring-2 ring-transparent group-hover/btn:ring-white/30 transition-all">
                 <img
                   v-if="avatarUrl"
                   :src="avatarUrl"
                   alt="Avatar do usuário"
                   class="w-full h-full object-cover"
                   @error="avatarFailed = true"
                 />
                 <span v-else class="w-full h-full flex items-center justify-center">{{ profile?.nome?.charAt(0) || user?.email?.charAt(0) || '?' }}</span>
              </div>
              <svg class="w-4 h-4 text-white/60 transition-transform" :class="{ 'rotate-180': isUserDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <!-- Dropdown Card -->
            <Transition name="dropdown">
              <div v-if="isUserDropdownOpen" class="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden ring-1 ring-black/5 text-slate-900">
                <div class="px-4 py-4 mb-2 bg-slate-50/50 rounded-2xl">
                  <p class="text-xs font-black text-green-600 uppercase tracking-widest mb-1">{{ profile?.tipo_conta }}</p>
                  <p class="text-sm font-black text-slate-900 truncate">{{ profile?.nome }}</p>
                  <p class="text-xs font-medium text-slate-400 truncate">{{ user.email }}</p>
                </div>
                
                <div class="space-y-0.5">
                  <NuxtLink v-if="profile?.tipo_conta === 'empresa'" to="/painel/empresa" @click="closeMenus" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1E88E5] hover:bg-blue-50 rounded-xl transition-all">
                    <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Painel da Empresa
                  </NuxtLink>
                  <NuxtLink v-if="profile?.role === 'admin' || profile?.role === 'superadmin'" to="/admin" @click="closeMenus" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all [&.router-link-active]:bg-amber-50 [&.router-link-active]:text-amber-700">
                    <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Administração
                  </NuxtLink>
                  <NuxtLink to="/perfil" @click="closeMenus" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all [&.router-link-active]:bg-green-50 [&.router-link-active]:text-green-700">
                    <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Meu Perfil
                  </NuxtLink>
                  <NuxtLink :to="profile?.tipo_conta === 'empresa' ? '/painel/empresa/configuracoes' : '/perfil'" @click="closeMenus" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all [&.router-link-active]:bg-green-50 [&.router-link-active]:text-green-700">
                    <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Configurações
                  </NuxtLink>
                </div>
  
                <div class="h-px bg-slate-50 my-2"></div>
  
                <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sair da Conta
                </button>
              </div>
            </Transition>
            </div>
          </div>
      </div>

      <!-- MOBILE CONTROLS -->
      <div class="flex lg:hidden items-center gap-3">
        <!-- Notificações Mobile -->
        <div v-if="ready && user" class="relative" ref="notificationRef">
          <button @click="showNotifications = !showNotifications" class="p-2 text-white/70 hover:bg-white/10 rounded-xl relative">
            <Bell :size="22" />
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-green-950">
              {{ unreadCount }}
            </span>
          </button>
          
          <!-- Dropdown Notificações Mobile -->
          <div v-if="showNotifications" class="absolute right-0 sm:-right-10 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <span class="font-bold text-slate-800 text-sm">Notificações</span>
              <button v-if="unreadCount > 0" @click="markAsRead()" class="text-[10px] font-bold text-green-600 hover:underline">Limpar tudo</button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div v-if="loadingNotifications" class="p-8 text-center"><div class="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>
              <div v-else-if="notifications.length === 0" class="p-8 text-center text-slate-400 text-xs italic">Nenhuma notificação por aqui.</div>
              <div v-for="n in notifications" :key="n.id" :class="{'bg-green-50/30': !n.lida}" class="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" @click="markAsRead(n.id); n.link && navigateTo(n.link); showNotifications = false">
                <div class="flex gap-3 text-left">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                    <Briefcase v-if="n.tipo === 'vaga'" :size="16" />
                    <MessageSquare v-else :size="16" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 mb-0.5 truncate text-left">{{ n.titulo }}</p>
                    <p class="text-[10px] text-slate-500 line-clamp-2 leading-relaxed text-left">{{ n.mensagem }}</p>
                    <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold text-left">{{ new Date(n.created_at).toLocaleDateString() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Avatar (Mobile) -->
        <NuxtLink v-if="ready && user" to="/perfil" class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black overflow-hidden transition-colors">
           <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar do usuário" class="w-full h-full object-cover" @error="avatarFailed = true" />
           <span v-else class="w-full h-full flex items-center justify-center">{{ profile?.nome?.charAt(0) || 'U' }}</span>
        </NuxtLink>

        <!-- Hamburger -->
        <button 
          @click="toggleMobileMenu" 
          class="w-12 h-12 flex items-center justify-center rounded-2xl text-white active:scale-95 transition-all relative overflow-hidden group"
          :aria-expanded="isMobileMenuOpen"
        >
          <div class="relative w-6 h-5">
            <span class="absolute block w-full h-0.5 bg-current transition-all duration-300 transform" :class="isMobileMenuOpen ? 'rotate-45 top-2' : 'top-0'"></span>
            <span class="absolute block w-full h-0.5 bg-current transition-all duration-300 top-2" :class="{ 'opacity-0 -translate-x-full': isMobileMenuOpen }"></span>
            <span class="absolute block w-full h-0.5 bg-current transition-all duration-300 transform" :class="isMobileMenuOpen ? '-rotate-45 top-2' : 'top-4'"></span>
          </div>
        </button>
      </div>

    </div>
  </header>

  <!-- MOBILE SIDEBAR -->
  <Teleport to="body">
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[200] lg:hidden">
      <!-- Backdrop -->
      <Transition name="fade-backdrop" appear>
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closeMenus"></div>
      </Transition>

      <!-- Panel -->
      <Transition name="slide-panel" appear>
        <div class="absolute right-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-white shadow-2xl flex flex-col overflow-hidden rounded-l-[40px]">
          <!-- Header Inside Sidebar -->
          <div class="p-6 flex items-center justify-between border-b border-slate-50">
            <img src="/PEBASPRO-logo.png" alt="PebasPro" class="h-10 w-auto" />
            <button @click="closeMenus" class="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>

          <!-- Menu Content -->
          <div class="flex-grow overflow-y-auto p-6 space-y-2">
            <!-- User Status (Mobile Panel) -->
            <div v-if="user" class="mb-8 p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-[32px] text-white shadow-xl shadow-green-600/20">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl overflow-hidden shadow-sm">
                   <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar do usuário" class="w-full h-full object-cover" @error="avatarFailed = true" />
                   <span v-else class="w-full h-full flex items-center justify-center text-slate-400">{{ profile?.nome?.charAt(0) || 'U' }}</span>
                </div>
                <div>
                  <p class="text-xs font-black text-green-100 uppercase tracking-widest">{{ profile?.tipo_conta }}</p>
                  <p class="text-lg font-black leading-tight">{{ profile?.nome }}</p>
                </div>
              </div>
              <NuxtLink to="/perfil" class="block w-full py-3 bg-white/10 hover:bg-white/20 transition-colors text-center font-black text-sm uppercase tracking-widest rounded-2xl border border-white/20">Ver Meu Perfil</NuxtLink>
            </div>

            <!-- Dynamic Mobile Links -->
            <template v-if="!ready">
               <div v-for="i in 6" :key="i" class="h-14 bg-slate-50 rounded-2xl animate-pulse"></div>
            </template>
            <template v-else>
                 <NuxtLink 
                  v-for="item in activeMenu" 
                  :key="item.label"
                  :to="item.to"
                  @click="item.onClick?.()"
                  :class="[
                    'flex items-center px-6 py-4 text-lg font-black rounded-2xl transition-all uppercase tracking-tight',
                    item.isCTA 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 my-4' 
                      : 'text-slate-700 hover:bg-green-50 hover:text-green-600 [&.router-link-active]:bg-green-50 [&.router-link-active]:text-green-600'
                  ]"
                >
                  {{ item.label }}
                </NuxtLink>
            </template>

            <div class="h-px bg-slate-100 my-6"></div>

            <!-- Global Actions Mobile -->
            <template v-if="!user">
               <div class="grid grid-cols-1 gap-3">
                  <NuxtLink to="/login" class="flex items-center justify-center py-5 font-black text-slate-700 bg-slate-50 rounded-[28px] uppercase tracking-widest text-sm">Entrar</NuxtLink>
                  <NuxtLink to="/cadastro" class="flex items-center justify-center py-5 font-black text-white bg-green-600 rounded-[28px] uppercase tracking-widest text-sm shadow-xl shadow-green-600/20">Criar Conta</NuxtLink>
               </div>
            </template>
            <template v-else>
               <NuxtLink v-if="profile?.role === 'admin' || profile?.role === 'superadmin'" to="/admin" @click="closeMenus" class="flex items-center px-6 py-4 text-lg font-black text-amber-600 hover:bg-amber-50 rounded-2xl uppercase tracking-tight">Administração</NuxtLink>
               <NuxtLink :to="profile?.tipo_conta === 'empresa' ? '/painel/empresa/configuracoes' : '/perfil'" @click="closeMenus" class="flex items-center px-6 py-4 text-lg font-black text-slate-700 hover:bg-slate-50 rounded-2xl uppercase tracking-tight">Configurações</NuxtLink>
               <button @click="handleLogout" class="flex items-center w-full px-6 py-4 text-lg font-black text-red-500 hover:bg-red-50 rounded-2xl uppercase tracking-tight">Encerrar Sessão</button>
            </template>
          </div>

          <!-- Footer Inside Sidebar -->
          <div class="p-8 bg-slate-50 text-center">
             <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">PebasPro &copy; 2026</p>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
/* Mobile Panel Transitions */
.fade-backdrop-enter-active, .fade-backdrop-leave-active { transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-backdrop-enter-from, .fade-backdrop-leave-to { opacity: 0; }

.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }

/* Desktop Dropdown Transition */
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(15px) scale(0.95); }

/* Fade Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Nuxt Link Active State */
/* Apenas links principais do header ficam brancos quando ativos */
nav .router-link-active:not(.is-cta) {
    color: #ffffff;
}

/* Custom Scrollbar for Mobile Menu */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
