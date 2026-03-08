import type { Database } from '~/types/database.types'

type Notificacao = Database['public']['Tables']['notificacoes']['Row']

export const useNotifications = () => {
    const notifications = useState<Notificacao[]>('user_notifications', () => [])
    const loading = ref(false)
    const { profile } = useAuthStore()

    const unreadCount = computed(() => notifications.value.filter(n => !n.lida).length)

    const fetchNotifications = async () => {
        if (!profile?.id) return
        loading.value = true
        try {
            const data = await $fetch<Notificacao[]>('/api/notificacoes')
            notifications.value = data || []
        } catch (e) {
            console.error('Erro ao buscar notificações:', e)
        } finally {
            loading.value = false
        }
    }

    const markAsRead = async (id?: string) => {
        try {
            await $fetch('/api/notificacoes/ler', {
                method: 'POST',
                body: { id }
            })
            if (id) {
                const index = notifications.value.findIndex(n => n?.id === id)
                if (index !== -1) notifications.value[index].lida = true
            } else {
                notifications.value.forEach(n => n.lida = true)
            }
        } catch (e) {
            console.error('Erro ao marcar como lida:', e)
        }
    }

    // Polling opcional ou via Supabase Realtime se necessário no futuro
    onMounted(() => {
        if (profile?.id) {
            fetchNotifications()
        }
    })

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead
    }
}
