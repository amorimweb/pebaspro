<template>
  <NuxtLink
    v-if="href"
    :to="href"
    class="block w-full no-underline"
  >
    <div
      class="bg-green-50 border border-green-200 text-green-800 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-8 w-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div class="mb-2 text-[32px] sm:text-[36px] md:text-[40px] text-green-800">
        <slot name="icon"></slot>
      </div>

      <h2 class="text-lg sm:text-xl md:text-2xl font-semibold mb-3 leading-tight">
        {{ titulo }}
      </h2>

      <p class="text-sm sm:text-base md:text-lg text-gray-600 font-medium">
        {{ descricao }}
      </p>
    </div>
  </NuxtLink>
  <div
    v-else
    @click="onClick"
    class="bg-green-50 border border-green-200 text-green-800 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-8 w-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5"
  >
    <div class="mb-2 text-[32px] sm:text-[36px] md:text-[40px] text-green-800">
      <slot name="icon"></slot>
    </div>

    <h2 class="text-lg sm:text-xl md:text-2xl font-semibold mb-3 leading-tight">
      {{ titulo }}
    </h2>

    <p class="text-sm sm:text-base md:text-lg text-gray-600 font-medium">
      {{ descricao }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
  descricao: string
  href?: string
  onClick?: () => void
}>()
</script>
