import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event)
    const supabase = serverSupabaseServiceRole<Database>(event)
    const body = await readBody<{ id?: string }>(event)

    let query = supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id)

    if (body.id) query = query.eq('id', body.id)

    const { error } = await query
    if (error) {
        throw createError({ statusCode: 400, message: 'Erro ao atualizar notificacao' })
    }

    return { success: true }
})
