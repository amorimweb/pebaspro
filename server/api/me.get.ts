import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireAuthenticatedUser } from '../utils/authenticatedUser'

const hasText = (value?: string | null) => Boolean(value?.trim())

const isComplete = (profile: any) => Boolean(
    hasText(profile?.tipo_conta) &&
    hasText(profile?.nome) &&
    hasText(profile?.documento) &&
    hasText(profile?.telefone) &&
    hasText(profile?.cidade) &&
    hasText(profile?.estado) &&
    hasText(profile?.profissao) &&
    hasText(profile?.sobre_mim)
)

export default defineEventHandler(async (event) => {
    const authUser = await requireAuthenticatedUser(event)
    const supabase = serverSupabaseServiceRole<Database>(event)

    let { data: profile, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

    if (error) {
        throw createError({ statusCode: 500, message: 'Erro ao buscar perfil do usuario' })
    }

    if (!profile && authUser.email) {
        const byEmail = await supabase
            .from('usuarios')
            .select('*')
            .ilike('email', authUser.email)
            .order('updated_at', { ascending: false })
            .limit(1)

        if (byEmail.error) {
            throw createError({ statusCode: 500, message: 'Erro ao buscar perfil por email' })
        }

        profile = byEmail.data?.[0] || null

        if (profile && profile.id !== authUser.id) {
            const { data: linkedProfile, error: linkError } = await supabase
                .from('usuarios')
                .update({
                    id: authUser.id,
                    email: authUser.email,
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('id', profile.id)
                .select('*')
                .single()

            if (!linkError && linkedProfile) profile = linkedProfile
        }
    }

    if (!profile) {
        throw createError({ statusCode: 404, message: 'Perfil nao encontrado' })
    }

    if (profile.cadastro_completo !== true && isComplete(profile)) {
        const { data: updatedProfile, error: updateError } = await supabase
            .from('usuarios')
            .update({
                cadastro_completo: true,
                status: profile.status || 'ativo',
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', profile.id)
            .select('*')
            .single()

        if (!updateError && updatedProfile) profile = updatedProfile
    }

    const { data: curriculo } = await supabase
        .from('curriculos')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle()

    return {
        ...profile,
        curriculo: curriculo || null,
    }
})
