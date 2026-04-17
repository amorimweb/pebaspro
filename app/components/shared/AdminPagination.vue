<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
})

const emit = defineEmits(['pageChange'])

const startItem = computed(() => ((props.currentPage - 1) * props.itemsPerPage) + 1)
const endItem = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems))

const onPageChange = (page: number) => {
  if (page < 1 || page > props.totalPages) return
  emit('pageChange', page)
}
</script>

<template>
  <div class="flex items-center justify-between px-8 py-6 bg-white border-t border-slate-50">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="onPageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all"
      >
        Anterior
      </button>
      <button
        @click="onPageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="relative ml-3 inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all"
      >
        Próxima
      </button>
    </div>
    
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-bold text-slate-400">
          Mostrando <span class="font-black text-slate-900">{{ startItem }}</span> a <span class="font-black text-slate-900">{{ endItem }}</span> de <span class="font-black text-slate-900">{{ totalItems }}</span> resultados
        </p>
      </div>
      
      <div>
        <nav class="isolate inline-flex -space-x-px gap-1">
          <button
            @click="onPageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-xl p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          
          <div class="flex gap-1 items-center px-4">
            <span class="text-xs font-black text-slate-400">Página</span>
            <span class="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">{{ currentPage }}</span>
            <span class="text-xs font-black text-slate-400">de</span>
            <span class="text-xs font-black text-slate-900">{{ totalPages }}</span>
          </div>

          <button
            @click="onPageChange(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center rounded-xl p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
