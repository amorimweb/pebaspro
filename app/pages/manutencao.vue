<template>
  <div class="maintenance-page">
    <div class="stars" />
    <div class="stars stars-2" />

    <div class="container">
      <div class="gear-wrapper">
        <Settings :size="80" class="gear-icon" />
      </div>

      <div class="logo">
        Pebas<span>Pro</span>
      </div>
      <div class="tagline">Plataforma de talentos e oportunidades</div>

      <h1 class="title">Em Manutenção</h1>
      <p class="subtitle">
        Estamos aprimorando a plataforma para trazer<br />
        uma experiência ainda melhor para você.
      </p>

      <div class="progress-wrap">
        <div class="progress-bar" />
      </div>

      <div class="info-card">
        <div class="info-item">
          <div class="info-label">Previsão de retorno</div>
          <div class="info-value">Em breve</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Em Manutenção — Pebas Pro' })
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2419 0%, #1a3d2b 40%, #0f2419 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: white;
  overflow: hidden;
  position: relative;
}

/* Estrelas de fundo */
.stars,
.stars-2 {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 35%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 20% 85%, rgba(134,239,172,0.3) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 60% 45%, rgba(134,239,172,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 45% 90%, rgba(255,255,255,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.4) 0%, transparent 100%);
  pointer-events: none;
}

.stars-2 {
  background-image:
    radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 25% 30%, rgba(255,255,255,0.2) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 55% 70%, rgba(134,239,172,0.25) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.35) 0%, transparent 100%),
    radial-gradient(1px 1px at 95% 20%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 5%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 65% 95%, rgba(255,255,255,0.2) 0%, transparent 100%);
  opacity: 0.6;
}

.container {
  text-align: center;
  padding: 40px 24px;
  max-width: 600px;
  width: 100%;
  z-index: 1;
  position: relative;
}

/* Engrenagem */
.gear-wrapper {
  margin-bottom: 24px;
  display: inline-flex;
}

.gear-icon {
  color: #4ade80;
  filter: drop-shadow(0 0 24px rgba(38, 140, 82, 0.7));
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Logo */
.logo {
  font-size: 30px;
  font-weight: 900;
  color: #4ade80;
  letter-spacing: -1px;
  margin-bottom: 6px;
}

.logo span {
  color: white;
}

.tagline {
  font-size: 12px;
  color: #86efac;
  margin-bottom: 48px;
  text-transform: uppercase;
  letter-spacing: 3px;
  opacity: 0.8;
}

/* Título */
.title {
  font-size: 52px;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.1;
  background: linear-gradient(135deg, #ffffff, #86efac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 480px) {
  .title { font-size: 36px; }
}

.subtitle {
  font-size: 17px;
  color: #86efac;
  margin-bottom: 40px;
  line-height: 1.7;
  opacity: 0.9;
}

/* Barra de progresso */
.progress-wrap {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  height: 6px;
  margin-bottom: 40px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #268C52, #4ade80);
  border-radius: 50px;
  width: 70%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Card de info */
.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(38, 140, 82, 0.35);
  border-radius: 16px;
  padding: 24px 32px;
  display: inline-flex;
  gap: 48px;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.info-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #86efac;
  margin-bottom: 6px;
  opacity: 0.8;
}

.info-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
}
</style>
