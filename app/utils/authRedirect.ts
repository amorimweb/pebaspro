type ProfileRoute = {
  tipo_conta?: string | null
}

export const completeRegistrationRoute = '/cadastro/dados'

export const profileHomeRoute = (profile?: ProfileRoute | null) => {
  const routes: Record<string, string> = {
    talento: '/',
    cliente: '/',
    prestador: '/painel/prestador',
    empresa: '/painel/empresa',
  }

  return routes[profile?.tipo_conta || ''] || '/'
}
