<script setup lang="ts">
import { useProfileStore } from '~/stores/profile'
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nome = ref('')
const documento = ref('')
const telefone = ref('')
const cidade = ref('')
const estado = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

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

// Para prestador: detecta CPF ou CNPJ pelo número de dígitos digitados
const isPrestador = computed(() => chosenType.value === 'prestador')
const isEmpresa = computed(() => chosenType.value === 'empresa')

// Detecta se o campo atual é CNPJ (empresa sempre é CNPJ; prestador é CNPJ se já tem >11 dígitos)
const isCNPJ = computed(() => {
  if (isEmpresa.value) return true
  if (isPrestador.value) return documento.value.replace(/\D/g, '').length > 11
  return false
})

const docLabel = computed(() => {
  if (isEmpresa.value) return 'CNPJ'
  if (isPrestador.value) return 'CPF ou CNPJ'
  return 'CPF'
})
const docPlaceholder = computed(() => isCNPJ.value ? '00.000.000/0001-00' : '000.000.000-00')
const docMaxLength = computed(() => {
  if (isEmpresa.value || isPrestador.value) return 18
  return 14
})

const applyDocMask = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  if (isEmpresa.value) return maskCNPJ(raw)
  if (isPrestador.value) return digits.length > 11 ? maskCNPJ(raw) : maskCPF(raw)
  return maskCPF(raw)
}

// Validações de dígito verificador
const validarCPF = (cpf: string) => {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += Number(n.charAt(i)) * (10 - i)
  let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  if (r !== Number(n.charAt(9))) return false
  s = 0
  for (let i = 0; i < 10; i++) s += Number(n.charAt(i)) * (11 - i)
  r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  return r === Number(n.charAt(10))
}

const validarCNPJ = (cnpj: string) => {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
  const calc = (len: number) => {
    let s = 0, pos = len - 7
    for (let i = len; i >= 1; i--) { s += Number(n.charAt(len - i)) * pos--; if (pos < 2) pos = 9 }
    const r = s % 11; return r < 2 ? 0 : 11 - r
  }
  return calc(12) === Number(n.charAt(12)) && calc(13) === Number(n.charAt(13))
}

const docError = ref('')
const validateDoc = () => {
  // Re-aplica máscara antes de validar (garante formato correto)
  documento.value = applyDocMask(documento.value)

  const digits = documento.value.replace(/\D/g, '')
  if (!digits) { docError.value = ''; return }

  if (isEmpresa.value) {
    docError.value = validarCNPJ(documento.value) ? '' : 'CNPJ inválido'
  } else if (isPrestador.value) {
    if (digits.length > 11) {
      docError.value = validarCNPJ(documento.value) ? '' : 'CNPJ inválido'
    } else {
      docError.value = validarCPF(documento.value) ? '' : 'CPF inválido'
    }
  } else {
    docError.value = validarCPF(documento.value) ? '' : 'CPF inválido'
  }
}

const typeCookie = useCookie('pebas_pending_type')
const chosenType = computed(() => typeCookie.value || 'talento')

definePageMeta({
  layout: false,
  noPadding: true
})

