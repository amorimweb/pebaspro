import { useState } from 'react';

// Tipos de perfis: 'master', 'financeiro', 'moderador', 'rh'
export function usePermissions() {
  // Em uma aplicação real, isso viria do contexto de autenticação (ex: Firebase Auth / JWT)
  const [role] = useState<'master' | 'financeiro' | 'moderador' | 'rh'>('master');

  const canAccess = (resource: string) => {
    if (role === 'master') return true;

    const permissions: Record<string, string[]> = {
      financeiro: ['financeiro', 'relatorios'],
      moderador: ['talentos', 'prestadores', 'empresas', 'moderacao', 'suporte'],
      rh: ['painel-rh', 'vagas', 'talentos']
    };

    return permissions[role]?.includes(resource) || false;
  };

  const canPerformAction = (action: 'create' | 'edit' | 'delete' | 'export' | 'view', resource: string) => {
    if (role === 'master') return true;

    // Regras granulares
    if (action === 'delete' && role !== 'master') return false; // Apenas master pode deletar

    return canAccess(resource);
  };

  return { role, canAccess, canPerformAction };
}
