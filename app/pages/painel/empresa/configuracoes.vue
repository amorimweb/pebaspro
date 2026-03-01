<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Configurações</h1>
      <p class="text-gray-500">Gerencie suas preferências e dados da conta</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Card: Dados da Empresa -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
            🏢
        </div>
        <div>
            <h3 class="font-bold text-lg text-gray-800">Dados da Empresa</h3>
            <p class="text-sm text-gray-500 mt-1">Logo, descrição, endereço e informações públicas do seu perfil.</p>
        </div>
        <NuxtLink to="/perfil" class="mt-auto px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-100 transition-colors">
            Editar Perfil
        </NuxtLink>
      </div>

      <!-- Card: Segurança -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            🔒
        </div>
        <div>
            <h3 class="font-bold text-lg text-gray-800">Segurança</h3>
            <p class="text-sm text-gray-500 mt-1">Alterar senha e configurações de acesso.</p>
        </div>
        <button class="mt-auto px-4 py-2 bg-slate-50 text-slate-400 font-bold rounded-lg text-sm cursor-not-allowed" disabled title="Em breve">
            Alterar Senha
        </button>
      </div>

      <!-- Card: Notificações -->
      <!-- <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
            🔔
        </div>
        <div>
            <h3 class="font-bold text-lg text-gray-800">Notificações</h3>
            <p class="text-sm text-gray-500 mt-1">Escolha como você quer ser notificado sobre novos candidatos.</p>
        </div>
        <div class="mt-auto flex items-center gap-2">
            <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Ativo por e-mail</span>
        </div>
      </div> -->
    
      <!-- Card: Assinatura -->
      <!-- <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl">
            💳
        </div>
        <div>
            <h3 class="font-bold text-lg text-gray-800">Assinatura & Plano</h3>
            <p class="text-sm text-gray-500 mt-1">Gerencie seu plano de acesso ao PebasPro.</p>
        </div>
        <div class="mt-auto">
            <span class="text-sm font-bold text-slate-700">Plano Gratuito</span>
        </div>
      </div> -->
      
    </div>
  </div>
</template>
