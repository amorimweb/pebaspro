<script setup lang="ts">
import type { Database } from '~/types'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'empresa-master'
})

const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const services = ref<any[]>([])
const loading = ref(true)

const fetchServices = async () => {
  if (!authStore.profile?.id) return
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('prestador_id', authStore.profile.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    services.value = data || []
  } catch (e) {
    console.error('Erro ao buscar servicos:', e)
  } finally {
    loading.value = false
  }
}

const deleteService = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este servico?')) return

  try {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id)
      .eq('prestador_id', authStore.profile?.id)

    if (error) throw error
    services.value = services.value.filter(s => s.id !== id)
  } catch (e) {
    alert('Erro ao excluir servico')
    console.error(e)
  }
}

const toggleStatus = async (service: any) => {
  try {
    const newStatus = !service.ativo
    const { error } = await supabase
      .from('servicos')
      .update({ ativo: newStatus })
      .eq('id', service.id)
      .eq('prestador_id', authStore.profile?.id)

    if (error) throw error
    service.ativo = newStatus
  } catch (e) {
    alert('Erro ao atualizar status')
    console.error(e)
  }
}

onMounted(fetchServices)
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span class="panel-tag mb-3">Vitrine corporativa</span>
        <h1 class="text-3xl font-black text-[#071B3A] tracking-tight">Servicos da Empresa</h1>
        <p class="text-slate-500 font-medium">Gerencie os servicos que sua empresa oferece na PEBASPRO.</p>
      </div>
      <NuxtLink to="/painel/empresa/servicos/novo" class="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center gap-2 max-w-fit">
        Novo Servico
      </NuxtLink>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-white rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="services.length === 0" class="text-center py-16 bg-white rounded-[28px] border border-slate-100 shadow-sm">
      <h3 class="text-xl font-black text-slate-900 mb-2">Nenhum servico cadastrado</h3>
      <p class="text-slate-500 max-w-md mx-auto mb-8">Crie o primeiro servico para aparecer nas buscas de prestadores.</p>
      <NuxtLink to="/painel/empresa/servicos/novo" class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-600/20 transition-all">
        Cadastrar Servico
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="service in services" :key="service.id" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <h3 class="text-lg font-black text-slate-900">{{ service.titulo }}</h3>
            <span :class="service.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'" class="px-2 py-0.5 rounded text-xs font-black uppercase tracking-wide">
              {{ service.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <p class="text-slate-500 text-sm mb-2 line-clamp-2">{{ service.descricao }}</p>
          <div v-if="service.preco_inicial" class="text-sm font-black text-green-600">
            A partir de {{ Number(service.preco_inicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
          </div>
          <div v-else class="text-sm font-bold text-slate-500 italic">Valor a combinar</div>
        </div>

        <div class="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
          <button @click="toggleStatus(service)" class="px-4 py-2 text-xs font-black uppercase rounded-xl bg-slate-50 text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors">
            {{ service.ativo ? 'Pausar' : 'Ativar' }}
          </button>
          <button @click="deleteService(service.id)" class="px-4 py-2 text-xs font-black uppercase rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
