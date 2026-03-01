<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const user = useSupabaseUser()
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
        alert('Preencha os campos obrigatórios (Nome e Categoria)')
        return
    }

    if (!user.value?.id) {
        alert('Usuário não autenticado')
        return
    }

    loading.value = true
    try {
        // Convert localized price string to number
        const priceNumber = parseFloat(form.value.preco_inicial.replace('R$', '').replace(/\./g, '').replace(',', '.').trim())

        const { data, error } = await supabase
            .from('servicos')
            .insert({
                prestador_id: user.value.id,
                categoria_id: form.value.categoria_id,
                titulo: form.value.titulo,
                descricao: form.value.descricao || null,
                preco_inicial: isNaN(priceNumber) ? null : priceNumber,
                ativo: true
            })
            .select()

        if (error) {
            console.error('Supabase error:', error)
            throw error
        }
        
        console.log('Serviço criado com sucesso:', data)
        
        // Success
        await router.push('/painel/prestador/servicos')
    } catch (e: any) {
        console.error('Erro ao salvar serviço:', e)
        alert(`Erro ao salvar serviço: ${e.message || 'Tente novamente.'}`)
    } finally {
        loading.value = false
    }
}

// Moeda Mask
const formatCurrency = (value: string) => {
  let v = value.replace(/\D/g, "")
  v = (Number(v) / 100).toFixed(2) + ""
  v = v.replace(".", ",")
  v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,")
  v = v.replace(/(\d)(\d{3}),/g, "$1.$2,")
  return v
}

const onPriceInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    form.value.preco_inicial = formatCurrency(target.value)
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-8">
         <NuxtLink to="/painel/prestador/servicos" class="text-sm font-bold text-gray-500 hover:text-green-600 flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Voltar para Meus Serviços
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Adicionar Novo Serviço</h1>
        <p class="text-gray-500">Descreva o serviço que você oferece para seus clientes.</p>
    </div>

    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <form @submit.prevent="handleSave" class="space-y-6">
            
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Nome do Serviço *</label>
                <input v-model="form.titulo" type="text" placeholder="Ex: Instalação de Ar Condicionado" class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-medium" required />
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
                <select v-model="form.categoria_id" class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-medium" required>
                    <option value="" disabled>Selecione uma categoria...</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Descrição Detalhada</label>
                <textarea v-model="form.descricao" rows="4" placeholder="Descreva o que está incluso, garantias, e detalhes importantes..." class="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all text-sm leading-relaxed"></textarea>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Preço Inicial (Opcional)</label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                    <input 
                        :value="form.preco_inicial" 
                        @input="onPriceInput"
                        type="text" 
                        placeholder="Deixe em branco para 'A combinar'" 
                        class="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-bold text-lg text-gray-800"
                    />
                </div>
                <p class="text-xs text-gray-400 mt-2">Este valor serve como referência para os clientes.</p>
            </div>

            <div class="pt-4 flex items-center justify-end gap-4">
                <NuxtLink to="/painel/prestador/servicos" class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                    Cancelar
                </NuxtLink>
                <button type="submit" :disabled="loading" class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all">
                    {{ loading ? 'Salvando...' : 'Salvar Serviço' }}
                </button>
            </div>

        </form>
    </div>
  </div>
</template>
