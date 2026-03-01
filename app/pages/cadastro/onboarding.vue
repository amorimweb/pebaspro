<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const { uploadFile, loading: uploading } = useFileUpload()
const { coords, getLocation } = useLocation()
const step = ref(1)

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
})

const nextStep = () => step.value++
const prevStep = () => step.value--

const finishOnboarding = async () => {
  loading.value = true
  
  try {
    let fotoUrl = form.value.foto
    
    // Se selecionou um arquivo, faz o upload primeiro
    if (selectedFile.value && user.value) {
      const fileName = `${user.value.id}-${Date.now()}.jpg`
      const { publicUrl, error: uploadError } = await uploadFile(selectedFile.value, `perfil/${fileName}`, 'bucket1')
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
        talento: '/',
        empresa: '/painel/empresa',
        prestador: '/painel/prestador',
        cliente: '/',
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

        <!-- Seleção / confirmação do tipo de conta -->
        <div class="tipo-conta-selector">
          <label class="tipo-conta-label">Confirme seu perfil</label>
          <div class="tipos-grid">
            <button
              v-for="tipo in profileTypes"
              :key="tipo.id"
              type="button"
              class="tipo-card"
              :class="{ active: form.tipo_conta === tipo.id }"
              @click="form.tipo_conta = tipo.id as any"
            >
              <span class="tipo-icon">{{ tipo.icon }}</span>
              <div>
                <strong>{{ tipo.title }}</strong>
                <small>{{ tipo.subtitle }}</small>
              </div>
            </button>
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
              <label>Região / Bairro</label>
              <input v-model="form.regiao" type="text" placeholder="Ex: Cidade Nova" />
            </div>
            <div class="form-group">
              <label>Endereço Ref. (Opcional)</label>
              <input v-model="form.endereco" type="text" placeholder="Rua, número..." />
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button @click="nextStep" class="btn-primary">Continuar</button>
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
            <div class="relative">
              <input 
                v-model="form.profissao" 
                list="profissoes-list"
                type="text" 
                placeholder="Selecione ou digite sua profissão..." 
                class="w-full"
              />
              <datalist id="profissoes-list">
                <optgroup label="Construção e Reformas">
                  <option value="Pedreiro"></option>
                  <option value="Pintor"></option>
                  <option value="Eletricista Residencial"></option>
                  <option value="Encanador"></option>
                  <option value="Carpinteiro"></option>
                  <option value="Gesseiro"></option>
                  <option value="Serralheiro"></option>
                  <option value="Marido de Aluguel"></option>
                </optgroup>
                <optgroup label="Indústria e Manutenção">
                  <option value="Mecânico Industrial"></option>
                  <option value="Soldador"></option>
                  <option value="Caldereiro"></option>
                  <option value="Operador de Máquinas Pesadas"></option>
                  <option value="Eletricista Industrial"></option>
                  <option value="Instrumentista"></option>
                  <option value="Técnico de Mineração"></option>
                </optgroup>
                <optgroup label="Serviços Domésticos">
                  <option value="Diarista"></option>
                  <option value="Cozinheira"></option>
                  <option value="Babá"></option>
                  <option value="Passadeira"></option>
                  <option value="Cuidador de Idosos"></option>
                  <option value="Jardineiro"></option>
                </optgroup>
                <optgroup label="Beleza e Estética">
                  <option value="Cabeleireiro"></option>
                  <option value="Manicure/Pedicure"></option>
                  <option value="Maquiadora"></option>
                  <option value="Barbeiro"></option>
                  <option value="Esteticista"></option>
                  <option value="Designer de Sobrancelhas"></option>
                </optgroup>
                <optgroup label="Tecnologia e Escritório">
                  <option value="Auxiliar Administrativo"></option>
                  <option value="Vendedor/Comercial"></option>
                  <option value="Atendente/Recepcionista"></option>
                  <option value="Desenvolvedor"></option>
                  <option value="Designer Gráfico"></option>
                  <option value="Social Media"></option>
                  <option value="Contador"></option>
                </optgroup>
                <optgroup label="Logística e Automotiva">
                  <option value="Motorista (CNH D/E)"></option>
                  <option value="Entregador"></option>
                  <option value="Mecânico Automotivo"></option>
                  <option value="Borracheiro"></option>
                  <option value="Alinhador/Balanceador"></option>
                </optgroup>
              </datalist>
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
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
}

.onboarding-card {
  max-width: 640px;
  width: 100%;
  background: white;
  border-radius: 32px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

@media (max-width: 640px) {
  .onboarding-card { padding: 40px 24px; }
  .form-row { grid-template-columns: 1fr; }
}

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
  margin-bottom: 40px;
  text-align: center;
}

.step-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: #268C52;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 16px;
}

.step-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
}

.step-header p {
  color: #64748b;
  font-size: 1.1rem;
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
