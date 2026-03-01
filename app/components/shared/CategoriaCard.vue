<template>
  <div
    class="w-[100px] h-[100px] bg-green-50 flex flex-col items-center justify-center rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
  >
    <div class="text-2xl text-green-700 mb-1">
      <slot name="icon"></slot>
    </div>
    <p class="text-sm font-bold text-green-700">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>
