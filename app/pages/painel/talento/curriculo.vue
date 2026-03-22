<script setup lang="ts">
import type { Database } from '~/types/database.types'

import { useAuthStore } from '~/stores/auth'
import { useCurriculum } from '~/composables/useCurriculum'

// definePageMeta removed as auth.global handles this

definePageMeta({ layout: 'dashboard' })

const authStore = useAuthStore()
const { curriculum, saveCurriculum, fetchCurriculum } = useCurriculum()
const { translateError } = useTranslation()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

// State
const loading = ref(false)
const saving = ref(false)

// Form Fields
const form = ref({
    objetivo_profissional: '',
    biografia: '',
    habilidades: [] as string[],
    experiencia_profissional: [] as any[],
    formacao_academica: [] as any[],
    latitude: null as number | null,
    longitude: null as number | null
})

// UI State
const activeTab = ref('sobre')
const isEditingSobre = ref(false)
const newSkill = ref('')
const showExpModal = ref(false)
const showEduModal = ref(false)

// Temp items for modals
const tempExp = ref({
    empresa: '',
    cargo: '',
    inicio: '',
    fim: '',
    atual: false,
    descricao: ''
})
const tempEdu = ref({
    instituicao: '',
    curso: '',
    nivel: 'Bacharelado',
    inicio: '',
    fim: '',
    status: 'Completo'
})

// Progress Calculation
const completeness = computed(() => {
    let score = 0
    if (form.value.objetivo_profissional) score += 20
    if (form.value.habilidades.length > 0) score += 20
    if (form.value.experiencia_profissional.length > 0) score += 20
    if (form.value.formacao_academica.length > 0) score += 20
    if (form.value.latitude) score += 20
    return score
})

const progressColor = computed(() => {
    if (completeness.value < 40) return 'bg-red-500'
    if (completeness.value < 80) return 'bg-yellow-500'
    return 'bg-green-500'
})

const hydrateForm = (data: any) => {
    if (!data) return
    form.value.objetivo_profissional = data.objetivo_profissional || ''
    form.value.biografia = data.biografia || ''
    form.value.habilidades = data.habilidades || []
    form.value.experiencia_profissional = Array.isArray(data.experiencia_profissional) ? data.experiencia_profissional : []
    form.value.formacao_academica = Array.isArray(data.formacao_academica) ? data.formacao_academica : []
    form.value.latitude = data.latitude ?? null
    form.value.longitude = data.longitude ?? null
}

watch(curriculum, (newVal) => {
    if (newVal) hydrateForm(newVal)
}, { immediate: true })

onMounted(async () => {
    navigateTo('/curriculo', { replace: true })
})

const saveProfile = async () => {
    if (!user.value) return
    saving.value = true
    
    const isComplete = completeness.value >= 80

    // Save to dedicated table
    const { error } = await saveCurriculum({
        objetivo_profissional: form.value.objetivo_profissional,
        biografia: form.value.biografia,
        habilidades: form.value.habilidades,
        experiencia_profissional: form.value.experiencia_profissional,
        formacao_academica: form.value.formacao_academica,
        latitude: form.value.latitude,
        longitude: form.value.longitude
    })

    // Also update main user profile for backward compatibility and status
    if (!error) {
        await authStore.updateProfile({
            cadastro_completo: isComplete
        })
        alert('Currículo salvo com sucesso!')
    } else {
        alert('Erro ao salvar currículo: ' + translateError(error))
    }
    saving.value = false
}

// Skills Logic
const addSkill = () => {
    if (newSkill.value && !form.value.habilidades.includes(newSkill.value)) {
        form.value.habilidades.push(newSkill.value)
        newSkill.value = ''
    }
}
const removeSkill = (skill: string) => {
    if (confirm(`Deseja realmente excluir a habilidade "${skill}"?`)) {
        form.value.habilidades = form.value.habilidades.filter(s => s !== skill)
    }
}

