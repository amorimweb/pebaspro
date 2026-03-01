<script setup lang="ts">
// Default Layout
</script>

<template>
  <div class="pebaspro-layout">
    <AppHeader />
    
    <main class="flex-grow">
      <slot />
    </main>
    
    <AppFooter />
  </div>
</template>
