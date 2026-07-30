export type RegistrationAccountType = 'talento' | 'prestador' | 'empresa'

export const documentDigits = (value?: string | null) =>
  (value || '').replace(/\D/g, '')

export const maskCPF = (value: string) => documentDigits(value).slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

export const maskCNPJ = (value: string) => documentDigits(value).slice(0, 14)
  .replace(/(\d{2})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1/$2')
  .replace(/(\d{4})(\d{1,2})$/, '$1-$2')

export const maskDocument = (value: string, accountType: RegistrationAccountType) => {
  const digits = documentDigits(value)
  return accountType === 'empresa' || (accountType === 'prestador' && digits.length > 11)
    ? maskCNPJ(digits)
    : maskCPF(digits)
}

export const isValidCPF = (value?: string | null) => {
  const digits = documentDigits(value)
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  const calculateDigit = (length: number) => {
    let sum = 0
    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * (length + 1 - index)
    }
    const result = (sum * 10) % 11
    return result === 10 ? 0 : result
  }

  return calculateDigit(9) === Number(digits[9])
    && calculateDigit(10) === Number(digits[10])
}

export const isValidCNPJ = (value?: string | null) => {
  const digits = documentDigits(value)
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false

  const calculateDigit = (length: number) => {
    let sum = 0
    let factor = length - 7
    for (let index = length; index >= 1; index--) {
      sum += Number(digits[length - index]) * factor--
      if (factor < 2) factor = 9
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return calculateDigit(12) === Number(digits[12])
    && calculateDigit(13) === Number(digits[13])
}

export const isValidDocumentForType = (
  value: string | null | undefined,
  accountType: RegistrationAccountType,
) => {
  if (accountType === 'empresa') return isValidCNPJ(value)
  if (accountType === 'talento') return isValidCPF(value)
  return documentDigits(value).length === 14 ? isValidCNPJ(value) : isValidCPF(value)
}

export const documentMaxLength = (accountType: RegistrationAccountType) =>
  accountType === 'talento' ? 14 : 18
