import type { Database } from '~/types/database.types'

export const useFavorites = () => {
    const supabase = useSupabaseClient<Database>()
    const authStore = useAuthStore()
    const loading = ref(false)

    /**
     * Alterna o estado de favorito de um usuário (talento/prestador).
     */
    const toggleUserFavorite = async (favoritedUserId: string) => {
        const userId = authStore.profile?.id
        if (!userId) return { error: 'Usuário não autenticado' }

        loading.value = true
        try {
            // Verificar se já existe nos favoritos
            const { data: existing, error: checkError } = await supabase
                .from('favoritos')
                .select('id')
                .eq('usuario_id', userId)
                .eq('favorito_usuario_id', favoritedUserId)
                .maybeSingle()

            if (checkError) throw checkError

            if (existing) {
                // Se existe, remove
                const { error: deleteError } = await supabase
                    .from('favoritos')
                    .delete()
                    .eq('id', existing.id)

                if (deleteError) throw deleteError
                return { action: 'removed', error: null }
            } else {
                // Se não existe, adiciona
                const { error: insertError } = await supabase
                    .from('favoritos')
                    .insert({
                        usuario_id: userId,
                        favorito_usuario_id: favoritedUserId
                    })

                if (insertError) throw insertError
                return { action: 'added', error: null }
            }
        } catch (err: any) {
            console.error('Erro ao alternar favorito:', err)
            return { error: err.message || err }
        } finally {
            loading.value = false
        }
    }

    /**
     * Verifica se um usuário específico é favorito do usuário atual.
     */
    const isUserFavorite = async (favoritedUserId: string) => {
        const userId = authStore.profile?.id
        if (!userId) return false

        try {
            const { data } = await supabase
                .from('favoritos')
                .select('id')
                .eq('usuario_id', userId)
                .eq('favorito_usuario_id', favoritedUserId)
                .maybeSingle()

            return !!data
        } catch (e) {
            return false
        }
    }

    /**
     * Retorna a lista de IDs de usuários favoritados pelo usuário logado.
     */
    const getMyFavoritedUserIds = async () => {
        const userId = authStore.profile?.id
        if (!userId) return []

        const { data, error } = await supabase
            .from('favoritos')
            .select('favorito_usuario_id')
            .eq('usuario_id', userId)
            .not('favorito_usuario_id', 'is', null)

        if (error) {
            console.error('Erro ao buscar IDs favoritados:', error)
            return []
        }

        return data.map(f => f.favorito_usuario_id) as string[]
    }

    /**
     * Alterna o estado de favorito de um serviço.
     */
    const toggleServiceFavorite = async (serviceId: string) => {
        const userId = authStore.profile?.id
        if (!userId) return { error: 'Usuário não autenticado' }

        loading.value = true
        try {
            const { data: existing, error: checkError } = await supabase
                .from('favoritos')
                .select('id')
                .eq('usuario_id', userId)
                .eq('servico_id', serviceId)
                .maybeSingle()

            if (checkError) throw checkError

            if (existing) {
                const { error: deleteError } = await supabase
                    .from('favoritos')
                    .delete()
                    .eq('id', existing.id)

                if (deleteError) throw deleteError
                return { action: 'removed', error: null }
            } else {
                const { error: insertError } = await supabase
                    .from('favoritos')
                    .insert({
                        usuario_id: userId,
                        servico_id: serviceId
                    })

                if (insertError) throw insertError
                return { action: 'added', error: null }
            }
        } catch (err: any) {
            console.error('Erro ao alternar favorito do serviço:', err)
            return { error: err.message || err }
        } finally {
            loading.value = false
        }
    }

    /**
     * Verifica se um serviço é favorito do usuário atual.
     */
    const isServiceFavorite = async (serviceId: string) => {
        const userId = authStore.profile?.id
        if (!userId) return false

        try {
            const { data } = await supabase
                .from('favoritos')
                .select('id')
                .eq('usuario_id', userId)
                .eq('servico_id', serviceId)
                .maybeSingle()

            return !!data
        } catch (e) {
            return false
        }
    }

    /**
     * Retorna a lista de IDs de serviços favoritados pelo usuário logado.
     */
    const getMyFavoritedServiceIds = async () => {
        const userId = authStore.profile?.id
        if (!userId) return []

        const { data, error } = await supabase
            .from('favoritos')
            .select('servico_id')
            .eq('usuario_id', userId)
            .not('servico_id', 'is', null)

        if (error) {
            console.error('Erro ao buscar IDs de serviços favoritados:', error)
            return []
        }

        return data.map(f => f.servico_id) as string[]
    }

    return {
        toggleUserFavorite,
        isUserFavorite,
        getMyFavoritedUserIds,
        toggleServiceFavorite,
        isServiceFavorite,
        getMyFavoritedServiceIds,
        loading
    }
}
