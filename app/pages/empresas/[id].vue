<script setup lang="ts">
import type { Database } from '~/types'

type UserRow = Database['public']['Tables']['usuarios']['Row']
type ServicoRow = Database['public']['Tables']['servicos']['Row']
type VagaRow = Database['public']['Tables']['vagas']['Row']

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient<Database>()

const { pending, data, error: fetchError } = useAsyncData(`profile-${id}`, async () => {
  const userRes = await client.from('usuarios').select('*').eq('id', id).single()
  if (userRes.error) throw userRes.error

  const p = userRes.data as UserRow
  const isPrest = p.tipo_conta === 'prestador'
  let servs: ServicoRow[] = []
  let vags: VagaRow[] = []

  if (isPrest) {
    const servRes = await client
      .from('servicos').select('*')
      .eq('prestador_id', id).eq('ativo', true)
      .order('created_at', { ascending: false })
    servs = (servRes.data || []) as ServicoRow[]
  } else {
    const vagasRes = await client
      .from('vagas').select('*')
      .eq('empresa_id', id).is('encerramento', null)
      .order('data_publicacao', { ascending: false })
    vags = (vagasRes.data || []) as VagaRow[]
  }

  return {
    profile: p,
    isPrestador: isPrest,
    servicos: servs,
    vagas: vags
  }
}, { lazy: true })

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })

const formatWhatsApp = (tel: string) => {
  const num = tel.replace(/\D/g, '')
  return `https://wa.me/55${num}`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">

    <main v-if="data?.profile">
      <!-- Hero Banner -->
      <div
        class="text-white pt-20 pb-24 relative overflow-hidden"
        :class="data.isPrestador
          ? 'bg-gradient-to-r from-teal-900 to-teal-700'
          : 'bg-gradient-to-r from-gray-900 to-gray-800'"
      >
        <div class="absolute inset-0 opacity-20">
          <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" fill-opacity="0.1"/>
          </svg>
        </div>

        <div class="container mx-auto px-4 relative z-10 text-center">
          <div class="w-24 h-24 mx-auto bg-white rounded-2xl p-1 mb-6 shadow-xl flex items-center justify-center overflow-hidden">
            <img v-if="data.profile.foto" :src="data.profile.foto" class="w-full h-full object-cover rounded-xl" :alt="data.profile.nome ?? undefined">
            <span v-else class="text-3xl font-bold text-gray-800">{{ data.profile.nome?.charAt(0) }}</span>
          </div>

          <!-- Badge de tipo -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20 bg-white/10">
            {{ data.isPrestador ? '🛠️ Prestador de Serviços' : '🏢 Empresa' }}
          </div>

          <h1 class="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">{{ data.profile.nome }}</h1>
          <p class="text-xl text-gray-300 flex items-center justify-center gap-2 flex-wrap">
            <span v-if="data.profile.regiao">📍 {{ data.profile.regiao }}</span>
            <span v-if="data.profile.profissao" class="w-1.5 h-1.5 bg-gray-500 rounded-full"/>
            <span v-if="data.profile.profissao">{{ data.profile.profissao }}</span>
          </p>
        </div>
      </div>

      <!-- Content Container -->
      <div class="container mx-auto px-4 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">

          <!-- Sobre -->
          <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-teal-600" :class="data.isPrestador ? 'text-teal-600' : 'text-green-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ data.isPrestador ? 'Sobre o Profissional' : 'Sobre a Empresa' }}
            </h2>
            <div class="text-gray-600 leading-relaxed whitespace-pre-line">
              {{ data.profile.biografia || data.profile.sobre_mim || (data.isPrestador ? 'O profissional ainda não adicionou uma descrição.' : 'A empresa ainda não adicionou uma descrição.') }}
            </div>
          </div>

          <!-- Serviços (prestador) -->
          <div v-if="data.isPrestador">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Serviços Oferecidos ({{ data.servicos.length }})
            </h3>

            <div v-if="data.servicos.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p class="text-gray-500">Nenhum serviço cadastrado no momento.</p>
            </div>

            <div v-else class="grid gap-4">
              <div v-for="s in data.servicos" :key="s.id" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <h4 class="font-bold text-lg text-gray-900">{{ s.titulo }}</h4>
                    <p v-if="s.descricao" class="text-sm text-gray-500 mt-2 line-clamp-2">{{ s.descricao }}</p>
                  </div>
                  <div v-if="s.preco_inicial" class="flex-shrink-0 text-right">
                    <span class="text-teal-700 font-bold text-lg">
                      R$ {{ s.preco_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                    </span>
                    <p class="text-xs text-gray-400">a partir de</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vagas (empresa) -->
          <div v-else>
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Vagas Abertas ({{ data.vagas.length }})
            </h3>

            <div v-if="data.vagas.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p class="text-gray-500">Nenhuma vaga aberta no momento.</p>
            </div>

            <div v-else class="grid gap-4">
              <NuxtLink
                v-for="job in data.vagas"
                :key="job.id"
                :to="`/vagas/${job.id}`"
                class="block bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition group"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold text-lg text-gray-900 group-hover:text-green-700 transition">{{ job.titulo }}</h4>
                    <div class="flex items-center gap-3 text-sm text-gray-500 mt-2 flex-wrap">
                      <span class="flex items-center gap-1">📍 {{ job.local }}</span>
                      <span class="w-1 h-1 bg-gray-300 rounded-full"/>
                      <span class="capitalize">{{ job.modalidade }}</span>
                      <span class="w-1 h-1 bg-gray-300 rounded-full"/>
                      <span class="text-green-600 font-medium">{{ job.salario }}</span>
                    </div>
                  </div>
                  <span class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{{ formatDate(job.data_publicacao) }}</span>
                </div>
              </NuxtLink>
            </div>
          </div>

        </div>

        <!-- Right Column: Contato -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
            <h3 class="font-bold text-gray-900 mb-4">Contato</h3>

            <div class="space-y-4">
              <!-- WhatsApp / Telefone -->
              <div v-if="data.profile.telefone" class="flex items-center gap-3 text-gray-600">
                <div class="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <a :href="formatWhatsApp(data.profile.telefone)" target="_blank" class="hover:text-green-600 transition font-medium">
                  {{ data.profile.telefone }}
                </a>
              </div>

              <!-- Email -->
              <div v-if="data.profile.email" class="flex items-center gap-3 text-gray-600">
                <div class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span class="truncate text-sm">{{ data.profile.email }}</span>
              </div>

              <!-- Sem contato -->
              <p v-if="!data.profile.telefone && !data.profile.email" class="text-sm text-gray-400 italic">
                Nenhuma informação de contato disponível.
              </p>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100">
              <p class="text-xs text-gray-400 text-center">
                Membro desde {{ new Date(data.profile.created_at).getFullYear() }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Loading/Error -->
    <div v-else class="flex items-center justify-center min-h-[60vh]">
      <div v-if="fetchError" class="text-center">
        <p class="text-gray-500 font-medium">Perfil não encontrado.</p>
        <NuxtLink to="/" class="text-teal-600 underline mt-2 inline-block">Voltar ao início</NuxtLink>
      </div>
      <div v-else-if="pending" class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"/>
    </div>
  </div>
</template>