// Experience Logic
const saveExp = () => {
    form.value.experiencia_profissional.push({ ...tempExp.value })
    showExpModal.value = false
    tempExp.value = { empresa: '', cargo: '', inicio: '', fim: '', atual: false, descricao: '' }
}
const removeExp = (index: number) => {
    if (confirm('Deseja realmente excluir esta experiência profissional?')) {
        form.value.experiencia_profissional.splice(index, 1)
    }
}

// Education Logic
const saveEdu = () => {
    form.value.formacao_academica.push({ ...tempEdu.value })
    showEduModal.value = false
    tempEdu.value = { instituicao: '', curso: '', nivel: 'Bacharelado', inicio: '', fim: '', status: 'Completo' }
}
const removeEdu = (index: number) => {
    if (confirm('Deseja realmente excluir esta formação acadêmica?')) {
        form.value.formacao_academica.splice(index, 1)
    }
}

// Location
const getLocation = () => {
    if (!navigator.geolocation) return alert('Geolocalização não suportada')
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        form.value.latitude = latitude
        form.value.longitude = longitude
        
        // Auto-save location
        await saveCurriculum({ latitude, longitude })
        alert('Localização atualizada!')
    })
}

// Scroll to section
const scrollToSection = (id: string) => {
    activeTab.value = id
    const el = document.getElementById(id)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

// IntersectionObserver to update active tab on scroll
onMounted(() => {
    const sections = ['sobre', 'exp', 'edu']
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activeTab.value = entry.target.id
                }
            })
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach(id => {
        const el = document.getElementById(id)
        if (el) observer.observe(el)
    })
})

