import persistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin({
  name: 'pinia-persistedstate',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    if (import.meta.server) return

    nuxtApp.$pinia.use(persistedstate)
  },
})

