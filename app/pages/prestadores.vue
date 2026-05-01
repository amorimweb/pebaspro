<script setup lang="ts">
import type { Database } from '~/types'

const supabase = useSupabaseClient<Database>()
const search = ref('')
const selectedType = ref('')
const selectedRegiao = ref('')

// Busca prestadores com cadastro completo e pelo menos 1 serviço ativo
const { data: prestadores, refresh, pending } = await useAsyncData<any[]>('prestadores-list', async () => {
  let query = (supabase
    .from('usuarios')
    .select('*, servicos(id, titulo, preco_inicial)') as any)
    .or('tipo_conta.eq.prestador,and(tipo_conta.eq.empresa,modo_prestador.eq.true)')
    .eq('cadastro_completo', true)
    .eq('status', 'ativo')

  if (search.value) {
    query = query.ilike('nome', `%${search.value}%`)
  }
  if (selectedRegiao.value) {
    query = query.ilike('regiao', `%${selectedRegiao.value}%`)
  }

  const { data } = await query
  return data || []
}, {
  watch: [selectedRegiao]
})

const handleSearch = () => refresh()
</script>

<template>
  <div class="servicos-page">
    <main class="container">

      <!-- Header -->
      <header class="page-header">
        <div class="header-badge">🛠️ Serviços</div>
        <h1>Prestadores da Região</h1>
        <p>Encontre profissionais qualificados para o que você precisa.</p>
      </header>

      <!-- Busca -->
      <div class="search-section">
        <div class="search-card">
          <input
            v-model="search"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Buscar por nome ou especialidade..."
          />
          <input
            v-model="selectedRegiao"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Região ou bairro..."
            class="input-regiao"
          />
          <button @click="handleSearch" class="btn-search">Buscar</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="loading-state">
        <div class="spinner"/>
        <p>Buscando profissionais...</p>
      </div>

      <!-- Grid -->
      <div v-else-if="prestadores && prestadores.length > 0" class="prestadores-grid">
        <NuxtLink
          v-for="p in prestadores"
          :key="p.id"
          :to="`/empresas/${p.id}`"
          class="prestador-card"
        >
          <!-- Avatar -->
          <div class="prestador-avatar">
            <img v-if="p.foto" :src="p.foto" :alt="p.nome || ''" />
            <span v-else>{{ p.nome?.charAt(0) }}</span>
          </div>

          <!-- Info -->
          <div class="prestador-info">
            <div class="prestador-especialidade">{{ p.profissao || 'Profissional Autônomo' }}</div>
            <h3>{{ p.nome }}</h3>
            <p class="prestador-location">📍 {{ p.regiao || 'Na região' }}</p>
            <p class="prestador-bio">{{ p.sobre_mim || 'Clique para ver os serviços deste profissional.' }}</p>
          </div>

          <!-- Serviços resumidos -->
          <div v-if="p.servicos && p.servicos.length > 0" class="servicos-preview">
            <span
              v-for="s in p.servicos.slice(0, 3)"
              :key="s.id"
              class="servico-tag"
            >{{ s.titulo }}</span>
            <span v-if="p.servicos.length > 3" class="servico-tag-more">+{{ p.servicos.length - 3 }}</span>
          </div>

          <div class="card-footer">
            <span class="view-link">Ver Serviços →</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>Nenhum prestador encontrado com esses termos.</p>
        <button @click="search = ''; selectedRegiao = ''; refresh()" class="clear-btn">Limpar filtros</button>
      </div>

    </main>
  </div>
</template>

<style scoped>
.servicos-page { background: #f0fdfa; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }

.page-header { text-align: center; margin-bottom: 56px; }
.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ccfbf1;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #99f6e4;
  margin-bottom: 16px;
}
.page-header h1 { font-size: 2.5rem; font-weight: 900; color: #1e293b; margin-bottom: 12px; }
.page-header p { font-size: 1.125rem; color: #64748b; }

.search-section { max-width: 800px; margin: 0 auto 56px; }
.search-card {
  background: white;
  padding: 8px;
  border-radius: 20px;
  display: flex;
  gap: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.search-card input {
  flex: 1;
  border: none;
  padding: 0 20px;
  font-size: 0.95rem;
  outline: none;
  border-radius: 12px;
  background: #f8fafc;
  height: 46px;
}
.input-regiao { max-width: 200px; }
.btn-search {
  background: linear-gradient(to right, #0f766e, #0891b2);
  color: white;
  border: none;
  padding: 0 28px;
  height: 46px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.btn-search:hover { opacity: 0.9; }

@media (max-width: 640px) {
  .search-card { flex-wrap: wrap; }
  .input-regiao { max-width: 100%; }
}

.prestadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}

.prestador-card {
  background: white;
  padding: 28px;
  border-radius: 24px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid transparent;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.prestador-card:hover {
  transform: translateY(-6px);
  border-color: #0f766e;
  box-shadow: 0 15px 35px rgba(15, 118, 110, 0.1);
}

.prestador-avatar {
  width: 72px;
  height: 72px;
  background: #f0fdfa;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  color: #0f766e;
  overflow: hidden;
  flex-shrink: 0;
}
.prestador-avatar img { width: 100%; height: 100%; object-fit: cover; }

.prestador-especialidade {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0f766e;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.prestador-card h3 { font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 4px 0; }
.prestador-location { font-size: 0.9rem; color: #64748b; font-weight: 600; }
.prestador-bio {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 4px;
}

.servicos-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.servico-tag {
  background: #f0fdfa;
  color: #0f766e;
  border: 1px solid #99f6e4;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
.servico-tag-more {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
}

.card-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.view-link { color: #0f766e; font-weight: 700; font-size: 0.9rem; }

.loading-state { text-align: center; padding: 80px; color: #64748b; }
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #99f6e4;
  border-top-color: #0f766e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; opacity: 0.4; filter: grayscale(1); }
.empty-state p { color: #64748b; font-size: 1.1rem; font-weight: 600; margin-bottom: 24px; }
.clear-btn {
  padding: 12px 24px;
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover { background: #0d6b63; transform: translateY(-2px); }
</style>
