import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const userId = user.id || (user as any).sub
  const { conversa_id, conteudo } = await readBody(event)

  if (!conversa_id || !conteudo?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'conversa_id e conteudo são obrigatórios' })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { data: msg, error } = await supabase
    .from('mensagens')
    .insert({ conversa_id, remetente_id: userId, conteudo: conteudo.trim(), tipo: 'texto' })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await supabase
    .from('conversas')
    .update({ updated_at: new Date().toISOString(), ultima_mensagem: conteudo.trim() })
    .eq('id', conversa_id)

  // Busca o outro participante para enviar push
  const { data: conversa } = await supabase
    .from('conversas')
    .select('participante1_id, participante2_id')
    .eq('id', conversa_id)
    .single()

  if (conversa) {
    const recipientId = conversa.participante1_id === userId
      ? conversa.participante2_id
      : conversa.participante1_id

    const { data: remetente } = await supabase
      .from('usuarios')
      .select('nome')
      .eq('id', userId)
      .single()

    await sendPushToUser(supabase, recipientId, {
      title: remetente?.nome || 'Nova mensagem',
      body: conteudo.trim().length > 80 ? conteudo.trim().slice(0, 80) + '…' : conteudo.trim(),
      url: '/painel/mensagens',
      tag: `mensagem-${conversa_id}`,
    })
  }

  return msg
})
