export default defineNuxtPlugin(() => {
    const user = useSupabaseUser()
    const authStore = useAuthStore()

    // Sincroniza o perfil sempre que o estado do usuário mudar
    watch(user, async (newUser, oldUser) => {
        // 1. Usuário logou ou mudou
        if (newUser) {
            if (newUser.id !== oldUser?.id || !authStore.profile) {
                await authStore.fetchProfile()
            } else {
                // Já temos perfil e o usuário é o mesmo (hidratação)
                authStore.initialized = true
            }
        }
        // 2. Usuário deslogou (tinha um oldUser mas sumiu)
        else if (oldUser) {
            await authStore.signOut()
            authStore.initialized = true
        }
        // 3. Estado inicial deslogado (convidado)
        else {
            authStore.initialized = true
        }
    }, { immediate: true })
})
