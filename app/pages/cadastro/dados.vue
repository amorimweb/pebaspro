<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useProfileStore } from '~/stores/profile'

type AccountType = 'talento' | 'prestador' | 'empresa'

definePageMeta({
  layout: false,
  noPadding: true
})

const PENDING_PROFILE_KEY = 'pebas_pending_complete_profile'
const supabase = useSupabaseClient()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const typeCookie = useCookie<AccountType | null>('pebas_pending_type', { maxAge: 3600 })

const step = ref(1)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  tipo_conta: (typeCookie.value || '') as AccountType | '',
  nome: '',
  documento: '',
  telefone: '',
  cidade: '',
  estado: '',
  regiao: '',
  endereco: '',
  profissao: '',
  objetivo_profissional: '',
  habilidades_input: '',
  sobre_mim: '',
  biografia: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false
})

const accountTypes = [
  { id: 'talento' as AccountType, title: 'Talento', description: 'Busco vagas de emprego' },
  { id: 'prestador' as AccountType, title: 'Prestador', description: 'Ofereco meus servicos' },
  { id: 'empresa' as AccountType, title: 'Empresa', description: 'Quero contratar talentos' }
]

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const isEmpresa = computed(() => form.tipo_conta === 'empresa')
const isPrestador = computed(() => form.tipo_conta === 'prestador')
const typeName = computed(() => accountTypes.find(type => type.id === form.tipo_conta)?.title || 'perfil')
const docLabel = computed(() => isEmpresa.value ? 'CNPJ' : isPrestador.value ? 'CPF ou CNPJ' : 'CPF')
const professionLabel = computed(() => isEmpresa.value ? 'Segmento da empresa' : isPrestador.value ? 'Especialidade principal' : 'Profissao / cargo desejado')
const currentTitle = computed(() => [
  'Identificacao',
  'Localizacao',
  'Apresentacao',
  'Revise seus dados',
  'Crie seu acesso'
][step.value - 1])

const maskTelefone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
}

const maskCPF = (value: string) => value.replace(/\D/g, '').slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const maskCNPJ = (value: string) => value.replace(/\D/g, '').slice(0, 14)
  .replace(/(\d{2})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1/$2')
  .replace(/(\d{4})(\d{1,2})$/, '$1-$2')

const applyDocMask = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return isEmpresa.value || (isPrestador.value && digits.length > 11) ? maskCNPJ(value) : maskCPF(value)
}

const validarCPF = (cpf: string) => {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  let sum = 0
  for (let index = 0; index < 9; index++) sum += Number(n[index]) * (10 - index)
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== Number(n[9])) return false
  sum = 0
  for (let index = 0; index < 10; index++) sum += Number(n[index]) * (11 - index)
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  return digit === Number(n[10])
}

