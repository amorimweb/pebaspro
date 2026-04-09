<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const { uploadFile, loading: uploading } = useFileUpload()
const { coords, getLocation } = useLocation()
const step = ref(1)
const typeCookie = useCookie<string | null>('pebas_pending_type')

// Profissões A-Z
const profissoesList = [
  'Administrador de Banco de Dados', 'Almoxarife', 'Analista Administrativo',
  'Analista de Dados', 'Analista de RH', 'Analista de Sistemas', 'Analista de Suporte',
  'Analista Financeiro', 'Assistente Administrativo', 'Assistente de Atendimento',
  'Assistente de RH', 'Assistente Financeiro', 'Atendente', 'Atendente de Clínica',
  'Atendente de Telemarketing', 'Auxiliar Administrativo', 'Auxiliar de Cozinha',
  'Auxiliar de Enfermagem', 'Auxiliar de Escritório', 'Auxiliar de Logística',
  'Auxiliar de Produção', 'Auxiliar de Sala', 'Auxiliar de Serviços Gerais',
  'Barman', 'Caixa', 'Chapeiro', 'Conferente', 'Consultor de Vendas',
  'Coordenador Pedagógico', 'Copywriter', 'Cozinheiro', 'Customer Success',
  'Designer Gráfico', 'DevOps', 'Desenvolvedor Back-end', 'Desenvolvedor Front-end',
  'Desenvolvedor Full Stack', 'Desenvolvedor Web', 'Editor de Vídeo', 'Eletricista',
  'Encanador', 'Entregador', 'Especialista em Inteligência Artificial', 'Estoquista',
  'Fiscal de Loja', 'Garçom', 'Gerente de Loja', 'Gerente de Restaurante',
  'Gerente de Vendas', 'Gestor de Tráfego', 'Marketing Digital', 'Monitor Escolar',
  'Motorista', 'Operador de Call Center', 'Operador de Caixa', 'Operador de Máquinas',
  'Professor', 'Programador', 'Promotor de Vendas', 'Recepcionista',
  'Recepcionista Hospitalar', 'Repositor', 'Representante Comercial', 'Secretária',
  'Social Media', 'Subgerente', 'Suporte Técnico', 'Suporte ao Cliente',
  'Supervisor Comercial', 'Técnico de Enfermagem', 'Técnico em Informática',
  'Técnico em Manutenção', 'Vendedor', 'Vendedor de Loja', 'Zelador', 'Outros'
]

const profissaoSearch = ref('')
const showProfissaoDropdown = ref(false)

const profissoesFiltradas = computed(() => {
  const q = profissaoSearch.value.toLowerCase()
  return profissoesList.filter(p => p.toLowerCase().includes(q))
})

const selecionarProfissao = (p: string) => {
  form.value.profissao = p
  profissaoSearch.value = p
  showProfissaoDropdown.value = false
}

const onProfissaoInput = () => {
  form.value.profissao = profissaoSearch.value
  showProfissaoDropdown.value = true
}

const onProfissaoFocus = () => {
  showProfissaoDropdown.value = true
}

const onProfissaoBlur = () => {
  // delay so click on item registers first
  setTimeout(() => { showProfissaoDropdown.value = false }, 180)
}

const profileTypes = [
  { id: 'talento',   icon: '🎯', title: 'Talento',   subtitle: 'Busco vagas de emprego' },
  { id: 'prestador', icon: '🛠️', title: 'Prestador', subtitle: 'Ofereço meus serviços' },
  { id: 'empresa',   icon: '🏢', title: 'Empresa',   subtitle: 'Quero contratar talentos' },
]
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Ref para o preview da imagem
const photoPreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// Dados do formulário baseados na tabela 'usuarios'
const form = ref({
  nome: '',
  telefone: '',
  regiao: '',
  endereco: '',
  profissao: '',
  sobre_mim: '',
  biografia: '',
  tipo_conta: '' as 'cliente' | 'talento' | 'prestador' | 'empresa',
  documento: '',
  foto: '',
  latitude: null as number | null,
  longitude: null as number | null,
  objetivo_profissional: '',
  habilidades_input: ''
})

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedFile.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

