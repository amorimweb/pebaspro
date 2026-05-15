export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/manutencao') {
    return navigateTo('/manutencao')
  }
})
