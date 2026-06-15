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
        loading.value = true
        error.value = null

        try {
            const activeSession = session || await getSession()
            if (!activeSession?.user?.id) {
                return { data: null, error: null }
            }

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
        } finally {
            initialized.value = true
            loading.value = false
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
        setProfile,
        clearProfile,
        fetchProfile,
        loadProfile,
        signInWithPassword,
        saveCompleteProfile,
        updateProfile,
        signOut,
    }
}, {
    persist: {
        pick: ['profile'],
    },
})
