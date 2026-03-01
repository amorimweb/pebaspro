<script setup lang="ts">
useSeoMeta({
  title: 'Sobre o PebasPro - Nossa Missão',
  description: 'Conheça a história e o propósito do PebasPro, conectando talentos e oportunidades na região.'
})

const values = [
  { title: 'Transparência', desc: 'Processos claros e honestos para todos os usuários.', icon: '🤝' },
  { title: 'Agilidade', desc: 'Conexão rápida entre quem precisa e quem faz.', icon: '⚡' },
  { title: 'Segurança', desc: 'Dados protegidos e profissionais verificados.', icon: '🛡️' },
  { title: 'Comunidade', desc: 'Foco no desenvolvimento local da região.', icon: '🏘️' }
]
</script>

<template>
  <div class="sobre-page">
    
    <main>
      <!-- Hero Section -->
      <section class="about-hero">
        <div class="container">
          <h1>Conectando o talento<br/><span class="text-gradient">à oportunidade</span></h1>
          <p class="lead">
            O PebasPro nasceu com a missão de simplificar o mercado de trabalho na região, 
            eliminando intermediários e criando conexões diretas entre profissionais qualificados e empresas visionárias.
          </p>
        </div>
      </section>

      <!-- History Section -->
      <section class="history-section">
        <div class="container grid-2">
          <div class="history-text">
            <h2>Nossa História</h2>
            <p>
              Em uma região que pulsa oportunidade, percebemos que encontrar o profissional 
              certo para uma demanda específica — ou a vaga ideal para o seu talento — ainda era um desafio 
              analógico em um mundo digital.
            </p>
            <p>
              O PebasPro surgiu como a solução definitiva para unificar o ecossistema de serviços e vagas, 
              focalizando na facilidade de uso e na confiança mútua.
            </p>
          </div>
          <div class="history-image">
            <!-- Representação visual (Poderia usar generate_image no futuro) -->
            <div class="image-placeholder">
              <span>PEBASPRO</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Grid -->
      <section class="values-section">
        <div class="container">
          <h2 class="text-center">Nossos Valores</h2>
          <div class="values-grid">
            <div v-for="val in values" :key="val.title" class="value-card">
              <div class="val-icon">{{ val.icon }}</div>
              <h3>{{ val.title }}</h3>
              <p>{{ val.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="about-cta">
        <div class="container text-center">
          <h2>Pronto para começar?</h2>
          <p>Junte-se a milhares de profissionais e empresas que já confiam no PebasPro.</p>
          <div class="cta-actions">
            <NuxtLink to="/cadastro" class="btn-primary">Criar Conta Agora</NuxtLink>
            <NuxtLink to="/vagas" class="btn-secondary">Ver Vagas Disponíveis</NuxtLink>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center { text-align: center; }
.text-gradient {
  background: linear-gradient(to right, #268C52, #177486);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about-hero {
  padding: 100px 0;
  text-align: center;
  background-color: #f8fafc;
}

.about-hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.1;
}

.lead {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 800px;
  margin: 0 auto;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  padding: 100px 0;
}

@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; gap: 40px; text-align: center; }
}

.history-text h2 {
  font-size: 2.25rem;
  margin-bottom: 24px;
}

.history-text p {
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 16px;
}

.image-placeholder {
  height: 400px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #94a3b8;
  font-size: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.values-section {
  padding: 100px 0;
  background-color: #ffffff;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-top: 60px;
}

@media (max-width: 1024px) {
  .values-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .values-grid { grid-template-columns: 1fr; }
}

.value-card {
  padding: 40px;
  border-radius: 20px;
  background: #f8fafc;
  transition: transform 0.3s;
}

.value-card:hover { transform: translateY(-5px); }

.val-icon {
  font-size: 3rem;
  margin-bottom: 24px;
}

.value-card h3 {
  margin-bottom: 12px;
  font-weight: 700;
}

.value-card p {
  color: #64748b;
  line-height: 1.5;
}

.about-cta {
  padding: 100px 0;
  background: linear-gradient(to right, #0f172a, #1e293b);
  color: white;
}

.about-cta h2 { font-size: 2.5rem; margin-bottom: 16px; }
.about-cta p { font-size: 1.25rem; opacity: 0.8; margin-bottom: 40px; }

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 480px) {
  .cta-actions { flex-direction: column; }
}

.btn-primary {
  padding: 16px 32px;
  background: linear-gradient(to right, #268C52, #177486);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  color: white;
}

.btn-secondary {
  padding: 16px 32px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  color: white;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.05);
}
</style>
