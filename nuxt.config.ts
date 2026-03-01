// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
})