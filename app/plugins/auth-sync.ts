export default defineNuxtPlugin(() => {
    const user = useSupabaseUser()
    const authStore = useAuthStore()

    // Sincroniza o perfil sempre que o estado do usuário mudar
    watch(user, async (newUser, oldUser) => {
        // 1. Usuário logou ou mudou
        if (newUser) {
            if (newUser.id !== oldUser?.id) {
                await authStore.fetchProfile()
            }
        }
        // 2. Usuário deslogou (tinha um oldUser mas sumiu)
        else if (oldUser) {
            authStore.signOut()
            authStore.initialized = true
        }
        // 3. Estado inicial deslogado (convidado)
        else if (!authStore.initialized) {
            authStore.initialized = true
        }
    }, { immediate: true })
})
