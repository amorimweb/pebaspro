<script setup lang="ts">
definePageMeta({
  noPadding: false
})
const userStore = useAuthStore()
const supabase = useSupabaseClient()
const route = useRoute()
const search = ref((route.query.search as string) || '')
const selectedType = ref('')
const isLoggedIn = computed(() => !!userStore.user)
 
const hojeISO = new Date().toISOString().split('T')[0]
 
// Integramos com a tabela real 'vagas' e fazemos join com 'usuarios' para pegar o nome da empresa
const { data: jobs, refresh, pending, error } = await useAsyncData<any[]>('vagas-list', async () => {
  const agora = new Date()
 
  let query = supabase
    .from('vagas')
    .select(`
      *,
      empresa:usuarios ( nome )
    `)
    .order('data_publicacao', { ascending: false })
 
  if (search.value) {
    query = query.ilike('titulo', `%${search.value}%`)
  }
  
  if (selectedType.value) {
    query = query.eq('tipo', selectedType.value)
  }
 
  // Apenas vagas abertas (Removido para mostrar todas com badge)
  // query = query.or(`encerramento.is.null,encerramento.gte.${hojeISO}`)
 
  const { data, error } = await query
  if (error) throw error
  
  // Ordenar: Encerradas por último, mantendo a ordem de publicação
  return (data || []).sort((a, b) => {
    const isClosedA = a.encerramento && a.encerramento < hojeISO
    const isClosedB = b.encerramento && b.encerramento < hojeISO
    if (isClosedA && !isClosedB) return 1
    if (!isClosedA && isClosedB) return -1
    return 0
  })
}, {
  watch: [selectedType] // Recarregar quando o tipo mudar
})
 
const isExpired = (job: any) => job.encerramento && job.encerramento < hojeISO
 
const handleSearch = () => {
  refresh()
}
 
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
</script>

