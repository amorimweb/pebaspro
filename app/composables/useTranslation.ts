export const useTranslation = () => {
    const errorMap: Record<string, string> = {
        // Auth Errors
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'User already registered': 'Este e-mail já está cadastrado em nossa plataforma.',
        'Signup disabled': 'O cadastro de novos usuários está temporariamente desativado.',
        'Email not confirmed': 'Por favor, confirme seu e-mail para continuar.',
        'Invalid characters in password': 'A senha contém caracteres inválidos.',
        'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
        'New password should be different from the old password': 'A nova senha deve ser diferente da antiga.',

        // Database / PostgREST Errors
        'duplicate key value violates unique constraint': 'Este registro já existe (duplicidade detectada).',
        'violates foreign key constraint': 'Não foi possível realizar esta ação pois existem registros dependentes.',
        'null value in column': 'Um dos campos obrigatórios não foi preenchido.',
        'permission denied': 'Você não tem permissão para realizar esta ação.',
        'row level security policy': 'Acesso negado por política de segurança.',

        // Custom Generic Errors
        'Network request failed': 'Erro de conexão. Verifique sua internet.',
        'Something went wrong': 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    }

    /**
     * Traduz uma mensagem de erro vinda do Supabase ou de exceções genéricas
     * @param error O objeto de erro ou a string da mensagem
     * @returns Mensagem traduzida ou a original caso não encontre mapeamento
     */
    const translateError = (error: any): string => {
        if (!error) return ''

        const message = typeof error === 'string'
            ? error
            : error.message || error.statusText || JSON.stringify(error)

        // Tenta encontrar o mapeamento exato ou parcial
        const entry = Object.entries(errorMap).find(([key]) => message.includes(key))

        return entry ? entry[1] : message
    }

    return {
        translateError
    }
}
