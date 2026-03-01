import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ vitrineId: string }>(event)

    if (!body?.vitrineId) {
        throw createError({ statusCode: 400, statusMessage: 'ID da vitrine não fornecido' })
    }

    // 1. Tentar pegar o usuário autenticado (pode ser nulo caso visitante anônimo)
    let visitanteId: string | null = null
    try {
        const user = await serverSupabaseUser(event)
        if (user) visitanteId = user.id || (user as any).sub
    } catch (e) {
        // visitante nulo ok
    }

    // 2. Se o visitante for o próprio dono da vitrine, NÃO contabiliza
    if (visitanteId === body.vitrineId) {
        return { success: true, message: 'Dono da vitrine (não contabilizado)' }
    }

    // 3. Pegar o IP para evitar spam anônimo de F5
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || 'desconhecido'

    // 4. Usar Service Role para bypass RLS nas inserções/verificações
    const client = serverSupabaseServiceRole<Database>(event)

    // 5. Verificar se já existe uma visualização hoje (mesmo visitante_id OU mesmo IP se visitante for nulo)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Início do dia

    let query = client
        .from('visualizacoes_vitrine')
        .select('id')
        .eq('vitrine_id', body.vitrineId)
        .gte('created_at', hoje.toISOString())
        .limit(1)

    if (visitanteId) {
        query = query.eq('visitante_id', visitanteId)
    } else {
        query = query.eq('ip_address', ipAddress).is('visitante_id', null)
    }

    const { data: jaViu } = await query

    if (jaViu && jaViu.length > 0) {
        return { success: true, message: 'Visualização já contabilizada hoje' }
    }

    // 6. Inserir a nova visualização
    const { error } = await client
        .from('visualizacoes_vitrine')
        .insert({
            vitrine_id: body.vitrineId,
            visitante_id: visitanteId,
            ip_address: ipAddress
        } as any) // O "as any" aqui pq custom schemas podem não tipar síncronos

    if (error) {
        console.error('Erro ao registrar visualização:', error)
        throw createError({ statusCode: 500, statusMessage: 'Erro ao registrar visualização' })
    }

    return { success: true, message: 'Visualização registrada com sucesso' }
})