const openPrintView = () => {
    window.open('/painel/talento/curriculo-print', '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 pb-20">
    <!-- Hero / Top Section -->
    <div class="bg-white border-b border-slate-200/60 pb-12 pt-8 mb-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div class="space-y-2">
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
                        Meu Currículo Profissional
                    </span>
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Construa sua Vitrine 📄
                    </h1>
                    <p class="text-slate-500 text-lg font-medium max-w-2xl">
                        Mantenha suas informações atualizadas para ser encontrado pelas melhores empresas.
                    </p>
                </div>
                
                <div class="flex items-center gap-3">
                    <button 
                        @click="openPrintView" 
                        class="flex items-center gap-2 px-6 py-4 bg-slate-600 text-white rounded-2xl font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-600/20 active:scale-95 text-lg"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm0 0h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 01-1-3.8l-2.5-2m0 0a2 2 0 01 2-2h4a2 2 0 011 3.8l-2.5 2"></path></svg>
                        Imprimir
                    </button>
                    <button 
                        @click="saveProfile" 
                        :disabled="saving"
                        class="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition shadow-xl shadow-green-600/20 active:scale-95 text-lg disabled:opacity-50"
                    >
                        <svg v-if="saving" class="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {{ saving ? 'Salvando...' : 'Salvar Currículo' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4">
        <!-- Progress Bar (Integrated) -->
        <div class="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-10">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-black text-slate-900 text-lg uppercase tracking-widest">Força do seu Currículo</h3>
                <span class="text-2xl font-black" :class="completeness >= 80 ? 'text-green-600' : 'text-slate-400'">{{ completeness }}%</span>
            </div>
            <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-1000" :class="progressColor" :style="{ width: completeness + '%' }"></div>
            </div>
            <p v-if="completeness < 80" class="text-sm font-medium text-red-500 mt-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Complete pelo menos 80% do seu perfil para poder se candidatar às vagas.
            </p>
            <p v-else class="text-sm font-medium text-green-600 mt-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Seu currículo está pronto! Você já pode se candidatar às vagas.
            </p>
        </div>

        <!-- Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            <!-- Sidebar Navigation (sticky) -->
            <div class="lg:col-span-1">
                <div class="space-y-3 sticky top-28">
                    <button @click="scrollToSection('sobre')" :class="activeTab === 'sobre' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'" class="w-full text-left px-6 py-4 rounded-2xl font-black transition-all flex items-center gap-4 uppercase text-xs tracking-widest">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        Sobre Mim
                    </button>
                    <button @click="scrollToSection('exp')" :class="activeTab === 'exp' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'" class="w-full text-left px-6 py-4 rounded-2xl font-black transition-all flex items-center gap-4 uppercase text-xs tracking-widest">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Experiência
                    </button>
                    <button @click="scrollToSection('edu')" :class="activeTab === 'edu' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'" class="w-full text-left px-6 py-4 rounded-2xl font-black transition-all flex items-center gap-4 uppercase text-xs tracking-widest">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                        Formação
                    </button>
                </div>
            </div>

            <!-- Content Area -->
            <div class="lg:col-span-3 space-y-8">

                <!-- Seção: Sobre Mim -->
                <div id="sobre" class="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 scroll-mt-32">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <span class="w-1.5 h-8 bg-slate-900 rounded-full"></span>
                        <h2 class="text-xl font-black text-slate-900 uppercase tracking-widest">Sobre Mim</h2>
                    </div>
                    <div class="flex items-center gap-3">
                        <template v-if="!isEditingSobre">
                            <button @click="isEditingSobre = true" class="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                Editar
                            </button>
                        </template>
                        <template v-else>
                            <button @click="isEditingSobre = false" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                            <button @click="saveProfile().then(() => isEditingSobre = false)" :disabled="saving" class="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-green-600/20">
                                <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                {{ saving ? 'Salvando...' : 'Salvar' }}
                            </button>
                        </template>
                    </div>
                </div>
                <div class="space-y-10">
                    <!-- Modo Edição -->
                    <div v-if="isEditingSobre" class="grid grid-cols-1 gap-8">
                        <div class="space-y-3">
                            <label class="block text-sm font-black text-slate-900 uppercase tracking-widest">Objetivo Profissional</label>
                            <input v-model="form.objetivo_profissional" type="text" class="w-full border-2 border-slate-100 bg-slate-50/50 rounded-2xl px-6 py-4 outline-none focus:border-green-500 focus:bg-white transition-all font-medium text-lg" placeholder="Ex: Desenvolvedor Senior Fullstack">
                        </div>
                        
                        <div class="space-y-3">
                            <label class="block text-sm font-black text-slate-900 uppercase tracking-widest">Resumo / Biografia</label>
                            <textarea v-model="form.biografia" rows="6" class="w-full border-2 border-slate-100 bg-slate-50/50 rounded-2xl px-6 py-4 outline-none focus:border-green-500 focus:bg-white transition-all font-medium text-lg leading-relaxed" placeholder="Conte um pouco sobre sua trajetória profissional..."></textarea>
                        </div>

                        <div class="space-y-4">
                            <label class="block text-sm font-black text-slate-900 uppercase tracking-widest">Habilidades & Competências</label>
                            <div class="flex gap-3">
                                <input v-model="newSkill" @keydown.enter.prevent="addSkill" type="text" class="flex-1 border-2 border-slate-100 bg-slate-50/50 rounded-2xl px-6 py-4 outline-none focus:border-green-500 focus:bg-white transition-all font-medium" placeholder="Digite e aperte Enter (Ex: Photoshop, Vendas)">
                                <button @click="addSkill" class="bg-slate-900 text-white px-8 rounded-2xl font-black hover:bg-black transition active:scale-95">Adicionar</button>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <transition-group name="list">
                                    <span v-for="skill in form.habilidades" :key="skill" class="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-3 border border-green-100">
                                        {{ skill }}
                                        <button @click="removeSkill(skill)" class="w-5 h-5 flex items-center justify-center bg-green-200 rounded-full text-green-800 hover:bg-green-300 transition-colors">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </span>
                                </transition-group>
                            </div>
                        </div>

                        <div class="pt-10 border-t border-slate-100">
                            <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Sua Localização</h4>
                            <div class="flex flex-col md:flex-row items-center gap-6">
                                <button @click="getLocation" class="w-full md:w-auto px-8 py-5 bg-blue-50 text-blue-700 rounded-2xl font-black hover:bg-blue-100 transition flex items-center justify-center gap-3">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    {{ form.latitude ? 'Atualizar Localização' : 'Ativar Geolocalização' }}
                                </button>
                                <div v-if="form.latitude" class="flex items-center gap-2 text-green-600 font-bold">
                                     <div class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                     </div>
                                     Pronto! Te avisaremos de vagas na sua região.
                                </div>
                                <div v-else class="text-slate-400 font-medium">Use sua localização para ver vagas próximas.</div>
                            </div>
                        </div>
                    </div>

                    <!-- Modo Visualização -->
                    <div v-if="!isEditingSobre" class="grid grid-cols-1 gap-6">
                        <div v-if="form.objetivo_profissional" class="space-y-2">
                            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Objetivo Profissional</p>
                            <p class="text-lg font-bold text-slate-800">{{ form.objetivo_profissional }}</p>
                        </div>
                        <div v-else class="py-4 text-slate-400 italic text-sm">Nenhum objetivo profissional informado. Clique em Editar para adicionar.</div>

                        <div v-if="form.biografia" class="space-y-2">
                            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Resumo / Biografia</p>
                            <p class="text-slate-600 leading-relaxed whitespace-pre-line">{{ form.biografia }}</p>
                        </div>

                        <div v-if="form.habilidades.length" class="space-y-3">
                            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Habilidades</p>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="skill in form.habilidades" :key="skill" class="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-black border border-green-100">{{ skill }}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 text-sm font-bold" :class="form.latitude ? 'text-green-600' : 'text-slate-400'">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            {{ form.latitude ? 'Geolocalização ativada' : 'Sem geolocalização' }}
                        </div>
                    </div>
                </div>
                </div>

                <!-- Seção: Experiência -->
                <div id="exp" class="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 scroll-mt-32">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <span class="w-1.5 h-8 bg-slate-900 rounded-full"></span>
                        <h2 class="text-xl font-black text-slate-900 uppercase tracking-widest">Experiência Profissional</h2>
                    </div>
                    <button @click="showExpModal = true" class="px-5 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        + Adicionar
                    </button>
                </div>
                <div class="space-y-8">

                    <div v-if="form.experiencia_profissional.length === 0" class="text-center py-20 bg-slate-50 rounded-[32px] border-4 border-dashed border-slate-100">
                        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <p class="text-slate-400 font-bold text-lg">Nenhuma experiência cadastrada.</p>
                        <button @click="showExpModal = true" class="mt-4 text-green-600 font-black hover:underline">Adicionar minha primeira experiência</button>
                    </div>

                    <div v-else class="grid grid-cols-1 gap-6">
                        <div v-for="(exp, index) in form.experiencia_profissional" :key="index" class="p-8 border-2 border-slate-50 bg-slate-50/30 rounded-3xl hover:border-green-200 hover:bg-white transition-all relative group shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
                            <button @click="removeExp(index)" class="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <div class="flex items-start gap-6">
                                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-2xl text-slate-200 uppercase">
                                    {{ exp.empresa?.charAt(0) }}
                                </div>
                                <div class="space-y-1">
                                    <h4 class="text-xl font-black text-slate-900">{{ exp.cargo }}</h4>
                                    <p class="text-slate-600 font-bold text-lg">{{ exp.empresa }}</p>
                                    <div class="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest pt-2">
                                        {{ new Date(exp.inicio).toLocaleDateString() }} - {{ exp.atual ? 'Atual' : new Date(exp.fim).toLocaleDateString() }}
                                        <span v-if="exp.atual" class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    </div>
                                    <p class="text-slate-500 mt-6 leading-relaxed text-lg font-medium">{{ exp.descricao }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                <!-- Seção: Formação -->
                <div id="edu" class="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 scroll-mt-32">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <span class="w-1.5 h-8 bg-slate-900 rounded-full"></span>
                        <h2 class="text-xl font-black text-slate-900 uppercase tracking-widest">Formação Acadêmica</h2>
                    </div>
                    <button @click="showEduModal = true" class="px-5 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                        + Adicionar
                    </button>
                </div>
                <div class="space-y-8">

                    <div v-if="form.formacao_academica.length === 0" class="text-center py-20 bg-slate-50 rounded-[32px] border-4 border-dashed border-slate-100">
                        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                             <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                        </div>
                        <p class="text-slate-400 font-bold text-lg">Nenhuma formação cadastrada.</p>
                        <button @click="showEduModal = true" class="mt-4 text-green-600 font-black hover:underline">Adicionar minha formação</button>
                    </div>

                     <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="(edu, index) in form.formacao_academica" :key="index" class="p-8 border-2 border-slate-50 bg-slate-50/30 rounded-3xl hover:border-green-200 hover:bg-white transition-all relative group shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
                            <button @click="removeEdu(index)" class="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <h4 class="text-xl font-black text-slate-900 leading-tight mb-1">{{ edu.curso }}</h4>
                            <p class="text-slate-600 font-bold">{{ edu.instituicao }}</p>
                            <div class="mt-6 flex items-center justify-between">
                                <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-500">{{ edu.nivel }}</span>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conclusão: {{ new Date(edu.fim).toLocaleDateString() }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Modals -->
    <!-- Exp Modal (Refined Design) -->
    <div v-if="showExpModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showExpModal = false"></div>
        <div class="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 class="font-black text-3xl text-slate-900 mb-8 tracking-tight">Adicionar Experiência</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Cargo</label>
                    <input v-model="tempExp.cargo" type="text" placeholder="Ex: Vendedor, Gerente..." class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Empresa</label>
                    <input v-model="tempExp.empresa" type="text" placeholder="Nome da Empresa" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Início</label>
                    <input v-model="tempExp.inicio" type="date" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="space-y-2" v-if="!tempExp.atual">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Fim</label>
                    <input v-model="tempExp.fim" type="date" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="md:col-span-2 py-2">
                    <label class="flex items-center gap-3 text-sm font-black text-slate-700 cursor-pointer">
                        <input v-model="tempExp.atual" type="checkbox" class="w-6 h-6 rounded-lg border-2 border-slate-200 text-green-600 focus:ring-green-500 transition-all"> 
                        Trabalho aqui atualmente
                    </label>
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Atividades</label>
                    <textarea v-model="tempExp.descricao" placeholder="O que você fazia lá?" rows="4" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-medium leading-relaxed"></textarea>
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
                <button @click="showExpModal = false" class="px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition uppercase text-xs tracking-widest">Cancelar</button>
                <button @click="saveExp" class="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition shadow-xl shadow-slate-900/20 active:scale-95">Salvar Experiência</button>
            </div>
        </div>
    </div>

     <!-- Edu Modal (Refined Design) -->
    <div v-if="showEduModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showEduModal = false"></div>
        <div class="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 class="font-black text-3xl text-slate-900 mb-8 tracking-tight">Adicionar Formação</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Curso / Área</label>
                    <input v-model="tempEdu.curso" type="text" placeholder="Ex: Administração, Direito..." class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Instituição</label>
                    <input v-model="tempEdu.instituicao" type="text" placeholder="Nome da Faculdade ou Escola" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nível</label>
                    <select v-model="tempEdu.nivel" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold cursor-pointer">
                        <option>Ensino Médio</option>
                        <option>Técnico</option>
                        <option>Bacharelado</option>
                        <option>Mestrado</option>
                        <option>Doutorado</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Início</label>
                    <input v-model="tempEdu.inicio" type="date" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Conclusão</label>
                    <input v-model="tempEdu.fim" type="date" class="w-full border-2 border-slate-50 bg-slate-50/50 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold">
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
                <button @click="showEduModal = false" class="px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition uppercase text-xs tracking-widest">Cancelar</button>
                <button @click="saveEdu" class="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition shadow-xl shadow-slate-900/20 active:scale-95">Salvar Formação</button>
            </div>
        </div>
    </div>

    </div>

</template>

<style scoped>
.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
