<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const services = ref<any[]>([])
const loading = ref(true)

const fetchServices = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('servicos')
            .select('*')
            .eq('prestador_id', authStore.profile?.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        services.value = data || []
    } catch (e) {
        console.error('Erro ao buscar serviços:', e)
    } finally {
        loading.value = false
    }
}

const deleteService = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
        const { error } = await supabase
            .from('servicos')
            .delete()
            .eq('id', id)
        
        if (error) throw error
        
        // Remove from local list
        services.value = services.value.filter(s => s.id !== id)
    } catch (e) {
        alert('Erro ao excluir serviço')
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

        if (error) throw error
        service.ativo = newStatus
    } catch (e) {
        alert('Erro ao atualizar status')
        console.error(e)
    }
}

onMounted(() => {
    if (authStore.profile?.id) {
        fetchServices()
    }
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Meus Serviços</h1>
            <p class="text-gray-500">Gerencie os serviços que você oferece na plataforma.</p>
        </div>
        <NuxtLink to="/painel/prestador/servicos/novo" class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all text-sm flex items-center gap-2 max-w-fit">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Novo Serviço
        </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="services.length === 0" class="text-center py-16 bg-white rounded-[32px] border border-gray-100 shadow-sm">
        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
        <p class="text-gray-500 max-w-md mx-auto mb-8">Comece a divulgar seu trabalho adicionando seu primeiro serviço agora mesmo.</p>
        <NuxtLink to="/painel/prestador/servicos/novo" class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all">
            Cadastrar Serviço
        </NuxtLink>
    </div>

    <!-- Services List -->
    <div v-else class="grid grid-cols-1 gap-4">
        <div v-for="service in services" :key="service.id" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-lg font-bold text-gray-900">{{ service.titulo }}</h3>
                    <span :class="service.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                        {{ service.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                </div>
                <p class="text-gray-500 text-sm mb-2 line-clamp-2">{{ service.descricao }}</p>
                <div class="text-sm font-medium text-green-600">
                    A partir de {{ Number(service.preco_inicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                </div>
            </div>

            <div class="flex items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                <button @click="toggleStatus(service)" :title="service.ativo ? 'Pausar serviço' : 'Ativar serviço'" class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <svg v-if="service.ativo" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
                 <!-- Edit (Future Implementation) -->
                <!-- <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button> -->
                <button @click="deleteService(service.id)" title="Excluir serviço" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
    </div>
  </div>
</template>
