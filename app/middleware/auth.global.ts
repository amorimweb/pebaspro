import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const authStore = useAuthStore()

    const publicPrefixes = [
        '/',
        '/login',
        '/cadastro',
        '/confirm',
        '/esqueci-senha',
        '/redefinir-senha',
        // Rotas públicas (permitir compartilhar link sem forçar onboarding)
        '/vagas',
        '/servicos',
        '/empresas',
        '/prestadores',
        '/contato',
        '/manutencao',
    ]
    const isPublicRoute =
        publicPrefixes.some((p) => to.path === p || to.path.startsWith(`${p}/`)) ||
        to.path.startsWith('/cadastro/')

    if (!user.value) {
        if (!isPublicRoute) {
            return navigateTo('/login')
        }
        return
    }
    // Em alguns momentos a sessão pode hidratar sem id; não tratar como autenticado.
    if (!user.value.id) return

    // Ensure profile is loaded — always fetch if we have a user but no profile
    // (the auth-sync plugin may have set initialized=true via the SSR "else" branch
    //  before the session was available, leaving profile=null for an authenticated user)
    if (!authStore.profile) {
        const supabase = useSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        await authStore.fetchProfile(session?.access_token)
    }

    // 2. Enforce onboarding for incomplete profiles
    const profile = authStore.profile
    const isOnboardingRoute = to.path.startsWith('/cadastro/')

    if (!isPublicRoute && !isOnboardingRoute) {
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
