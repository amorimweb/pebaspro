<script setup lang="ts">
useSeoMeta({
  title: 'Política de Privacidade - PebasPro',
  description: 'Saiba como o PebasPro protege e utiliza seus dados pessoais.'
})
</script>

<template>
  <div class="legal-page">
    <main>
      <!-- Hero Section -->
      <section class="legal-hero">
        <div class="container">
          <h1>Política de <span class="text-gradient">Privacidade</span></h1>
          <p class="lead">
            Sua privacidade é nossa prioridade. Conheça como tratamos seus dados.
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="content-section">
        <div class="container narrow-content">
          <div class="legal-block">
            <h2>1. Coleta de Dados</h2>
            <p>
              Coletamos informações que você nos fornece diretamente ao criar uma conta, preencher seu perfil ou se candidatar a vagas. Isso inclui seu nome, e-mail, telefone, cargo e outras informações profissionais.
            </p>
          </div>

          <div class="legal-block">
            <h2>2. Uso das Informações</h2>
            <p>
              As informações coletadas são utilizadas para:
            </p>
            <ul>
              <li>Fornecer, manter e melhorar nossos serviços;</li>
              <li>Personalizar sua experiência na plataforma;</li>
              <li>Facilitar o contato entre contratantes e profissionais;</li>
              <li>Enviar comunicações sobre a plataforma e novas oportunidades.</li>
            </ul>
          </div>

          <div class="legal-block">
            <h2>3. Compartilhamento de Dados</h2>
            <p>
              Seu perfil profissional é visível para outros usuários da plataforma conforme suas configurações de privacidade. Nós não vendemos seus dados para terceiros.
            </p>
          </div>

          <div class="legal-block">
            <h2>4. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento através das configurações do seu perfil.
            </p>
          </div>

          <div class="legal-block">
            <h2>5. Segurança</h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus dados contra acessos não autorizados e perda acidental. No entanto, nenhum método de transmissão pela internet é 100% seguro.
            </p>
          </div>

          <div class="legal-block">
            <h2>6. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta política, entre em contato conosco pelo e-mail: <a href="mailto:contato.pebaspro@gmail.com" class="text-green-600 font-bold">contato.pebaspro@gmail.com</a>.
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