<template>
  <div class="vagas-page">

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header class="vagas-header">
        <h1>Vagas na Região</h1>
        <p>Acompanhe as últimas oportunidades publicadas na região.</p>
      </header>

      <div class="vagas-layout">
        <!-- Sidebar Filtros -->
        <aside class="filters-sidebar">
          <div class="filter-group">
            <h3>O que você busca?</h3>
            <div class="search-wrapper">
              <input 
                v-model="search" 
                @keyup.enter="handleSearch"
                type="text" 
                placeholder="Cargo ou palavra-chave" 
                class="search-field" 
              />
              <button @click="handleSearch" class="search-btn-icon">🔍</button>
            </div>
          </div>

          <div class="filter-group">
            <h3>Tipo de Contrato</h3>
            <div class="categories-list">
              <label class="filter-label">
                <input type="radio" v-model="selectedType" value="" @change="handleSearch" />
                <span>Todos os tipos</span>
              </label>
              <label v-for="t in ['CLT', 'PJ', 'Freelance', 'Estágio']" :key="t" class="filter-label">
                <input type="radio" v-model="selectedType" :value="t" @change="handleSearch" />
                <span>{{ t }}</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Listagem de Vagas Real -->
        <section class="jobs-list">
          <div v-if="pending" class="loading-state">
            <div class="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p class="text-lg font-bold text-slate-600">Buscando as melhores oportunidades...</p>
          </div>

          <div v-else-if="error" class="error-list-state">
            <span class="error-icon">⚠️</span>
            <h3>Ops! Algo deu errado</h3>
            <p>{{ error.message || 'Não foi possível carregar as vagas no momento.' }}</p>
            <button @click="() => refresh()" class="retry-btn">Tentar Novamente</button>
          </div>
          
          <template v-else-if="jobs && jobs.length > 0">
            <div
              v-for="job in jobs"
              :key="job.id"
              class="job-card group"
              :class="{ 'job-card--expired': isExpired(job) }"
            >
              <div class="job-info flex-1">
                <div class="job-header flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="job-type font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border"
                      :class="isExpired(job)
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-green-50 text-green-700 border-green-100'"
                    >
                      {{ job.tipo }}
                    </span>
                    <span class="job-date text-xs text-slate-400 font-bold">
                      {{ formatDate(job.data_publicacao) }}
                    </span>
                  </div>
                  
                  <!-- Badge encerrada -->
                  <span v-if="isExpired(job)" class="expired-badge">
                    ⏸ Encerrada
                  </span>

                  <!-- Match Badge (Only for active + Talents) -->
                  <div v-else-if="userStore.profile?.tipo_conta === 'talento'" class="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-pulse">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                    <span class="text-[10px] font-black uppercase tracking-tighter">98% Match</span>
                  </div>
                </div>

                <h2
                  class="job-title text-2xl font-black mb-2 transition-colors flex items-center gap-3"
                  :class="isExpired(job) ? 'text-slate-400' : 'text-slate-900 group-hover:text-green-600'"
                >
                  {{ job.titulo }}
                </h2>
                <p class="job-company text-lg font-bold mb-6 italic" :class="isExpired(job) ? 'text-slate-400' : 'text-slate-500'">
                   {{ (job.empresa as any)?.nome || 'Empresa Privada' }}
                </p>
                
                <div class="job-meta flex flex-wrap gap-6 text-sm">
                  <div class="meta-item flex items-center gap-2 font-medium" :class="isExpired(job) ? 'text-slate-400' : 'text-slate-600'">
                    <div class="p-2 rounded-lg" :class="isExpired(job) ? 'bg-slate-50' : 'bg-slate-100'"><span class="icon">📍</span></div>
                    <span>{{ job.local }}</span>
                  </div>
                  <div class="meta-item flex items-center gap-2 font-medium" :class="isExpired(job) ? 'text-slate-400' : 'text-slate-600'">
                    <div class="p-2 rounded-lg" :class="isExpired(job) ? 'bg-slate-50' : 'bg-slate-100'"><span class="icon">💰</span></div>
                    <span class="font-bold">{{ job.salario || 'Valor a negociar' }}</span>
                  </div>
                  <div class="meta-item flex items-center gap-2 font-medium" :class="isExpired(job) ? 'text-slate-400' : 'text-slate-600'">
                    <div class="p-2 rounded-lg" :class="isExpired(job) ? 'bg-slate-50' : 'bg-slate-100'"><span class="icon">🏢</span></div>
                    <span class="capitalize">{{ job.modalidade }}</span>
                  </div>
                </div>
              </div>
              
              <div class="job-actions shrink-0 ml-8">
                <NuxtLink
                  :to="`/vagas/${job.id}`"
                  class="details-btn block text-center min-w-[180px]"
                  :class="{ 'details-btn--expired': isExpired(job) }"
                >
                  {{ isExpired(job) ? 'Ver Vaga (Encerrada)' : (isLoggedIn ? 'Ver Detalhes' : 'Entrar para Candidatar') }}
                </NuxtLink>
              </div>
            </div>
          </template>

          <div v-else class="empty-state">
            <div class="empty-illustration">🔍</div>
            <h3>Busca Vazia</h3>
            <p>Não encontramos vagas com esses termos. Tente limpar os filtros ou buscar por algo diferente.</p>
            <button @click="search = ''; selectedType = ''; refresh()" class="clear-filters-btn">Limpar Filtros</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.vagas-page { background-color: #f8fafc; min-height: 100vh; }
.vagas-container { width: 100%; }
.vagas-header { 
  margin-bottom: 32px; 
  text-align: left; 
}

@media (min-width: 768px) {
  .vagas-header {
    margin-bottom: 48px;
  }
}

.vagas-header h1 { 
  font-size: 1.875rem; 
  font-weight: 800; 
  color: #1e293b; 
  margin-bottom: 8px; 
}

@media (min-width: 768px) {
  .vagas-header h1 {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }
}

.vagas-header p { 
  font-size: 1rem; 
  color: #64748b; 
}

@media (min-width: 768px) {
  .vagas-header p {
    font-size: 1.125rem;
  }
}
 
.vagas-layout { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 24px; 
}

@media (min-width: 1024px) {
  .vagas-layout {
    grid-template-columns: 300px 1fr;
  }
}

@media (min-width: 768px) {
  .vagas-layout {
    gap: 40px;
  }
}
 
.filters-sidebar { 
  background: white; 
  padding: 24px; 
  border-radius: 24px; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
  height: fit-content; 
}

@media (min-width: 768px) {
  .filters-sidebar {
    padding: 32px;
  }
}

.filter-group { 
  margin-bottom: 24px; 
}

@media (min-width: 768px) {
  .filter-group {
    margin-bottom: 32px;
  }
}

.filter-group h3 { 
  font-size: 1rem; 
  font-weight: 700; 
  margin-bottom: 16px; 
  color: #1e293b; 
}

@media (min-width: 768px) {
  .filter-group h3 {
    font-size: 1.1rem;
    margin-bottom: 20px;
  }
}
 
.search-wrapper { position: relative; }
.search-field { 
  width: 100%; 
  height: 44px; 
  padding: 0 44px 0 16px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  outline: none; 
  transition: border-color 0.2s; 
}

@media (min-width: 768px) {
  .search-field {
    height: 48px;
  }
}
.search-field:focus { border-color: #268C52; }
.search-btn-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.1rem; cursor: pointer; }
 
.categories-list { 
  display: flex; 
  flex-direction: row; 
  flex-wrap: wrap; 
  gap: 8px; 
}

@media (min-width: 768px) {
  .categories-list {
    flex-direction: column;
    gap: 14px;
  }
}

.filter-label { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  cursor: pointer; 
  color: #4b5563; 
  font-weight: 500; 
  font-size: 0.875rem; 
  background: #f8fafc; 
  padding: 6px 12px; 
  border-radius: 999px; 
  border: 1px solid #e2e8f0; 
}

@media (min-width: 768px) {
  .filter-label {
    gap: 12px;
    font-size: 1rem;
    background: transparent;
    padding: 0;
    border-radius: 0;
    border: none;
  }
}
.filter-label:has(input:checked) { background: #f0fdf4; border-color: #268C52; color: #166534; }
.filter-label input[type="radio"] { 
  width: 16px; 
  height: 16px; 
  accent-color: #268C52; 
  display: none; 
}

@media (min-width: 768px) {
  .filter-label input[type="radio"] {
    display: block;
  }
}
 
.jobs-list { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
}

@media (min-width: 768px) {
  .jobs-list {
    gap: 24px;
  }
}

.job-card { 
  background: white; 
  padding: 20px; 
  border-radius: 24px; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  align-items: stretch; 
  transition: all 0.3s; 
  border: 1px solid transparent; 
}

@media (min-width: 768px) {
  .job-card {
    padding: 32px;
    flex-direction: row;
    align-items: center;
  }
}
 
@media (min-width: 641px) { .job-card { align-items: center; } }
 
.job-type { 
  background-color: #f0fdf4; 
  color: #166534; 
  padding: 4px 10px; 
  border-radius: 20px; 
  font-size: 0.65rem; 
  font-weight: 800; 
  text-transform: uppercase; 
}

@media (min-width: 768px) {
  .job-type {
    padding: 6px 14px;
    font-size: 0.75rem;
  }
}

.job-date { 
  font-size: 0.75rem; 
  color: #94a3b8; 
  font-weight: 500; 
}

@media (min-width: 768px) {
  .job-date {
    font-size: 0.875rem;
  }
}

.job-title { 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: #0f172a; 
  margin-bottom: 4px; 
}

@media (min-width: 768px) {
  .job-title {
    font-size: 1.5rem;
    margin-bottom: 6px;
  }
}

.job-company { 
  color: #268C52; 
  font-weight: 700; 
  font-size: 0.95rem; 
  margin-bottom: 16px; 
}

@media (min-width: 768px) {
  .job-company {
    font-size: 1.05rem;
    margin-bottom: 20px;
  }
}

.job-meta { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  color: #64748b; 
  font-size: 0.875rem; 
}

@media (min-width: 768px) {
  .job-meta {
    gap: 24px;
    font-size: 0.95rem;
  }
}

.meta-item { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
}

@media (min-width: 768px) {
  .meta-item {
    gap: 8px;
  }
}
 
.job-actions { 
  margin-top: 20px; 
}

@media (min-width: 768px) {
  .job-actions {
    margin-top: 0;
    margin-left: 32px;
  }
}

.details-btn { 
  background: linear-gradient(to right, #268C52, #177486); 
  color: white; 
  padding: 12px 24px; 
  border-radius: 12px; 
  text-decoration: none; 
  font-weight: 700; 
  transition: all 0.2s; 
  white-space: nowrap; 
  text-align: center; 
  width: 100%; 
}

@media (min-width: 768px) {
  .details-btn {
    padding: 14px 28px;
    width: auto;
  }
}
 
.empty-state { 
  text-align: center; 
  padding: 60px 20px; 
  color: #64748b; 
  background: white; 
  border-radius: 32px; 
  border: 2px dashed #e2e8f0; 
}

@media (min-width: 768px) {
  .empty-state {
    padding: 100px 0;
  }
}

.empty-illustration { 
  font-size: 4rem; 
  margin-bottom: 20px; 
  display: block; 
  filter: grayscale(1); 
  opacity: 0.5; 
}

@media (min-width: 768px) {
  .empty-illustration {
    font-size: 5rem;
    margin-bottom: 24px;
  }
}

.empty-state h3 { 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: #1e293b; 
  margin-bottom: 8px; 
}

@media (min-width: 768px) {
  .empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }
}

.empty-state p { 
  margin-bottom: 24px; 
  max-width: 400px; 
  margin-left: auto; 
  margin-right: auto; 
  font-size: 0.875rem; 
}

@media (min-width: 768px) {
  .empty-state p {
    margin-bottom: 32px;
    font-size: 1rem;
  }
}

.clear-filters-btn, .retry-btn { padding: 12px 24px; background: #268C52; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.clear-filters-btn:hover, .retry-btn:hover { background: #1a633a; transform: translateY(-2px); }

.error-list-state { text-align: center; padding: 60px; background: #fef2f2; border-radius: 24px; border: 1px solid #fee2e2; }
.error-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
.error-list-state h3 { color: #991b1b; font-weight: 800; margin-bottom: 8px; }
.error-list-state p { color: #b91c1c; opacity: 0.8; margin-bottom: 24px; }

.loading-state { text-align: center; padding: 100px; }
</style>
