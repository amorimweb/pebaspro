import type { Database } from '~/types/database.types'

export const useVagas = () => {
    const supabase = useSupabaseClient<Database>()
    const user = useSupabaseUser()
    const loading = ref(false)

    const authStore = useAuthStore()

    const criarVaga = async (vaga: any) => {
        loading.value = true
        try {
            const userId = authStore.profile?.id || user.value?.id
            if (!userId) throw new Error('Usuário não autenticado')

            const { error } = await supabase
                .from('vagas')
                .insert({
                    ...vaga,
                    empresa_id: userId
                })
            if (error) throw error
            return { error: null }
        } finally {
            loading.value = false
        }
    }

    const atualizarVaga = async (id: string, updates: any) => {
        loading.value = true
        try {
            const { error } = await supabase
                .from('vagas')
                .update(updates)
                .eq('id', id)
            if (error) throw error
            return { error: null }
        } finally {
            loading.value = false
        }
    }

    const buscarVaga = async (id: string) => {
        loading.value = true
        try {
            const { data, error } = await supabase
                .from('vagas')
                .select('*')
                .eq('id', id)
                .single()
            if (error) throw error
            return { data, error: null }
        } finally {
            loading.value = false
        }
    }

    return { criarVaga, atualizarVaga, buscarVaga, loading }
}