const validarCNPJ = (cnpj: string) => {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
  const calc = (length: number) => {
    let sum = 0
    let factor = length - 7
    for (let index = length; index >= 1; index--) {
      sum += Number(n[length - index]) * factor--
      if (factor < 2) factor = 9
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  return calc(12) === Number(n[12]) && calc(13) === Number(n[13])
}

const validateDocument = () => {
  const digits = form.documento.replace(/\D/g, '')
  if (isEmpresa.value) return validarCNPJ(form.documento)
  if (isPrestador.value && digits.length > 11) return validarCNPJ(form.documento)
  return validarCPF(form.documento)
}

const setError = (message: string) => {
  errorMsg.value = message
  return false
}

const validateStep = (targetStep = step.value) => {
  errorMsg.value = ''
  if (targetStep === 1) {
    if (!form.tipo_conta) return setError('Escolha o tipo de perfil.')
    if (form.nome.trim().length < 3) return setError('Informe seu nome ou razao social.')
    if (!validateDocument()) return setError(`${docLabel.value} invalido. Verifique o numero informado.`)
    if (form.telefone.replace(/\D/g, '').length < 10) return setError('Informe um WhatsApp ou celular valido.')
  }
  if (targetStep === 2 && (!form.cidade.trim() || !form.estado)) {
    return setError('Informe cidade e estado.')
  }
  if (targetStep === 3) {
    if (form.profissao.trim().length < 3) return setError(`Informe ${professionLabel.value.toLowerCase()}.`)
    if (form.sobre_mim.trim().length < 20) return setError('Escreva um resumo com pelo menos 20 caracteres.')
    if (form.tipo_conta === 'talento' && form.objetivo_profissional.trim().length < 3) {
      return setError('Informe seu objetivo profissional.')
    }
    if (form.tipo_conta === 'talento' && !form.habilidades_input.trim()) {
      return setError('Informe suas principais habilidades.')
    }
  }
  if (targetStep === 5) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Informe um e-mail valido.')
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    if (form.password !== form.confirmPassword) return setError('As senhas nao coincidem.')
    if (!form.termsAccepted) return setError('Aceite os termos e a politica de privacidade.')
  }
  return true
}

const nextStep = () => {
  if (validateStep()) step.value++
}

const prevStep = () => {
  errorMsg.value = ''
  step.value--
}

const profilePayload = () => ({
  nome: form.nome.trim(),
  documento: form.documento,
  telefone: form.telefone,
  cidade: form.cidade.trim().toUpperCase(),
  estado: form.estado,
  regiao: form.regiao.trim() || null,
  endereco: form.endereco.trim() || null,
  profissao: form.profissao.trim(),
  objetivo_profissional: form.tipo_conta === 'talento' ? form.objetivo_profissional.trim() : null,
  habilidades: form.tipo_conta === 'talento'
    ? form.habilidades_input.split(',').map(skill => skill.trim()).filter(Boolean)
    : [],
  sobre_mim: form.sobre_mim.trim(),
  biografia: form.biografia.trim() || form.sobre_mim.trim(),
  tipo_conta: form.tipo_conta,
  cadastro_completo: true,
  status: 'ativo'
})

const redirectCompleteProfile = async (token?: string) => {
  const result = await authStore.fetchProfile(token)
  const profile = result?.data
  if (!profile) return false
  const routes: Record<string, string> = {
    talento: '/',
    prestador: '/painel/prestador',
    empresa: '/painel/empresa'
  }
  await navigateTo(routes[profile.tipo_conta || ''] || '/')
  return true
}

const handleSignUp = async () => {
  if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(5)) return
  loading.value = true
  successMsg.value = ''
  const cadastro = profilePayload()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { cadastro },
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })
    if (error) throw error

    if (data.session?.access_token && data.user) {
      const loaded = await redirectCompleteProfile(data.session.access_token)
      if (!loaded) {
        await profileStore.createProfile({ id: data.user.id, email: form.email.trim(), ...cadastro })
        await redirectCompleteProfile(data.session.access_token)
      }
      return
    }

    successMsg.value = 'Cadastro concluido. Confirme seu e-mail para acessar sua conta.'
  } catch (error: any) {
    errorMsg.value = error?.message || 'Nao foi possivel criar sua conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignUp = async () => {
  if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return
  if (!form.termsAccepted) {
    errorMsg.value = 'Aceite os termos e a politica de privacidade.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profilePayload()))
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/confirm` }
  })
  if (error) {
    localStorage.removeItem(PENDING_PROFILE_KEY)
    errorMsg.value = error.message
    loading.value = false
  }
}

const goBack = () => navigateTo('/cadastro')
</script>

<template>
  <div class="registration-page">
    <div class="registration-card">
      <div class="progress">
        <span :style="{ width: `${(step / 5) * 100}%` }"></span>
      </div>

      <header>
        <button v-if="step === 1" class="back" type="button" @click="goBack">Voltar</button>
        <button v-else class="back" type="button" @click="prevStep">Voltar</button>
        <img src="/PEBASPRO-logo.png" alt="PEBASPRO" />
        <p class="step">Etapa {{ step }} de 5</p>
        <h1>{{ currentTitle }}</h1>
        <p class="subtitle">Seu cadastro sera criado completo somente ao finalizar.</p>
      </header>

      <p v-if="errorMsg" class="banner error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="banner success">{{ successMsg }}</p>

      <form v-if="!successMsg" class="form" @submit.prevent="handleSignUp">
        <section v-if="step === 1">
          <label>Tipo de perfil</label>
          <div class="types">
            <button
              v-for="type in accountTypes"
              :key="type.id"
              type="button"
              :class="{ selected: form.tipo_conta === type.id }"
              @click="form.tipo_conta = type.id"
            >
              <strong>{{ type.title }}</strong>
              <small>{{ type.description }}</small>
            </button>
          </div>
          <label>Nome completo / Razao social</label>
          <input v-model="form.nome" type="text" required placeholder="Como voce quer ser identificado?" />
          <div class="row">
            <div>
              <label>{{ docLabel }}</label>
              <input
                :value="form.documento"
                type="text"
                required
                :placeholder="isEmpresa ? '00.000.000/0001-00' : '000.000.000-00'"
                @input="form.documento = applyDocMask(($event.target as HTMLInputElement).value)"
              />
            </div>
            <div>
              <label>WhatsApp / Celular</label>
              <input
                :value="form.telefone"
                type="text"
                required
                placeholder="(94) 99999-9999"
                @input="form.telefone = maskTelefone(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </section>

        <section v-else-if="step === 2">
          <div class="row">
            <div>
              <label>Cidade</label>
              <input
                :value="form.cidade"
                type="text"
                required
                placeholder="SUA CIDADE"
                @input="form.cidade = ($event.target as HTMLInputElement).value.toUpperCase()"
              />
            </div>
            <div>
              <label>Estado</label>
              <select v-model="form.estado" required>
                <option value="" disabled>Selecione</option>
                <option v-for="uf in ESTADOS_BR" :key="uf" :value="uf">{{ uf }}</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div>
              <label>Bairro</label>
              <input v-model="form.regiao" type="text" placeholder="Opcional" />
            </div>
            <div>
              <label>Endereco de referencia</label>
              <input v-model="form.endereco" type="text" placeholder="Opcional" />
            </div>
          </div>
        </section>

        <section v-else-if="step === 3">
          <label>{{ professionLabel }}</label>
          <input v-model="form.profissao" type="text" required placeholder="Informe sua area de atuacao" />
          <template v-if="form.tipo_conta === 'talento'">
            <label>Objetivo profissional</label>
            <input v-model="form.objetivo_profissional" type="text" required placeholder="Qual oportunidade voce busca?" />
            <label>Habilidades principais</label>
            <input v-model="form.habilidades_input" type="text" required placeholder="Ex: manutencao, atendimento, Excel" />
          </template>
          <label>{{ form.tipo_conta === 'empresa' ? 'Descricao da empresa' : form.tipo_conta === 'prestador' ? 'Descricao dos servicos' : 'Resumo profissional' }}</label>
          <textarea v-model="form.sobre_mim" rows="4" required placeholder="Escreva um breve resumo para o seu perfil."></textarea>
          <label>Biografia detalhada <small>(opcional)</small></label>
          <textarea v-model="form.biografia" rows="3" placeholder="Acrescente detalhes que ajudam a apresentar seu perfil."></textarea>
        </section>

        <section v-else-if="step === 4" class="review">
          <div class="review-line"><span>Perfil</span><strong>{{ typeName }}</strong></div>
          <div class="review-line"><span>Nome</span><strong>{{ form.nome }}</strong></div>
          <div class="review-line"><span>{{ docLabel }}</span><strong>{{ form.documento }}</strong></div>
          <div class="review-line"><span>Contato</span><strong>{{ form.telefone }}</strong></div>
          <div class="review-line"><span>Localizacao</span><strong>{{ form.cidade }}, {{ form.estado }}</strong></div>
          <div class="review-line"><span>{{ professionLabel }}</span><strong>{{ form.profissao }}</strong></div>
          <p class="review-summary">{{ form.sobre_mim }}</p>
          <p class="note">E-mail e senha serao informados somente no proximo passo.</p>
        </section>

        <section v-else class="access">
          <p class="note">Seus dados estao prontos. Agora escolha como deseja acessar a plataforma.</p>
          <label>E-mail</label>
          <input v-model="form.email" type="email" autocomplete="email" placeholder="seu@email.com" />
          <div class="row">
            <div>
              <label>Senha</label>
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Minimo de 6 caracteres" />
              <button class="toggle" type="button" @click="showPassword = !showPassword">{{ showPassword ? 'Ocultar' : 'Mostrar' }}</button>
            </div>
            <div>
              <label>Confirmar senha</label>
              <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password" />
              <button class="toggle" type="button" @click="showConfirmPassword = !showConfirmPassword">{{ showConfirmPassword ? 'Ocultar' : 'Mostrar' }}</button>
            </div>
          </div>
          <label class="terms">
            <input v-model="form.termsAccepted" type="checkbox" />
            <span>Li e aceito os <NuxtLink to="/termos" target="_blank">Termos de Uso</NuxtLink> e a <NuxtLink to="/privacidade" target="_blank">Politica de Privacidade</NuxtLink>.</span>
          </label>
          <div class="divider"><span>ou</span></div>
          <button type="button" class="google" :disabled="loading" @click="handleGoogleSignUp">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
            Criar acesso com Google
          </button>
        </section>

        <div class="actions">
          <button v-if="step < 5" class="primary" type="button" @click="nextStep">Continuar</button>
          <button v-else class="primary" type="submit" :disabled="loading">
            {{ loading ? 'Criando conta...' : 'Criar minha conta' }}
          </button>
        </div>
      </form>

      <footer v-else>
        <NuxtLink to="/login">Ir para login</NuxtLink>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.registration-page { min-height: 100dvh; background: #f1f5f9; padding: 20px; display: flex; justify-content: center; align-items: flex-start; font-family: Inter, sans-serif; }
.registration-card { margin-block: 12px; width: 100%; max-width: 720px; padding: 34px 24px; background: #fff; border-radius: 28px; box-shadow: 0 18px 40px rgba(15, 23, 42, .07); position: relative; overflow: hidden; }
.progress { position: absolute; inset: 0 0 auto; height: 6px; background: #e2e8f0; }
.progress span { height: 100%; display: block; background: linear-gradient(90deg, #268c52, #177486); transition: width .25s; }
header { text-align: center; margin-bottom: 24px; position: relative; }
header img { height: 58px; display: block; margin: 0 auto 18px; }
.back { position: absolute; left: 0; top: 20px; background: none; border: 0; color: #268c52; font-weight: 700; cursor: pointer; }
.step { color: #268c52; text-transform: uppercase; font-size: .75rem; font-weight: 800; letter-spacing: .12em; margin: 0 0 8px; }
h1 { margin: 0 0 6px; color: #0f172a; font-size: 1.8rem; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; }
.form section { display: flex; flex-direction: column; gap: 14px; }
label { color: #334155; font-size: .92rem; font-weight: 700; }
input:not([type=checkbox]), select, textarea { width: 100%; padding: 13px 15px; border: 1px solid #dbe3ec; border-radius: 12px; font: inherit; color: #0f172a; outline: none; background: #fff; }
input:focus, select:focus, textarea:focus { border-color: #268c52; box-shadow: 0 0 0 3px rgba(38, 140, 82, .12); }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.row > div { display: flex; flex-direction: column; gap: 8px; position: relative; }
.types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.types button { border: 1px solid #dbe3ec; border-radius: 12px; background: #fff; padding: 12px 8px; cursor: pointer; text-align: center; }
.types button.selected { border-color: #268c52; background: #f0fdf4; }
.types strong, .types small { display: block; }
.types small { margin-top: 3px; color: #64748b; font-size: .75rem; }
.banner { margin: 0 0 18px; border-radius: 12px; padding: 12px 14px; font-weight: 600; font-size: .9rem; }
.error { color: #b91c1c; background: #fef2f2; }
.success { color: #166534; background: #f0fdf4; }
.actions { display: flex; justify-content: flex-end; margin-top: 28px; }
.primary { min-width: 185px; padding: 14px 20px; border: 0; border-radius: 12px; background: linear-gradient(90deg, #268c52, #177486); color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
.primary:disabled, .google:disabled { opacity: .65; cursor: wait; }
.review { background: #f8fafc; border-radius: 16px; padding: 8px 18px 18px; }
.review-line { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
.review-line span { color: #64748b; }
.review-line strong { text-align: right; }
.review-summary { color: #334155; line-height: 1.55; margin: 10px 0 0; }
.note { color: #64748b; font-size: .9rem; background: #f8fafc; border-radius: 10px; padding: 12px; margin: 0; }
.toggle { position: absolute; right: 10px; bottom: 12px; border: 0; background: #fff; color: #268c52; font-weight: 700; cursor: pointer; font-size: .8rem; }
.terms { display: flex; gap: 10px; align-items: flex-start; margin-top: 6px; font-weight: 500; line-height: 1.4; }
.terms input { margin-top: 3px; accent-color: #268c52; }
.terms a, footer a { color: #268c52; font-weight: 700; }
.divider { height: 1px; background: #e2e8f0; margin: 12px 0 4px; text-align: center; }
.divider span { position: relative; top: -11px; background: #fff; padding: 0 12px; color: #94a3b8; }
.google { display: flex; height: 52px; width: 100%; align-items: center; justify-content: center; gap: 10px; border: 1px solid #dbe3ec; border-radius: 12px; background: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.google img { width: 20px; height: 20px; }
footer { text-align: center; margin-top: 20px; }
@media (max-width: 620px) {
  .registration-card { padding: 30px 18px; }
  .row, .types { grid-template-columns: 1fr; }
  .back { top: 4px; }
  header img { margin-top: 22px; }
}
</style>