// Máscaras
const maskTelefone = (v: string) => {
  v = v.replace(/\D/g, "")
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
  v = v.replace(/(\d)(\d{4})$/, "$1-$2")
  return v
}

const maskCPF = (v: string) => {
  v = v.replace(/\D/g, "").slice(0, 11)
  v = v.replace(/(\d{3})(\d)/, "$1.$2")
  v = v.replace(/(\d{3})(\d)/, "$1.$2")
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return v
}

const maskCNPJ = (v: string) => {
  v = v.replace(/\D/g, "").slice(0, 14)
  v = v.replace(/(\d{2})(\d)/, "$1.$2")
  v = v.replace(/(\d{3})(\d)/, "$1.$2")
  v = v.replace(/(\d{3})(\d)/, "$1/$2")
  v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2")
  return v
}

const isEmpresa = computed(() => form.value.tipo_conta === 'empresa')
const docLabel = computed(() => isEmpresa.value ? 'CNPJ' : 'CPF')
const docPlaceholder = computed(() => isEmpresa.value ? '00.000.000/0001-00' : '000.000.000-00')
const docMaxLength = computed(() => isEmpresa.value ? 18 : 14)
const applyDocMask = (raw: string) => isEmpresa.value ? maskCNPJ(raw) : maskCPF(raw)

const docError = ref('')
const validateDoc = () => {
  const raw = form.value.documento.replace(/\D/g, '')
  if (!raw) { docError.value = ''; return }
  if (isEmpresa.value) {
    const n = raw
    if (n.length !== 14) { docError.value = 'CNPJ inválido'; return }
    docError.value = ''
  } else {
    const n = raw
    if (n.length !== 11) { docError.value = 'CPF inválido'; return }
    docError.value = ''
  }
}

// Sincronizar dados iniciais que vieram do Auth ou Store
onMounted(async () => {
  // Se o perfil já estiver carregado no store (pelo plugin), use-o
  if (authStore.profile) {
    const p = authStore.profile
    form.value.nome = p.nome || ''
    form.value.tipo_conta = (p.tipo_conta as any) || ''
    form.value.documento = p.documento || ''
    form.value.telefone = p.telefone || ''
  } else if (user.value?.user_metadata) {
    // Fallback para metadados da sessão em caso de primeiro acesso imediato
    const meta = user.value.user_metadata
    form.value.nome = meta.full_name || meta.name || ''
    form.value.tipo_conta = meta.tipo_conta || ''
    form.value.documento = meta.documento || ''
    form.value.telefone = meta.telefone || ''
  }
  // Capturar localização silenciosamente
  getLocation()

  // Garantir que o tipo_conta venha do cookie caso não esteja no perfil
  if (!form.value.tipo_conta && typeCookie.value) {
    form.value.tipo_conta = typeCookie.value as any
  }
})

const changeAccountType = () => {
  form.value.tipo_conta = '' as any
}

const nextStep = () => step.value++
const prevStep = () => step.value--

