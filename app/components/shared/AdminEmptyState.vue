<script setup lang="ts">
import { SearchX } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[32px] border border-slate-100">
    <div class="p-6 bg-slate-50 rounded-[32px] mb-6">
      <SearchX class="w-12 h-12 text-slate-300" />
    </div>
    <h3 class="text-xl font-black text-slate-900 mb-2">{{ title }}</h3>
    <p class="text-slate-500 max-w-sm mx-auto font-medium">{{ description }}</p>
  </div>
</template>
