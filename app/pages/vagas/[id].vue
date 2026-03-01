<script setup lang="ts">
definePageMeta({
  noPadding: true
})
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const route = useRoute()
const id = route.params.id
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()

// Buscar dados reais da vaga com join na empresa
const { data: job, error } = useAsyncData(`job-${id}`, async () => {
  const { data, error } = await (supabase
    .from('vagas')
    .select(`
      *,
      empresa:usuarios (*)
    `) as any)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}, { lazy: true })

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Verifica se o currículo está completo para habilitar o botão
const isResumeComplete = computed(() => {
    if (!authStore.profile) return false
    
    // Prefer the explicit flag if it exists/is reliable
    if (authStore.profile.cadastro_completo) return true

    // Fallback check
    return !!(
        authStore.profile.objetivo_profissional && 
        authStore.profile.habilidades && 
        authStore.profile.habilidades.length > 0
    )
})

const openWhatsApp = async () => {
  // Verificar se o usuário está logado
  if (!authStore.profile) {
    alert('Você precisa estar logado para se candidatar.')
    navigateTo('/login')
    return
  }

  if (!isResumeComplete.value) {
    alert('Seu currículo está incompleto! Complete seu perfil com objetivo e habilidades para se candidatar.')
    navigateTo('/painel/talento/curriculo')
    return
  }

  // Registrar candidatura no banco para métricas da empresa
  try {
     await supabase.from('candidaturas').insert({
        vaga_id: job.value.id,
        talento_id: authStore.user.id
     })
  } catch (e) {
      console.error('Erro ao registrar candidatura:', e)
  }

  if (!job.value?.whatsapp) return
  const phone = job.value.whatsapp.replace(/\D/g, '')
  const message = encodeURIComponent(`Olá, vi a vaga de "${job.value.titulo}" no PebasPro e gostaria de mais informações.`)
  window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')
}
</script>

<template>
  <div class="job-detail-page">

    <main class="container">
      <div v-if="job" class="job-layout">
        <!-- Coluna Principal -->
        <section class="job-main">
          <div class="job-header-card">
            <div class="job-top">
              <span class="job-type">{{ job.tipo }}</span>
              <span class="job-date">Publicado em {{ formatDate(job.data_publicacao) }}</span>
            </div>
            <h1>{{ job.titulo }}</h1>
            <div class="job-subtitle">
              <span class="company-name">🏢 {{ (job.empresa as any)?.nome }}</span>
              <span class="dot">•</span>
              <span class="location">📍 {{ job.local }}</span>
            </div>
          </div>

          <div class="job-content-card">
            <div class="content-section">
              <h3>Descrição da Oportunidade</h3>
              <p class="description-text">{{ job.descricao }}</p>
            </div>

            <div v-if="job.requisitos" class="content-section">
              <h3>Requisitos e Qualificações</h3>
              <p class="description-text">{{ job.requisitos }}</p>
            </div>

            <div v-if="job.beneficios" class="content-section">
              <h3>Benefícios</h3>
              <p class="description-text">{{ job.beneficios }}</p>
            </div>
          </div>
        </section>

        <!-- Sidebar de Ação -->
        <aside class="job-sidebar">
          <div class="apply-card">
            <div class="price-box">
              <span class="label">Remuneração Estipulada</span>
              <span class="value">{{ job.salario || 'A combinar' }}</span>
            </div>
            
            <div class="job-details-list">
              <div class="detail-item">
                <span class="label">Jornada:</span>
                <span class="val">{{ job.jornada }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Modalidade:</span>
                <span class="val capitalize">{{ job.modalidade }}</span>
              </div>
              <div v-if="job.encerramento" class="detail-item warning">
                <span class="label">Encerra em:</span>
                <span class="val">{{ formatDate(job.encerramento) }}</span>
              </div>
            </div>

            <div class="apply-buttons space-y-3">
                 <!-- VISITOR (Not Logged In) -->
                 <div v-if="!user" class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
                    <p class="text-green-800 font-black text-lg mb-2">Interessado nesta vaga?</p>
                    <p class="text-green-700 text-sm mb-6 font-medium">Crie sua conta ou faça login para falar diretamente com o contratante.</p>
                    <div class="grid grid-cols-1 gap-3">
                        <NuxtLink to="/login" class="block w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20 active:scale-95">
                            Fazer Login
                        </NuxtLink>
                        <NuxtLink to="/cadastro" class="block w-full py-4 bg-white text-green-600 border-2 border-green-600 rounded-xl font-bold hover:bg-green-50 transition active:scale-95">
                            Criar Conta Grátis
                        </NuxtLink>
                    </div>
                </div>

                 <!-- LOGGED BUT INCOMPLETE RESUME (Only for Talents) -->
                 <div v-else-if="authStore.profile?.tipo_conta === 'talento' && !isResumeComplete" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center shadow-sm">
                    <p class="text-yellow-800 font-black text-lg mb-2">Currículo Incompleto</p>
                    <p class="text-yellow-700 text-sm mb-6 font-medium">Para se candidatar, você precisa completar seu perfil profissional com objetivo e habilidades.</p>
                    <NuxtLink to="/painel/talento/curriculo" class="block w-full py-4 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition shadow-lg shadow-yellow-600/20 active:scale-95">
                        Completar Currículo Agora
                    </NuxtLink>
                </div>

                 <!-- LOGGED AND READY (OR NOT A TALENT) -->
                 <div v-else class="space-y-4">
                    <!-- Match Badge (Only for Talents) -->
                    <div v-if="authStore.profile?.tipo_conta === 'talento'" class="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-4 group cursor-help transition-all hover:bg-blue-100">
                      <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-600 text-white rounded-lg">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div>
                            <p class="text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none">Seu Potencial</p>
                            <p class="text-blue-900 font-black text-lg leading-tight">98% de Match</p>
                        </div>
                      </div>
                      <div class="text-blue-600 font-black text-xs uppercase tracking-tighter">Muito Reco.</div>
                    </div>

                    <button 
                        @click="openWhatsApp" 
                        class="btn-primary w-full flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Candidatar via WhatsApp
                    </button>
                 </div>
            </div>
            
            <p class="direct-contact">Falando direto com o contratante</p>
            
            <p class="safety-tip">
              🛡️ <strong>Dica de segurança:</strong> O PebasPro não cobra taxas de candidatos. Nunca faça pagamentos para garantir vagas.
            </p>
          </div>

          <div class="company-card">
            <h3>Sobre a Empresa</h3>
            <div class="company-mini-info">
              <div class="mini-logo">
                <img v-if="(job.empresa as any)?.foto" :src="(job.empresa as any)?.foto" :alt="(job.empresa as any)?.nome" />
                <span v-else>{{ (job.empresa as any)?.nome?.charAt(0) }}</span>
              </div>
              <div>
                <p class="bold">{{ (job.empresa as any)?.nome }}</p>
                <p class="light">{{ (job.empresa as any)?.regiao || 'Na região' }}</p>
              </div>
            </div>
            <p class="company-bio">{{ (job.empresa as any)?.biografia || 'Esta empresa ainda não preencheu sua descrição completa.' }}</p>
            <NuxtLink v-if="job.empresa_id" :to="`/empresas/${job.empresa_id}`" class="view-company">Ver todos os detalhes</NuxtLink>
          </div>
        </aside>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Vaga não encontrada</h2>
        <p>A vaga que você procura pode ter sido encerrada ou removida.</p>
        <NuxtLink to="/vagas" class="btn-outline">Voltar para listagem</NuxtLink>
      </div>

      <div v-else class="loading-state">
        Buscando detalhes da vaga...
      </div>
    </main>

  </div>
</template>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px 60px 20px; }
.job-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
@media (max-width: 1024px) { .job-layout { grid-template-columns: 1fr; } }

