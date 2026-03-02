import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const authStore = useAuthStore()

    const publicRoutes = ['/', '/login', '/cadastro', '/confirm', '/esqueci-senha', '/redefinir-senha', '/vagas', '/servicos', '/termos', '/privacidade']
    const path = to.path.replace(/\/$/, '') || '/'
    const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/cadastro/')

    if (!user.value) {
        if (!isPublicRoute) {
            console.log('Middleware Blocando Acesso:', to.path)
            return navigateTo('/login')
        }
        return
    }

    // Ensure profile is loaded
    if (!authStore.initialized) {
        await authStore.fetchProfile()
    }

    // Enforce account suspension global block
    if (authStore.profile?.status === 'suspenso') {
        if (process.client) {
            alert('Sua conta foi suspensa por violar os termos de uso. Entre em contato com o suporte.')
        }
        await authStore.signOut()
        return navigateTo('/')
    }
})
