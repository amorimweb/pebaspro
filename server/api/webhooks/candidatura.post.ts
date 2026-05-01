import { serverSupabaseServiceRole } from '#supabase/server'

const STATUS_LABELS: Record<string, string> = {
  Visualizada: 'Empresa visualizou sua candidatura',
  Aceita: '🎉 Sua candidatura foi aceita!',
  Rejeitada: 'Candidatura não aprovada desta vez',
  Contratado: '🎊 Parabéns! Você foi contratado!',
  Pendente: 'Candidatura recebida',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Supabase Database Webhook payload format
  const record = body.record
  const oldRecord = body.old_record
  const type = body.type // INSERT or UPDATE

  if (!record) return { ok: true }

  const supabase = serverSupabaseServiceRole(event)

  // Nova candidatura → notifica empresa
  if (type === 'INSERT') {
    const { data: vaga } = await supabase
      .from('vagas')
      .select('titulo, empresa_id')
      .eq('id', record.vaga_id)
      .single()

    if (vaga?.empresa_id) {
      const { data: talento } = await supabase
        .from('usuarios').select('nome').eq('id', record.talento_id).single()

      await sendPushToUser(supabase, vaga.empresa_id, {
        title: 'Nova candidatura',
        body: `${talento?.nome || 'Um talento'} se candidatou para "${vaga.titulo}"`,
        url: `/painel/empresa/vagas`,
        tag: `candidatura-${record.id}`,
      })
    }
  }

  // Status mudou → notifica talento
  if (type === 'UPDATE' && oldRecord?.status !== record.status) {
    const msg = STATUS_LABELS[record.status]
    if (msg && record.talento_id) {
      const { data: vaga } = await supabase
        .from('vagas').select('titulo').eq('id', record.vaga_id).single()

      await sendPushToUser(supabase, record.talento_id, {
        title: vaga?.titulo || 'Atualização de candidatura',
        body: msg,
        url: '/minhas_vagas',
        tag: `candidatura-${record.id}`,
      })
    }
  }

  return { ok: true }
})
