export function useAudit() {
  const logAction = (action: string, resource: string, details?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: 'admin_master_1', // Em produção, pegar do AuthContext
      action,
      resource,
      details: details || {}
    };

    // Em produção, isso seria enviado para uma API/Firestore
    console.log('[AUDIT LOG]', logEntry);
  };

  return { logAction };
}
