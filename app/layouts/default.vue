<script setup lang="ts">
// Default Layout
const route = useRoute()
const showPadding = computed(() => !route.meta.noPadding)
</script>

<template>
  <div class="pebaspro-layout flex flex-col min-h-screen min-w-0">
    <AppHeader />
    
    <main 
      class="flex-grow flex flex-col"
      :class="{ 'pt-24': showPadding }"
    >
      <slot />
    </main>
    
    <AppFooter />
  </div>
</template>