const finishOnboarding = async () => {
  loading.value = true
  
  try {
    let fotoUrl = form.value.foto
    
    // Se selecionou um arquivo, faz o upload primeiro
    if (selectedFile.value && user.value) {
      const fileName = `${user.value.id}-${Date.now()}.jpg`
      const { publicUrl, error: uploadError } = await uploadFile(selectedFile.value, `${fileName}`, 'avatars')
      if (uploadError) throw new Error(uploadError)
      fotoUrl = publicUrl || ''
    }

    const updates = {
      nome: form.value.nome,
      telefone: form.value.telefone,
      regiao: form.value.regiao,
      endereco: form.value.endereco,
      profissao: form.value.profissao,
      sobre_mim: form.value.sobre_mim,
      biografia: form.value.biografia,
      tipo_conta: form.value.tipo_conta,
      documento: form.value.documento,
      foto: fotoUrl, // Salva a URL da foto otimizada
      latitude: coords.value.latitude,
      longitude: coords.value.longitude,
      objetivo_profissional: form.value.objetivo_profissional,
      habilidades: form.value.habilidades_input ? form.value.habilidades_input.split(',').map(s => s.trim()).filter(s => s) : [],
      cadastro_completo: true,
      status: 'ativo'
    }

    const { error } = await authStore.updateProfile(updates)
    
    if (!error) {
      const profile = authStore.profile
      const redirectMap: Record<string, string> = {
        talento: '/',
        empresa: '/painel/empresa',
        prestador: '/painel/prestador',
        cliente: '/',
      }
      const target = redirectMap[profile?.tipo_conta as keyof typeof redirectMap] || '/'
      navigateTo(target)
    } else {
      throw error
    }
  } catch (err: any) {
    loading.value = false
    alert(`Erro ao salvar os dados: ${err.message}`)
  }
}

definePageMeta({
  layout: false,
  noPadding: true
})
</script>