const handleSignUp = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // 1. Validar senhas
    if (password.value !== confirmPassword.value) {
      errorMsg.value = 'As senhas não coincidem.'
      loading.value = false
      return
    }

    // 2. Validar cidade e estado
    if (!cidade.value.trim() || !estado.value) {
      errorMsg.value = 'Preencha sua cidade e estado.'
      loading.value = false
      return
    }

    // 3. Validar documento
    let docValido = false
    const digits = documento.value.replace(/\D/g, '')
    if (isEmpresa.value) docValido = validarCNPJ(documento.value)
    else if (isPrestador.value) docValido = digits.length > 11 ? validarCNPJ(documento.value) : validarCPF(documento.value)
    else docValido = validarCPF(documento.value)
    
    if (!docValido) {
      errorMsg.value = `${docLabel.value} inválido. Verifique os dados e tente novamente.`
      loading.value = false
      return
    }

    // 2. Prosseguir com cadastro no Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: nome.value,
          tipo_conta: chosenType.value,
          documento: documento.value,
          telefone: telefone.value,
        },
        emailRedirectTo: `${window.location.origin}/confirm`,
      }
    })

    if (error) {
      errorMsg.value = error.message
      loading.value = false
    } else if (data.user) {
      // 3. Criação do Perfil via Store Centralizado
      const profileStore = useProfileStore()
      const { error: profileError } = await profileStore.createProfile({
          id: data.user.id,
          nome: nome.value,
          email: email.value,
          documento: documento.value,
          telefone: telefone.value,
          cidade: cidade.value.toUpperCase(),
          estado: estado.value,
          tipo_conta: chosenType.value as any
      })

      if (profileError) {
         console.error('Aviso: Erro ao criar perfil:', profileError)
      }

      // SEMPRE redirecionar para o onboarding para completar o perfil
      await navigateTo('/cadastro/onboarding')
    } else {
      // Caso o Supabase exija confirmação (fallback)
      successMsg.value = 'Quase lá! Verifique seu e-mail para confirmar seu acesso.'
      loading.value = false
    }
  } catch (error: any) {
    console.error('Erro no cadastro:', error)
    errorMsg.value = error.data?.message || 'Erro ao criar conta. Tente novamente.'
    loading.value = false
  }
}
const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })
  if (error) errorMsg.value = error.message
}
const goBack = () => {
  typeCookie.value = null
  navigateTo('/cadastro')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <button @click="goBack" class="back-btn mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Mudar perfil selecionado
        </button>
        <h1>Dados do seu perfil</h1>
        <p>Complete o cadastro como <strong>{{ chosenType === 'talento' ? 'Talento' : chosenType === 'prestador' ? 'Prestador' : 'Empresa' }}</strong></p>
      </div>

      <form @submit.prevent="handleSignUp" class="auth-form">
        <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-banner">{{ successMsg }}</div>

        <div class="form-group">
          <label for="nome">Nome Completo / Razão Social</label>
          <input v-model="nome" id="nome" type="text" placeholder="Como quer ser identificado?" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="documento">{{ docLabel }}</label>
            <input 
              :value="documento" 
              @input="documento = applyDocMask(($event.target as HTMLInputElement).value)"
              @blur="validateDoc"
              id="documento" 
              type="text" 
              :placeholder="docPlaceholder" 
              required 
              :maxlength="docMaxLength"
              :class="{ 'input-error': docError }"
            />
            <span v-if="docError" class="field-error">{{ docError }}</span>
          </div>
          <div class="form-group">
            <label for="telefone">WhatsApp / Celular</label>
            <input 
              :value="telefone" 
              @input="telefone = maskTelefone(($event.target as HTMLInputElement).value)"
              id="telefone" 
              type="text" 
              placeholder="(94) 90000-0000" 
              required 
              maxlength="15"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="cidade">Cidade</label>
            <input
              :value="cidade"
              @input="cidade = ($event.target as HTMLInputElement).value.toUpperCase()"
              id="cidade"
              type="text"
              placeholder="SUA CIDADE"
              required
              style="text-transform: uppercase;"
            />
          </div>
          <div class="form-group">
            <label for="estado">Estado</label>
            <select v-model="estado" id="estado" required class="select-field">
              <option value="" disabled>Selecione</option>
              <option v-for="uf in ESTADOS_BR" :key="uf" :value="uf">{{ uf }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input v-model="email" id="email" type="email" placeholder="seu@email.com" required />
        </div>

        <div class="form-group">
          <label for="password">Senha de Acesso</label>
          <div class="password-input-wrapper">
            <input 
              v-model="password" 
              id="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Mínimo 6 caracteres" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Senha</label>
          <div class="password-input-wrapper">
            <input 
              v-model="confirmPassword" 
              id="confirmPassword" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Digite a senha novamente" 
              required 
            />
            <button type="button" @click="showPassword = !showPassword" class="eye-btn">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Preparando tudo...' : 'Criar minha conta' }}
        </button>

        <div class="divider">
          <span>ou continue com</span>
        </div>

        <button type="button" @click="loginWithGoogle" class="google-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Google
        </button>
      </form>

      <div class="auth-footer">
        Ao se cadastrar, você concorda com nossos termos.
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  padding: 60px 20px;
  font-family: 'Inter', sans-serif;
}

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

.auth-card {
  max-width: 560px;
  width: 100%;
  background: white;
  padding: 32px 24px;
  border-radius: 32px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .auth-card {
    padding: 56px;
  }
}

.auth-header {
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 10px 18px;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  width: fit-content;
}

.back-btn:hover {
  background-color: white;
  border-color: #268C52;
  color: #268C52;
  transform: translateX(-4px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.mb-6 {
    margin-bottom: 24px;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.auth-header p {
  color: #64748b;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  height: 52px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #268C52;
}

.select-field {
  height: 52px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: #0f172a;
  cursor: pointer;
  appearance: auto;
}

.select-field:focus {
  outline: none;
  border-color: #268C52;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  width: 100%;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.error-banner {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  font-size: 0.875rem;
}

.success-banner {
  background-color: #f0fdf4;
  color: #166534;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
}

.submit-btn {
  height: 52px;
  background: linear-gradient(to right, #268C52, #177486);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.auth-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 10px 0;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 12px;
}

.google-btn {
  height: 52px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.google-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.google-btn img {
  width: 20px;
  height: 20px;
}
</style>
