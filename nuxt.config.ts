// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
  app: {
    head: {
      title: 'Pebas Pro - Onde o talento encontra a oportunidade',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
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
  },
  runtimeConfig: {
    r2AccountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    r2PublicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
  }
})