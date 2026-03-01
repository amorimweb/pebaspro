<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['admin'] as any })

const supabase = useSupabaseClient<Database>()
const search = ref('')
const vagas = ref<any[]>([])
const loading = ref(true)

const fetchVagas = async () => {
  loading.value = true
  try {
    let query = supabase
      .from('vagas')
      .select(`*, empresa:usuarios(nome, email)`)
      .order('data_publicacao', { ascending: false }) as any
    if (search.value) query = query.ilike('titulo', `%${search.value}%`)
    const { data } = await query
    vagas.value = data || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchVagas)

const deleteVaga = async (id: string) => {
  if (!confirm('Tem certeza que deseja remover esta vaga?')) return
  await supabase.from('vagas').delete().eq('id', id)
  vagas.value = vagas.value.filter(v => v.id !== id)
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-3 items-center">
      <input
        v-model="search"
        @keyup.enter="fetchVagas"
        type="text"
        placeholder="Buscar por título..."
        class="flex-1 h-10 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
      />
      <button @click="fetchVagas" class="h-10 px-5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
        Buscar
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
          {{ vagas.length }} vaga(s)
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
            <tr>
              <th class="px-6 py-4">Título</th>
              <th class="px-6 py-4">Empresa</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Publicada</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" v-for="i in 5" :key="i">
              <td colspan="5" class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-full animate-pulse"/></td>
            </tr>
            <tr v-else-if="vagas.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400">Nenhuma vaga encontrada.</td>
            </tr>
            <tr v-else v-for="v in vagas" :key="v.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-900 max-w-64">
                <p class="truncate">{{ v.titulo }}</p>
                <p class="text-xs text-gray-400 font-normal mt-0.5">{{ v.modalidade }} · {{ v.tipo }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="font-medium text-gray-700">{{ (v.empresa as any)?.nome || '—' }}</p>
                <p class="text-xs text-gray-400">{{ (v.empresa as any)?.email }}</p>
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${v.encerramento ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`">
                  {{ v.encerramento ? 'Encerrada' : 'Ativa' }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-400">{{ formatDate(v.data_publicacao) }}</td>
              <td class="px-6 py-4 text-right flex gap-2 justify-end">
                <NuxtLink :to="`/vagas/${v.id}`" target="_blank" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition">
                  Ver
                </NuxtLink>
                <button @click="deleteVaga(v.id)" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                  Remover
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
