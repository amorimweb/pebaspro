import { defineStore } from 'pinia'
import { useProfileStore } from '~/stores/profile'
import type { Usuario } from '~/types/database.types'

export const useAuthStore = defineStore('auth', () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const profileStore = useProfileStore()

    const profile = computed(() => profileStore.profile)
    const profileLoading = computed(() => profileStore.loading)
    const error = computed(() => profileStore.error)

    const initialized = useState('auth_initialized', () => false)

    // Sincroniza o estado inicial se já houver perfil (SSR ou Persistência)
    if (profileStore.profile) {
        initialized.value = true
    }

    // Watcher para garantir que initialized mude para true assim que o perfil carregar
    watch(() => profileStore.profile, (val) => {
        if (val && !initialized.value) {
            initialized.value = true
        }
    })

    async function fetchProfile() {
        try {
            await profileStore.fetchProfile()
            if (profile.value?.status === 'suspenso') {
                if (process.client) {
                    alert('Sua conta foi suspensa por violar os termos de uso. Entre em contato com o suporte.')
                    await signOut()
                    navigateTo('/')
                } else {
                    await signOut()
                }
            }
        } finally {
            initialized.value = true
        }
    }

    async function updateProfile(data: Partial<Usuario>) {
        const userId = user.value?.id || profile.value?.id
        if (!userId) return { error: { message: 'Usuário não autenticado' } }

        profileStore.loading = true
        try {
            const { error: err } = await supabase
                .from('usuarios')
                .upsert({
                    id: userId,
                    ...data,
                    updated_at: new Date().toISOString()
                })

            if (err) throw err

            // Forçar a re-busca do perfil para atualizar todos os componentes
            await profileStore.fetchProfile()
            return { data: profileStore.profile, error: null }
        } catch (e: any) {
            console.error('Erro ao atualizar perfil no store:', e)
            return { data: null, error: e }
        } finally {
            profileStore.loading = false
        }
    }

    async function signOut() {
        profileStore.clearProfile()
        return await supabase.auth.signOut()
    }

    return {
        user,
        profile,
        profileLoading,
        error,
        initialized,
        fetchProfile,
        updateProfile,
        signOut
    }
})
