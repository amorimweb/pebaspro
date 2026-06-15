import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { CreateUsuarioPayload } from '~/types/usuarios'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

const hasText = (value?: string | null) => Boolean(value?.trim())

const assertCompleteProfile = (body: CreateUsuarioPayload) => {
    if (
        !hasText(body.nome) ||
        !hasText(body.documento) ||
        !hasText(body.telefone) ||
        !hasText(body.cidade) ||
        !hasText(body.estado) ||
        !hasText(body.profissao) ||
        !hasText(body.sobre_mim) ||
        !['talento', 'prestador', 'empresa'].includes(body.tipo_conta || '')
    ) {
        throw createError({ statusCode: 400, message: 'Cadastro completo e obrigatorio' })
    }
}

export default defineEventHandler(async (event) => {
    const authUser = await requireAuthenticatedUser(event)
    const body: CreateUsuarioPayload = await readBody(event)
    assertCompleteProfile(body)

    const supabase = serverSupabaseServiceRole<Database>(event)
    const profile = {
        id: authUser.id,
        email: authUser.email || body.email || null,
        nome: body.nome?.trim() || null,
        documento: body.documento || null,
        telefone: body.telefone || null,
        endereco: body.endereco || null,
        profissao: body.profissao?.trim() || null,
        regiao: body.regiao || null,
        sobre_mim: body.sobre_mim?.trim() || null,
        tipo_conta: body.tipo_conta,
        biografia: body.biografia || body.sobre_mim || null,
        cadastro_completo: true,
        foto: body.foto || null,
        habilidades: body.habilidades || [],
        objetivo_profissional: body.objetivo_profissional || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        cidade: body.cidade?.trim().toUpperCase() || null,
        estado: body.estado || null,
        status: 'ativo',
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
        .from('usuarios')
        .upsert(profile as any, { onConflict: 'id' })
        .select('*')
        .single()

    if (error) {
        console.error('Erro ao salvar usuario:', error.message)
        throw createError({ statusCode: 400, message: 'Erro ao salvar dados do usuario' })
    }

    return data
})
