import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

/**
 * POST /api/auth/check-email-conflict
 *
 * Após login OAuth, verifica se o email do usuário já está cadastrado
 * na tabela `usuarios` com um ID diferente (conta criada por email/senha).
 *
 * Retorna { conflict: true } quando detecta uma conta duplicada,
 * permitindo que o cliente bloqueie o acesso e oriente o usuário.
 */
export default defineEventHandler(async (event) => {
    const user = await requireAuthenticatedUser(event)

    const { email } = await readBody<{ email: string }>(event)
    if (!email?.trim()) {
        throw createError({ statusCode: 400, message: 'E-mail obrigatório' })
    }

    const client = serverSupabaseServiceRole<Database>(event)

    // Verifica se outro usuário já ocupa esse e-mail na tabela de perfis
    const { data: existing } = await client
        .from('usuarios')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

    // Conflito: existe perfil com esse e-mail, mas pertence a outro UUID
    if (existing && existing.id !== user.id) {
        return { conflict: true }
    }

    return { conflict: false }
})
