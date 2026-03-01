<script setup lang="ts">
definePageMeta({ layout: false, noPadding: true })

const supabase = useSupabaseClient()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMsg = ref('')

const handleReset = async () => {
  if (!email.value) return
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  })

  loading.value = false
  if (error) {
    errorMsg.value = 'Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.'
  } else {
    sent.value = true
  }
}
</script>

<template>
  <div class="page">
    <div class="card">

      <!-- Logo -->
      <div class="logo">
        <span>⚡</span>
        <strong>PebasPro</strong>
      </div>

      <!-- Enviado com sucesso -->
      <div v-if="sent" class="success-state">
        <div class="success-icon">📬</div>
        <h1>E-mail enviado!</h1>
        <p>Verifique sua caixa de entrada em <strong>{{ email }}</strong> e clique no link para redefinir sua senha.</p>
        <p class="hint">Não encontrou? Verifique a pasta de spam.</p>
        <NuxtLink to="/login" class="btn-back">Voltar ao login</NuxtLink>
      </div>

      <!-- Formulário -->
      <div v-else>
        <div class="header">
          <NuxtLink to="/login" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Voltar ao login
          </NuxtLink>
          <h1>Esqueci minha senha</h1>
          <p>Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
        </div>

        <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

        <form @submit.prevent="handleReset" class="form">
          <div class="form-group">
            <label for="email">E-mail cadastrado</label>
            <input
              v-model="email"
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              autocomplete="email"
            />
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"/>
            {{ loading ? 'Enviando...' : 'Enviar link de redefinição' }}
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.back-link:hover { color: #6366f1; }

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
.form-group input {
  height: 48px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8fafc;
}
.form-group input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  background: white;
}

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

/* Success state */
.success-state { text-align: center; }
.success-icon { font-size: 3.5rem; margin-bottom: 16px; display: block; }
.success-state h1 { font-size: 1.7rem; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
.success-state p { color: #475569; font-size: 0.95rem; line-height: 1.7; margin-bottom: 8px; }
.hint { font-size: 0.8rem !important; color: #94a3b8 !important; }
.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
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
