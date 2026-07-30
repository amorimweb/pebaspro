import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export async function requireAuthenticatedUser(event: any) {
    // serverSupabaseUser() retorna os claims do JWT (via getClaims()), cujo
    // identificador do usuario vem no campo padrao "sub", nao "id".
    const cookieUser = await serverSupabaseUser(event)
    const cookieUserId = cookieUser?.id || (cookieUser as any)?.sub
    if (cookieUserId) return { ...cookieUser, id: cookieUserId }

    const authorization = getHeader(event, 'authorization')
    const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''
    if (token) {
        const supabase = serverSupabaseServiceRole<Database>(event)
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user?.id) return data.user
    }

    throw createError({ statusCode: 401, message: 'Usuario nao autenticado' })
}
