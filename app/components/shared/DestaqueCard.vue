<template>
  <div
    class="flex flex-col p-6 gap-3 rounded-3xl bg-green-50 shadow-md transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-xl"
  >
    <h3 class="font-bold text-lg text-green-800">{{ titulo }}</h3>
    <p class="text-sm text-gray-600 leading-relaxed">{{ descricao }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
  descricao: string
}>()
</script>
