import type { Database, Curriculo } from '~/types/database.types'

export const useCurriculum = () => {
    const supabase = useSupabaseClient<Database>()
    const user = useSupabaseUser()
    const authStore = useAuthStore()
    const loading = ref(false)

    const asArray = (value: any) => Array.isArray(value) ? value : []

    const curriculum = computed(() => {
        const profile = authStore.profile as any
        if (!profile) return null

        const saved = profile.curriculo || {}
        return {
            id: saved.id || null,
            user_id: saved.user_id || profile.id,
            objetivo_profissional: saved.objetivo_profissional || profile.objetivo_profissional || '',
            biografia: saved.biografia || profile.biografia || profile.sobre_mim || '',
            habilidades: asArray(saved.habilidades).length ? saved.habilidades : asArray(profile.habilidades),
            experiencia_profissional: asArray(saved.experiencia_profissional).length
                ? saved.experiencia_profissional
                : asArray(profile.experiencia_profissional),
            formacao_academica: asArray(saved.formacao_academica).length
                ? saved.formacao_academica
                : asArray(profile.formacao_academica),
            latitude: saved.latitude ?? profile.latitude ?? null,
            longitude: saved.longitude ?? profile.longitude ?? null,
            created_at: saved.created_at || profile.created_at || null,
            updated_at: saved.updated_at || profile.updated_at || null,
        }
    })

    async function fetchCurriculum() {
        await authStore.fetchProfile()
    }

    async function saveCurriculum(data: Partial<Curriculo>) {
        const userId = user.value?.id || authStore.profile?.id

        if (!userId || userId === 'undefined') {
            console.error('Save failed: user_id is missing or invalid', {
                supabaseUser: user.value?.id,
                storeProfile: authStore.profile?.id,
            })
            return { error: { message: 'Usuario nao autenticado ou ID invalido' } }
        }

        loading.value = true
        try {
            const payload = {
                objetivo_profissional: data.objetivo_profissional || null,
                biografia: data.biografia || null,
                habilidades: data.habilidades || [],
                experiencia_profissional: data.experiencia_profissional || [],
                formacao_academica: data.formacao_academica || [],
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
            }

            const { data: saved, error } = await supabase
                .from('curriculos')
                .upsert({
                    user_id: userId,
                    ...payload,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })
                .select()
                .single()

            if (error) throw error

            await authStore.updateProfile(payload)
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
        saveCurriculum,
    }
}
