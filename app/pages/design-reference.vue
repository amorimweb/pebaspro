<script setup lang="ts">
definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Arquivo Visual - PebasPro',
  description: 'Páginas antigas do backup renderizadas'
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="font-semibold">Voltar</span>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">📚 Arquivo Visual</h1>
        <div class="w-24"></div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Header Antigo -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Header (AppBar)</h2>
          <span class="text-xs text-gray-300">Material-UI</span>
        </div>
        <div class="p-0">
          <!-- Recreated Header -->
          <div style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 48px;">
              <!-- Logo -->
              <div style="display: flex; align-items: center;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #268C52, #177486); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.5rem;">
                  PP
                </div>
              </div>
              
              <!-- Menu Links -->
              <div style="display: flex; gap: 24px; align-items: center;">
                <a href="#" style="font-size: 1.3em; color: black; text-decoration: none; position: relative; padding: 4px 0;">
                  vagas
                </a>
                <a href="#" style="font-size: 1.3em; color: black; text-decoration: none; position: relative; padding: 4px 0;">
                  empresas
                </a>
                <a href="#" style="font-size: 1.3em; color: black; text-decoration: none; position: relative; padding: 4px 0;">
                  sobre
                </a>
                <a href="#" style="font-size: 1.3em; color: black; text-decoration: none; position: relative; padding: 4px 0;">
                  contato
                </a>
              </div>
              
              <!-- Botões Login/Cadastro -->
              <div style="display: flex; gap: 12px; align-items: center;">
                <button style="font-size: 1.1em; background: linear-gradient(to bottom, #268C52, #177486); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; border: none; padding: 8px 16px; cursor: pointer; font-weight: 600;">
                  Entrar
                </button>
                <button style="font-size: 1.1em; background: linear-gradient(to bottom, #268C52, #177486); color: white; font-weight: bold; border-radius: 8px; padding: 8px 16px; border: none; cursor: pointer;">
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner Hero -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Banner Hero</h2>
          <span class="text-xs text-gray-300">Material-UI</span>
        </div>
        <div class="p-0">
          <!-- Recreated Banner Hero -->
          <div style="background: linear-gradient(to right, #268C52, #177486); color: white; text-align: center; padding: 0 16px; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h3 style="font-size: 3rem; font-weight: 800; margin: 0 0 16px;">
              Encontre o profissional ideal
            </h3>
            <p style="font-size: 1.25rem; max-width: 600px; margin: 0 auto 48px; opacity: 0.9;">
              Conectamos você com os melhores prestadores da região de forma rápida e segura
            </p>
            <div style="display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap; width: 100%; max-width: 700px;">
              <input 
                type="text" 
                placeholder="Buscar serviços..." 
                style="flex: 1; min-width: 300px; padding: 12px 16px; border-radius: 4px; border: none; font-size: 16px;"
              />
              <button style="background: #1976d2; color: white; padding: 10px 40px; border-radius: 4px; border: none; font-weight: 600; cursor: pointer;">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categorias Populares -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Categorias Populares</h2>
          <span class="text-xs text-gray-300">Material-UI Grid 2x2</span>
        </div>
        <div class="p-8">
          <h3 style="font-size: 2rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 32px;">
            Categorias Populares
          </h3>
          <div style="display: flex; justify-content: center;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 400px;">
              <!-- Eletricista -->
              <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <svg style="width: 48px; height: 48px; color: #1976d2; margin: 0 auto 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <div style="font-weight: 600; color: #333;">Eletricista</div>
              </div>
              <!-- Pintor -->
              <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <svg style="width: 48px; height: 48px; color: #1976d2; margin: 0 auto 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
                <div style="font-weight: 600; color: #333;">Pintor</div>
              </div>
              <!-- Diarista -->
              <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <svg style="width: 48px; height: 48px; color: #1976d2; margin: 0 auto 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <div style="font-weight: 600; color: #333;">Diarista</div>
              </div>
              <!-- Mecânico -->
              <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <svg style="width: 48px; height: 48px; color: #1976d2; margin: 0 auto 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div style="font-weight: 600; color: #333;">Mecânico</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nossa Plataforma -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Nossa Plataforma</h2>
          <span class="text-xs text-gray-300">Benefícios</span>
        </div>
        <div class="p-8">
          <h3 style="font-size: 2rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 32px;">
            Nossa Plataforma
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            <!-- Conexão Rápida -->
            <div style="background: white; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Conexão Rápida
              </h4>
              <p style="color: #666; line-height: 1.6;">
                Encontre profissionais em minutos
              </p>
            </div>
            <!-- Segurança Garantida -->
            <div style="background: white; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Segurança Garantida
              </h4>
              <p style="color: #666; line-height: 1.6;">
                Profissionais verificados e avaliados
              </p>
            </div>
            <!-- Avaliações Reais -->
            <div style="background: white; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Avaliações Reais
              </h4>
              <p style="color: #666; line-height: 1.6;">
                Sistema de feedback confiável
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Nossos Valores (Sobre) -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Nossos Valores</h2>
          <span class="text-xs text-gray-300">Página Sobre</span>
        </div>
        <div class="p-8" style="background: #fff;">
          <h3 style="font-size: 2rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 16px;">
            Nossos Valores
          </h3>
          <p style="text-align: center; color: #666; margin-bottom: 48px;">
            Os princípios que guiam nosso trabalho todos os dias
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;">
            <!-- Missão -->
            <div style="background: white; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
              <div style="background: #1B6E3C; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg style="width: 48px; height: 48px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Missão
              </h4>
              <p style="color: #666; line-height: 1.6; font-size: 0.875rem;">
                Conectar pessoas, profissionais e empresas de Parauapebas por meio de tecnologia
              </p>
            </div>
            <!-- Compromisso -->
            <div style="background: white; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
              <div style="background: #1B6E3C; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg style="width: 48px; height: 48px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Compromisso
              </h4>
              <p style="color: #666; line-height: 1.6; font-size: 0.875rem;">
                Oferecer um ambiente digital seguro, rápido e prático
              </p>
            </div>
            <!-- Inovação -->
            <div style="background: white; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
              <div style="background: #1B6E3C; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg style="width: 48px; height: 48px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Inovação
              </h4>
              <p style="color: #666; line-height: 1.6; font-size: 0.875rem;">
                Ser a principal plataforma de referência em Parauapebas
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fale Conosco -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Fale Conosco</h2>
          <span class="text-xs text-gray-300">Página Contato</span>
        </div>
        <div class="p-8" style="background: #f5f5f5;">
          <h3 style="font-size: 2rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 48px;">
            Fale Conosco
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px;">
            <!-- Informações -->
            <div>
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 24px;">
                Informações de Contato
              </h4>
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg style="width: 24px; height: 24px; color: #1B6E3C;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <div>
                  <div style="font-weight: 600; font-size: 0.875rem;">Telefone:</div>
                  <div style="color: #666; font-size: 0.875rem;">(94) 98402-5172</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <svg style="width: 24px; height: 24px; color: #1B6E3C;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <div>
                  <div style="font-weight: 600; font-size: 0.875rem;">E-mail:</div>
                  <div style="color: #666; font-size: 0.875rem;">contato.pebaspro@gmail.com</div>
                </div>
              </div>
            </div>
            <!-- Formulário -->
            <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 24px;">
                Solicite seu Suporte
              </h4>
              <div style="display: grid; gap: 16px;">
                <input type="text" placeholder="Nome completo *" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" />
                <input type="email" placeholder="E-mail *" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" />
                <textarea placeholder="Mensagem (opcional)" rows="4" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; resize: vertical;"></textarea>
                <button style="background: #1B6E3C; color: white; padding: 12px; border-radius: 4px; border: none; font-weight: 600; cursor: pointer; font-size: 16px;">
                  Enviar Solicitação
                </button>
                <p style="text-align: center; font-size: 0.75rem; color: #666;">
                  * Campos obrigatórios - Resposta em até 2 horas úteis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de Vaga -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Card de Vaga</h2>
          <span class="text-xs text-gray-300">Página Vagas</span>
        </div>
        <div class="p-8">
          <!-- Card de Vaga -->
          <div style="background: #E8F5E9; border: 1px solid #C8E6C9; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s;">
            <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 8px;">
              Desenvolvedor Full Stack
            </h4>
            <p style="font-size: 0.75rem; color: #666; margin-bottom: 16px;">
              Postado há 2 dias
            </p>
            <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
              <span style="background: white; border: 1px solid #C8E6C9; padding: 4px 12px; border-radius: 16px; font-size: 0.875rem; font-weight: 600;">
                R$ 5.000 - R$ 8.000
              </span>
              <span style="background: white; border: 1px solid #C8E6C9; padding: 4px 12px; border-radius: 16px; font-size: 0.875rem; font-weight: 600;">
                Parauapebas
              </span>
              <span style="background: white; border: 1px solid #C8E6C9; padding: 4px 12px; border-radius: 16px; font-size: 0.875rem; font-weight: 600;">
                Sênior
              </span>
            </div>
            <p style="color: #333; line-height: 1.6; margin-bottom: 24px; font-size: 0.875rem;">
              Buscamos desenvolvedor experiente para atuar em projetos web. Conhecimento em Vue.js, Node.js e PostgreSQL.
            </p>
            <div style="text-align: center;">
              <button style="background: #1B6E3C; color: white; padding: 10px 32px; border-radius: 4px; border: none; font-weight: 600; cursor: pointer;">
                saiba mais
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de Profissional -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Card de Profissional</h2>
          <span class="text-xs text-gray-300">Página Profissionais</span>
        </div>
        <div class="p-8">
          <!-- Card de Profissional -->
          <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                <div>
                  <h4 style="font-size: 1rem; font-weight: 700; color: #1976d2; margin-bottom: 4px;">
                    João Silva
                  </h4>
                  <p style="font-size: 0.875rem; color: #666; margin-bottom: 2px;">
                    Eletricista
                  </p>
                  <p style="font-size: 0.875rem; color: #666;">
                    Parauapebas
                  </p>
                </div>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: 600; color: #2e7d32; margin-bottom: 8px;">
                  R$ 150/dia
                </p>
                <button style="background: #25D366; color: white; padding: 6px 16px; border-radius: 4px; border: none; font-size: 0.875rem; font-weight: 600; cursor: pointer;">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Login com Google/Facebook -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Autenticação Social</h2>
          <span class="text-xs text-gray-300">Login/Cadastro</span>
        </div>
        <div class="p-8">
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 32px;">
            Entrar ou Criar Conta
          </h3>
          <div style="max-width: 400px; margin: 0 auto; display: grid; gap: 16px;">
            <!-- Google -->
            <button style="background: white; border: 2px solid #ddd; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600;">
              <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
            <!-- Facebook -->
            <button style="background: #1877F2; color: white; border: none; padding: 12px 24px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600;">
              <svg style="width: 24px; height: 24px;" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continuar com Facebook
            </button>
            <!-- Divider -->
            <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0;">
              <div style="flex: 1; height: 1px; background: #ddd;"></div>
              <span style="color: #666; font-size: 0.875rem;">ou</span>
              <div style="flex: 1; height: 1px; background: #ddd;"></div>
            </div>
            <!-- Email/Senha -->
            <input type="email" placeholder="Email" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;" />
            <input type="password" placeholder="Senha" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px;" />
            <button style="background: #1B6E3C; color: white; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; font-size: 16px;">
              Entrar
            </button>
          </div>
        </div>
      </div>

      <!-- Nossos Serviços (Empresas) -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Nossos Serviços</h2>
          <span class="text-xs text-gray-300">Página Empresas</span>
        </div>
        <div class="p-8" style="background: #f5f5f5;">
          <h3 style="font-size: 2rem; font-weight: 700; color: #1B6E3C; text-align: center; margin-bottom: 48px;">
            Nossos Serviços
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 900px; margin: 0 auto;">
            <!-- Conexão Rápida -->
            <div style="background: #E8F5E9; border: 2px solid #C8E6C9; border-radius: 8px; padding: 24px; text-align: center; transition: all 0.2s;">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Conexão Rápida
              </h4>
              <p style="color: #666; line-height: 1.6; font-size: 0.875rem;">
                Encontre profissionais em minutos
              </p>
            </div>
            <!-- Segurança Garantida -->
            <div style="background: #E8F5E9; border: 2px solid #C8E6C9; border-radius: 8px; padding: 24px; text-align: center; transition: all 0.2s;">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Segurança Garantida
              </h4>
              <p style="color: #666; line-height: 1.6; font-size: 0.875rem;">
                Profissionais verificados e avaliados
              </p>
            </div>
            <!-- Avaliações Reais -->
            <div style="background: #E8F5E9; border: 2px solid #C8E6C9; border-radius: 8px; padding: 24px; text-align: center; transition: all 0.2s;">
              <h4 style="font-size: 1.25rem; font-weight: 700; color: #1B6E3C; margin-bottom: 12px;">
                Avaliações Reais
              </h4>
              <p style="color: #666; line-height: 1.6; font-size: 0.875rem;">
                Sistema de feedback confiável
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards Ação (Prestador/Empresa) -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <h2 class="text-white font-bold">Cards de Ação</h2>
          <span class="text-xs text-gray-300">Home - Prestador/Empresa</span>
        </div>
        <div class="p-8">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; max-width: 800px; margin: 0 auto;">
            <!-- Encontrar Profissional -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <svg style="width: 64px; height: 64px; color: white; margin: 0 auto 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <h4 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 12px;">
                Encontrar Profissional
              </h4>
              <p style="color: rgba(255,255,255,0.9); line-height: 1.6;">
                Busque profissionais qualificados para seu projeto
              </p>
            </div>
            <!-- Buscar Trabalhos -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <svg style="width: 64px; height: 64px; color: white; margin: 0 auto 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <h4 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 12px;">
                Busque Trabalhos
              </h4>
              <p style="color: rgba(255,255,255,0.9); line-height: 1.6;">
                Encontre oportunidades de trabalho na sua região
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="text-center text-gray-500 text-sm py-8">
        <p>Estas são recriações visuais das páginas antigas (Material-UI + React)</p>
        <p class="mt-2">
          <NuxtLink to="/" class="text-green-600 hover:text-green-700 font-medium">
            ← Voltar para a home
          </NuxtLink>
        </p>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* Hover effects */
div[style*="cursor: pointer"]:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