<template>
  <div class="onboarding-page">
    <div class="onboarding-card">
      
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: (step / 3) * 100 + '%' }"></div>
      </div>

      <!-- Step 1: Localização e Contato -->
      <div v-if="step === 1" class="step-fade">
        <div class="step-header">
          <span class="step-number">Etapa 1 de 3</span>
          <h1>Falta pouco, {{ form.nome.split(' ')[0] }}! 👋</h1>
          <p>Confirme seus dados e adicione uma foto de perfil ou logo.</p>
        </div>

        <!-- Seleção de Perfil (se não estiver definido) -->
        <div v-if="!form.tipo_conta" class="tipo-conta-selector step-fade">
          <span class="tipo-conta-label">Escolha seu perfil</span>
          <div class="tipos-grid">
            <button 
              v-for="type in profileTypes" 
              :key="type.id"
              class="tipo-card"
              :class="{ active: form.tipo_conta === type.id }"
              @click="form.tipo_conta = type.id as any"
            >
              <span class="tipo-icon">{{ type.icon }}</span>
              <div>
                <strong>{{ type.title }}</strong>
                <small>{{ type.subtitle }}</small>
              </div>
            </button>
          </div>
        </div>

        <!-- Perfil selecionado (read-only com opção de mudar) -->
        <div v-else class="tipo-conta-readonly step-fade">
          <div class="flex justify-between items-end mb-3">
            <span class="tipo-conta-label mb-0">Perfil selecionado</span>
            <button @click="changeAccountType" class="text-xs font-bold text-green-600 hover:underline">
              Mudar perfil
            </button>
          </div>
          <div class="tipo-conta-badge">
            <span class="tipo-icon">
              {{ profileTypes.find(t => t.id === form.tipo_conta)?.icon || '👤' }}
            </span>
            <div>
              <strong>{{ profileTypes.find(t => t.id === form.tipo_conta)?.title || form.tipo_conta }}</strong>
              <small>{{ profileTypes.find(t => t.id === form.tipo_conta)?.subtitle }}</small>
            </div>
            <span class="tipo-lock" title="Você pode mudar o perfil antes de concluir">🔓</span>
          </div>
        </div>

        <div class="form-container">
          <!-- Upload de Foto -->
          <div class="photo-upload-container">
            <div class="photo-preview" @click="fileInput?.click()">
              <img v-if="photoPreview" :src="photoPreview" alt="Preview" />
              <div v-else class="photo-placeholder">
                <span>📸</span>
                <p>Adicionar Foto</p>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*" 
                @change="onFileChange"
              />
            </div>
            <p class="photo-tip">Clique no círculo para selecionar uma imagem (Logo ou Foto)</p>
          </div>

          <div class="form-group">
            <label>{{ docLabel }}</label>
            <input
              :value="form.documento"
              @input="form.documento = applyDocMask(($event.target as HTMLInputElement).value)"
              @blur="validateDoc"
              type="text"
              :placeholder="docPlaceholder"
              :maxlength="docMaxLength"
              :class="{ 'input-error': docError }"
            />
            <span v-if="docError" class="field-error">{{ docError }}</span>
          </div>

          <div class="form-group">
            <label>WhatsApp / Celular</label>
            <input 
              :value="form.telefone" 
              @input="form.telefone = maskTelefone(($event.target as HTMLInputElement).value)" 
              type="text" 
              placeholder="(94) 99999-9999" 
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Bairro/Cidade</label>
              <input v-model="form.regiao" type="text" placeholder="Ex: Cidade Nova" />
            </div>
            <div class="form-group">
              <label>Endereço Ref. (Opcional)</label>
              <input v-model="form.endereco" type="text" placeholder="Rua, número..." />
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button @click="nextStep" class="btn-primary" :disabled="!form.tipo_conta">Continuar</button>
        </div>
      </div>

      <!-- Step 2: Atuação Profissional -->
      <div v-if="step === 2" class="step-fade">
        <div class="step-header">
          <span class="step-number">Etapa 2 de 3</span>
          <h1 v-if="form.tipo_conta === 'talento'">Sua Carreira</h1>
          <h1 v-else-if="form.tipo_conta === 'prestador'">Sua Especialidade</h1>
          <h1 v-else>Atuação da Empresa</h1>
          <p>Como as pessoas devem te encontrar na plataforma?</p>
        </div>

        <div class="form-container">
          <div class="form-group">
            <label>{{ form.tipo_conta === 'empresa' ? 'Segmento da Empresa' : 'Sua Profissão / Especialidade' }}</label>
            <div class="profissao-wrapper">
              <input
                v-model="profissaoSearch"
                @input="onProfissaoInput"
                @focus="onProfissaoFocus"
                @blur="onProfissaoBlur"
                type="text"
                placeholder="Digite ou selecione sua profissão..."
                class="profissao-input"
                autocomplete="off"
              />
              <ul v-if="showProfissaoDropdown && profissoesFiltradas.length" class="profissao-list">
                <li
                  v-for="p in profissoesFiltradas"
                  :key="p"
                  @mousedown.prevent="selecionarProfissao(p)"
                  class="profissao-item"
                  :class="{ selected: form.profissao === p }"
                >
                  {{ p }}
                </li>
              </ul>
            </div>
          </div>
          
          <div v-if="form.tipo_conta === 'talento'" class="form-group">
            <label>Objetivo Profissional</label>
            <input v-model="form.objetivo_profissional" type="text" placeholder="Ex: Atuar na área de vendas ou logística" required />
          </div>

          <div v-if="form.tipo_conta === 'talento'" class="form-group">
            <label>Suas Principais Habilidades</label>
            <input v-model="form.habilidades_input" type="text" placeholder="Ex: Digitação, Vendas, Atendimento (separe por vírgula)" required />
          </div>

          <div class="form-group">
            <label>Um breve resumo (Sobre Mim)</label>
            <textarea v-model="form.sobre_mim" rows="4" placeholder="Fale um pouco sobre sua trajetória ou o que sua empresa faz..."></textarea>
          </div>
        </div>

        <div class="step-actions">
          <button @click="prevStep" class="btn-ghost">Voltar</button>
          <button @click="nextStep" class="btn-primary">Continuar</button>
        </div>
      </div>

      <!-- Step 3: Bio Detalhada -->
      <div v-if="step === 3" class="step-fade">
        <div class="step-header">
          <span class="step-number">Etapa Final</span>
          <h1>Apresentação Completa 🚀</h1>
          <p>Esta biografia aparecerá no seu perfil público para atrair usuários ou contratantes.</p>
        </div>

        <div class="form-container">
          <div class="form-group">
            <label>Sua Biografia Detalhada</label>
            <textarea v-model="form.biografia" rows="8" placeholder="Descrição completa dos seus serviços, habilidades ou valores da empresa..."></textarea>
          </div>
        </div>

        <div class="step-actions">
          <button @click="prevStep" class="btn-ghost">Voltar</button>
          <button @click="finishOnboarding" class="btn-primary" :disabled="loading">
            {{ loading ? 'Finalizando...' : 'Concluir Cadastro' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Estilos herdados e mantendo a consistência visual */

.input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.field-error {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 600;
  margin-top: 2px;
}

.tipo-conta-readonly {
  margin-bottom: 28px;
}

.tipo-conta-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #f0fdf4;
  border: 2px solid #268C52;
  border-radius: 14px;
  color: #0f172a;
}

.tipo-conta-badge > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tipo-lock {
  margin-left: auto;
  font-size: 1rem;
  opacity: 0.4;
}

.tipo-conta-selector {
  margin-bottom: 32px;
}

.tipo-conta-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.tipos-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tipo-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.tipo-card:hover {
  border-color: #268C52;
  background: #fff;
}

.tipo-card.active {
  border-color: #268C52;
  background: #f0fdf4;
  box-shadow: 0 0 0 3px rgba(38, 140, 82, 0.12);
}

.tipo-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tipo-card strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.tipo-card small {
  font-size: 0.8rem;
  color: #64748b;
}
.onboarding-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

@media (min-width: 768px) {
  .onboarding-page {
    padding: 40px 20px;
  }
}
 
.onboarding-card {
  max-width: 640px;
  width: 100%;
  background: white;
  border-radius: 32px;
  padding: 32px 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .onboarding-card {
    padding: 60px;
  }
}
 
@media (max-width: 640px) {
  .onboarding-card { padding: 32px 20px; }
  .form-row { grid-template-columns: 1fr; }
}
 
/* Custom profissão dropdown */
.profissao-wrapper { position: relative; }
 
.profissao-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  font-family: inherit;
}

