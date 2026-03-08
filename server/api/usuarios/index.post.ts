import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { CreateUsuarioPayload } from '~/types/usuarios'

// POST /api/usuarios — Cria ou atualiza (upsert) um usuário na tabela `usuarios`
export default defineEventHandler(async (event) => {
    const body: CreateUsuarioPayload = await readBody(event)

    if (!body.id) {
        throw createError({ statusCode: 400, message: 'Campo `id` é obrigatório' })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)

    const { data, error } = await supabase
        .from('usuarios')
        .upsert({
            ...body,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) throw createError({ statusCode: 400, message: error.message })

    return data
})
