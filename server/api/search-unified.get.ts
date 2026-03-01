import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = (query.q as string)?.trim() || ''

    if (!q || q.length < 2) {
        return []
    }

    const client = serverSupabaseServiceRole<Database>(event)

    // 1. Buscar empresas e prestadores pelo nome
    const { data: users } = await client
        .from('usuarios')
        .select('id, nome, foto, regiao, profissao, tipo_conta')
        .in('tipo_conta', ['prestador', 'empresa'])
        .ilike('nome', `%${q}%`)
        .limit(4)

    // 2. Buscar serviços pelo título
    const { data: services } = await client
        .from('servicos')
        .select('id, titulo, preco_inicial, prestador:usuarios(nome, foto, regiao, tipo_conta)')
        .eq('ativo', true)
        .ilike('titulo', `%${q}%`)
        .limit(4)

    const results = []

    // Formatar usuários
    if (users) {
        for (const u of users) {
            results.push({
                type: u.tipo_conta, // 'empresa' | 'prestador'
                id: u.id,
                title: u.nome,
                subtitle: u.profissao || u.regiao || (u.tipo_conta === 'empresa' ? 'Empresa Parceira' : 'Profissional'),
                image: u.foto,
                url: `/empresas/${u.id}` // A rota atual /empresas/[id] atende empresas e prestadores
            })
        }
    }

    // Formatar serviços
    if (services) {
        for (const s of services) {
            const p = (s.prestador as any) || {}
            results.push({
                type: 'servico',
                id: s.id,
                title: s.titulo,
                subtitle: `Oferecido por ${p?.nome || 'Prestador'}`,
                image: p?.foto,
                url: `/servicos/${s.id}`
            })
        }
    }

    return results
})
