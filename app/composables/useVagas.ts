import type { Database } from '~/types'

export const useVagas = () => {
    const supabase = useSupabaseClient<Database>()
    const user = useSupabaseUser()
    const loading = ref(false)

    const criarVaga = async (vaga: any) => {
        loading.value = true
        try {
            if (!user.value?.id) throw new Error('Usuário não autenticado')

            const { error } = await supabase
                .from('vagas')
                .insert({
                    ...vaga,
                    empresa_id: user.value?.id
                })
            if (error) throw error
            return { error: null }
        } catch (err: any) {
            console.error('Erro ao criar vaga:', err)
            return { error: err }
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
        } catch (err: any) {
            console.error('Erro ao atualizar vaga:', err)
            return { error: err }
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
        } catch (err: any) {
            console.error('Erro ao buscar vaga:', err)
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
    }

    return { criarVaga, atualizarVaga, buscarVaga, loading }
}
