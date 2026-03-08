import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autorizado' })
    }

    if (!body.id) {
        // Se não passar ID, marca todas como lidas
        const { error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('user_id', user.id)

        if (error) throw createError({ statusCode: 400, message: error.message })
        return { success: true }
    }

    const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', body.id)
        .eq('user_id', user.id)

    if (error) {
        throw createError({ statusCode: 400, message: error.message })
    }

    return { success: true }
})
