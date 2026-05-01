export const usePushNotifications = () => {
  const config = useRuntimeConfig()
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const permission = ref<NotificationPermission>('default')

  const checkSupport = () => {
    isSupported.value =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
  }

  const getSubscription = async (): Promise<PushSubscription | null> => {
    if (!isSupported.value) return null
    const reg = await navigator.serviceWorker.ready
    return reg.pushManager.getSubscription()
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported.value) return false

    try {
      permission.value = await Notification.requestPermission()
      if (permission.value !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const vapidKey = urlBase64ToUint8Array(config.public.vapidPublicKey)

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })

      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: sub.toJSON(),
      })

      isSubscribed.value = true
      return true
    } catch (err) {
      console.error('Erro ao ativar push:', err)
      return false
    }
  }

  const unsubscribe = async () => {
    const sub = await getSubscription()
    if (!sub) return

    await $fetch('/api/push/unsubscribe', {
      method: 'POST',
      body: { endpoint: sub.endpoint },
    })

    await sub.unsubscribe()
    isSubscribed.value = false
  }

  const init = async () => {
    checkSupport()
    if (!isSupported.value) return

    permission.value = Notification.permission
    const sub = await getSubscription()
    isSubscribed.value = !!sub

    // Se já tinha permissão mas perdeu a subscription (ex: limpou dados), reinscreve
    if (permission.value === 'granted' && !sub) {
      await subscribe()
    }
  }

  return { isSupported, isSubscribed, permission, init, subscribe, unsubscribe }
}
