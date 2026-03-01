<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({ layout: 'admin', middleware: ['admin'] as any })

const supabase = useSupabaseClient<Database>()
const search = ref('')
const servicos = ref<any[]>([])
const loading = ref(true)

const fetchServicos = async () => {
  loading.value = true
  try {
    let query = supabase
      .from('servicos')
      .select(`*, prestador:usuarios(nome, email, foto)`)
      .order('created_at', { ascending: false }) as any
    if (search.value) query = query.ilike('titulo', `%${search.value}%`)
    const { data } = await query
    servicos.value = data || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchServicos)

const toggleAtivo = async (id: string, current: boolean) => {
  await supabase.from('servicos').update({ ativo: !current } as never).eq('id', id)
  const idx = servicos.value.findIndex(s => s.id === id)
  if (idx !== -1) servicos.value[idx].ativo = !current
}

const deleteServico = async (id: string) => {
  if (!confirm('Remover este serviço permanentemente?')) return
  await supabase.from('servicos').delete().eq('id', id)
  servicos.value = servicos.value.filter(s => s.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-3 items-center">
      <input
        v-model="search"
        @keyup.enter="fetchServicos"
        type="text"
        placeholder="Buscar por título do serviço..."
        class="flex-1 h-10 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
      />
      <button @click="fetchServicos" class="h-10 px-5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
        Buscar
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-100">
        <h2 class="font-bold text-gray-900 flex items-center gap-2">
          <span class="w-2 h-6 bg-teal-500 rounded-full"></span>
          {{ servicos.length }} serviço(s)
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-xs uppercase text-gray-400 font-semibold">
            <tr>
              <th class="px-6 py-4">Serviço</th>
              <th class="px-6 py-4">Prestador</th>
              <th class="px-6 py-4">Preço Inicial</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" v-for="i in 5" :key="i">
              <td colspan="5" class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-full animate-pulse"/></td>
            </tr>
            <tr v-else-if="servicos.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400">Nenhum serviço encontrado.</td>
            </tr>
            <tr v-else v-for="s in servicos" :key="s.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 max-w-64">
                <p class="font-semibold text-gray-900 truncate">{{ s.titulo }}</p>
                <p v-if="s.descricao" class="text-xs text-gray-400 truncate mt-0.5">{{ s.descricao }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
                    <img v-if="(s.prestador as any)?.foto" :src="(s.prestador as any).foto" class="w-full h-full object-cover"/>
                    <span v-else>{{ (s.prestador as any)?.nome?.charAt(0) || '?' }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-700">{{ (s.prestador as any)?.nome || '—' }}</p>
                    <p class="text-xs text-gray-400">{{ (s.prestador as any)?.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-semibold text-gray-900">
                {{ s.preco_inicial ? `R$ ${s.preco_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—' }}
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.ativo ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`">
                  {{ s.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right flex gap-2 justify-end">
                <button
                  @click="toggleAtivo(s.id, s.ativo)"
                  class="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                >
                  {{ s.ativo ? 'Desativar' : 'Ativar' }}
                </button>
                <button @click="deleteServico(s.id)" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
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
