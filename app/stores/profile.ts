import { defineStore } from 'pinia'
import type { Usuario } from '~/types/database.types'

export const useProfileStore = defineStore('profile', {
    state: () => ({
        profile: null as Usuario | null,
        loading: false,
        error: null as string | null
    }),

    persist: true,

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
            } catch (err: any) {
                console.error('Erro ao buscar perfil:', err)
                this.error = err.statusMessage || 'Erro ao carregar perfil'
                this.profile = null
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
