<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    visitas: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    loading: Boolean
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
    emit('update:modelValue', false)
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue" class="fixed inset-0 z-50">
            <!-- Backdrop -->
            <div 
                class="absolute inset-0 bg-black/40 backdrop-blur-sm"
                @click="close"
            ></div>
            
            <!-- Modal -->
            <div class="absolute inset-0 flex items-center justify-center p-4">
                <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                    <!-- Header -->
                    <div class="border-b border-gray-200 p-6 flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-black text-gray-900">Visitas ao Meu Perfil</h2>
                            <p class="text-sm text-gray-500 mt-1">Empresas que visitaram seu perfil</p>
                        </div>
                        <button 
                            @click="close"
                            class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                        >
                            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Content -->
                    <div class="overflow-y-auto flex-1">
                        <div v-if="loading" class="p-8 text-center">
                            <div class="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p class="text-gray-500">Carregando visitas...</p>
                        </div>
                        
                        <div v-else-if="visitas.length === 0" class="p-8 text-center">
                            <div class="text-4xl mb-2">👁️</div>
                            <p class="text-gray-500">Nenhuma visita ao seu perfil ainda.</p>
                            <p class="text-xs text-gray-400 mt-2">Quando empresas visitarem seu perfil, você verá aqui.</p>
                        </div>
                        
                        <div v-else class="divide-y divide-gray-200">
                            <div 
                                v-for="(visita, idx) in (visitas as any[])" 
                                :key="idx"
                                class="p-6 hover:bg-gray-50/50 transition"
                            >
                                <div class="flex items-start justify-between gap-4 mb-3">
                                    <div class="flex-1">
                                        <h3 class="font-black text-gray-900 text-lg">
                                            {{ visita.usuarios?.nome || 'Usuário' }}
                                        </h3>
                                        <p class="text-sm text-gray-500 mt-1">
                                            {{ visita.usuarios?.tipo_usuario === 'empresa' ? '🏢 Empresa' : '👤 Pessoa Física' }}
                                        </p>
                                    </div>
                                </div>
                                
                                <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span class="flex items-center gap-2">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
                                        </svg>
                                        {{ formatDate(visita.created_at) }} às {{ formatTime(visita.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
