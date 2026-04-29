import type { Database } from '~/types'

export const useMensagens = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  
  const loading = ref(false)
  const loadingMessages = ref(false)
  const error = ref<string | null>(null)
  const conversations = ref<any[]>([])
  const messages = ref<any[]>([])
  const activeConversationId = ref<string | null>(null)

  // ─── Fetch Conversations ───────────────────────────────────────────────────
  const fetchConversations = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('conversas')
        .select(`
          *,
          p1:participante1_id(id, nome, foto, tipo_conta),
          p2:participante2_id(id, nome, foto, tipo_conta),
          vaga:vaga_id(id, titulo)
        `)
        .or(`participante1_id.eq.${user.value.id},participante2_id.eq.${user.value.id}`)
        .order('updated_at', { ascending: false })

      if (err) throw err

      conversations.value = data.map((c: any) => {
        const isSelfP1 = c.participante1_id === user.value?.id
        const other = isSelfP1 ? c.p2 : c.p1
        return { ...c, otherUser: other }
      })
    } catch (e: any) {
      error.value = e.message
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
    if (!user.value || !content.trim()) return
    try {
      const { error: err } = await supabase
        .from('mensagens')
        .insert({
          conversa_id: conversationId,
          remetente_id: user.value.id,
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
    const channel = supabase.channel('obs:conversas')
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
