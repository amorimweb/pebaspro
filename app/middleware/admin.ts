import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()

    // Aguardar carregamento inicial do perfil, se necessário
    if (!authStore.initialized) {
        await authStore.fetchProfile()
    }

    const profile = authStore.profile
    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

    if (!profile || !isAdmin) {
        return navigateTo('/')
    }
})
