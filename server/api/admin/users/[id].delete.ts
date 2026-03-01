import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    // 1. Verify authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
    }

    // 2. Init Service Role client
    const client = serverSupabaseServiceRole<Database>(event)

    // 3. Verify admin role
    const { data: profile } = await client
        .from('usuarios')
        .select('role')
        .eq('id', user.id || (user as any).sub)
        .single()

    if (!profile || profile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
    }

    // 4. Get the target user ID to delete
    const targetId = getRouterParam(event, 'id')

    if (!targetId) {
        throw createError({ statusCode: 400, statusMessage: 'ID do usuário não fornecido' })
    }

    // 5. Protect admin from deleting themselves
    if (targetId === (user.id || (user as any).sub)) {
        throw createError({ statusCode: 400, statusMessage: 'Você não pode deletar sua própria conta' })
    }

    // 6. Delete user from Supabase Auth (this cascades to the `usuarios` table)
    const { error } = await client.auth.admin.deleteUser(targetId)

    if (error) {
        throw createError({ statusCode: 500, statusMessage: 'Erro ao deletar usuário: ' + error.message })
    }

    return { success: true, message: 'Usuário deletado com sucesso' }
})
