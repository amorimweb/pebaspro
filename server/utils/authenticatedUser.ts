import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export async function requireAuthenticatedUser(event: any) {
    const cookieUser = await serverSupabaseUser(event)
    if (cookieUser?.id) return cookieUser

    const authorization = getHeader(event, 'authorization')
    const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''
    if (token) {
        const supabase = serverSupabaseServiceRole<Database>(event)
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user?.id) return data.user
    }

    throw createError({ statusCode: 401, message: 'Usuario nao autenticado' })
}
