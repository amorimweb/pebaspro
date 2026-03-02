import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    // 1. Obter o usuário autenticado
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Não autorizado',
        })
    }

    // Extrair o ID de forma robusta (id ou sub)
    const userId = user.id || (user as any).sub

    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do usuário não encontrado na sessão',
        })
    }

    // 3. Consultar a tabela usuarios utilizando Service Role (bypass RLS)
    const client = serverSupabaseServiceRole<Database>(event)

    const { data: profile, error: profileError } = await client
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError) {
        console.error(`Erro ao buscar perfil para o usuário ${userId}:`, profileError.message)
        if (profileError.code === 'PGRST116') {
            throw createError({ statusCode: 404, statusMessage: 'Perfil não encontrado' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno ao buscar perfil' })
    }

    // 4. Buscar currículo separadamente (Left Join manual e seguro)
    const { data: curriculo } = await client
        .from('curriculos')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    return {
        ...profile,
        curriculo: curriculo || null
    }
})
