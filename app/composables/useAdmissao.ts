import type { Database } from '~/types/database.types'

type Admissao = Database['public']['Tables']['admissoes']['Row'] & {
  talento?: { nome: string | null; foto: string | null; profissao: string | null } | null
  vaga?: { titulo: string | null } | null
}

type EsocialEvento = Database['public']['Tables']['esocial_eventos']['Row']

type VagaComCandidatos = Database['public']['Tables']['vagas']['Row'] & {
  candidaturas_aprovadas: number
  candidaturas: Array<{
    id: string
    talento_id: string
    status: string
    talento: { nome: string | null; foto: string | null; profissao: string | null } | null
  }>
}

export const useAdmissao = () => {
  const supabase = useSupabaseClient<Database>()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const empresaId = computed(() => authStore.profile?.id)

  // ─── Vagas com todos os candidatos ─────────────────────────────────────────
  const fetchVagasParaContratar = async (): Promise<VagaComCandidatos[]> => {
    if (!empresaId.value) return []
    loading.value = true
    error.value = null
    try {
      const { data: d1, error: e1 } = await supabase
        .from('vagas')
        .select(`*, candidaturas!candidaturas_vaga_id_fkey (id, talento_id, status, talento:usuarios!candidaturas_talento_id_fkey (nome, foto, profissao))`)
        .eq('empresa_id', empresaId.value)
        .order('data_publicacao', { ascending: false })

      let data: any[] = []
      if (e1) {
        // status ainda não existe — busca sem ele
        const { data: d2, error: e2 } = await supabase
          .from('vagas')
          .select(`*, candidaturas!candidaturas_vaga_id_fkey (id, talento_id, talento:usuarios!candidaturas_talento_id_fkey (nome, foto, profissao))`)
          .eq('empresa_id', empresaId.value)
          .order('data_publicacao', { ascending: false })
        if (e2) throw e2
        data = d2 ?? []
      } else {
        data = d1 ?? []
      }

      return data.map((vaga: any) => ({
        ...vaga,
        candidaturas: (vaga.candidaturas ?? []).map((c: any) => ({
          ...c,
          status: c.status ?? 'Pendente',
        })),
        candidaturas_aprovadas: (vaga.candidaturas ?? []).filter(
          (c: any) => c.status === 'Aprovado'
        ).length,
      }))
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // ─── Aprovar / Reprovar candidatura ────────────────────────────────────────
  const atualizarStatusCandidatura = async (
    candidaturaId: string,
    status: 'Aprovado' | 'Reprovado' | 'Pendente'
  ) => {
    const { error: err } = await supabase
      .from('candidaturas')
      .update({ status })
      .eq('id', candidaturaId)
    if (err) throw err
  }

  // ─── Admissões em andamento ─────────────────────────────────────────────────
  const fetchAdmissoes = async (): Promise<Admissao[]> => {
    if (!empresaId.value) return []
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('admissoes')
        .select(`
          *,
          talento:usuarios!admissoes_talento_id_fkey (nome, foto, profissao),
          vaga:vagas!admissoes_vaga_id_fkey (titulo)
        `)
        .eq('empresa_id', empresaId.value)
        .order('created_at', { ascending: false })

      if (err) throw err
      return (data ?? []) as Admissao[]
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // ─── Iniciar admissão ───────────────────────────────────────────────────────
  const iniciarAdmissao = async (payload: {
    talento_id: string
    vaga_id: string
    candidatura_id?: string
    cargo: string
    salario?: string
    regime: string
    jornada?: string
    data_inicio?: string
    observacoes?: string
  }) => {
    if (!empresaId.value) throw new Error('Não autenticado')
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('admissoes')
        .insert({
          ...payload,
          empresa_id: empresaId.value,
          status: 'Documentação',
        })
        .select()
        .single()

      if (err) throw err

      // Marca candidatura como Contratado
      if (payload.candidatura_id) {
        await supabase
          .from('candidaturas')
          .update({ status: 'Contratado' })
          .eq('id', payload.candidatura_id)
      }

      return { data, error: null }
    } catch (e: any) {
      error.value = e.message
      return { data: null, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // ─── Atualizar item do checklist ────────────────────────────────────────────
  const atualizarChecklist = async (
    admissaoId: string,
    item: string,
    valor: boolean,
    checklistAtual: Record<string, boolean>
  ) => {
    const novoChecklist = { ...checklistAtual, [item]: valor }
    const { error: err } = await supabase
      .from('admissoes')
      .update({ checklist: novoChecklist })
      .eq('id', admissaoId)

    if (err) throw err

    // Avança status automaticamente conforme progresso
    const total = Object.keys(novoChecklist).length
    const feitos = Object.values(novoChecklist).filter(Boolean).length
    const pct = feitos / total

    let novoStatus: string | null = null
    if (pct >= 1) novoStatus = 'eSocial'
    else if (pct >= 0.5) novoStatus = 'EmConferência'

    if (novoStatus) {
      await supabase
        .from('admissoes')
        .update({ status: novoStatus })
        .eq('id', admissaoId)
    }

    return novoChecklist
  }

  // ─── Gerar evento eSocial S-2200 ────────────────────────────────────────────
  const gerarEventoS2200 = async (admissao: Admissao) => {
    if (!empresaId.value) throw new Error('Não autenticado')
    loading.value = true
    error.value = null
    try {
      const protocolo = `1.${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`

      const { data, error: err } = await supabase
        .from('esocial_eventos')
        .insert({
          empresa_id: empresaId.value,
          admissao_id: admissao.id,
          evento_id: 'S-2200',
          titulo: `Admissão de Trabalhador — ${(admissao as any).talento?.nome ?? admissao.cargo}`,
          status: 'Pendente',
          protocolo,
          responsavel: authStore.profile?.nome ?? 'Empresa',
        })
        .select()
        .single()

      if (err) throw err

      // Marca admissão como Concluído
      await supabase
        .from('admissoes')
        .update({ status: 'Concluído' })
        .eq('id', admissao.id)

      return { data, error: null }
    } catch (e: any) {
      error.value = e.message
      return { data: null, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // ─── Eventos eSocial ────────────────────────────────────────────────────────
  const fetchEventosEsocial = async (): Promise<EsocialEvento[]> => {
    if (!empresaId.value) return []
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('esocial_eventos')
        .select('*')
        .eq('empresa_id', empresaId.value)
        .order('created_at', { ascending: false })

      if (err) throw err
      return (data ?? []) as EsocialEvento[]
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // ─── Utilitários ───────────────────────────────────────────────────────────
  const checklistLabels: Record<string, string> = {
    rg: 'RG / CNH',
    cpf: 'CPF',
    comprovante_residencia: 'Comprovante de Residência',
    foto_3x4: 'Foto 3x4',
    ctps: 'CTPS Digital',
    aso_admissional: 'ASO Admissional',
    contrato_assinado: 'Contrato Assinado',
    esocial_enviado: 'eSocial Enviado',
  }

  const progressoAdmissao = (checklist: Record<string, boolean>) => {
    const total = Object.keys(checklist).length
    const feitos = Object.values(checklist).filter(Boolean).length
    return total > 0 ? Math.round((feitos / total) * 100) : 0
  }

  return {
    loading,
    error,
    fetchVagasParaContratar,
    fetchAdmissoes,
    iniciarAdmissao,
    atualizarStatusCandidatura,
    atualizarChecklist,
    gerarEventoS2200,
    fetchEventosEsocial,
    checklistLabels,
    progressoAdmissao,
  }
}
