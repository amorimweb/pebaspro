import type { Database } from '~/types'

type ParticipantIdSource = string | null | undefined | { value: string | null | undefined }

export const useMensagens = (participantIdSource?: ParticipantIdSource) => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  const loading = ref(false)
  const loadingMessages = ref(false)
  const error = ref<string | null>(null)
  const conversations = ref<any[]>([])
  const messages = ref<any[]>([])
  const activeConversationId = ref<string | null>(null)

  const getParticipantId = () => {
    const explicitId = typeof participantIdSource === 'object'
      ? participantIdSource?.value
      : participantIdSource

    return explicitId || authStore.profile?.id || user.value?.id || null
  }

  // ─── Fetch Conversations ───────────────────────────────────────────────────
  const fetchConversations = async () => {
    const participantId = getParticipantId()
    if (!participantId) return

    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('conversas')
        .select('*')
        .or(`participante1_id.eq.${participantId},participante2_id.eq.${participantId}`)
        .order('updated_at', { ascending: false })

      if (err) throw err

      if (!data || data.length === 0) {
        conversations.value = []
        return
      }

      const otherIds = [...new Set(
        data.map((c: any) =>
          c.participante1_id === participantId ? c.participante2_id : c.participante1_id
        )
      )]

      const { data: users } = await supabase
        .from('usuarios')
        .select('id, nome, foto, tipo_conta')
        .in('id', otherIds)

      const usersMap = Object.fromEntries((users || []).map((u: any) => [u.id, u]))

      conversations.value = data.map((c: any) => {
        const otherId = c.participante1_id === participantId ? c.participante2_id : c.participante1_id
        return { ...c, otherUser: usersMap[otherId] || null }
      })
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar conversas:', e)
    } finally {
      loading.value = false
    }
  }

  // ─── Fetch Messages ────────────────────────────────────────────────────────
  const fetchMessages = async (conversationId: string) => {
    loadingMessages.value = true
    try {
      const { data, error: err } = await supabase
        .from('mensagens')
        .select('*')
        .eq('conversa_id', conversationId)
        .order('created_at', { ascending: true })

      if (err) throw err
      messages.value = data || []
    } catch (e: any) {
      console.error('Erro ao buscar mensagens:', e.message)
    } finally {
      loadingMessages.value = false
    }
  }

  // ─── Send Message ──────────────────────────────────────────────────────────
  const sendMessage = async (conversationId: string, content: string) => {
    const participantId = getParticipantId()
    if (!participantId || !content.trim()) return
    try {
      const { error: err } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversationId,
          remetente_id: participantId,
          conteudo: content.trim()
        })
      if (err) throw err
    } catch (e: any) {
      console.error('Erro ao enviar:', e.message)
      throw e
    }
  }

  // ─── Update CRM Status ─────────────────────────────────────────────────────
  const updateStatus = async (conversationId: string, status: string) => {
    try {
      const { error: err } = await supabase
        .from('conversas')
        .update({ status_contratacao: status })
        .eq('id', conversationId)
      if (err) throw err

      const idx = conversations.value.findIndex(c => c.id === conversationId)
      if (idx !== -1) conversations.value[idx].status_contratacao = status
    } catch (e: any) {
      console.error('Erro ao atualizar status:', e.message)
      throw e
    }
  }

  // ─── Realtime Subscriptions ────────────────────────────────────────────────
  const subscribeToMessages = (conversationId: string, callback: (msg: any) => void) => {
    const channel = supabase.channel(`obs:mensagens:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `conversa_id=eq.${conversationId}`
      }, payload => callback(payload.new))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const subscribeToConversations = (callback: () => void) => {
    const participantId = getParticipantId()
    if (!participantId) return () => {}

    const channel = supabase.channel(`obs:conversas:${participantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, () => callback())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  return {
    loading, loadingMessages, error, conversations, messages, activeConversationId,
    fetchConversations, fetchMessages, sendMessage, updateStatus,
    subscribeToMessages, subscribeToConversations
  }
}
