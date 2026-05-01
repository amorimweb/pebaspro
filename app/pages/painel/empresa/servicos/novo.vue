<script setup lang="ts">
import type { Database } from '~/types'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'empresa-master'
})

const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const router = useRouter()

const loading = ref(false)
const categories = ref<any[]>([])

const form = ref({
  titulo: '',
  descricao: '',
  categoria_id: '',
  preco_inicial: ''
})

onMounted(async () => {
  const { data } = await supabase.from('categorias').select('id, nome').order('nome')
  categories.value = data || []
})

const handleSave = async () => {
  if (!form.value.titulo || !form.value.categoria_id) {
    alert('Preencha os campos obrigatorios (Nome e Categoria)')
    return
  }

  if (!authStore.profile?.id) {
    alert('Usuario nao autenticado')
    return
  }

  if (!authStore.profile.modo_prestador) {
    alert('Ative o modo prestador antes de cadastrar servicos.')
    return
  }

  loading.value = true
  try {
    const priceNumber = parseFloat(form.value.preco_inicial.replace('R$', '').replace(/\./g, '').replace(',', '.').trim())

    const { error } = await supabase
      .from('servicos')
      .insert({
        prestador_id: authStore.profile.id,
        categoria_id: form.value.categoria_id,
        titulo: form.value.titulo,
        descricao: form.value.descricao || null,
        preco_inicial: isNaN(priceNumber) ? null : priceNumber,
        ativo: true
      })

    if (error) throw error
    await router.push('/painel/empresa/servicos')
  } catch (e: any) {
    console.error('Erro ao salvar servico:', e)
    alert(`Erro ao salvar servico: ${e.message || 'Tente novamente.'}`)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: string) => {
  let v = value.replace(/\D/g, '')
  v = (Number(v) / 100).toFixed(2)
  v = v.replace('.', ',')
  v = v.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,')
  v = v.replace(/(\d)(\d{3}),/g, '$1.$2,')
  return v
}

const onPriceInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  form.value.preco_inicial = formatCurrency(target.value)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div>
      <NuxtLink to="/painel/empresa/servicos" class="text-sm font-black text-slate-500 hover:text-green-600 flex items-center gap-2 mb-4">
        Voltar para Servicos
      </NuxtLink>
      <span class="panel-tag mb-3">Novo servico</span>
      <h1 class="text-3xl font-black text-[#071B3A] tracking-tight">Adicionar Servico</h1>
      <p class="text-slate-500 font-medium">Descreva o servico oferecido pela sua empresa.</p>
    </div>

    <div class="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm">
      <form @submit.prevent="handleSave" class="space-y-6">
        <div>
          <label class="block text-sm font-black text-slate-700 mb-2">Nome do Servico *</label>
          <input v-model="form.titulo" type="text" placeholder="Ex: Manutencao industrial" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-medium" required />
        </div>

        <div>
          <label class="block text-sm font-black text-slate-700 mb-2">Categoria *</label>
          <select v-model="form.categoria_id" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-medium" required>
            <option value="" disabled>Selecione uma categoria...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-black text-slate-700 mb-2">Descricao Detalhada</label>
          <textarea v-model="form.descricao" rows="4" placeholder="Descreva o que esta incluso, prazos, garantias e diferenciais..." class="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all text-sm leading-relaxed"></textarea>
        </div>

        <div>
          <label class="block text-sm font-black text-slate-700 mb-2">Preco Inicial (Opcional)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">R$</span>
            <input
              :value="form.preco_inicial"
              @input="onPriceInput"
              type="text"
              placeholder="Deixe em branco para 'A combinar'"
              class="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-black text-lg text-slate-800"
            />
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end gap-4">
          <NuxtLink to="/painel/empresa/servicos" class="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-colors">
            Cancelar
          </NuxtLink>
          <button type="submit" :disabled="loading" class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all disabled:opacity-70">
            {{ loading ? 'Salvando...' : 'Salvar Servico' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
