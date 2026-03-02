<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()
const user = useSupabaseUser()

const loading = ref(false)
const jobs = ref<any[]>([])
const locationAllowed = ref(false)
const locationError = ref<string | null>(null)
const radius = ref(50) // km

// User coords
const coords = ref<{lat: number, lon: number} | null>(null)

onMounted(() => {
    const profile = authStore.profile
    const curr = profile?.curriculo
    
    // Try to get location from new table first, then legacy profile
    const lat = curr?.latitude || profile?.latitude
    const lon = curr?.longitude || profile?.longitude

    if (lat && lon) {
        coords.value = { lat, lon }
        locationAllowed.value = true
        fetchJobs()
    } else {
        requestLocation()
    }
})

const requestLocation = () => {
    if (!navigator.geolocation) {
        locationError.value = 'Geolocalização não suportada.'
        return
    }

    loading.value = true
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            locationAllowed.value = true
            locationError.value = null
            coords.value = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }
            
            // Optional: Update profile with new location
            updateProfileLocation(position.coords.latitude, position.coords.longitude)
            
            await fetchJobs()
            loading.value = false
        },
        (error) => {
            console.error('Erro de GPS:', error)
            locationError.value = 'Precisamos da sua localização para encontrar vagas próximas.'
            loading.value = false
        }
    )
}

const updateProfileLocation = async (lat: number, lon: number) => {
    if (!user.value) return
    await authStore.updateProfile({
        latitude: lat,
        longitude: lon
    })
}

const fetchJobs = async () => {
    if (!coords.value || !authStore.profile) return
    
    loading.value = true
    try {
        const profile = authStore.profile
        const curr = profile?.curriculo
        const skills = (curr?.habilidades && curr.habilidades.length > 0) ? curr.habilidades : (profile?.habilidades || [])

        const { data, error } = await supabase.rpc('search_vagas', {
            user_lat: coords.value.lat,
            user_lon: coords.value.lon,
            radius_km: radius.value,
            user_skills: skills
        } as any)

        if (error) {
            console.warn('RPC search_vagas falhou, tentando busca simples:', error)
            // Fallback: Busca simples das últimas vagas
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('vagas')
                .select('*')
                .order('data_publicacao', { ascending: false })
                .limit(5)
            
            if (fallbackError) throw fallbackError
            
            // Mapear dados para o formato esperado pelo template
            jobs.value = (fallbackData || []).map((j: any) => ({
                ...j,
                dist_km: 0,
                skill_match_count: 0
            }))
        } else {
            jobs.value = data || []
        }

    } catch (e) {
        console.error('Erro ao buscar vagas recomendadas:', e)
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
            <h2 class="text-lg font-bold text-gray-900">Vagas Recomendadas</h2>
            <p class="text-xs text-gray-500" v-if="coords">
                Baseado em localização ({{ radius }}km) e habilidades.
            </p>
        </div>
        <button 
            v-if="!locationAllowed" 
            @click="requestLocation" 
            class="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 transition"
        >
            Ativar Localização
        </button>
    </div>

    <div v-if="loading" class="p-8 text-center text-gray-400">
        <div class="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        Buscando melhores oportunidades...
    </div>

    <div v-else-if="locationError" class="p-8 text-center">
        <p class="text-red-500 mb-2">{{ locationError }}</p>
        <button @click="requestLocation" class="text-sm underline text-gray-600">Tentar Novamente</button>
    </div>

    <div v-else-if="jobs.length === 0" class="p-8 text-center text-gray-500">
        <p>Nenhuma vaga encontrada no raio de {{ radius }}km.</p>
        <p class="text-xs mt-1">Tente completar suas habilidades no perfil.</p>
    </div>

    <div v-else class="divide-y divide-gray-100">
        <div v-for="job in jobs" :key="job.id" class="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row gap-4 sm:items-center">
            
            <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                    <h3 class="font-bold text-gray-900">{{ job.titulo }}</h3>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800" v-if="job.skill_match_count > 0">
                        {{ job.skill_match_count }} skills
                    </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ job.descricao }}</p>
                
                <div class="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        ~{{ Math.round(job.dist_km) }} km
                    </span>
                    <span v-if="job.modalidade" class="capitalize">• {{ job.modalidade }}</span>
                    <span v-if="job.salario">• {{ job.salario }}</span>
                </div>
            </div>

            <NuxtLink :to="`/vagas/${job.id}`" class="shrink-0">
                <button class="w-full sm:w-auto px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition">
                    Ver Detalhes
                </button>
            </NuxtLink>

        </div>
    </div>
  </div>
</template>
