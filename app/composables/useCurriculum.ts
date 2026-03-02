import type { Database, Curriculo } from '~/types/database.types'

export const useCurriculum = () => {
    const supabase = useSupabaseClient<Database>()
    const user = useSupabaseUser()
    const authStore = useAuthStore()
    const loading = ref(false)

    const curriculum = computed(() => authStore.profile?.curriculo || null)

    async function fetchCurriculum() {
        // Agora o currículo vem junto com o perfil no authStore
        await authStore.fetchProfile()
    }

    async function saveCurriculum(data: Partial<Curriculo>) {
        // Tenta pegar o ID do user do Supabase ou do Profile no Pinia
        const userId = user.value?.id || authStore.profile?.id

        if (!userId || userId === 'undefined') {
            console.error('Save failed: user_id is missing or invalid', {
                supabaseUser: user.value?.id,
                storeProfile: authStore.profile?.id
            })
            return { error: { message: 'Usuário não autenticado ou ID inválido' } }
        }

        loading.value = true
        try {
            const { data: saved, error } = await supabase
                .from('curriculos')
                .upsert({
                    user_id: userId,
                    objetivo_profissional: data.objetivo_profissional,
                    biografia: data.biografia,
                    habilidades: data.habilidades,
                    experiencia_profissional: data.experiencia_profissional,
                    formacao_academica: data.formacao_academica,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
                .select()
                .single()

            if (error) throw error

            // Força atualização do perfil no Pinia para refletir os novos dados do currículo
            await authStore.fetchProfile()

            return { data: saved, error: null }
        } catch (e: any) {
            console.error('Error saving curriculum:', e)
            return { data: null, error: e }
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        curriculum,
        fetchCurriculum,
        saveCurriculum
    }
}
