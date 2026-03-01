<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const profile = computed(() => authStore.profile)
const initialized = computed(() => authStore.initialized)
const profileLoading = computed(() => authStore.profileLoading)
const supabase = useSupabaseClient()
const router = useRouter()

// UI State
const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isScrolled = ref(false)
const route = useRoute()
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
    { label: 'Minhas Vagas', to: '/painel/talento' },
    { label: 'Meu Currículo', to: '/painel/talento/curriculo' },
    { label: 'Mensagens', to: '/painel/mensagens' },
    { label: 'Perfil', to: '/perfil' },
  ],
  prestador: [
    { label: 'Dashboard', to: '/painel/prestador' },
    { label: 'Meus Serviços', to: '/painel/prestador/servicos' },
    { label: 'Mensagens', to: '/painel/mensagens' },
    { label: 'Perfil', to: '/perfil' },
    { label: 'Divulgar Serviço', to: '/divulgar-servico', isCTA: true },
  ],
  empresa: [
    { label: 'Dashboard', to: '/painel/empresa' },
    { label: 'Minhas Vagas', to: '/painel/empresa/vagas' },
    { label: 'Buscar Talentos', to: '/painel/empresa/buscar-talentos' },
    { label: 'Perfil', to: '/perfil' },
    { label: 'Anunciar Vaga', to: '/painel/empresa/vagas/nova', isCTA: true },
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
      'fixed top-0 left-0 right-0 z-[100] h-24 transition-all duration-500 backdrop-blur-md',
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
        <!-- Loading Skeletons -->
        <template v-if="!initialized">
          <div v-for="i in 4" :key="i" class="h-8 w-24 bg-slate-100/50 rounded-xl animate-pulse mx-1"></div>
        </template>

        <!-- Main Dynamic Menu -->
        <template v-else>
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
        </template>
      </nav>

      <!-- AUTH / USER DROPDOWN (DESKTOP) -->
      <div class="hidden lg:flex items-center gap-3">
        <template v-if="!initialized">
          <div class="h-10 w-28 bg-slate-100/50 rounded-xl animate-pulse"></div>
        </template>

        <template v-else-if="!user">
          <NuxtLink to="/login" class="px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors rounded-xl">Entrar</NuxtLink>
          <NuxtLink to="/cadastro" class="ml-2 px-5 py-2.5 text-sm font-bold bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-green-400/20 active:scale-95 transition-all rounded-xl">Cadastrar</NuxtLink>
        </template>

        <div v-else class="relative user-dropdown-trigger">
            <button 
              @click.stop="toggleUserDropdown" 
              class="flex items-center gap-2 p-1 rounded-xl transition-all active:scale-95"
            >
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm uppercase overflow-hidden">
               <img 
                 v-if="profile?.foto" 
                 :src="profile.foto" 
                 class="w-full h-full object-cover" 
                 @error="(e) => (e.target as HTMLImageElement).src = '/default-avatar.png'"
               />
               <span v-else class="w-full h-full flex items-center justify-center">{{ profile?.nome?.charAt(0) || user?.email?.charAt(0) || 'U' }}</span>
            </div>
            <svg class="w-4 h-4 text-white/60 transition-transform" :class="{ 'rotate-180': isUserDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Card -->
          <Transition name="dropdown">
            <div v-if="isUserDropdownOpen" class="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden ring-1 ring-black/5">
              <div class="px-4 py-4 mb-2 bg-slate-50/50 rounded-2xl">
                <p class="text-xs font-black text-green-600 uppercase tracking-widest mb-1">{{ profile?.tipo_conta }}</p>
                <p class="text-sm font-black text-slate-900 truncate">{{ profile?.nome }}</p>
                <p class="text-xs font-medium text-slate-400 truncate">{{ user.email }}</p>
              </div>
              
              <div class="space-y-0.5">
                <NuxtLink to="/perfil" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all">
                  <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Meu Perfil
                </NuxtLink>
                <NuxtLink :to="profile?.tipo_conta === 'empresa' ? '/painel/empresa/configuracoes' : '/perfil'" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all">
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

      <!-- MOBILE CONTROLS -->
      <div class="flex lg:hidden items-center gap-3">
        <!-- Profile Avatar (Mobile) -->
        <NuxtLink v-if="initialized && user" to="/perfil" class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black overflow-hidden transition-colors">
           <img v-if="profile?.foto" :src="profile.foto" class="w-full h-full object-cover" />
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
                   <img v-if="profile?.foto" :src="profile.foto" class="w-full h-full object-cover" />
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
            <template v-if="!initialized">
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
                    : 'text-slate-700 hover:bg-green-50 hover:text-green-600'
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
               <NuxtLink :to="profile?.tipo_conta === 'empresa' ? '/painel/empresa/configuracoes' : '/perfil'" class="flex items-center px-6 py-4 text-lg font-black text-slate-700 hover:bg-slate-50 rounded-2xl uppercase tracking-tight">Configurações</NuxtLink>
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

/* Nuxt Link Active State */
.router-link-active:not(.is-cta) {
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
