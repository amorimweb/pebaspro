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
        async fetchProfile() {
            this.loading = true
            this.error = null

            try {
                const data = await $fetch<Usuario>('/api/me')
                this.profile = data
                return { data, error: null }
            } catch (err: any) {
                console.error('Erro ao buscar perfil:', err)
                this.error = err.statusMessage || 'Erro ao carregar perfil'
                this.profile = null
                return { data: null, error: err }
            } finally {
                this.loading = false
            }
        },

        async createProfile(data: CreateUsuarioPayload) {
            this.loading = true
            try {
                await $fetch('/api/usuarios', {
                    method: 'POST',
                    body: data
                })
                await this.fetchProfile()
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
