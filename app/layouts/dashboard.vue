<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotifications } from '~/composables/useNotifications'

const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const menuItems = computed(() => {
  const profile = authStore.profile
  if (!profile) return []

  const menu = []

  if (profile.tipo_conta === 'talento') {
    menu.push(
      { name: 'Dashboard', path: '/painel/talento', icon: '📊' },
      { name: 'Minhas Vagas', path: '/minhas_vagas', icon: '💼' },
      { name: 'Buscar Vagas', path: '/vagas', icon: '🔍' },
      { name: 'Meu Currículo', path: '/painel/talento/curriculo', icon: '📄' },
      { name: 'Mensagens', path: '/painel/mensagens', icon: '💬' },
      { name: 'Favoritos', path: '/painel/favoritos', icon: '⭐' },
    )
  }

  if (profile.tipo_conta === 'prestador') {
    menu.push(
      { name: 'Dashboard', path: '/painel/talento', icon: '📊' },
      { name: 'Favoritos', path: '/painel/favoritos', icon: '⭐' },
      { name: 'Conexões', path: '/painel/mensagens', icon: '💬' },
    )
  }

  if (profile.tipo_conta === 'empresa') {
    menu.push(
      { name: 'Dashboard', path: '/painel/empresa', icon: '📊' },
      { name: 'Minhas Vagas', path: '/painel/empresa/vagas', icon: '🏢' },
      { name: 'Buscar Talentos', path: '/painel/empresa/buscar-talentos', icon: '🔍' },
      { name: 'Favoritos', path: '/painel/empresa/favoritos', icon: '⭐' },
      { name: 'Conexões', path: '/painel/empresa/mensagens', icon: '💬' },
    )
  }

  return menu
})

const handleLogout = async () => {
  await authStore.signOut()
  navigateTo('/login')
}

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
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    
    <!-- Sidebar Overlay Mobile -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-slate-900/50 z-[100] lg:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-[110] transition-transform duration-300 transform lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="h-24 flex items-center justify-between px-6 border-b border-slate-100">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/PEBASPRO-logo.png" alt="PebasPro" class="h-14 md:h-20 w-auto object-contain drop-shadow-md" />
        </NuxtLink>
        <button class="lg:hidden text-slate-500 hover:text-slate-700" @click="isSidebarOpen = false">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-4 flex flex-col h-[calc(100vh-4rem)] justify-between">
        <nav class="space-y-1">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.path" 
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-green-700 transition-colors"
            active-class="bg-green-50 text-green-700 font-bold"
            @click="isSidebarOpen = false"
          >
            <span>{{ item.icon }}</span>
            {{ item.name }}
          </NuxtLink>
        </nav>

        <div class="space-y-1 pt-4 border-t border-slate-100">
          <NuxtLink 
            to="/perfil"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            <span>👤</span>
            Meu Perfil
          </NuxtLink>
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            Sair
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0">
      
      <!-- Desktop Topbar (Hidden on Mobile) -->
      <header class="hidden lg:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30">
        <div>
          <h2 v-if="authStore.profile?.tipo_conta === 'empresa'" class="text-xl font-black text-slate-800 uppercase tracking-tight">
            {{ authStore.profile?.nome }}
          </h2>
        </div>
        <div class="flex items-center gap-6">
          <!-- Notificações Desktop -->
          <div class="relative" ref="notificationRef">
            <button @click="showNotifications = !showNotifications" class="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-xl transition-all relative group">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
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
                    <div class="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover/item:border-green-200 transition-colors">
                      <span class="text-lg">{{ n.tipo === 'vaga' ? '💼' : '💬' }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-slate-900 mb-1 leading-tight">{{ n.titulo }}</p>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">{{ n.mensagem }}</p>
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

          <div class="h-8 w-px bg-slate-100"></div>

          <NuxtLink to="/perfil" class="flex items-center gap-3 group">
            <div class="text-right">
               <p class="text-xs font-black text-slate-900 group-hover:text-green-600 transition-colors">{{ authStore.profile?.nome?.split(' ')[0] }}</p>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ authStore.profile?.tipo_conta }}</p>
            </div>
            <img :src="authStore.profile?.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" class="w-10 h-10 rounded-2xl border-2 border-white shadow-md group-hover:scale-105 transition-all" />
          </NuxtLink>
        </div>
      </header>
      <!-- Mobile Topbar -->
      <header class="lg:hidden h-24 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button @click="isSidebarOpen = true" class="text-slate-600 hover:text-slate-900 p-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/PEBASPRO-logo.png" alt="PebasPro" class="h-10 md:h-14 w-auto object-contain drop-shadow-sm" />
        </div>
        <div class="flex items-center gap-4">
          <!-- Notificações Mobile -->
          <div class="relative" ref="notificationRef">
            <button @click="showNotifications = !showNotifications" class="p-2 text-slate-600 hover:bg-slate-50 rounded-xl relative">
              <span class="text-xl">🔔</span>
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {{ unreadCount }}
              </span>
            </button>
            
            <!-- Dropdown Notificações Mobile -->
            <div v-if="showNotifications" class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span class="font-bold text-slate-800 text-sm">Notificações</span>
                <button v-if="unreadCount > 0" @click="markAsRead()" class="text-[10px] font-bold text-green-600 hover:underline">Limpar tudo</button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div v-if="loadingNotifications" class="p-8 text-center"><div class="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>
                <div v-else-if="notifications.length === 0" class="p-8 text-center text-slate-400 text-xs italic">Nenhuma notificação por aqui.</div>
                <div v-for="n in notifications" :key="n.id" :class="{'bg-green-50/30': !n.lida}" class="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" @click="markAsRead(n.id); n.link && navigateTo(n.link)">
                  <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {{ n.tipo === 'vaga' ? '💼' : '💬' }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-slate-800 mb-0.5 truncate">{{ n.titulo }}</p>
                      <p class="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{{ n.mensagem }}</p>
                      <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold">{{ new Date(n.created_at).toLocaleDateString() }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NuxtLink to="/perfil">
            <img :src="authStore.profile?.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" class="w-10 h-10 rounded-full border border-slate-200" />
          </NuxtLink>
        </div>
      </header>

      <!-- Page Content Wrapper -->
      <div class="flex-1 overflow-auto p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
          <slot />
        </div>
      </div>
    </main>

  </div>
</template>

<style scoped>
/* Transições suaves para a sidebar responsiva */
aside {
  will-change: transform;
}
</style>
