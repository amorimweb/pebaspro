<script setup lang="ts">
useSeoMeta({
  title: 'Termos de Uso - PEBASPRO',
  description: 'Leia os termos e condições de uso da plataforma PEBASPRO.'
})
</script>

<template>
  <div class="legal-page">
    <main>
      <!-- Hero Section -->
      <section class="legal-hero">
        <div class="container">
          <h1>Termos de <span class="text-gradient">Uso</span></h1>
          <p class="lead">
            Bem-vindo ao PEBASPRO. Ao acessar nossa plataforma, você concorda com os termos abaixo.
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="content-section">
        <div class="container narrow-content">
          <div class="legal-block">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao utilizar o PEBASPRO, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.
            </p>
          </div>

          <div class="legal-block">
            <h2>2. Uso da Plataforma</h2>
            <p>
              O PEBASPRO é uma plataforma de conexão entre profissionais (Talentos) e contratantes (Empresas/Indivíduos). Não somos responsáveis pela execução dos serviços ou pelas contratações realizadas através da plataforma.
            </p>
            <ul>
              <li>Você deve ter pelo menos 18 anos para criar uma conta.</li>
              <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
              <li>É proibido o uso da plataforma para fins ilegais ou não autorizados.</li>
            </ul>
          </div>

          <div class="legal-block">
            <h2>3. Responsabilidades do Usuário</h2>
            <p>
              O usuário é o único responsável por manter a confidencialidade de sua conta e senha. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.
            </p>
          </div>

          <div class="legal-block">
            <h2>4. Limitação de Responsabilidade</h2>
            <p>
              Em nenhum caso o PEBASPRO ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais em nossa plataforma.
            </p>
          </div>

          <div class="legal-block">
            <h2>5. Modificações</h2>
            <p>
              O PEBASPRO pode revisar estes termos de uso a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de uso.
            </p>
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

.narrow-content {
  max-width: 800px;
}

.text-gradient {
  background: linear-gradient(to right, #268C52, #177486);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.legal-hero {
  padding: 80px 0;
  text-align: center;
  background-color: #f8fafc;
}

.legal-hero h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.lead {
  font-size: 1.25rem;
  color: #64748b;
}

.content-section {
  padding: 60px 0 100px;
  background-color: #ffffff;
}

.legal-block {
  margin-bottom: 40px;
}

.legal-block h2 {
  font-size: 1.75rem;
  margin-bottom: 16px;
  color: #0f172a;
}

.legal-block p {
  font-size: 1.125rem;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 12px;
}

.legal-block ul {
  list-style-type: disc;
  padding-left: 24px;
  color: #475569;
}

.legal-block li {
  margin-bottom: 8px;
  font-size: 1.125rem;
}
</style>
