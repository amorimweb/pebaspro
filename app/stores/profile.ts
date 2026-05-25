import { defineStore } from 'pinia'
import type { Usuario } from '~/types/database.types'
import type { CreateUsuarioPayload } from '~/types/usuarios'

export const useProfileStore = defineStore('profile', {
    state: () => ({
        profile: null as Usuario | null,
        loading: false,
        error: null as string | null
    }),

    persist: { pick: ['profile'] },

    getters: {
        isAuthenticated: (state) => !!state.profile,
        isAdmin: (state) => state.profile?.role === 'admin' || state.profile?.role === 'superadmin'
    },

    actions: {
        async fetchProfile(accessToken?: string) {
            this.loading = true
            this.error = null

            try {
                const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
                const data = await $fetch<Usuario>('/api/me', { headers })
                this.profile = data
                return { data, error: null }
            } catch (err: any) {
                // 401 é esperado quando não há sessão; não tratar como "erro" barulhento.
                if (err?.statusCode === 401) {
                    if (accessToken || !this.profile) {
                        this.profile = null
                    }
                    this.error = null
                    return { data: null, error: err }
                }
                console.error('Erro ao buscar perfil:', err)
                this.error = err?.data?.message || err?.message || 'Erro ao carregar perfil'
                this.profile = null
                return { data: null, error: err }
            } finally {
                this.loading = false
            }
        },

        async createProfile(data: CreateUsuarioPayload) {
            this.loading = true
            try {
                const supabase = useSupabaseClient()
                const { data: { session } } = await supabase.auth.getSession()
                await $fetch('/api/usuarios', {
                    method: 'POST',
                    body: data,
                    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
                })
                await this.fetchProfile(session?.access_token)
                return { error: null }
            } catch (e: any) {
                console.error('Erro ao criar perfil:', e)
                return { error: e }
            } finally {
                this.loading = false
            }
        },

        clearProfile() {
            this.profile = null
            this.error = null
            this.loading = false
        }
    }
})
