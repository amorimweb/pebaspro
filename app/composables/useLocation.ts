export const useLocation = () => {
    const coords = ref<{ latitude: number | null; longitude: number | null }>({
        latitude: null,
        longitude: null
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    const getLocation = () => {
        loading.value = true
        error.value = null

        if (!navigator.geolocation) {
            error.value = 'Geolocalização não suportada pelo navegador'
            loading.value = false
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                coords.value = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
                loading.value = false
            },
            (err) => {
                console.error('Erro ao obter localização:', err)
                error.value = 'Não foi possível obter sua localização'
                loading.value = false
            },
            { enableHighAccuracy: true }
        )
    }

    return { coords, getLocation, loading, error }
}
