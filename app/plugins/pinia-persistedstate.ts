import persistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin({
  name: 'pinia-persistedstate',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    nuxtApp.$pinia.use(persistedstate)
  },
})

