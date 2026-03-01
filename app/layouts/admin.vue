<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()

const navItems = [
  { label: 'Dashboard',  icon: '📊', path: '/admin' },
  { label: 'Usuários',   icon: '👥', path: '/admin/usuarios' },
  { label: 'Vagas',      icon: '💼', path: '/admin/vagas' },
  { label: 'Serviços',   icon: '🛠️', path: '/admin/servicos' },
]

const isActive = (path: string) =>
  path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)

const handleSignOut = async () => {
  await authStore.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">⚡</span>
        <div>
          <p class="logo-title">PebasPro</p>
          <p class="logo-sub">Admin Panel</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: isActive(item.path) }]"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ authStore.profile?.nome?.charAt(0) || '?' }}</div>
          <div>
            <p class="user-name">{{ authStore.profile?.nome?.split(' ')[0] }}</p>
            <p class="user-role">{{ authStore.profile?.role }}</p>
          </div>
        </div>
        <button @click="handleSignOut" class="signout-btn" title="Sair">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-area">
      <!-- Topbar -->
      <header class="topbar">
        <div>
          <h2 class="topbar-title">{{ navItems.find(n => isActive(n.path))?.label || 'Admin' }}</h2>
          <p class="topbar-sub">Painel de Administração</p>
        </div>
        <NuxtLink to="/" class="view-site-btn" target="_blank">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          Ver Site
        </NuxtLink>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot/>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

/* ── Sidebar ── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  padding: 28px 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.logo-title { font-size: 1rem; font-weight: 800; color: white; }
.logo-sub   { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.sidebar-nav {
  flex: 1;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}
.nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
.nav-item.active { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
.nav-icon { font-size: 1.1rem; width: 24px; text-align: center; }

.sidebar-footer {
  padding: 20px 16px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.user-info { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(99,102,241,0.3);
  color: #a5b4fc; font-weight: 800; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name { color: white; font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { color: #64748b; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
.signout-btn { color: #64748b; background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; flex-shrink: 0; }
.signout-btn:hover { color: #f87171; background: rgba(239,68,68,0.1); }

/* ── Main ── */
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.topbar-sub   { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }

.view-site-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-size: 0.85rem; font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.view-site-btn:hover { border-color: #6366f1; color: #6366f1; background: #f8f7ff; }

.page-content { padding: 32px; flex: 1; }
</style>
