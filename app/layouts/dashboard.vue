<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const menuItems = computed(() => {
  const profile = authStore.profile
  if (!profile) return []

  const menu = [
    { name: 'Início', path: '/', icon: '🏠' }
  ]

  if (profile.tipo_conta === 'prestador' || profile.tipo_conta === 'talento') {
    menu.push(
      { name: 'Dashboard', path: '/painel/talento', icon: '📊' },
      { name: 'Mensagens', path: '/painel/mensagens', icon: '💬' },
    )
  }

  if (profile.tipo_conta === 'empresa') {
    menu.push(
      { name: 'Dashboard', path: '/painel/empresa', icon: '📊' },
      { name: 'Minhas Vagas', path: '/painel/empresa/vagas', icon: '🏢' },
      { name: 'Buscar Talentos', path: '/painel/empresa/buscar-talentos', icon: '🔍' },
      { name: 'Mensagens', path: '/painel/mensagens', icon: '💬' },
    )
  }

  return menu
})

const handleLogout = async () => {
  await authStore.signOut()
  navigateTo('/login')
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
        <NuxtLink to="/perfil">
          <img :src="authStore.profile?.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" class="w-8 h-8 rounded-full border border-slate-200" />
        </NuxtLink>
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
