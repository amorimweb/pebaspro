<script setup lang="ts">
definePageMeta({ layout: false, noPadding: true })

const supabase = useSupabaseClient()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const done = ref(false)
const errorMsg = ref('')

// Supabase redireciona com #access_token na URL — o cliente detecta automaticamente
// Mas em alguns casos precisamos aguardar a sessão ser restaurada
const user = useSupabaseUser()

const handleUpdate = async () => {
  errorMsg.value = ''

  if (password.value.length < 6) {
    errorMsg.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true

  const { error } = await supabase.auth.updateUser({ password: password.value })

  loading.value = false

  if (error) {
    errorMsg.value = 'Não foi possível atualizar a senha. O link pode ter expirado.'
  } else {
    done.value = true
    // Redireciona após 3s
    setTimeout(() => navigateTo('/login'), 3000)
  }
}

const strength = computed(() => {
  const p = password.value
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
})

const strengthLabel = computed(() => {
  if (!password.value) return ''
  if (strength.value <= 1) return { text: 'Fraca', color: '#ef4444' }
  if (strength.value <= 3) return { text: 'Média', color: '#f59e0b' }
  return { text: 'Forte', color: '#10b981' }
})
</script>

<template>
  <div class="page">
    <div class="card">

      <!-- Logo -->
      <div class="logo">
        <span>⚡</span>
        <strong class="text-green-600">PEBASPRO</strong>
      </div>

      <!-- Sessão não encontrada -->
      <div v-if="!user && !done" class="warning-state">
        <div class="warning-icon">⚠️</div>
        <h1>Link inválido ou expirado</h1>
        <p>Solicite um novo link de redefinição de senha.</p>
        <NuxtLink to="/esqueci-senha" class="btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center; margin-top:20px;">
          Solicitar novo link
        </NuxtLink>
      </div>

      <!-- Sucesso -->
      <div v-else-if="done" class="success-state">
        <div class="success-icon">✅</div>
        <h1>Senha atualizada!</h1>
        <p>Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes.</p>
        <NuxtLink to="/login" class="btn-back">Ir para o login agora</NuxtLink>
      </div>

      <!-- Formulário -->
      <div v-else>
        <div class="header">
          <h1>Redefinir senha</h1>
          <p>Escolha uma nova senha segura para sua conta.</p>
        </div>

        <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

        <form @submit.prevent="handleUpdate" class="form">
          <!-- Nova senha -->
          <div class="form-group">
            <label for="password">Nova senha</label>
            <div class="input-wrapper">
              <input
                v-model="password"
                id="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                required
                autocomplete="new-password"
              />
              <button type="button" @click="showPassword = !showPassword" class="eye-btn" tabindex="-1">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <!-- Força da senha -->
            <div v-if="password" class="strength-bar">
              <div class="strength-track">
                <div
                  class="strength-fill"
                  :style="{ width: `${(strength / 5) * 100}%`, background: (strengthLabel as any)?.color }"
                />
              </div>
              <span class="strength-label" :style="{ color: (strengthLabel as any)?.color }">
                {{ (strengthLabel as any)?.text }}
              </span>
            </div>
          </div>

          <!-- Confirmar senha -->
          <div class="form-group">
            <label for="confirm">Confirmar nova senha</label>
            <input
              v-model="confirmPassword"
              id="confirm"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Repita a senha"
              required
              autocomplete="new-password"
            />
            <span v-if="confirmPassword && confirmPassword !== password" class="field-error">
              As senhas não coincidem
            </span>
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"/>
            {{ loading ? 'Atualizando...' : 'Redefinir senha' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
}

.card {
  width: 100%;
  max-width: 460px;
  background: white;
  border-radius: 28px;
  padding: 48px 44px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 36px;
}
.logo span {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
}

.header h1 { font-size: 1.7rem; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
.header p  { color: #64748b; font-size: 0.95rem; line-height: 1.6; }

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 12px;
  margin: 16px 0;
}

.form { margin-top: 28px; display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
}

.input-wrapper { position: relative; }
.input-wrapper input { padding-right: 48px !important; }
.eye-btn {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 4px;
}

.form-group input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8fafc;
  box-sizing: border-box;
}
.form-group input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  background: white;
}

/* Força da senha */
.strength-bar { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.strength-track { flex: 1; height: 4px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 99px; transition: width 0.3s, background 0.3s; }
.strength-label { font-size: 0.75rem; font-weight: 700; width: 40px; }

.field-error { font-size: 0.78rem; color: #dc2626; font-weight: 600; }

.btn-primary {
  height: 52px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: inherit;
  width: 100%;
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Warning / Success */
.warning-state, .success-state { text-align: center; }
.warning-icon, .success-icon { font-size: 3.2rem; margin-bottom: 16px; display: block; }
.warning-state h1, .success-state h1 { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
.warning-state p, .success-state p { color: #475569; font-size: 0.95rem; line-height: 1.7; }
.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 12px 28px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-back:hover { background: #e2e8f0; }
</style>
