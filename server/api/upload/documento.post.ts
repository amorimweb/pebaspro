import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { sendPushToUser } from '~/server/utils/sendPush'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const userId = user.id || (user as any).sub
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })

  const formData = await readFormData(event)
  const file       = formData.get('file')       as File
  const conversaId = formData.get('conversa_id') as string
  const empresaId  = formData.get('empresa_id')  as string
  const talentoId  = formData.get('talento_id')  as string | null
  const tipo       = (formData.get('tipo') as string) || 'Geral'

  if (!file) throw createError({ statusCode: 400, statusMessage: 'Arquivo não enviado' })

  const isValidPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isValidPdf) throw createError({ statusCode: 400, statusMessage: 'Apenas PDF é aceito' })

  const MAX_BYTES = 10 * 1024 * 1024
  if (file.size > MAX_BYTES) throw createError({ statusCode: 400, statusMessage: 'Arquivo maior que 10 MB' })

  const cfg = useRuntimeConfig()

  if (!cfg.r2AccountId || !cfg.r2AccessKeyId || !cfg.r2SecretAccessKey) {
    throw createError({ statusCode: 500, statusMessage: 'R2 não configurado no servidor' })
  }

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.r2AccessKeyId,
      secretAccessKey: cfg.r2SecretAccessKey,
    },
  })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `documentos/${Date.now()}-${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await r2.send(new PutObjectCommand({
    Bucket: cfg.r2BucketName,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ContentLength: file.size,
  }))

  const url = `${cfg.r2PublicUrl}/${key}`

  const supabase = serverSupabaseServiceRole(event)

  const { data: doc, error: docErr } = await supabase
    .from('documentos')
    .insert({
      empresa_id:    empresaId || user.id,
      talento_id:    talentoId || null,
      conversa_id:   conversaId || null,
      nome:          file.name,
      tipo,
      url,
      tamanho_bytes: file.size,
      enviado_por:   userId,
    })
    .select()
    .single()

  if (docErr) throw createError({ statusCode: 500, statusMessage: docErr.message })

  if (conversaId) {
    await supabase.from('mensagens').insert({
      conversa_id:  conversaId,
      remetente_id: userId,
      conteudo:     `📄 ${file.name}`,
      tipo:         'documento',
      documento_id: doc.id,
    })

    await supabase
      .from('conversas')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversaId)

    const { data: conversa } = await supabase
      .from('conversas')
      .select('participante1_id, participante2_id')
      .eq('id', conversaId)
      .single()

    if (conversa) {
      const recipientId = conversa.participante1_id === userId
        ? conversa.participante2_id
        : conversa.participante1_id

      const { data: remetente } = await supabase
        .from('usuarios').select('nome').eq('id', userId).single()

      await sendPushToUser(supabase, recipientId, {
        title: remetente?.nome || 'Novo documento',
        body: `Documento enviado: ${file.name}`,
        url: '/painel/mensagens',
        tag: `mensagem-${conversaId}`,
      })
    }
  }

  return { ok: true, documento: doc }
})
