import { defineStore } from 'pinia'
import type { CreateUsuarioPayload } from '~/types/usuarios'

export const useProfileStore = defineStore('profile', () => {
    const authStore = useAuthStore()

    const profile = computed(() => authStore.profile)
    const loading = computed(() => authStore.profileLoading)
    const error = computed(() => authStore.error)
    const isAuthenticated = computed(() => Boolean(authStore.profile))
    const isAdmin = computed(() => {
        const role = authStore.profile?.role
        return role === 'admin' || role === 'superadmin'
    })

    const fetchProfile = async (_accessToken?: string, _email?: string | null) => {
        return await authStore.fetchProfile()
    }

    const createProfile = async (data: CreateUsuarioPayload) => {
        return await authStore.saveCompleteProfile(data)
    }

    const clearProfile = () => authStore.clearProfile()

    return {
        profile,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        fetchProfile,
        createProfile,
        clearProfile,
    }
})
