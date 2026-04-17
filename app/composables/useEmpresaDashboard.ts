export const useEmpresaDashboard = () => {
    const authStore = useAuthStore()
    
    // Perfil mockado inicial baseado no modelo 'Corporativo' conforme solicitado
    const dashboardState = reactive({
        mode: 'corporativo', // 'essencial' | 'operacional' | 'corporativo'
        activePlan: 'corporativo',
        company: {
            name: authStore.profile?.nome || 'PEBASPRO Soluções em Mineração',
            email: authStore.profile?.email || 'contato@pebaspro.com.br',
            mode: 'corporativo',
            plan: 'corporativo',
            serviceProviderActive: false
        }
    })

    const setMode = (mode: string) => {
        dashboardState.mode = mode
        dashboardState.company.mode = mode
    }

    return {
        ...toRefs(dashboardState),
        setMode
    }
}
