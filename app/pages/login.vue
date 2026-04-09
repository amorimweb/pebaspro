<script setup lang="ts">
type AccountType = 'talento' | 'prestador' | 'empresa' | 'cliente'
const authStore = useAuthStore()

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const showTypeSelection = ref(false)
const typeCookie = useCookie<AccountType | null>('pebas_pending_type', { maxAge: 3600 })

const profileTypes = [
  {
    id: 'talento' as AccountType,
    title: 'Talento',
    subtitle: 'Busco vagas de emprego',
    icon: '🎯',
    color: '#3b82f6'
  },
  {
    id: 'prestador' as AccountType,
    title: 'Prestador',
    subtitle: 'Ofereço meus serviços',
    icon: '🛠️',
    color: '#10b981'
  },
  {
    id: 'empresa' as AccountType,
    title: 'Empresa',
    subtitle: 'Quero contratar talentos',
    icon: '🏢',
    color: '#8b5cf6'
  }
]

definePageMeta({
  layout: false,
  noPadding: true
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    // Login direto com Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (error) {
      errorMsg.value = error.message
      return
    }
    
    if (data.user) {
      // Buscar perfil do usuário
      await authStore.fetchProfile()
      
      const profile = authStore.profile

      // 1. Se o perfil estiver incompleto, forçar onboarding
      if (!profile || !profile.cadastro_completo) {
        await navigateTo('/cadastro/onboarding')
        return
      }

      // 2. Redirecionar baseado no tipo de conta se o perfil estiver completo
      const redirectMap: Record<string, string> = {
        talento: '/',
        empresa: '/painel/empresa',
        prestador: '/painel/prestador',
        cliente: '/',
      }
      
      const target = redirectMap[profile.tipo_conta as keyof typeof redirectMap] || '/'
      await navigateTo(target)
    }
  } catch (error: any) {
    console.error('Erro no login:', error)
    errorMsg.value = 'Ocorreu um erro ao tentar entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = () => {
  showTypeSelection.value = true
}

const confirmGoogleLogin = async (type: AccountType) => {
  loading.value = true
  showTypeSelection.value = false
  typeCookie.value = type
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })
  
  if (error) {
    errorMsg.value = error.message
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <NuxtLink to="/">
          <img src="/PEBASPRO-logo.png" alt="PEBASPRO" class="auth-logo" />
        </NuxtLink>
        <h1>Bem-vindo de volta</h1>
        <p>Acesse sua conta para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="errorMsg" class="error-banner">
          {{ errorMsg }}
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            v-model="email" 
            id="email" 
            type="email" 
            placeholder="seu@email.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <div class="password-wrapper">
            <input 
              v-model="password" 
              id="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••" 
              required 
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>

        <div class="form-options">
          <NuxtLink to="/esqueci-senha" class="forgot-link">Esqueceu a senha?</NuxtLink>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="divider">
          <span>ou</span>
        </div>

        <button type="button" @click="loginWithGoogle" class="google-btn">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continuar com Google
        </button>
      </form>

      <div class="auth-footer">
        Não tem uma conta? <NuxtLink to="/cadastro">Cadastre-se</NuxtLink>
      </div>
    </div>

    <!-- Modal de Seleção de Perfil para Google -->
    <Teleport to="body">
      <div v-if="showTypeSelection" class="modal-overlay" @click="showTypeSelection = false">
        <div class="modal-content" @click.stop>
          <button class="close-modal" @click="showTypeSelection = false">&times;</button>
          
          <div class="modal-header">
            <h2>Como você quer usar o PEBASPRO?</h2>
            <p>Se você for um novo usuário, esse será o seu perfil inicial.</p>
          </div>

          <div class="types-grid-mini">
            <button 
              v-for="profile in profileTypes" 
              :key="profile.id" 
              class="type-card-mini"
              @click="confirmGoogleLogin(profile.id)"
            >
              <div class="card-icon-mini" :style="{ backgroundColor: profile.color + '20', color: profile.color }">
                {{ profile.icon }}
              </div>
              <div class="card-info-mini">
                <h3>{{ profile.title }}</h3>
                <p>{{ profile.subtitle }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9; /* Um pouco mais escuro para destacar o card branco */
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

@media (min-width: 768px) {
  .auth-page {
    padding: 40px 20px;
  }
}
 
.auth-card {
  max-width: 480px;
  width: 100%;
  background: white;
  padding: 32px 20px;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}

@media (min-width: 768px) {
  .auth-card {
    padding: 40px 48px;
  }
}
 
.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .auth-header {
    margin-bottom: 32px;
  }
}

.auth-logo {
  height: 80px;
  margin: 0 auto 24px;
  display: block;
}

.auth-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.auth-header p {
  color: #6b7280;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  height: 48px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #268C52;
  box-shadow: 0 0 0 3px rgba(38, 140, 82, 0.1);
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
}

.error-banner {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.form-options {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: 0.875rem;
  color: #268C52;
  text-decoration: none;
  font-weight: 500;
}

.submit-btn {
  height: 48px;
  background: linear-gradient(to right, #268C52, #177486);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
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
  transform: translateY(-1px);
}

.google-btn img {
  width: 20px;
  height: 20px;
}

.auth-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.auth-footer a {
  color: #268C52;
  text-decoration: none;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 40px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.close-modal {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.modal-header p {
  color: #64748b;
  font-size: 0.95rem;
}

.types-grid-mini {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-card-mini {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.type-card-mini:hover {
  background: white;
  border-color: #268C52;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-icon-mini {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-info-mini h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.card-info-mini p {
  font-size: 0.875rem;
  color: #64748b;
}
</style>
