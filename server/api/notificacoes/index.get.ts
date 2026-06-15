import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event)
    const supabase = serverSupabaseServiceRole<Database>(event)

    const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('DB ERROR [notificacoes]:', error)
        throw createError({ statusCode: 500, message: 'Erro ao carregar notificacoes do banco de dados' })
    }

    return data || []
})
