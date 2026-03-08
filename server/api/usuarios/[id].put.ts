import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { UpdateUsuarioPayload } from '~/types/usuarios'

// PUT /api/usuarios/:id — Atualiza campos do usuário
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({ statusCode: 400, message: 'ID do usuário é obrigatório' })
    }

    const body: UpdateUsuarioPayload = await readBody(event)

    const supabase = serverSupabaseServiceRole<Database>(event)

    const { data, error } = await supabase
        .from('usuarios')
        .update({
            ...body,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error?.code === 'PGRST116') {
        throw createError({ statusCode: 404, message: 'Usuário não encontrado' })
    }
    if (error) throw createError({ statusCode: 400, message: 'Erro ao atualizar dados do usuário' })

    return data
})
