<script setup lang="ts">
definePageMeta({
  noPadding: true
})
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database.types'

const route = useRoute()
const id = route.params.id
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()
const { translateError } = useTranslation()

// Buscar dados reais da vaga com join na empresa
const { data: job, error } = useAsyncData(`job-${id}`, async () => {
  const { data, error } = await (supabase
    .from('vagas')
    .select(`
      *,
      empresa:usuarios (*)
    `) as any)
    .eq('id', id as string)
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

const isVagaAtiva = computed(() => {
    if (!job.value) return true
    if (!job.value.encerramento) return true
    
    const agora = new Date()
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const parts = job.value.encerramento.split('-')
    if (parts.length !== 3) return true
    
    const [year, month, day] = parts.map(Number)
    const dataEnc = new Date(year, month - 1, day)
    
    return dataEnc >= hoje
})

const openInternalChat = async () => {
  if (!isVagaAtiva.value) {
    alert('Esta vaga já foi encerrada.')
    return
  }

  if (!authStore.profile) {
    alert('Você precisa estar logado para se candidatar.')
    navigateTo('/login')
    return
  }

  try {
     if (authStore.profile && job.value) {
        const [p1, p2] = [authStore.profile.id, job.value.empresa_id].sort()
        
        const { data: existing } = await supabase
            .from('conversas')
            .select('id')
            .eq('participante1_id', p1)
            .eq('participante2_id', p2)
            .maybeSingle()

        let conversaId = existing?.id

        if (!conversaId) {
            const { data: newConv, error } = await supabase
                .from('conversas')
                .insert({
                    participante1_id: p1,
                    participante2_id: p2,
                    tipo_contato: 'interno',
                    status_contratacao: 'interessado',
                    ultima_mensagem: `Candidatura (Interno): ${job.value.titulo}`
                })
                .select('id')
                .single()
            
            if (error) throw error
            conversaId = newConv.id
        }

        // Registrar candidatura de forma assíncrona
        supabase.from('candidaturas' as any).insert({
            vaga_id: job.value.id,
            talento_id: authStore.profile.id
        })

        return navigateTo(`/mensagens?id=${conversaId}`)
     }
  } catch (e) {
      console.error('Erro ao iniciar chat:', translateError(e))
  }
}

const openEmail = async () => {
  if (!isVagaAtiva.value) {
    alert('Esta vaga já foi encerrada.')
    return
  }

  if (!authStore.profile) {
    alert('Você precisa estar logado para se candidatar.')
    navigateTo('/login')
    return
  }

  if (authStore.profile?.tipo_conta === 'talento' && !isResumeComplete.value) {
    alert('Seu currículo está incompleto! Complete seu perfil com objetivo e habilidades para se candidatar.')
    navigateTo('/painel/talento/curriculo')
    return
  }

  const emailRaw = job.value?.email || (job.value?.empresa as any)?.email
  if (!emailRaw) {
    alert('Esta empresa não disponibilizou contato via e-mail para esta vaga.')
    return
  }

  // Registrar candidatura de forma assíncrona
  supabase.from('candidaturas' as any).insert({
      vaga_id: job.value.id,
      talento_id: authStore.profile.id
  })

  const subject = encodeURIComponent(`Candidatura: ${job.value.titulo} - PEBASPRO`)
  const body = encodeURIComponent(`Olá! Vi a vaga de "${job.value.titulo}" no PEBASPRO e gostaria de me candidatar. Em anexo envio meu interesse.`)
  window.location.href = `mailto:${emailRaw}?subject=${subject}&body=${body}`
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
                    <NuxtLink to="/curriculo/editar" class="block w-full py-4 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition shadow-lg shadow-yellow-600/20 active:scale-95">
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
                      <div class="text-blue-600 font-black text-xs uppercase tracking-tighter">Recomendado</div>
                    </div>

                    <div v-if="!isVagaAtiva" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
                        <p class="text-red-800 font-black text-lg mb-2">Vaga Encerrada</p>
                        <p class="text-red-700 text-sm font-medium">Esta oportunidade não aceita mais candidaturas.</p>
                    </div>

                    <div v-if="isVagaAtiva" class="space-y-3">
                        <button 
                            @click="openInternalChat" 
                            class="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            Enviar mensagens
                        </button>

                        <button 
                            v-if="job.tipo_contato === 'email' || job.tipo_contato === 'ambos'"
                            @click="openEmail" 
                            class="w-full h-[60px] flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white rounded-16 border-none font-black text-lg transition-transform active:scale-95 shadow-lg shadow-slate-900/10"
                        >
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            Candidatar via E-mail
                        </button>
                    </div>
                 </div>
            </div>
            
            <p class="direct-contact">Falando direto com o contratante</p>
            
            <p class="safety-tip">
              🛡️ <strong>Dica de segurança:</strong> O PEBASPRO não cobra taxas de candidatos. Nunca faça pagamentos para garantir vagas.
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
            <p class="company-bio">{{ (job.empresa as any)?.biografia || (job.empresa as any)?.sobre_mim || 'Esta empresa ainda não preencheu sua descrição completa.' }}</p>
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
.container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 24px 16px 40px 16px; 
}

@media (min-width: 768px) {
  .container {
    padding: 40px 20px 60px 20px;
  }
}

.job-layout { 
  display: grid; 
  grid-template-columns: 1fr 380px; 
  gap: 24px; 
}

@media (min-width: 768px) {
  .job-layout {
    gap: 40px;
  }
}

@media (max-width: 1024px) { .job-layout { grid-template-columns: 1fr; } }
 
.job-header-card { 
  background: white; 
  padding: 24px; 
  border-radius: 24px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
  margin-bottom: 24px; 
}

@media (min-width: 768px) {
  .job-header-card {
    padding: 48px;
  }
}

.job-top { 
  display: flex; 
  flex-wrap: wrap; 
  justify-content: space-between; 
  margin-bottom: 16px; 
  align-items: center; 
  gap: 12px; 
}

@media (min-width: 768px) {
  .job-top {
    margin-bottom: 24px;
  }
}

.job-type { 
  background-color: #f0fdf4; 
  color: #166534; 
  padding: 6px 12px; 
  border-radius: 20px; 
  font-size: 0.75rem; 
  font-weight: 800; 
  text-transform: uppercase; 
}

@media (min-width: 768px) {
  .job-type {
    padding: 8px 16px;
    font-size: 0.875rem;
  }
}

.job-date { 
  color: #94a3b8; 
  font-size: 0.85rem; 
  font-weight: 500; 
}

@media (min-width: 768px) {
  .job-date {
    font-size: 0.9rem;
  }
}
 
.job-header-card h1 { 
  font-size: 1.75rem; 
  font-weight: 900; 
  color: #0f172a; 
  margin-bottom: 12px; 
  line-height: 1.2; 
}

@media (min-width: 768px) {
  .job-header-card h1 {
    font-size: 2.75rem;
    margin-bottom: 16px;
  }
}

.job-subtitle { 
  display: flex; 
  flex-wrap: wrap; 
  align-items: center; 
  gap: 8px; 
  color: #4b5563; 
  font-size: 1rem; 
  font-weight: 600; 
}

@media (min-width: 768px) {
  .job-subtitle {
    gap: 16px;
    font-size: 1.125rem;
  }
}
.dot { 
  color: #d1d5db; 
  display: none; 
}

@media (min-width: 768px) {
  .dot {
    display: inline;
  }
}
 
.job-content-card { 
  background: white; 
  padding: 24px; 
  border-radius: 24px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
}

@media (min-width: 768px) {
  .job-content-card {
    padding: 48px;
  }
}

.content-section { 
  margin-bottom: 32px; 
}

@media (min-width: 768px) {
  .content-section {
    margin-bottom: 48px;
  }
}

.content-section:last-child { margin-bottom: 0; }
.content-section h3 { 
  font-size: 1.15rem; 
  font-weight: 800; 
  margin-bottom: 16px; 
  color: #1e293b; 
  position: relative; 
  padding-left: 16px; 
}

@media (min-width: 768px) {
  .content-section h3 {
    font-size: 1.4rem;
    margin-bottom: 24px;
  }
}
.content-section h3::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #268C52; border-radius: 2px; }
 
.description-text { 
  white-space: pre-line; 
  line-height: 1.7; 
  color: #374151; 
  font-size: 1rem; 
}

@media (min-width: 768px) {
  .description-text {
    line-height: 1.9;
    font-size: 1.15rem;
  }
}
 
.job-sidebar { display: flex; flex-direction: column; gap: 24px; }
.apply-card, .company-card { 
  background: white; 
  padding: 24px; 
  border-radius: 24px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
}

@media (min-width: 768px) {
  .apply-card, .company-card {
    padding: 32px;
  }
}
 
.price-box { 
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
  padding: 24px 20px; 
  border-radius: 20px; 
  text-align: center; 
  margin-bottom: 24px; 
  border: 1px solid #e2e8f0; 
}

@media (min-width: 768px) {
  .price-box {
    padding: 32px 24px;
    margin-bottom: 32px;
  }
}
.price-box .label { 
  display: block; 
  font-size: 0.75rem; 
  color: #64748b; 
  margin-bottom: 8px; 
  font-weight: 600; 
  text-transform: uppercase; 
}

@media (min-width: 768px) {
  .price-box .label {
    font-size: 0.875rem;
  }
}

.price-box .value { 
  font-size: 1.5rem; 
  font-weight: 900; 
  color: #1e293b; 
}

@media (min-width: 768px) {
  .price-box .value {
    font-size: 1.75rem;
  }
}
 
.job-details-list { 
  margin-bottom: 24px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

@media (min-width: 768px) {
  .job-details-list {
    margin-bottom: 32px;
    gap: 16px;
  }
}

.detail-item { 
  display: flex; 
  justify-content: space-between; 
  font-size: 0.9rem; 
}

@media (min-width: 768px) {
  .detail-item {
    font-size: 0.95rem;
  }
}
.detail-item.warning .val { color: #dc2626; font-weight: 700; }
.detail-item .label { color: #64748b; font-weight: 500; }
.detail-item .val { color: #1e293b; font-weight: 700; }
 
.full-width { width: 100%; }
.rounded-16 { border-radius: 16px; }
.btn-primary { 
  height: 56px; 
  background: linear-gradient(to right, #25D366, #128C7E); 
  color: white; 
  border: none; 
  border-radius: 16px; 
  font-size: 1rem; 
  font-weight: 800; 
  cursor: pointer; 
  transition: all 0.3s; 
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2); 
}

@media (min-width: 768px) {
  .btn-primary {
    height: 60px;
    font-size: 1.1rem;
  }
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3); }
 
.direct-contact { 
  text-align: center; 
  font-size: 0.8rem; 
  color: #94a3b8; 
  margin-top: 12px; 
  font-weight: 500; 
}

@media (min-width: 768px) {
  .direct-contact {
    font-size: 0.85rem;
  }
}
.safety-tip { 
  margin-top: 24px; 
  font-size: 0.75rem; 
  color: #64748b; 
  line-height: 1.6; 
  padding: 14px; 
  background: #fffbeb; 
  border-radius: 12px; 
  border: 1px solid #fef3c7; 
}

@media (min-width: 768px) {
  .safety-tip {
    margin-top: 32px;
    font-size: 0.8rem;
    padding: 16px;
  }
}
 
.company-mini-info { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin-bottom: 20px; 
}

@media (min-width: 768px) {
  .company-mini-info {
    gap: 16px;
    margin-bottom: 24px;
  }
}
.mini-logo { 
  width: 44px; 
  height: 44px; 
  background: #f1f5f9; 
  border-radius: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: 800; 
  color: #268C52; 
  font-size: 1.1rem; 
}

@media (min-width: 768px) {
  .mini-logo {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}
.bold { 
  font-weight: 800; 
  color: #1e293b; 
  font-size: 1rem; 
}

@media (min-width: 768px) {
  .bold {
    font-size: 1.1rem;
  }
}
.light { 
  color: #64748b; 
  font-size: 0.85rem; 
}

@media (min-width: 768px) {
  .light {
    font-size: 0.9rem;
  }
}
.company-bio { 
  font-size: 0.9rem; 
  color: #4b5563; 
  line-height: 1.6; 
  margin-bottom: 20px; 
}

@media (min-width: 768px) {
  .company-bio {
    font-size: 0.95rem;
    margin-bottom: 24px;
  }
}
.view-company { 
  color: #268C52; 
  text-decoration: none; 
  font-weight: 700; 
  font-size: 0.9rem; 
  display: block; 
  text-align: center; 
  padding: 10px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  transition: all 0.2s; 
}

@media (min-width: 768px) {
  .view-company {
    font-size: 0.95rem;
    padding: 12px;
  }
}
.view-company:hover { background: #f8fafc; border-color: #268C52; }
 
.capitalize { text-transform: capitalize; }
.error-state, .loading-state { 
  text-align: center; 
  padding: 80px 20px; 
}

@media (min-width: 768px) {
  .error-state, .loading-state {
    padding: 100px 20px;
  }
}
</style>
