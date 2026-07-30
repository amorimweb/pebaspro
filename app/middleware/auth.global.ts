import { useAuthStore } from '~/stores/auth'
import { completeRegistrationRoute } from '~/utils/authRedirect'
import { isProfileComplete } from '~/utils/profileCompletion'

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

    const currentSession = (await supabase.auth.getSession()).data.session
    const activeUser = supabaseUser.value || currentSession?.user

    if (!activeUser?.id) {
        if (!isPublicRoute) {
            return navigateTo('/login')
        }
        return
    }

    if (currentSession && (!authStore.profile || authStore.profile.id !== activeUser.id)) {
        await authStore.loadProfile(currentSession)
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
