type ProfileLike = {
  cadastro_completo?: boolean | null
  tipo_conta?: string | null
  nome?: string | null
  documento?: string | null
  telefone?: string | null
  cidade?: string | null
  estado?: string | null
  profissao?: string | null
  sobre_mim?: string | null
  habilidades?: string[] | null
  objetivo_profissional?: string | null
}

const filled = (value?: string | null) => Boolean(value?.trim())

export const isProfileComplete = (profile?: ProfileLike | null) => {
  if (!profile) return false
  const baseComplete = Boolean(
    filled(profile.tipo_conta) &&
    filled(profile.nome) &&
    filled(profile.documento) &&
    filled(profile.telefone) &&
    filled(profile.cidade) &&
    filled(profile.estado) &&
    filled(profile.profissao) &&
    filled(profile.sobre_mim)
  )
  if (!baseComplete) return false

  if (profile.tipo_conta === 'talento') {
    return filled(profile.objetivo_profissional) && Boolean(profile.habilidades?.length)
  }

  return ['prestador', 'empresa'].includes(profile.tipo_conta || '')
}
