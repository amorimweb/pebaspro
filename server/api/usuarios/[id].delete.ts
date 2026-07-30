import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

// DELETE /api/usuarios/:id - autoexclusão de conta (LGPD Art. 18, IV).
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ID do usuario e obrigatorio' })
    }

    const user = await requireAuthenticatedUser(event)
    if (id !== user.id) {
        throw createError({ statusCode: 403, message: 'Nao autorizado a excluir esta conta' })
    }

    const client = serverSupabaseServiceRole<Database>(event)

    // Cascata via FK (usuarios, servicos, vagas, conversas, mensagens,
    // avaliacoes, favoritos) já configurada com ON DELETE CASCADE em database.sql.
    const { error } = await client.auth.admin.deleteUser(id)

    if (error) {
        throw createError({ statusCode: 500, message: 'Erro ao excluir conta' })
    }

    return { success: true }
})
