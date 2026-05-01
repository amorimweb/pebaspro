import webpush from 'web-push'

let vapidConfigured = false

function ensureVapid() {
  if (vapidConfigured) return
  const cfg = useRuntimeConfig()
  webpush.setVapidDetails(
    cfg.vapidMailto,
    cfg.public.vapidPublicKey,
    cfg.vapidPrivateKey,
  )
  vapidConfigured = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendPushToUser(
  supabase: any,
  userId: string,
  payload: PushPayload,
) {
  ensureVapid()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs?.length) return

  const expired: string[] = []

  await Promise.allSettled(
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        )
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expired.push(sub.id)
        }
      }
    }),
  )

  if (expired.length) {
    await supabase.from('push_subscriptions').delete().in('id', expired)
  }
}
