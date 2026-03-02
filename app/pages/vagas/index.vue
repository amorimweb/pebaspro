<script setup lang="ts">
definePageMeta({
  noPadding: true
})
const userStore = useAuthStore()
const supabase = useSupabaseClient()
const route = useRoute()
const search = ref((route.query.search as string) || '')
const selectedType = ref('')
const isLoggedIn = computed(() => !!userStore.user)

// Integramos com a tabela real 'vagas' e fazemos join com 'usuarios' para pegar o nome da empresa
const { data: jobs, refresh, pending, error } = await useAsyncData<any[]>('vagas-list', async () => {
  const agora = new Date()
  const hojeISO = agora.toISOString().split('T')[0] // 'YYYY-MM-DD'

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

  // Apenas vagas abertas (sem data de encerramento OU com data de encerramento >= hoje)
  query = query.or(`encerramento.is.null,encerramento.gte.${hojeISO}`)

  const { data, error } = await query
  if (error) throw error
  return data || []
}, {
  watch: [selectedType] // Recarregar quando o tipo mudar
})

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

    <main class="vagas-container">
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
            <div v-for="job in jobs" :key="job.id" class="job-card group">
              <div class="job-info flex-1">
                <div class="job-header flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <span class="job-type bg-green-50 text-green-700 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-green-100">
                      {{ job.tipo }}
                    </span>
                    <span class="job-date text-xs text-slate-400 font-bold">
                      {{ formatDate(job.data_publicacao) }}
                    </span>
                  </div>
                  
                  <!-- Match Badge (Only for Talents) -->
                  <div v-if="userStore.profile?.tipo_conta === 'talento'" class="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-pulse">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                    <span class="text-[10px] font-black uppercase tracking-tighter">98% Match</span>
                  </div>
                </div>

                <h2 class="job-title text-2xl font-black text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                  {{ job.titulo }}
                </h2>
                <p class="job-company text-lg font-bold text-slate-500 mb-6 italic">
                   {{ (job.empresa as any)?.nome || 'Empresa Privada' }}
                </p>
                
                <div class="job-meta flex flex-wrap gap-6 text-sm">
                  <div class="meta-item flex items-center gap-2 text-slate-600 font-medium">
                    <div class="p-2 bg-slate-100 rounded-lg"><span class="icon">📍</span></div>
                    <span>{{ job.local }}</span>
                  </div>
                  <div class="meta-item flex items-center gap-2 text-slate-600 font-medium">
                    <div class="p-2 bg-slate-100 rounded-lg"><span class="icon">💰</span></div>
                    <span class="font-bold">{{ job.salario || 'Valor a negociar' }}</span>
                  </div>
                  <div class="meta-item flex items-center gap-2 text-slate-600 font-medium">
                    <div class="p-2 bg-slate-100 rounded-lg"><span class="icon">🏢</span></div>
                    <span class="capitalize">{{ job.modalidade }}</span>
                  </div>
                </div>
              </div>
              
              <div class="job-actions shrink-0 ml-8">
                <NuxtLink :to="`/vagas/${job.id}`" class="details-btn block text-center min-w-[180px]">
                  {{ isLoggedIn ? 'Ver Detalhes' : 'Entrar para Candidatar' }}
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
.vagas-container { max-width: 1200px; margin: 0 auto; padding: 0 20px 60px 20px; }
.vagas-header { margin-bottom: 48px; text-align: left; }
.vagas-header h1 { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
.vagas-header p { font-size: 1.125rem; color: #64748b; }

.vagas-layout { display: grid; grid-template-columns: 320px 1fr; gap: 40px; }
@media (max-width: 900px) { .vagas-layout { grid-template-columns: 1fr; } }

.filters-sidebar { background: white; padding: 32px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); height: fit-content; }
.filter-group { margin-bottom: 32px; }
.filter-group h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; color: #1e293b; }

.search-wrapper { position: relative; }
.search-field { width: 100%; height: 48px; padding: 0 48px 0 16px; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; }
.search-btn-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; }

.categories-list { display: flex; flex-direction: column; gap: 14px; }
.filter-label { display: flex; align-items: center; gap: 12px; cursor: pointer; color: #4b5563; font-weight: 500; }
.filter-label input[type="radio"] { width: 18px; height: 18px; accent-color: #268C52; }

.jobs-list { display: flex; flex-direction: column; gap: 24px; }
.job-card { background: white; padding: 32px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; border: 1px solid transparent; }
.job-card:hover { transform: translateY(-4px); border-color: #268C52; box-shadow: 0 12px 30px rgba(38, 140, 82, 0.08); }

@media (max-width: 640px) { .job-card { flex-direction: column; align-items: flex-start; gap: 24px; } }

.job-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.job-type { background-color: #f0fdf4; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.job-date { font-size: 0.875rem; color: #94a3b8; font-weight: 500; }
.job-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.job-company { color: #268C52; font-weight: 700; font-size: 1.05rem; margin-bottom: 20px; }
.job-meta { display: flex; flex-wrap: wrap; gap: 24px; color: #64748b; font-size: 0.95rem; }
.meta-item { display: flex; align-items: center; gap: 8px; }
.capitalize { text-transform: capitalize; }

.details-btn { background: linear-gradient(to right, #268C52, #177486); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: all 0.2s; white-space: nowrap; }
.empty-state { text-align: center; padding: 100px 0; color: #64748b; background: white; border-radius: 32px; border: 2px dashed #e2e8f0; }
.empty-illustration { font-size: 5rem; margin-bottom: 24px; display: block; filter: grayscale(1); opacity: 0.5; }
.empty-state h3 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
.empty-state p { margin-bottom: 32px; max-width: 400px; margin-left: auto; margin-right: auto; }

.clear-filters-btn, .retry-btn { padding: 12px 24px; background: #268C52; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.clear-filters-btn:hover, .retry-btn:hover { background: #1a633a; transform: translateY(-2px); }

.error-list-state { text-align: center; padding: 60px; background: #fef2f2; border-radius: 24px; border: 1px solid #fee2e2; }
.error-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
.error-list-state h3 { color: #991b1b; font-weight: 800; margin-bottom: 8px; }
.error-list-state p { color: #b91c1c; opacity: 0.8; margin-bottom: 24px; }

.loading-state { text-align: center; padding: 100px; }
</style>
