import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const authStore = useAuthStore()

    if (!user.value) {
        if (to.path !== '/login') {
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
