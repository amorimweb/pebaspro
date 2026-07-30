import { useAuthStore } from '~/stores/auth'
import { completeRegistrationRoute } from '~/utils/authRedirect'
import { isProfileComplete } from '~/utils/profileCompletion'

// supabase.auth.getSession() pode travar no servidor tentando renovar um
// token perto de expirar (visto travar por minutos em teste manual). Nunca
// deixamos isso bloquear a navegacao indefinidamente.
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
    Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])

export default defineNuxtRouteMiddleware(async (to) => {
    const supabaseUser = useSupabaseUser()
    const supabase = useSupabaseClient()
    const authStore = useAuthStore()

    const publicPrefixes = [
        '/',
        '/login',
        '/cadastro',
        '/confirm',
        '/esqueci-senha',
        '/redefinir-senha',
        '/vagas',
        '/servicos',
        '/empresas',
        '/prestadores',
        '/contato',
        '/manutencao',
    ]

    const isCadastroRoute = to.path.startsWith('/cadastro/')
    const isPublicRoute =
        publicPrefixes.some((p) => to.path === p || to.path.startsWith(`${p}/`)) ||
        isCadastroRoute

    // No servidor, supabaseUser.value vem dos claims do JWT (getClaims()),
    // cujo identificador e "sub", nao "id" como no objeto User do cliente.
    const quickUserId = supabaseUser.value?.id || (supabaseUser.value as any)?.sub
    const currentSession = quickUserId
        ? null
        : await withTimeout(supabase.auth.getSession().then((r) => r.data.session), 4000, null)
    const activeUserId = quickUserId || currentSession?.user?.id

    if (!activeUserId) {
        if (!isPublicRoute) {
            return navigateTo('/login')
        }
        return
    }

    if (!authStore.profile || authStore.profile.id !== activeUserId) {
        await authStore.loadProfile(currentSession, activeUserId)
    }

    if (to.path.startsWith('/cadastro/onboarding')) {
        return navigateTo(completeRegistrationRoute, { replace: true })
    }

    const profile = authStore.profile

    if (!isPublicRoute) {
        if (!profile && import.meta.client) {
            return
        }

        if (!isProfileComplete(profile)) {
            return navigateTo(completeRegistrationRoute)
        }

        if (profile && !profile.cadastro_completo) {
            await authStore.updateProfile({ cadastro_completo: true, status: 'ativo' })
        }
    }

    if (authStore.profile?.status === 'suspenso') {
        if (process.client) {
            alert('Sua conta foi suspensa por violar os termos de uso. Entre em contato com o suporte.')
        }
        await authStore.signOut()
        return navigateTo('/')
    }
})
