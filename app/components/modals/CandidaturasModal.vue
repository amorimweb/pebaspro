<script setup lang="ts">
import type { Database } from '~/types'
import type { PropType } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    candidaturas: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    loading: Boolean
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
    emit('update:modelValue', false)
}

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        visualizada: 'bg-blue-50 text-blue-700 border-blue-200',
        aceita: 'bg-green-50 text-green-700 border-green-200',
        rejeitada: 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
}

const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
        pendente: '⏳',
        visualizada: '👁️',
        aceita: '✅',
        rejeitada: '❌'
    }
    return icons[status] || '•'
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
                            <h2 class="text-2xl font-black text-gray-900">Minhas Candidaturas</h2>
                            <p class="text-sm text-gray-500 mt-1">Histórico completo de vagas aplicadas</p>
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
                            <div class="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p class="text-gray-500">Carregando candidaturas...</p>
                        </div>
                        
                        <div v-else-if="candidaturas.length === 0" class="p-8 text-center">
                            <div class="text-4xl mb-2">📝</div>
                            <p class="text-gray-500">Você ainda não se candidatou a nenhuma vaga.</p>
                        </div>
                        
                        <div v-else class="divide-y divide-gray-200">
                            <div 
                                v-for="(cand, idx) in (candidaturas as any[])" 
                                :key="idx"
                                class="p-6 hover:bg-gray-50/50 transition"
                            >
                                <div class="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <h3 class="font-black text-gray-900 text-lg">{{ cand.vagas?.titulo }}</h3>
                                        <p class="text-sm text-gray-500 mt-1">{{ cand.vagas?.local }}</p>
                                    </div>
                                    <span :class="['px-3 py-1 rounded-lg text-xs font-black border', getStatusColor(cand.status)]">
                                        {{ getStatusIcon(cand.status) }} {{ cand.status }}
                                    </span>
                                </div>
                                
                                <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span class="flex items-center gap-2">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                        Candidatura: {{ formatDate(cand.created_at) }}
                                    </span>
                                </div>
                                
                                <NuxtLink :to="`/vagas/${cand.vaga_id}`" class="mt-4 inline-block">
                                    <button class="text-sm font-bold text-green-600 hover:text-green-700 underline decoration-2 underline-offset-2">
                                        Ver Vaga →
                                    </button>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
