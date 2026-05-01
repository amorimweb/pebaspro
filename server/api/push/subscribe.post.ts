import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const userId = user.id || (user as any).sub
  const body = await readBody(event)

  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    throw createError({ statusCode: 400, statusMessage: 'Subscription inválida' })
  }

  const supabase = serverSupabaseServiceRole(event)

  await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh,
    auth: body.keys.auth,
  }, { onConflict: 'user_id,endpoint' })

  return { ok: true }
})
