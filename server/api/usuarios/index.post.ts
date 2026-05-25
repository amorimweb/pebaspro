import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { CreateUsuarioPayload } from '~/types/usuarios'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

// POST /api/usuarios - creates the completed profile for the authenticated account.
export default defineEventHandler(async (event) => {
    const body: CreateUsuarioPayload = await readBody(event)
    if (!body.id) {
        throw createError({ statusCode: 400, message: 'Campo `id` e obrigatorio' })
    }

    const user = await requireAuthenticatedUser(event)
    if (body.id !== user.id) {
        throw createError({ statusCode: 403, message: 'Nao autorizado a criar este perfil' })
    }

    if (
        body.cadastro_completo !== true ||
        !body.nome?.trim() ||
        !body.documento?.trim() ||
        !body.telefone?.trim() ||
        !body.cidade?.trim() ||
        !body.estado?.trim() ||
        !body.profissao?.trim() ||
        !body.sobre_mim?.trim() ||
        !['talento', 'prestador', 'empresa'].includes(body.tipo_conta || '')
    ) {
        throw createError({ statusCode: 400, message: 'Cadastro completo e obrigatorio' })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)
    const { data, error } = await supabase
        .from('usuarios')
        .upsert({
            id: body.id,
            email: user.email || body.email || null,
            nome: body.nome,
            documento: body.documento,
            telefone: body.telefone,
            endereco: body.endereco || null,
            profissao: body.profissao,
            regiao: body.regiao || null,
            sobre_mim: body.sobre_mim,
            tipo_conta: body.tipo_conta,
            biografia: body.biografia || body.sobre_mim,
            cadastro_completo: true,
            foto: body.foto || null,
            habilidades: body.habilidades || [],
            objetivo_profissional: body.objetivo_profissional || null,
            latitude: body.latitude ?? null,
            longitude: body.longitude ?? null,
            cidade: body.cidade,
            estado: body.estado,
            status: 'ativo',
            updated_at: new Date().toISOString()
        } as any)
        .select()
        .single()

    if (error) throw createError({ statusCode: 400, message: 'Erro ao salvar dados do usuario' })
    return data
})
