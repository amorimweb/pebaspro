import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Usuário não autenticado no servidor' })
    }

    // Validação de UUID para evitar erro 22P02 no Postgres
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user.id)) {
        console.error('SERVER ERROR: Invalid User UUID in session:', user.id)
        throw createError({ statusCode: 400, message: 'Identificador de usuário inválido na sessão' })
    }

    const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('DB ERROR [notificacoes]:', error)
        throw createError({ statusCode: 500, message: 'Erro ao carregar notificações do banco de dados' })
    }

    return data
})
