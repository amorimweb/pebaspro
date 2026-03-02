// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
  app: {
    head: {
      title: 'Pebas Pro - Onde o talento encontra a oportunidade',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  supabase: {
    redirect: false
  }
})