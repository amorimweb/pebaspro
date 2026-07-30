import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { UpdateUsuarioPayload } from '~/types/usuarios'
import { requireAuthenticatedUser } from '../../utils/authenticatedUser'
import { sanitizeCompleteProfile } from '../../utils/profileValidation'

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

    const supabase = serverSupabaseServiceRole<Database>(event)
    const { data: currentProfile, error: currentError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .maybeSingle()

    if (currentError) {
        throw createError({ statusCode: 500, message: 'Erro ao validar perfil atual' })
    }
    if (!currentProfile) {
        throw createError({ statusCode: 404, message: 'Usuario nao encontrado' })
    }

    const shouldValidateCompleteProfile =
        currentProfile.cadastro_completo === true || body.cadastro_completo === true
    const validatedProfile = shouldValidateCompleteProfile
        ? sanitizeCompleteProfile({ ...currentProfile, ...body, id } as any)
        : null

    const allowedUpdate = {
        nome: validatedProfile ? validatedProfile.nome : body.nome,
        documento: validatedProfile ? validatedProfile.documento : body.documento,
        telefone: validatedProfile ? validatedProfile.telefone : body.telefone,
        endereco: validatedProfile ? validatedProfile.endereco : body.endereco,
        profissao: validatedProfile ? validatedProfile.profissao : body.profissao,
        regiao: validatedProfile ? validatedProfile.regiao : body.regiao,
        sobre_mim: validatedProfile ? validatedProfile.sobre_mim : body.sobre_mim,
        tipo_conta: validatedProfile ? validatedProfile.tipo_conta : body.tipo_conta,
        biografia: validatedProfile ? validatedProfile.biografia : body.biografia,
        cadastro_completo: validatedProfile ? validatedProfile.cadastro_completo : body.cadastro_completo,
        foto: body.foto,
        experiencia_profissional: body.experiencia_profissional,
        formacao_academica: body.formacao_academica,
        habilidades: validatedProfile ? validatedProfile.habilidades : body.habilidades,
        objetivo_profissional: validatedProfile ? validatedProfile.objetivo_profissional : body.objetivo_profissional,
        latitude: body.latitude,
        longitude: body.longitude,
        cidade: validatedProfile ? validatedProfile.cidade : body.cidade,
        estado: validatedProfile ? validatedProfile.estado : body.estado,
        modo_prestador: validatedProfile ? validatedProfile.modo_prestador : body.modo_prestador
    }
    const cleanUpdate = Object.fromEntries(
        Object.entries(allowedUpdate).filter(([, value]) => value !== undefined)
    )

    const { data, error } = await supabase
        .from('usuarios')
        .update({ ...cleanUpdate, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single()

    if (error?.code === 'PGRST116') {
        throw createError({ statusCode: 404, message: 'Usuario nao encontrado' })
    }
    if (error?.code === '23505') {
        throw createError({ statusCode: 409, message: 'CPF ou CNPJ ja cadastrado' })
    }
    if (error) throw createError({ statusCode: 400, message: 'Erro ao atualizar dados do usuario' })
    return data
})
