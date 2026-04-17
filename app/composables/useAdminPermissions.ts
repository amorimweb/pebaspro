import { useAuthStore } from '~/stores/auth'

export type AdminRole = 'master' | 'financeiro' | 'moderador' | 'rh'

export function useAdminPermissions() {
  const authStore = useAuthStore()
  
  // Mapeamento simples: superadmin vira master, admin vira moderador por padrão
  // Se o perfil tiver um campo específico de sub-role no futuro, podemos ajustar aqui.
  const role = computed<AdminRole>(() => {
    if (authStore.profile?.role === 'superadmin') return 'master'
    return 'moderador' // Default para outros admins por enquanto
  })

  const canAccess = (resource: string) => {
    if (role.value === 'master') return true
    
    const permissions: Record<string, string[]> = {
      financeiro: ['financeiro', 'relatorios'],
      moderador: ['talentos', 'prestadores', 'empresas', 'moderacao', 'suporte', 'usuarios'],
      rh: ['painel-rh', 'vagas', 'talentos']
    }

    return permissions[role.value]?.includes(resource) || false
  }

  const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'export' | 'view', resource: string) => {
    if (role.value === 'master') return true
    
    // Regras granulares
    if (action === 'delete') return false // Apenas master pode deletar no protótipo
    
    return canAccess(resource)
  }

  return { role, canAccess, canPerformAction }
}
