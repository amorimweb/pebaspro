import { defineStore } from 'pinia'
import type { Session } from '@supabase/supabase-js'
import type { Usuario } from '~/types/database.types'
import type { CreateUsuarioPayload, UpdateUsuarioPayload } from '~/types/usuarios'

type AuthResult<T = Usuario | null> = {
    data: T
    error: any | null
}

export const useAuthStore = defineStore('auth', () => {
    const supabaseUser = useSupabaseUser()

    const profile = ref<Usuario | null>(null)
    const loading = ref(false)
    const initialized = ref(false)
    const error = ref<string | null>(null)
    let initializePromise: Promise<AuthResult> | null = null
    let profilePromise: Promise<AuthResult> | null = null

    // O perfil só existe após uma sessão validada e estabiliza a hidratação
    // enquanto o useSupabaseUser termina de atualizar no navegador.
    const user = computed(() => supabaseUser.value || (profile.value ? {
        id: profile.value.id,
        email: profile.value.email,
    } : null))
    const profileLoading = computed(() => loading.value)
    const isAuthenticated = computed(() => Boolean(user.value?.id))

    const authHeader = (session?: Session | null) => (
        session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
    )

    const getSession = async () => {
        const { data } = await useSupabaseClient().auth.getSession()
        return data.session
    }

    const setProfile = (value: Usuario | null) => {
        profile.value = value
        error.value = null
    }

    const clearProfile = () => {
        profile.value = null
        error.value = null
    }

    const loadProfile = async (session?: Session | null): Promise<AuthResult> => {
        if (profilePromise) return profilePromise

        loading.value = true
        error.value = null

        profilePromise = (async () => {
            const activeSession = session || await getSession()
            if (!activeSession?.user?.id) {
                clearProfile()
                return { data: null, error: null }
            }

            if (profile.value && profile.value.id !== activeSession.user.id) {
                clearProfile()
            }

            try {
                const data = await $fetch<Usuario>('/api/me', {
                    headers: authHeader(activeSession),
                })
                setProfile(data)
                return { data, error: null }
            } catch (err: any) {
                clearProfile()
                const statusCode = err?.statusCode || err?.status
                if (statusCode !== 401 && statusCode !== 404) {
                    error.value = err?.data?.message || err?.message || 'Erro ao carregar perfil'
                    console.error('Erro ao carregar perfil:', err)
                }
                return { data: null, error: err }
            }
        })()

        try {
            return await profilePromise
        } finally {
            profilePromise = null
            loading.value = false
        }
    }

    const initialize = async (): Promise<AuthResult> => {
        if (initialized.value) return { data: profile.value, error: null }
        if (initializePromise) return initializePromise

        initializePromise = (async () => {
            try {
                const session = await getSession()
                if (!session?.user?.id) {
                    clearProfile()
                    return { data: null, error: null }
                }
                return await loadProfile(session)
            } finally {
                initialized.value = true
            }
        })()

        try {
            return await initializePromise
        } finally {
            initializePromise = null
        }
    }

    const fetchProfile = async (_accessToken?: string, _email?: string | null) => loadProfile()

    const signInWithPassword = async (email: string, password: string) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: signInError } = await useSupabaseClient().auth.signInWithPassword({
                email: email.trim(),
                password,
            })

            if (signInError) return { data: null, error: signInError }

            const profileResult = await loadProfile(data.session)
            initialized.value = true
            return { data: profileResult.data, error: profileResult.error }
        } finally {
            loading.value = false
        }
    }

    const saveCompleteProfile = async (payload: CreateUsuarioPayload): Promise<AuthResult<Usuario>> => {
        loading.value = true
        error.value = null

        try {
            const session = await getSession()
            if (!session?.user?.id) {
                throw new Error('Usuario nao autenticado')
            }

            const data = await $fetch<Usuario>('/api/usuarios', {
                method: 'POST',
                body: payload,
                headers: authHeader(session),
            })

            setProfile(data)
            return { data, error: null }
        } catch (err: any) {
            error.value = err?.data?.message || err?.message || 'Erro ao salvar perfil'
            console.error('Erro ao salvar perfil:', err)
            return { data: null as any, error: err }
        } finally {
            loading.value = false
        }
    }

    const updateProfile = async (payload: UpdateUsuarioPayload): Promise<AuthResult<Usuario>> => {
        loading.value = true
        error.value = null

        try {
            const session = await getSession()
            const userId = session?.user?.id
            if (!userId) throw new Error('Usuario nao autenticado')

            const data = await $fetch<Usuario>(`/api/usuarios/${userId}`, {
                method: 'PUT',
                body: payload,
                headers: authHeader(session),
            })

            setProfile(data)
            return { data, error: null }
        } catch (err: any) {
            error.value = err?.data?.message || err?.message || 'Erro ao atualizar perfil'
            console.error('Erro ao atualizar perfil:', err)
            return { data: null as any, error: err }
        } finally {
            loading.value = false
        }
    }

    const deleteAccount = async (): Promise<{ error: any | null }> => {
        loading.value = true
        try {
            const session = await getSession()
            const userId = session?.user?.id
            if (!userId) throw new Error('Usuario nao autenticado')

            await $fetch(`/api/usuarios/${userId}`, {
                method: 'DELETE',
                headers: authHeader(session),
            })

            clearProfile()
            await useSupabaseClient().auth.signOut()
            return { error: null }
        } catch (err: any) {
            error.value = err?.data?.message || err?.message || 'Erro ao excluir conta'
            console.error('Erro ao excluir conta:', err)
            return { error: err }
        } finally {
            loading.value = false
        }
    }

    const signOut = async () => {
        loading.value = true
        try {
            clearProfile()
            initialized.value = true
            return await useSupabaseClient().auth.signOut()
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        profile,
        profileLoading,
        loading,
        error,
        initialized,
        isAuthenticated,
        initialize,
        setProfile,
        clearProfile,
        fetchProfile,
        loadProfile,
        signInWithPassword,
        saveCompleteProfile,
        updateProfile,
        deleteAccount,
        signOut,
    }
})
