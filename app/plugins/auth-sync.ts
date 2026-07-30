export default defineNuxtPlugin(() => {
    if (import.meta.server) return

    const user = useSupabaseUser()
    const authStore = useAuthStore()
    const supabase = useSupabaseClient()

    // O cliente Supabase precisa terminar de montar antes de consultar a sessão.
    // Não bloqueia a hidratação do Nuxt nem cria disputa pelo lock de autenticação.
    onNuxtReady(() => {
        authStore.initialize().catch((error) => {
            console.error('Erro ao inicializar autenticação:', error)
            authStore.initialized = true
        })
    })

    // Depois da inicialização, reage apenas a mudanças reais de usuário.
    watch(() => user.value?.id, async (newUserId, oldUserId) => {
        if (newUserId === oldUserId) return

        const { data: { session } } = await supabase.auth.getSession()

        if (!newUserId) {
            if (!session?.user?.id) authStore.clearProfile()
            return
        }

        if (session?.user?.id === newUserId) {
            await authStore.loadProfile(session)
        }
    })
})
