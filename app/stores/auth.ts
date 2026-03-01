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

    const initialized = ref(true)

    async function fetchProfile() {
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
    }

    async function updateProfile(data: Partial<Usuario>) {
        const userId = user.value?.id || profile.value?.id
        if (!userId) return { error: { message: 'Usuário não autenticado' } }

        profileStore.loading = true
        try {
            const { error: err } = await supabase
                .from('usuarios')
                .update(data)
                .eq('id', userId)

            if (err) throw err

            await fetchProfile()
            return { error: null }
        } catch (e: any) {
            console.error('Erro ao atualizar perfil:', e)
            return { error: e }
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
