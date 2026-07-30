import type { CreateUsuarioPayload } from '~/types/usuarios'
import {
  documentDigits,
  isValidDocumentForType,
  maskDocument,
  type RegistrationAccountType,
} from '~/utils/brDocuments'

const ACCOUNT_TYPES = ['talento', 'prestador', 'empresa'] as const
const STATES = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
])
const text = (value?: string | null) => value?.trim() || ''

export const sanitizeCompleteProfile = (body: CreateUsuarioPayload) => {
  const accountType = body.tipo_conta as RegistrationAccountType
  if (!ACCOUNT_TYPES.includes(accountType)) {
    throw createError({ statusCode: 400, message: 'Tipo de perfil invalido' })
  }

  const nome = text(body.nome)
  const telefoneDigits = documentDigits(body.telefone)
  const cidade = text(body.cidade).toUpperCase()
  const estado = text(body.estado).toUpperCase()
  const profissao = text(body.profissao)
  const sobreMim = text(body.sobre_mim)

  if (nome.length < 3 || nome.length > 160) {
    throw createError({ statusCode: 400, message: 'Nome ou razao social invalido' })
  }
  if (!isValidDocumentForType(body.documento, accountType)) {
    throw createError({ statusCode: 400, message: accountType === 'empresa' ? 'CNPJ invalido' : 'CPF ou CNPJ invalido' })
  }
  if (telefoneDigits.length < 10 || telefoneDigits.length > 11) {
    throw createError({ statusCode: 400, message: 'Telefone invalido' })
  }
  if (cidade.length < 2 || cidade.length > 120 || !STATES.has(estado)) {
    throw createError({ statusCode: 400, message: 'Cidade ou estado invalido' })
  }
  if (profissao.length < 3 || profissao.length > 160) {
    throw createError({ statusCode: 400, message: 'Profissao, especialidade ou segmento invalido' })
  }
  if (sobreMim.length < 20 || sobreMim.length > 3000) {
    throw createError({ statusCode: 400, message: 'A apresentacao deve ter entre 20 e 3000 caracteres' })
  }

  const habilidades = Array.isArray(body.habilidades)
    ? body.habilidades.map(item => item.trim()).filter(Boolean).slice(0, 30)
    : []
  const objetivo = text(body.objetivo_profissional)

  if (accountType === 'talento' && (objetivo.length < 3 || habilidades.length === 0)) {
    throw createError({ statusCode: 400, message: 'Talento deve informar objetivo profissional e habilidades' })
  }

  return {
    nome,
    documento: maskDocument(body.documento || '', accountType),
    telefone: body.telefone?.trim() || null,
    endereco: text(body.endereco).slice(0, 300) || null,
    profissao,
    regiao: text(body.regiao).slice(0, 120) || null,
    sobre_mim: sobreMim,
    tipo_conta: accountType,
    biografia: text(body.biografia).slice(0, 5000) || sobreMim,
    cadastro_completo: true,
    foto: text(body.foto) || null,
    habilidades: accountType === 'talento' ? habilidades : [],
    objetivo_profissional: accountType === 'talento' ? objetivo : null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    cidade,
    estado,
    modo_prestador: accountType === 'prestador',
    status: 'ativo',
  }
}
