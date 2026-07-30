import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { CreateUsuarioPayload } from '~/types/usuarios'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'
import { sanitizeCompleteProfile } from '../../utils/profileValidation'

export default defineEventHandler(async (event) => {
    const authUser = await requireAuthenticatedUser(event)
    const body: CreateUsuarioPayload = await readBody(event)
    const cleanProfile = sanitizeCompleteProfile(body)

    const supabase = serverSupabaseServiceRole<Database>(event)
    const profile = {
        id: authUser.id,
        email: authUser.email || body.email || null,
        ...cleanProfile,
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from('usuarios')
        .upsert(profile as any, { onConflict: 'id' })
        .select('*')
        .single()

    if (error) {
        console.error('Erro ao salvar usuario:', error.message)
        if (error.code === '23505') {
            throw createError({ statusCode: 409, message: 'CPF ou CNPJ ja cadastrado' })
        }
        throw createError({ statusCode: 400, message: 'Erro ao salvar dados do usuario' })
    }

    return data
})
