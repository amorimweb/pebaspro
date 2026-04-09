import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const authStore = useAuthStore()

    const publicRoutes = ['/', '/login', '/cadastro', '/confirm', '/esqueci-senha', '/redefinir-senha']
    const isPublicRoute = publicRoutes.some(path => to.path === path || to.path.startsWith('/cadastro/'))

    if (!user.value) {
        if (!isPublicRoute) {
            return navigateTo('/login')
        }
        return
    }

    // Ensure profile is loaded
    if (!authStore.initialized) {
        await authStore.fetchProfile()
    }

    // 2. Enforce onboarding for incomplete profiles
    const profile = authStore.profile
    const isOnboardingRoute = to.path.startsWith('/cadastro/')
    const isLogoutRoute = to.path === '/login' || to.path === '/confirm' // Rotas que podem lidar com troca de conta

    if (user.value && !isPublicRoute && !isOnboardingRoute) {
        if (!profile || !profile.cadastro_completo || !profile.tipo_conta) {
            console.log('Middleware: Perfil incompleto. Redirecionando para onboarding...')
            return navigateTo('/cadastro/onboarding')
        }
    }

    // 3. Enforce account suspension global block
    if (authStore.profile?.status === 'suspenso') {
        if (process.client) {
            alert('Sua conta foi suspensa por violar os termos de uso. Entre em contato com o suporte.')
        }
        await authStore.signOut()
        return navigateTo('/')
    }
})
