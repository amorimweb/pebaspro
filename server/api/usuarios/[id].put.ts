import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { UpdateUsuarioPayload } from '~/types/usuarios'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'

// PUT /api/usuarios/:id - updates only the authenticated user's editable fields.
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ID do usuario e obrigatorio' })
    }

    const body: UpdateUsuarioPayload = await readBody(event)
    const user = await requireAuthenticatedUser(event)
    if (id !== user.id) {
        throw createError({ statusCode: 403, message: 'Nao autorizado a editar este perfil' })
    }

    const allowedUpdate = {
        nome: body.nome,
        email: body.email,
        documento: body.documento,
        telefone: body.telefone,
        endereco: body.endereco,
        profissao: body.profissao,
        regiao: body.regiao,
        sobre_mim: body.sobre_mim,
        tipo_conta: body.tipo_conta,
        biografia: body.biografia,
        cadastro_completo: body.cadastro_completo,
        foto: body.foto,
        experiencia_profissional: body.experiencia_profissional,
        formacao_academica: body.formacao_academica,
        habilidades: body.habilidades,
        objetivo_profissional: body.objetivo_profissional,
        latitude: body.latitude,
        longitude: body.longitude,
        cidade: body.cidade,
        estado: body.estado,
        modo_prestador: body.modo_prestador
    }
    const cleanUpdate = Object.fromEntries(
        Object.entries(allowedUpdate).filter(([, value]) => value !== undefined)
    )

    const supabase = serverSupabaseServiceRole<Database>(event)
    const { data, error } = await supabase
        .from('usuarios')
        .update({ ...cleanUpdate, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single()

    if (error?.code === 'PGRST116') {
        throw createError({ statusCode: 404, message: 'Usuario nao encontrado' })
    }
    if (error) throw createError({ statusCode: 400, message: 'Erro ao atualizar dados do usuario' })
    return data
})
