import { useAuthStore } from '~/stores/auth'

export function useAdminAudit() {
  const authStore = useAuthStore()

  const logAction = (action: string, resource: string, details?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: authStore.profile?.email || 'unknown_admin',
      action,
      resource,
      details: details || {}
    }
    
    // Em produção, isso seria enviado para uma API/Supabase Logs
    console.log('[ADMIN AUDIT LOG]', logEntry)
  }

  return { logAction }
}
