<template>
  <div
    class="p-6 text-center rounded-3xl transition-all duration-300 shadow-sm bg-green-50 cursor-default hover:shadow-lg hover:scale-105"
  >
    <div
      class="text-[32px] mb-2 flex justify-center transition-transform duration-300"
      :style="{ color: color }"
    >
      <div class="transition-transform duration-300 hover:scale-120">
        <slot name="icon"></slot>
      </div>
    </div>

    <p class="text-xl font-bold">{{ value }}</p>
    <p class="text-sm text-gray-600">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
  color?: string
}>()
</script>
