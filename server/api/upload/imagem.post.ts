import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const userId = user.id || (user as any).sub
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })

  const supabase = serverSupabaseServiceRole(event)

  // Bloqueia empresa de enviar imagens
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('tipo_conta')
    .eq('id', userId)
    .single()

  if (perfil?.tipo_conta === 'empresa') {
    throw createError({ statusCode: 403, statusMessage: 'Empresas não podem enviar imagens' })
  }

  const formData = await readFormData(event)
  const file       = formData.get('file')        as File
  const conversaId = formData.get('conversa_id') as string

  if (!file) throw createError({ statusCode: 400, statusMessage: 'Arquivo não enviado' })
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Formato inválido. Use JPG, PNG ou WebP.' })
  }
  if (file.size > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Imagem maior que 5 MB' })
  }

  const cfg = useRuntimeConfig()

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.r2AccessKeyId,
      secretAccessKey: cfg.r2SecretAccessKey,
    },
  })

  const ext = file.type.split('/')[1]
  const key = `imagens/${Date.now()}-${userId.slice(0, 8)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await r2.send(new PutObjectCommand({
    Bucket: cfg.r2BucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ContentLength: file.size,
  }))

  const url = `${cfg.r2PublicUrl}/${key}`

  const { error } = await supabase.from('mensagens').insert({
    conversa_id:  conversaId,
    remetente_id: userId,
    conteudo:     url,
    tipo:         'imagem',
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

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
      title: remetente?.nome || 'Nova imagem',
      body: 'Enviou uma imagem para você',
      url: '/painel/mensagens',
      tag: `mensagem-${conversaId}`,
    })
  }

  return { ok: true, url }
})
