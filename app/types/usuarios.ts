import type { Json } from './database.types'

// ─────────────────────────────────────────────
// Payload para CRIAR usuário (INSERT)
// ─────────────────────────────────────────────
export interface CreateUsuarioPayload {
    id: string
    nome?: string | null
    email?: string | null
    documento?: string | null
    telefone?: string | null
    endereco?: string | null
    profissao?: string | null
    regiao?: string | null
    sobre_mim?: string | null
    status?: string | null
    tipo_conta?: string | null
    biografia?: string | null
    cadastro_completo?: boolean | null
    foto?: string | null
    experiencia_profissional?: Json | null
    formacao_academica?: Json | null
    habilidades?: string[] | null
    objetivo_profissional?: string | null
    latitude?: number | null
    longitude?: number | null
    role?: string
}

// ─────────────────────────────────────────────
// Payload para ATUALIZAR usuário (UPDATE)
// ─────────────────────────────────────────────
export interface UpdateUsuarioPayload {
    nome?: string | null
    email?: string | null
    documento?: string | null
    telefone?: string | null
    endereco?: string | null
    profissao?: string | null
    regiao?: string | null
    sobre_mim?: string | null
    status?: string | null
    tipo_conta?: string | null
    biografia?: string | null
    cadastro_completo?: boolean | null
    foto?: string | null
    experiencia_profissional?: Json | null
    formacao_academica?: Json | null
    habilidades?: string[] | null
    objetivo_profissional?: string | null
    latitude?: number | null
    longitude?: number | null
    role?: string
}
