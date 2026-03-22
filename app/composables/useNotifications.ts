import type { Database } from '~/types/database.types'

type Notificacao = Database['public']['Tables']['notificacoes']['Row']

export const useNotifications = () => {
    const authStore = useAuthStore()
    const notifications = useState<Notificacao[]>('user_notifications', () => [])
    const loading = ref(false)

    const unreadCount = computed(() => notifications.value.filter(n => !n.lida).length)

    const fetchNotifications = async () => {
        if (!authStore.profile?.id) return
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

    // Reactivo: busca notificações assim que o perfil estiver pronto
    watch(() => authStore.profile?.id, (newId) => {
        if (newId) fetchNotifications()
    }, { immediate: true })

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead
    }
}
