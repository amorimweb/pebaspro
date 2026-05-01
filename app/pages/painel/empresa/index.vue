<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Database } from '~/types'
import { 
  DashboardHeader,
  ServiceProviderCard,
  RecruitmentPipeline,
  OperationalReports,
  CompliancePanel,
  DigitalAdmission
} from '#components'

definePageMeta({
  layout: 'empresa-master'
})

const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const stats = ref({
  activeJobs: 0,
  totalCandidates: 0,
  activeAdmissions: 0,
  views: 0
})

const recentJobs = ref<any[]>([])
const recentCandidates = ref<any[]>([])
const recentAdmissions = ref<any[]>([])
const complianceAlerts = ref<any[]>([])
const jobsByCategory = ref<any[]>([])
const loading = ref(true)

const fetchDashboard = async () => {
  const userId = authStore.profile?.id || user.value?.id
  if (!userId || userId === 'undefined') return
    
  loading.value = true
  try {
    const agoraStr = new Date().toISOString().split('T')[0]
    
    // Contagem de Vagas Ativas
    const { count: jobsCount } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', userId)
      .or(`encerramento.is.null,encerramento.gte.${agoraStr}`)
    stats.value.activeJobs = jobsCount || 0

    // Contagem de Candidaturas Totais
    const { data: myJobs } = await supabase
      .from('vagas')
      .select('id')
      .eq('empresa_id', userId)
        
    if (myJobs && myJobs.length > 0) {
      const jobIds = myJobs.map(j => j.id)
      const { count: candCount } = await supabase
        .from('candidaturas')
        .select('*', { count: 'exact', head: true })
        .in('vaga_id', jobIds)
      stats.value.totalCandidates = candCount || 0
    }

    // Busca de Vagas Recentes
    const { data: jobs } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', userId)
      .order('data_publicacao', { ascending: false })
      .limit(5)
    recentJobs.value = jobs || []

    // Contagem de Visualizações do Perfil
    const { count: viewsCount } = await supabase
      .from('visualizacoes_vitrine')
      .select('*', { count: 'exact', head: true })
      .eq('vitrine_id', userId)
    stats.value.views = viewsCount || 0

    // Contagem de Admissões Ativas
    const { count: admCount } = await supabase
      .from('admissoes')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', userId)
      .neq('status', 'Concluído')
    stats.value.activeAdmissions = admCount || 0

    // Busca de Candidaturas Recentes
    const { data: cands } = await supabase
      .from('candidaturas')
      .select(`
        id,
        status,
        created_at,
        vaga:vagas(titulo),
        talento:usuarios(id, nome, profissao, regiao, foto)
      `)
      .in('vaga_id', myJobs?.map(j => j.id) || [])
      .order('created_at', { ascending: false })
      .limit(6)
    recentCandidates.value = cands || []

    // Busca de Admissões Recentes
    const { data: adms } = await supabase
      .from('admissoes')
      .select(`
        id,
        status,
        cargo,
        checklist,
        talento:usuarios(id, nome, foto)
      `)
      .eq('empresa_id', userId)
      .order('updated_at', { ascending: false })
      .limit(4)
    recentAdmissions.value = adms || []

    // Estatísticas de Vagas por Categoria
    const { data: catStats } = await supabase
      .from('vagas')
      .select('categoria:categorias(nome)')
      .eq('empresa_id', userId)
    
    if (catStats) {
      const counts: Record<string, number> = {}
      catStats.forEach(v => {
        const name = (v.categoria as any)?.nome || 'Outros'
        counts[name] = (counts[name] || 0) + 1
      })
      const total = catStats.length
      jobsByCategory.value = Object.entries(counts).map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        color: 'bg-green-600' // Pode ser dinâmico depois
      }))
    }

    // Alertas de Compliance (Simulado por enquanto baseado em dados reais)
    const { data: esocialErrors } = await supabase
      .from('esocial_eventos')
      .select('*')
      .eq('empresa_id', userId)
      .in('status', ['Erro', 'Pendente'])
      .limit(3)
    
    const alerts: any[] = []
    if (esocialErrors) {
      esocialErrors.forEach(e => {
        alerts.push({
          id: e.id,
          title: `Erro eSocial: ${e.evento_id}`,
          date: e.status === 'Erro' ? 'Falha na transmissão' : 'Aguardando envio',
          status: 'crítico',
          type: 'eSocial',
          icon: 'ShieldAlert'
        })
      })
    }

    const { data: pendingAdmissions } = await supabase
      .from('admissoes')
      .select('*, talento:usuarios(nome)')
      .eq('empresa_id', userId)
      .eq('status', 'Documentação')
      .limit(2)
    
    if (pendingAdmissions) {
      pendingAdmissions.forEach(a => {
        alerts.push({
          id: a.id,
          title: `Docs Pendentes: ${a.talento?.nome || 'Candidato'}`,
          date: 'Início próximo',
          status: 'atenção',
          type: 'Admissão',
          icon: 'Activity'
        })
      })
    }
    complianceAlerts.value = alerts

  } catch (e) {
    console.error('Error loading dashboard:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})

watch(() => authStore.profile, (newProfile) => {
  if (newProfile?.id) fetchDashboard()
}, { immediate: true })
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-1000">
    <!-- Header com os KPIs reais do backup -->
    <DashboardHeader :stats="stats" />

    <!-- Card Estratégico de Prestador -->
    <ServiceProviderCard />

    <!-- Grid Principal - Cada componente em uma linha -->
    <div class="grid grid-cols-1 gap-8">
      <DigitalAdmission :admissions="recentAdmissions" :loading="loading" />
      <RecruitmentPipeline :candidates="recentCandidates" :loading="loading" />
      <CompliancePanel :alerts="complianceAlerts" :loading="loading" />
      <OperationalReports 
        :recent-jobs="recentJobs" 
        :category-stats="jobsByCategory"
        :stats-overview="stats"
        :loading="loading" 
      />
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