@media (min-width: 768px) {
  .profissao-input {
    padding: 14px 18px;
  }
}
 
.profissao-input:focus { border-color: #268C52; }
 
.profissao-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  max-height: 220px;
  overflow-y: auto;
  z-index: 200;
  list-style: none;
  padding: 6px;
  margin: 0;
}
 
.profissao-item {
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #374151;
  transition: background 0.1s;
}
 
.profissao-item:hover { background: #f0fdf4; color: #268C52; }
.profissao-item.selected { background: #dcfce7; color: #166534; font-weight: 700; }
 
.progress-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background-color: #f1f5f9;
}
 
.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #268C52, #177486);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
 
.step-fade {
  animation: fadeIn 0.4s ease-out;
}
 
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
 
.step-header {
  margin-bottom: 24px;
  text-align: center;
}

@media (min-width: 768px) {
  .step-header {
    margin-bottom: 40px;
  }
}
 
.step-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: #268C52;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .step-number {
    font-size: 0.875rem;
    margin-bottom: 16px;
  }
}
 
.step-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

@media (min-width: 768px) {
  .step-header h1 {
    font-size: 2rem;
    margin-bottom: 12px;
  }
}
 
.step-header p {
  color: #64748b;
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .step-header p {
    font-size: 1.1rem;
  }
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.form-group input, .form-group textarea {
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: #268C52;
}

.photo-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.photo-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 4px solid #f1f5f9;
  overflow: hidden;
  cursor: pointer;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
}

.photo-preview:hover {
  border-color: #268C52;
  transform: scale(1.05);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  text-align: center;
  color: #94a3b8;
}

.photo-placeholder span {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 4px;
}

.photo-placeholder p {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.photo-tip {
  font-size: 0.8rem;
  color: #64748b;
}

.hidden {
  display: none;
}

.step-actions {
  margin-top: 48px;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 14px 40px;
  background: linear-gradient(to right, #268C52, #177486);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-ghost {
  padding: 14px 24px;
  background: transparent;
  color: #64748b;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
</style>
