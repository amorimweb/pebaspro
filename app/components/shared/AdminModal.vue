<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, required: true },
  maxWidth: { type: String, default: 'max-w-2xl' }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Bloquear scroll quando aberto
watch(() => props.isOpen, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close" />
      
      <!-- Panel -->
      <div 
        :class="[
          'relative bg-white rounded-[32px] shadow-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-300',
          maxWidth
        ]"
      >
        <div class="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">{{ title }}</h2>
          <button 
            @click="close" 
            class="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-8 overflow-y-auto max-h-[80vh] scrollbar-hide">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.zoom-in-95 { transform: scale(0.95); opacity: 0; }
.v-enter-to .zoom-in-95 { transform: scale(1); opacity: 1; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
