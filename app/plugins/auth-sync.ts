export default defineNuxtPlugin(() => {
    const user = useSupabaseUser()
    const profileStore = useProfileStore()

    // Sincroniza o perfil sempre que o estado do usuário mudar
    watch(user, async (newUser, oldUser) => {
        // Se o usuário entrar ou mudar de conta
        if (newUser && newUser.id !== oldUser?.id) {
            await profileStore.fetchProfile()
        }
        // Se o usuário sair
        else if (!newUser) {
            profileStore.clearProfile()
        }
    }, { immediate: true })
})
