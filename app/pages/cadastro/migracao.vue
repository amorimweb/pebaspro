<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useProfileStore } from '~/stores/profile'
import type { Database } from '~/types'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const { uploadFile, loading: uploading } = useFileUpload()
const { coords, getLocation } = useLocation()

const step = ref(1)
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// Dados do formulário
const form = ref({
  nome: '',
  tipo_conta: '' as 'talento' | 'prestador' | 'empresa',
  documento: '',
  telefone: '',
  regiao: '',
  endereco: '',
  profissao: '',
  sobre_mim: '',
  biografia: '',
  foto: ''
})

onMounted(() => {
  getLocation()
  
  // Verificar se existem credenciais de migração
  const migrateCreds = useCookie('pebas_migrate_creds').value
  if (migrateCreds) {
    try {
      const creds = typeof migrateCreds === 'string' ? JSON.parse(migrateCreds) : migrateCreds
      if (creds.email) {
        form.value.nome = creds.email.split('@')[0]
      }
    } catch (e) {
      console.error('Erro ao ler credenciais de migração:', e)
    }
  }
})

const maskTelefone = (v: string) => {
  v = v.replace(/\D/g, "")
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
  v = v.replace(/(\d)(\d{4})$/, "$1-$2")
  return v
}

const maskCPF = (v: string) => {
  v = v.replace(/\D/g, "")
  v = v.replace(/(\d{3})(\d)/, "$1.$2")
  v = v.replace(/(\d{3})(\d)/, "$1.$2")
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return v
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedFile.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

const steps = [
  { id: 1, title: 'Seu Nome', subtitle: 'Como devemos te chamar?' },
  { id: 2, title: 'Tipo de Conta', subtitle: 'Qual o seu objetivo na PEBASPRO?' },
  { id: 3, title: 'Documento', subtitle: 'Para sua segurança, informe seu CPF ou CNPJ.' },
  { id: 4, title: 'Contato', subtitle: 'Seu WhatsApp principal.' },
  { id: 5, title: 'Localização', subtitle: 'Onde você está localizado?' },
  { id: 6, title: 'Foto de Perfil', subtitle: 'Uma imagem passa mais confiança.' },
  { id: 7, title: 'Sua Profissão', subtitle: 'No que você trabalha?' },
  { id: 8, title: 'Sobre Você', subtitle: 'Um breve resumo para o seu perfil.' }
]

const accountTypes = [
  { id: 'talento', label: 'Talento', desc: 'Candidato em busca de vagas e oportunidades.' },
  { id: 'prestador', label: 'Prestador', desc: 'Profissional autônomo oferecendo serviços técnicos.' },
  { id: 'empresa', label: 'Empresa', desc: 'Gestor buscando talentos ou contratando serviços.' }
]

const totalSteps = steps.length

const nextStep = () => {
  if (canGoNext.value && step.value < totalSteps) step.value++
}

const prevStep = () => {
  if (step.value > 1) step.value--
}

const canGoNext = computed(() => {
  switch (step.value) {
    case 1: return form.value.nome.trim().length > 2
    case 2: return !!form.value.tipo_conta
    case 3: return form.value.documento.replace(/\D/g, '').length >= 11
    case 4: return form.value.telefone.replace(/\D/g, '').length >= 10
    case 5: return form.value.regiao.trim().length > 2 && form.value.endereco.trim().length > 3
    case 6: return !!photoPreview.value
    case 7: return form.value.profissao.trim().length > 2
    case 8: return form.value.sobre_mim.trim().length > 10
    default: return false
  }
})

const finishMigration = async () => {
  loading.value = true
  try {
    // 1. Verificar credenciais
    const migrateCookie = useCookie('pebas_migrate_creds')
    const migrateCreds = migrateCookie.value
    if (!migrateCreds) throw new Error('Credenciais de migração não encontradas. Tente fazer o login novamente.')

    const creds = typeof migrateCreds === 'string' ? JSON.parse(migrateCreds) : migrateCreds

    // 2. Realizar SignUp no Supabase
    let { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: creds.email,
      password: creds.password,
    })

    // MUDANÇA: Se o usuário já existir, apenas fazer o login para obter a sessão
    if (signUpError && (signUpError.message === 'User already registered' || signUpError.status === 422)) {
      console.log('Usuário já registrado no Supabase. Tentando login...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      })
      if (signInError) throw signInError
      signUpData = signInData
      signUpError = null
    }

    if (signUpError) throw signUpError
    if (!signUpData.user) throw new Error('Erro ao obter dados do usuário.')

    const userId = signUpData.user.id

    // 3. Upload da Foto (se houver)
    let fotoUrl = ''
    if (selectedFile.value) {
      const fileName = `${userId}-${Date.now()}.jpg`
      // Corrigido para bucket 'avatars' solicitado
      const { publicUrl, error: uploadError } = await uploadFile(selectedFile.value, `${fileName}`, 'avatars')
      if (uploadError) throw new Error(uploadError)
      fotoUrl = publicUrl || ''
    }

    // 4. Criar Perfil Completo
    const updates = {
      id: userId,
      email: creds.email,
      nome: form.value.nome,
      tipo_conta: form.value.tipo_conta,
      documento: form.value.documento,
      telefone: form.value.telefone,
      regiao: form.value.regiao,
      endereco: form.value.endereco,
      profissao: form.value.profissao,
      sobre_mim: form.value.sobre_mim,
      biografia: form.value.biografia || form.value.sobre_mim,
      foto: fotoUrl,
      latitude: (coords.value && typeof coords.value.latitude === 'number') ? coords.value.latitude : null,
      longitude: (coords.value && typeof coords.value.longitude === 'number') ? coords.value.longitude : null,
      cadastro_completo: true,
      status: 'ativo'
    }

    const { error: profileError } = await profileStore.createProfile(updates as any)
    if (profileError) throw profileError

    // 5. Limpar cookie apenas se tudo deu certo
    migrateCookie.value = null

    // 6. Redirecionar
    const redirectMap: Record<string, string> = {
      talento: '/perfil',
      empresa: '/painel/empresa',
      prestador: '/painel/prestador'
    }
    const target = redirectMap[form.value.tipo_conta as keyof typeof redirectMap] || '/'
    await navigateTo(target)
  } catch (err: any) {
    console.error('Erro na migração:', err)
    alert(`Erro ao salvar: ${err.message}`)
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: false,
  noPadding: true
})
</script>

<template>
  <div class="migration-page">
    <div class="migration-card">
      
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: (step / totalSteps) * 100 + '%' }"></div>
      </div>

      <div class="step-content">
        <div class="logo-container">
          <img src="/PEBASPRO-logo.png" alt="PEBASPRO" class="onboarding-logo" />
        </div>
        <div class="step-header">
          <span class="step-indicator">Pergunta {{ step }} de {{ totalSteps }}</span>
          <h1 v-if="steps[step-1]">{{ steps[step-1]?.title }}</h1>
          <p v-if="steps[step-1]">{{ steps[step-1]?.subtitle }}</p>
        </div>

        <div class="step-body">
          <!-- Step 1: Nome -->
          <div v-if="step === 1" class="form-group animate-in">
            <input v-model="form.nome" type="text" placeholder="Nome completo ou Razão Social" required autofocus @keyup.enter="nextStep" />
          </div>

          <!-- Step 2: Tipo de Conta -->
          <div v-if="step === 2" class="options-list animate-in">
            <button 
              v-for="tipo in accountTypes" 
              :key="tipo.id"
              :class="['option-item', { active: form.tipo_conta === tipo.id }]"
              @click="form.tipo_conta = tipo.id as any; nextStep()"
            >
              <div class="option-label">{{ tipo.label }}</div>
              <div class="option-desc">{{ tipo.desc }}</div>
            </button>
          </div>

          <!-- Step 3: Documento -->
          <div v-if="step === 3" class="form-group animate-in">
            <input 
              :value="form.documento" 
              @input="form.documento = maskCPF(($event.target as HTMLInputElement).value)" 
              type="text" 
              placeholder="CPF ou CNPJ" 
              maxlength="14"
              @keyup.enter="nextStep"
            />
          </div>

          <!-- Step 4: WhatsApp -->
          <div v-if="step === 4" class="form-group animate-in">
            <input 
              :value="form.telefone" 
              @input="form.telefone = maskTelefone(($event.target as HTMLInputElement).value)" 
              type="text" 
              placeholder="(94) 99999-9999" 
              maxlength="15"
              @keyup.enter="nextStep"
            />
          </div>

          <!-- Step 5: Localização -->
          <div v-if="step === 5" class="form-group animate-in">
            <input v-model="form.regiao" type="text" placeholder="Bairro / Região" @keyup.enter="nextStep" />
            <br>
            <input v-model="form.endereco" type="text" placeholder="Endereço (Opcional)" @keyup.enter="nextStep" />
          </div>

          <!-- Step 6: Foto -->
          <div v-if="step === 6" class="photo-step animate-in">
            <div class="photo-preview" @click="fileInput?.click()">
              <img v-if="photoPreview" :src="photoPreview" />
              <div v-else class="photo-placeholder">
                <span>📷</span>
                <p>Toque para selecionar</p>
              </div>
            </div>
            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
          </div>

          <!-- Step 7: Profissão -->
          <div v-if="step === 7" class="form-group animate-in">
            <input v-model="form.profissao" type="text" placeholder="Ex: Eletricista, Vendedor, etc." @keyup.enter="nextStep" />
          </div>

          <!-- Step 8: Sobre -->
          <div v-if="step === 8" class="form-group animate-in">
            <textarea v-model="form.sobre_mim" rows="5" placeholder="Fale um pouco sobre seus serviços ou objetivos..."></textarea>
          </div>
        </div>

        <div class="step-footer">
          <button v-if="step > 1" @click="prevStep" class="btn-back">Voltar</button>
          <div class="spacer"></div>
          <button v-if="step < totalSteps" @click="nextStep" class="btn-next" :disabled="!canGoNext">Próximo</button>
          <button v-else @click="finishMigration" class="btn-finish" :disabled="loading || !canGoNext">
            {{ loading ? 'Salvando...' : 'Concluir' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.migration-page {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.migration-card {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 24px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.progress-container {
  height: 6px;
  background: #e2e8f0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #268C52, #177486);
  transition: width 0.3s ease;
}

.step-content {
  padding: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.onboarding-logo {
  height: 60px;
  width: auto;
}

.step-header {
  margin-bottom: 32px;
}

.step-indicator {
  font-size: 0.8rem;
  font-weight: 700;
  color: #268C52;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
}

.step-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.step-header p {
  color: #64748b;
}

.step-body {
  flex: 1;
}

.animate-in {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: #268C52;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #268C52;
}

.option-item.active {
  border-color: #268C52;
  background: #f0fdf4;
}

.option-label {
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 0.875rem;
  color: #64748b;
}

.photo-step {
  display: flex;
  justify-content: center;
}

.photo-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #f1f5f9;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
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
}

.hidden { display: none; }

.step-footer {
  margin-top: 40px;
  display: flex;
  align-items: center;
}

.spacer { flex: 1; }

.btn-next, .btn-finish {
  padding: 12px 32px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-back {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-finish:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
