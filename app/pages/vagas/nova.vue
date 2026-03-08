<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const loading = ref(false)
const { translateError } = useTranslation()

const form = ref({
  titulo: '',
  modalidade: 'presencial',
  tipo: 'CLT',
  jornada: 'Integral',
  salario: '',
  local: '',
  whatsapp: '',
  descricao: '',
  requisitos: '',
  beneficios: '',
  encerramento: ''
})

const tiposContrato = ['CLT', 'PJ', 'Freelance', 'Estágio', 'Temporário', 'Diária']
const jornadas = ['Integral', 'Meio Período', 'Noturno', 'Escala 12x36', 'Flexível']
const modalidades = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Híbrido', value: 'hibrido' },
  { label: 'Remoto', value: 'remoto' }
]

// Carregar WhatsApp padrão do perfil da empresa
onMounted(() => {
  if (authStore.profile?.telefone) {
    form.value.whatsapp = authStore.profile.telefone
  }
})

const handleSubmit = async () => {
  if (!authStore.profile || authStore.profile.tipo_conta !== 'empresa') {
    alert('Apenas perfis de empresa podem publicar vagas.')
    return
  }

  loading.value = true
  
  // @ts-ignore
  const { data, error } = await supabase.from('vagas').insert({
    empresa_id: authStore.profile.id,
    titulo: form.value.titulo,
    descricao: form.value.descricao,
    requisitos: form.value.requisitos,
    beneficios: form.value.beneficios,
    modalidade: form.value.modalidade,
    tipo: form.value.tipo,
    jornada: form.value.jornada,
    salario: form.value.salario,
    local: form.value.local,
    whatsapp: form.value.whatsapp,
    encerramento: form.value.encerramento || null
  })

  if (error) {
    alert('Erro ao publicar vaga: ' + translateError(error))
    loading.value = false
  } else {
    navigateTo('/vagas')
  }
}

// definePageMeta removed
</script>

<template>
  <div class="new-job-page">

    <main class="container">
      <div class="form-card">
        <header class="form-header">
          <h1>Publicar Oportunidade</h1>
          <p>Preencha os detalhes da vaga para encontrar o profissional ideal na região.</p>
        </header>

        <form @submit.prevent="handleSubmit" class="job-form">
          <!-- Bloco 1: Informações Básicas -->
          <div class="form-section">
            <h2 class="section-title">Informações Básicas</h2>
            <div class="form-group">
              <label>Título da Vaga / Cargo</label>
              <input v-model="form.titulo" list="profissoes-vagas-list" type="text" placeholder="Ex: Eletricista de Manutenção Industrial" required />
              <datalist id="profissoes-vagas-list">
                <option value="Pedreiro"></option>
                <option value="Pintor"></option>
                <option value="Eletricista Residencial"></option>
                <option value="Encanador"></option>
                <option value="Carpinteiro"></option>
                <option value="Gesseiro"></option>
                <option value="Serralheiro"></option>
                <option value="Mecânico Industrial"></option>
                <option value="Soldador"></option>
                <option value="Caldereiro"></option>
                <option value="Operador de Máquinas Pesadas"></option>
                <option value="Diarista"></option>
                <option value="Cozinheira"></option>
                <option value="Babá"></option>
                <option value="Cabeleireiro"></option>
                <option value="Manicure/Pedicure"></option>
                <option value="Vendedor/Comercial"></option>
                <option value="Auxiliar Administrativo"></option>
              </datalist>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label>Modalidade</label>
                <select v-model="form.modalidade">
                  <option v-for="m in modalidades" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tipo de Contrato</label>
                <select v-model="form.tipo">
                  <option v-for="t in tiposContrato" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Jornada</label>
                <select v-model="form.jornada">
                  <option v-for="j in jornadas" :key="j" :value="j">{{ j }}</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>Salário / Remuneração</label>
                <input v-model="form.salario" type="text" placeholder="Ex: R$ 3.500,00 ou A combinar" />
              </div>
              <div class="form-group">
                <label>Local / Bairro</label>
                <input v-model="form.local" type="text" placeholder="Ex: Cidade Nova, Mina de Carajás..." required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>WhatsApp para Contato</label>
                <input v-model="form.whatsapp" type="text" placeholder="(94) 99999-9999" required />
              </div>
              <div class="form-group">
                <label>Data de Encerramento (Opcional)</label>
                <input v-model="form.encerramento" type="date" />
              </div>
            </div>
          </div>

          <!-- Bloco 2: Detalhes -->
          <div class="form-section">
            <h2 class="section-title">Conteúdo da Vaga</h2>
            <div class="form-group">
              <label>Descrição da Vaga</label>
              <textarea v-model="form.descricao" rows="6" placeholder="O que o profissional irá fazer no dia a dia?" required></textarea>
            </div>

            <div class="form-group">
              <label>Requisitos / Qualificações</label>
              <textarea v-model="form.requisitos" rows="4" placeholder="Ex: Curso técnico em elétrica, experiência de 2 anos..."></textarea>
            </div>

            <div class="form-group">
              <label>Benefícios</label>
              <textarea v-model="form.beneficios" rows="4" placeholder="Ex: Vale alimentação, plano de saúde, transporte fretado..."></textarea>
            </div>
          </div>

          <div class="form-actions">
            <NuxtLink to="/vagas" class="btn-ghost">Cancelar</NuxtLink>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Publicando...' : 'Publicar Vaga Agora' }}
            </button>
          </div>
        </form>
      </div>
    </main>

  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
}

.form-card {
  background: white;
  padding: 50px;
  border-radius: 32px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
}

@media (max-width: 640px) {
  .form-card { padding: 30px 20px; }
}

.form-header {
  margin-bottom: 48px;
  text-align: center;
}

.form-header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.form-header p {
  color: #64748b;
  font-size: 1.1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.job-form {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px) {
  .form-grid-3, .form-grid-2 { grid-template-columns: 1fr; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: #268C52;
  box-shadow: 0 0 0 4px rgba(38, 140, 82, 0.05);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
}

.btn-primary {
  padding: 16px 48px;
  background: linear-gradient(to right, #268C52, #177486);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:active { transform: scale(0.98); }

.btn-ghost {
  padding: 16px 32px;
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
}
</style>
