<script setup lang="ts">
type AccountType = 'talento' | 'prestador' | 'empresa'

definePageMeta({
  layout: false,
  noPadding: true
})

// Mova o useCookie para o topo do setup (melhor prática Nuxt)
const typeCookie = useCookie<AccountType | null>('pebas_pending_type', { maxAge: 3600 })

const supabase = useSupabaseClient()
const showTypeSelection = ref(false)

const selectType = (type: AccountType) => {
  console.log('Selecionando tipo:', type)
  typeCookie.value = type
  navigateTo('/cadastro/dados')
}

onMounted(() => {
  if (typeCookie.value) {
    console.log('Redirecionando automaticamente para cadastro de:', typeCookie.value)
    navigateTo('/cadastro/dados')
  }
})

const loginWithGoogle = () => {
  showTypeSelection.value = true
}

const confirmGoogleLogin = async (type: AccountType) => {
  showTypeSelection.value = false
  typeCookie.value = type
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })
  if (error) alert(error.message)
}

const profileTypes = [
  {
    id: 'talento' as AccountType,
    title: 'Talento',
    subtitle: 'Busco vagas de emprego',
    description: 'Encontre as melhores oportunidades nas maiores empresas da região.',
    icon: '🎯',
    color: '#3b82f6'
  },
  {
    id: 'prestador' as AccountType,
    title: 'Prestador',
    subtitle: 'Ofereço meus serviços',
    description: 'Divulgue seu trabalho e receba contatos diretos de clientes da região.',
    icon: '🛠️',
    color: '#10b981'
  },
  {
    id: 'empresa' as AccountType,
    title: 'Empresa',
    subtitle: 'Quero contratar talentos',
    description: 'Publique vagas e gerencie candidatos de forma simples e eficiente.',
    icon: '🏢',
    color: '#8b5cf6'
  }
]
</script>

<template>
  <div class="selection-page">
    <div class="selection-container">
      <div class="header">
        <NuxtLink to="/">
          <img src="/PEBASPRO-logo.png" alt="PebasPro" class="logo" />
        </NuxtLink>
        <h1>Como você quer usar o <span class="brand">PebasPro</span>?</h1>
        <p>Escolha o perfil que melhor descreve seu objetivo hoje.</p>
      </div>

      <div class="types-grid">
        <button 
          v-for="profile in profileTypes" 
          :key="profile.id" 
          class="type-card"
          @click="selectType(profile.id)"
          type="button"
        >
          <div class="card-icon" :style="{ backgroundColor: profile.color + '20', color: profile.color }">
            {{ profile.icon }}
          </div>
          <div class="card-content">
            <span class="type-badge" :style="{ color: profile.color }">{{ profile.subtitle }}</span>
            <h3>{{ profile.title }}</h3>
            <p>{{ profile.description }}</p>
          </div>
          <div class="card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </button>
      </div>

      <div class="footer">
        <div class="social-auth">
          <p>Ou se preferir, entre rapidamente com:</p>
          <button @click="loginWithGoogle" class="google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Continuar com Google
          </button>
        </div>
        <p class="login-prompt">Já tem uma conta? <NuxtLink to="/login" class="login-link">Fazer Login</NuxtLink></p>
      </div>
    </div>

    <!-- Modal de Seleção de Perfil para Google -->
    <Teleport to="body">
      <div v-if="showTypeSelection" class="modal-overlay" @click="showTypeSelection = false">
        <div class="modal-content" @click.stop>
          <button class="close-modal" @click="showTypeSelection = false">&times;</button>
          
          <div class="modal-header">
            <h2>Como você quer usar o PebasPro?</h2>
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
.selection-page {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
}

.selection-container {
  max-width: 1000px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.logo {
  height: 80px;
  margin: 0 auto 32px;
  display: block;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 12px;
}

.brand {
  color: #268C52;
}

.header p {
  font-size: 1.125rem;
  color: #64748b;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 900px) {
  .types-grid {
    grid-template-columns: 1fr;
  }
}

.type-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  text-align: left;
  width: 100%;
}

.type-card:hover {
  transform: translateY(-8px);
  border-color: #268C52;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 24px;
}

.type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: block;
}

.card-content h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
}

.card-content p {
  color: #64748b;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-arrow {
  margin-top: auto;
  padding-top: 32px;
  color: #cbd5e1;
  transition: all 0.3s;
  display: flex;
  justify-content: flex-end;
}

.card-arrow svg {
  width: 24px;
  height: 24px;
}

.type-card:hover .card-arrow {
  color: #268C52;
  transform: translateX(8px);
}

.footer {
  margin-top: 60px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}

.social-auth {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.social-auth p {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.google-btn {
  height: 56px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.google-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
}

.google-btn img {
  width: 24px;
  height: 24px;
}

.login-prompt {
  font-size: 1rem;
}

.login-link {
  color: #268C52;
  font-weight: 700;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
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
  text-align: left;
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
