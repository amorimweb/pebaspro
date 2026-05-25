export default defineNuxtPlugin(() => {
    if (import.meta.server) return

    const user = useSupabaseUser()
    const authStore = useAuthStore()
    const supabase = useSupabaseClient()

    const getAccessToken = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token
    }

    // Sincroniza o perfil sempre que o estado do usuário mudar
    watch(user, async (newUser, oldUser) => {
        // 1. Usuário logou ou mudou
        if (newUser && newUser.id) {
            if (newUser.id !== oldUser?.id || !authStore.profile) {
                await authStore.fetchProfile(await getAccessToken())
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
        // 3. Estado inicial: verifica se há sessão ativa antes de marcar como inicializado
        else if (!newUser) {
            // Só marca como inicializado se realmente não há sessão no Supabase
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                authStore.initialized = true
            } else if (session.user?.id) {
                await authStore.fetchProfile(session.access_token)
            }
            // Se há sessão mas user ainda não chegou via useSupabaseUser,
            // aguarda o próximo disparo do watch quando o estado sincronizar
        }
    }, { immediate: true })
})