.job-header-card { background: white; padding: 48px; border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 24px; }
.job-top { display: flex; justify-content: space-between; margin-bottom: 24px; align-items: center; }
.job-type { background-color: #f0fdf4; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 800; text-transform: uppercase; }
.job-date { color: #94a3b8; font-size: 0.9rem; font-weight: 500; }

.job-header-card h1 { font-size: 2.75rem; font-weight: 900; color: #0f172a; margin-bottom: 16px; line-height: 1.2; }
.job-subtitle { display: flex; align-items: center; gap: 16px; color: #4b5563; font-size: 1.125rem; font-weight: 500; }
.dot { color: #d1d5db; }

.job-content-card { background: white; padding: 48px; border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.content-section { margin-bottom: 48px; }
.content-section:last-child { margin-bottom: 0; }
.content-section h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 24px; color: #1e293b; position: relative; padding-left: 16px; }
.content-section h3::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #268C52; border-radius: 2px; }

.description-text { white-space: pre-line; line-height: 1.9; color: #374151; font-size: 1.15rem; }

.job-sidebar { display: flex; flex-direction: column; gap: 24px; }
.apply-card, .company-card { background: white; padding: 32px; border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }

.price-box { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 24px; border-radius: 20px; text-align: center; margin-bottom: 32px; border: 1px solid #e2e8f0; }
.price-box .label { display: block; font-size: 0.875rem; color: #64748b; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; }
.price-box .value { font-size: 1.75rem; font-weight: 900; color: #1e293b; }

.job-details-list { margin-bottom: 32px; display: flex; flex-direction: column; gap: 16px; }
.detail-item { display: flex; justify-content: space-between; font-size: 0.95rem; }
.detail-item.warning .val { color: #dc2626; font-weight: 700; }
.detail-item .label { color: #64748b; font-weight: 500; }
.detail-item .val { color: #1e293b; font-weight: 700; }

.full-width { width: 100%; }
.btn-primary { height: 60px; background: linear-gradient(to right, #25D366, #128C7E); color: white; border: none; border-radius: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3); }

.direct-contact { text-align: center; font-size: 0.85rem; color: #94a3b8; margin-top: 12px; font-weight: 500; }
.safety-tip { margin-top: 32px; font-size: 0.8rem; color: #64748b; line-height: 1.6; padding: 16px; background: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; }

.company-mini-info { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.mini-logo { width: 48px; height: 48px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #268C52; font-size: 1.25rem; }
.bold { font-weight: 800; color: #1e293b; font-size: 1.1rem; }
.light { color: #64748b; font-size: 0.9rem; }
.company-bio { font-size: 0.95rem; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
.view-company { color: #268C52; text-decoration: none; font-weight: 700; font-size: 0.95rem; display: block; text-align: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; transition: all 0.2s; }
.view-company:hover { background: #f8fafc; border-color: #268C52; }

.capitalize { text-transform: capitalize; }
.error-state, .loading-state { text-align: center; padding: 100px 20px; }
</style>
