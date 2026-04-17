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
  views: 0
})

const recentJobs = ref<any[]>([])
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
    <EmpresaDashboardHeader />

    <!-- Card Estratégico de Prestador -->
    <EmpresaServiceProviderCard />

    <!-- Grid Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Coluna Central (Pipeline e Relatórios) -->
      <div class="lg:col-span-8 flex flex-col gap-8">
        <div class="flex-1">
          <EmpresaRecruitmentPipeline />
        </div>
        <div class="flex-1">
          <EmpresaOperationalReports :recent-jobs="recentJobs" :loading="loading" />
        </div>
      </div>

      <!-- Coluna Lateral (Compliance e Admissão Digital) -->
      <div class="lg:col-span-4 flex flex-col gap-8">
        <div class="flex-1">
          <EmpresaCompliancePanel />
        </div>
        <div class="flex-1">
          <EmpresaDigitalAdmission />
        </div>
      </div>
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
