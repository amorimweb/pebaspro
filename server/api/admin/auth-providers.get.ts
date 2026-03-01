import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    // 1. Verificar se o usuário está autenticado
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
    }

    // 2. Usar o client Service Role para ter acesso à tabela auth.users (contém os provedores)
    const client = serverSupabaseServiceRole<Database>(event)

    // 3. Verificar se o usuário requisitante é de fato um admin
    const { data: profile } = await client
        .from('usuarios')
        .select('role')
        .eq('id', user.id || (user as any).sub)
        .single()

    if (!profile || profile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
    }

    // 4. Buscar a lista de usuários do Supabase Auth
    const { data: authUsers, error } = await client.auth.admin.listUsers()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: 'Erro ao listar usuários auth: ' + error.message })
    }

    // 5. Mapear os provedores pelo ID do usuário
    const providersMap: Record<string, string> = {}

    if (authUsers?.users) {
        authUsers.users.forEach(u => {
            // O provedor principal geralmente está em app_metadata.provider
            let provider = u.app_metadata?.provider || 'email'

            // Ajuste de nomes para exibição mais bonita
            if (provider === 'google') provider = 'Google'
            else if (provider === 'email') provider = 'E-mail e Senha'

            providersMap[u.id] = provider
        })
    }

    return providersMap
})
