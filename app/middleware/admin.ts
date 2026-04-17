import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    // Aguardar carregamento inicial do perfil, se necessário
    if (!authStore.initialized) {
        await authStore.fetchProfile()
    }

    const profile = authStore.profile
    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

    // Logs de depuração no servidor/cliente
    console.log(`[Middleware Admin] Acessando: ${to.path} | Usuário: ${profile?.nome || 'Null'} | Role: ${profile?.role || 'None'} | IsAdmin: ${isAdmin}`)

    if (!profile || !isAdmin) {
        console.warn(`[Middleware Admin] Acesso negado para ${to.path}. Redirecionando para home.`)
        return navigateTo('/')
    }

    console.log(`[Middleware Admin] Acesso concedido para ${to.path}`)
})
