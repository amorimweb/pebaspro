<script setup lang="ts">
import { completeRegistrationRoute, profileHomeRoute } from '~/utils/authRedirect'

const authStore = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const infoMsg = computed(() => {
  if (route.query.registered === 'check-email') {
    return 'Cadastro criado. Confirme seu e-mail para entrar na plataforma.'
  }
  return ''
})
definePageMeta({
  layout: false,
  noPadding: true
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const result = await authStore.signInWithPassword(email.value, password.value)

    if (result.error) {
      const message = result.error?.message || ''
      const statusCode = result.error?.statusCode || result.error?.status
      const errorMap: Record<string, string> = {
        'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
        'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
        'User not found': 'Nenhuma conta encontrada com este e-mail.',
        'Invalid login credentials': 'E-mail ou senha incorretos.',
      }
      if (statusCode === 404) {
        await navigateTo(completeRegistrationRoute)
        return
      }

      errorMsg.value = errorMap[message] || 'Ocorreu um erro ao entrar. Tente novamente.'
      return
    }

    if (!result.data) {
      await navigateTo(completeRegistrationRoute)
      return
    }

    await navigateTo(profileHomeRoute(result.data), { replace: true })
  } catch (error: any) {
    console.error('Erro no login:', error)
    errorMsg.value = 'Ocorreu um erro ao tentar entrar. Tente novamente.'
  } finally {
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
        <div v-if="infoMsg" class="info-banner">
          {{ infoMsg }}
        </div>

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
      </form>

      <div class="auth-footer">
        Não tem uma conta? <NuxtLink to="/cadastro">Cadastre-se</NuxtLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9; /* Um pouco mais escuro para destacar o card branco */
  overflow-x: hidden;
  padding: 16px;
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
  padding: 28px 20px;
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
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .auth-header {
    margin-bottom: 32px;
  }
}

.auth-logo {
  height: 64px;
  margin: 0 auto 18px;
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
  gap: 16px;
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

.info-banner {
  background-color: #f0fdf4;
  color: #166534;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
  font-weight: 600;
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

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-height: 720px) {
  .auth-page {
    align-items: flex-start;
    padding-block: 12px;
  }

  .auth-card {
    padding-block: 20px;
  }

  .auth-logo {
    height: 52px;
    margin-bottom: 12px;
  }

  .auth-header {
    margin-bottom: 14px;
  }

  .auth-header h1 {
    font-size: 1.5rem;
  }

  .auth-form {
    gap: 12px;
  }

  .form-group input,
  .submit-btn {
    height: 44px;
  }

  .auth-footer {
    margin-top: 16px;
  }
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
