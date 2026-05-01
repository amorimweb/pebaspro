import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })

  const userId = user.id || (user as any).sub
  const { endpoint } = await readBody(event)

  const supabase = serverSupabaseServiceRole(event)

  if (endpoint) {
    await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', endpoint)
  } else {
    await supabase.from('push_subscriptions').delete().eq('user_id', userId)
  }

  return { ok: true }
})
