<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()

// Usamos o loading global do store
const { uploadFile, loading: uploading } = useFileUpload()
const { coords, getLocation, loading: locationLoading } = useLocation()
const loading = computed(() => authStore.profileLoading || uploading.value || locationLoading.value)

onMounted(async () => {
    // O plugin já busca o perfil, mas podemos forçar um refresh se necessário
    if (user.value && !authStore.profile) {
        await authStore.fetchProfile()
    }
})

const isEditing = ref(false)
const form = ref({
    nome: '',
    objetivo_profissional: '',
    sobre_mim: '',
    endereco: '',
    telefone: '',
    experiencia_profissional: [] as any[],
    formacao_academica: [] as any[],
    habilidades: [] as string[],
    newSkill: '',
    documento: '',
    latitude: null as number | null,
    longitude: null as number | null
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

watch(() => authStore.profile, (p) => {
    if (p) {
        form.value.nome = p.nome || ''
        form.value.objetivo_profissional = p.objetivo_profissional || ''
        form.value.sobre_mim = p.sobre_mim || ''
        form.value.endereco = p.endereco || ''
        form.value.telefone = p.telefone || ''
        
        // Cópia simples para evitar complexidade profunda de tipos no Proxy
        form.value.experiencia_profissional = Array.isArray(p.experiencia_profissional) ? [...(p.experiencia_profissional as any[])] : []
        form.value.formacao_academica = Array.isArray(p.formacao_academica) ? [...(p.formacao_academica as any[])] : []
        
        const hab = p.habilidades
        form.value.habilidades = Array.isArray(hab) ? [...hab] : []
        form.value.documento = p.documento || ''
        form.value.latitude = p.latitude || null
        form.value.longitude = p.longitude || null
    }
}, { immediate: true })

const addExperience = () => {
    form.value.experiencia_profissional.push({ empresa: '', cargo: '', periodo: '', descricao: '' })
}

const removeExperience = (index: number) => {
    form.value.experiencia_profissional.splice(index, 1)
}

const addEducation = () => {
    form.value.formacao_academica.push({ instituicao: '', curso: '', periodo: '' })
}

const removeEducation = (index: number) => {
    form.value.formacao_academica.splice(index, 1)
}

const addSkill = () => {
    if (form.value.newSkill.trim() && !form.value.habilidades.includes(form.value.newSkill.trim())) {
        form.value.habilidades.push(form.value.newSkill.trim())
        form.value.newSkill = ''
    }
}

const removeSkill = (skill: string) => {
    form.value.habilidades = form.value.habilidades.filter(s => s !== skill)
}

const onFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
        const file = target.files[0]
        selectedFile.value = file
        
        // Upload imediato ao selecionar (opcional, ou pode esperar o Salvar)
        // O usuário disse que "não conseguiu alterar", então vamos fazer o upload automático pra ser mais direto
        const userId = user.value?.id
        if (!userId) return

        const fileName = `${userId}-${Date.now()}.jpg`
        const { publicUrl, error } = await uploadFile(file, `perfil/${fileName}`)
        
        if (error) {
            alert('Erro ao carregar foto: ' + error)
            return
        }

        if (publicUrl) {
            await authStore.updateProfile({ foto: publicUrl })
        }
    }
}

const handleGetLocation = () => {
    getLocation()
}

watch(coords, (newCoords) => {
    if (newCoords.latitude && newCoords.longitude) {
        form.value.latitude = newCoords.latitude
        form.value.longitude = newCoords.longitude
        // Podemos tentar buscar o endereço reverso aqui se houver uma API, mas vamos manter simples por enquanto
    }
})

const handleSave = async () => {
    // Garantir que os dados enviados não sejam Proxies do Vue, que o Supabase/PostgREST pode rejeitar
    const updatePayload = {
        nome: form.value.nome,
        objetivo_profissional: form.value.objetivo_profissional,
        sobre_mim: form.value.sobre_mim,
        endereco: form.value.endereco,
        telefone: form.value.telefone,
        experiencia_profissional: JSON.parse(JSON.stringify(form.value.experiencia_profissional || [])),
        formacao_academica: JSON.parse(JSON.stringify(form.value.formacao_academica || [])),
        habilidades: Array.from(toRaw(form.value.habilidades || [])),
        documento: form.value.documento,
        latitude: form.value.latitude,
        longitude: form.value.longitude
    }

    const { error } = await authStore.updateProfile(updatePayload)
    
    if (!error) {
        isEditing.value = false
    } else {
        alert('Erro ao salvar perfil: ' + (error.message || JSON.stringify(error)))
    }
}

const handleLogout = async () => {
    await authStore.signOut()
    navigateTo('/')
}

definePageMeta({
    layout: 'dashboard'
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Removido AppHeader pois o layout dashboard ja prove a navegacao -->

    <main class="flex-grow py-8 md:py-16">
      <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Sidebar: Perfil e Navegação -->
          <aside class="w-full lg:w-80 flex-shrink-0">
            <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 sticky top-24">
              <div class="flex flex-col items-center text-center">
                <div class="relative mb-6">
                  <div class="w-32 h-32 md:w-36 md:h-36 bg-green-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative group/avatar">
                    <Transition name="fade" mode="out-in">
                      <img v-if="authStore.profile?.foto" :key="authStore.profile.foto" :src="authStore.profile.foto" :alt="authStore.profile.nome || 'Avatar'" class="w-full h-full object-cover" />
                      <span v-else :key="'letter'" class="text-5xl font-black text-green-600 uppercase flex items-center justify-center w-full h-full bg-green-50">{{ authStore.profile?.nome?.charAt(0) || '?' }}</span>
                    </Transition>
                  </div>
                  <button v-if="isEditing" @click="fileInput?.click()" class="absolute bottom-2 right-2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-400 transition-colors border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
                </div>

                <h2 class="text-2xl font-bold text-slate-900 mb-1 leading-tight">{{ authStore.profile?.nome || 'Nome da Conta' }}</h2>
                <p class="text-green-600 font-bold text-sm uppercase tracking-wider mb-2">
                    {{ authStore.profile?.tipo_conta === 'empresa' ? 'Empresa' : (authStore.profile?.profissao || 'Profissão não informada') }}
                </p>
                <p class="text-slate-400 text-sm mb-8 break-all">{{ user?.email }}</p>

                <nav class="w-full flex flex-col gap-2 text-left">
                  <button class="w-full px-6 py-4 rounded-2xl bg-slate-50 text-slate-900 font-bold text-sm transition-all flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Visualizar Perfil
                  </button>
                  <button @click="isEditing = !isEditing" :class="isEditing ? 'bg-green-500 text-white' : 'hover:bg-slate-50 text-slate-600'" class="w-full px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ isEditing ? 'Editando Perfil' : 'Editar Informações' }}
                  </button>
                  
                  <div class="h-px bg-slate-100 my-2"></div>
                  
                  <button @click="handleLogout" class="w-full px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm transition-all flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair da Conta
                  </button>
                </nav>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="flex-grow flex flex-col gap-8">
            
            <!-- VIEW DE EMPRESA -->
            <template v-if="authStore.profile?.tipo_conta === 'empresa'">
                 <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                    <div v-if="!isEditing" @click="isEditing = true" class="absolute top-8 right-8 cursor-pointer text-slate-300 hover:text-green-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>

                    <div class="flex flex-col gap-8">
                        <section>
                            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                                <span class="w-8 h-px bg-green-200"></span> Dados da Empresa
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nome da Empresa</label>
                                    <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.nome || '-' }}</div>
                                    <input v-else v-model="form.nome" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" />
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">CNPJ / Documento</label>
                                    <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.documento || 'Não informado' }}</div>
                                    <input v-else v-model="form.documento" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" placeholder="00.000.000/0001-00" />
                                </div>
                            </div>
                        </section>

                        <section>
                        <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                            <span class="w-8 h-px bg-green-200"></span> Sobre a Empresa
                        </h3>
                        <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                            {{ authStore.profile?.sobre_mim || 'Adicione uma descrição sobre a empresa...' }}
                        </div>
                        <textarea v-else v-model="form.sobre_mim" rows="6" class="w-full text-slate-600 text-lg leading-relaxed bg-slate-50 border-none rounded-2xl p-6 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Descreva sua empresa, missão, valores..."></textarea>
                        </section>
                        
                        <section>
                         <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                            <span class="w-8 h-px bg-green-200"></span> Endereço e Localização
                        </h3>
                         <div class="grid grid-cols-1 gap-6">
                            <div>
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Endereço Público</label>
                                <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg">
                                    {{ authStore.profile?.endereco || 'Endereço não informado' }}
                                </div>
                                <input v-else v-model="form.endereco" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" placeholder="Ex: Av. Brasil, 1000 - Centro, Pebas" />
                            </div>
                            
                            <div v-if="isEditing" class="bg-green-50 p-6 rounded-2xl border border-green-100">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 class="font-bold text-green-900">Localização no Mapa</h4>
                                        <p class="text-sm text-green-700">Aumente sua visibilidade para talentos próximos.</p>
                                    </div>
                                    <button @click="handleGetLocation" :disabled="loading" class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50">
                                        {{ locationLoading ? 'Obtendo...' : 'Obter Minha Posição' }}
                                    </button>
                                </div>
                                <div v-if="form.latitude" class="flex gap-4 text-xs font-mono text-green-800 bg-white/50 p-2 rounded-lg">
                                    <span>LAT: {{ form.latitude.toFixed(6) }}</span>
                                    <span>LONG: {{ form.longitude?.toFixed(6) }}</span>
                                </div>
                                <div v-else-if="!locationLoading" class="text-xs text-green-600 italic">
                                    Localização não definida. Clique no botão acima para capturar sua posição atual.
                                </div>
                            </div>
                            <div v-else-if="authStore.profile?.latitude" class="flex items-center gap-2 text-green-600 font-bold text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Localização Geográfica Ativada
                            </div>
                         </div>
                        </section>
                    </div>
                 </div>
            </template>

            <!-- VIEW DE PRESTADOR -->
            <template v-else-if="authStore.profile?.tipo_conta === 'prestador'">
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                    <div v-if="!isEditing" @click="isEditing = true" class="absolute top-8 right-8 cursor-pointer text-slate-300 hover:text-green-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>

                    <div class="flex flex-col gap-8">
                        <section>
                            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                                <span class="w-8 h-px bg-green-200"></span> Minha Especialidade
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nome Profissional</label>
                                    <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.nome || '-' }}</div>
                                    <input v-else v-model="form.nome" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" />
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Documento</label>
                                    <div class="text-xl font-bold text-slate-800">{{ authStore.profile?.documento || 'Não informado' }}</div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                                <span class="w-8 h-px bg-green-200"></span> Apresentação do Prestador
                            </h3>
                            <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                                {{ authStore.profile?.sobre_mim || 'Adicione uma descrição sobre os serviços que você presta...' }}
                            </div>
                            <textarea v-else v-model="form.sobre_mim" rows="6" class="w-full text-slate-600 text-lg leading-relaxed bg-slate-50 border-none rounded-2xl p-6 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Descreva sua experiência, como você trabalha e o que os clientes podem esperar..."></textarea>
                        </section>
                        
                        <section>
                            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                                <span class="w-8 h-px bg-green-200"></span> Contato e Localização
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">WhatsApp / Telefone</label>
                                    <div v-if="!isEditing" class="flex items-center gap-3">
                                        <div class="text-xl font-bold text-slate-800">{{ authStore.profile?.telefone || 'Não informado' }}</div>
                                        <a v-if="authStore.profile?.telefone" :href="`https://wa.me/55${authStore.profile?.telefone.replace(/\D/g, '')}`" target="_blank" class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                            Contato
                                        </a>
                                    </div>
                                    <input v-else v-model="form.telefone" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" placeholder="(00) 00000-0000" />
                                </div>
                                <div class="md:col-span-2">
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Endereço Principal</label>
                                    <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg">{{ authStore.profile?.endereco || 'Não informado' }}</div>
                                    <input v-else v-model="form.endereco" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" placeholder="Ex: Av. Brasil, 1000 - Centro, Pebas" />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <!-- Habilidades e Diferenciais -->
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-10 flex items-center gap-2">
                    <span class="w-8 h-px bg-green-200"></span> Diferenciais e Competências
                    </h3>

                    <div class="flex flex-wrap gap-3">
                        <div v-for="skill in form.habilidades" :key="skill" class="group px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 transition-all hover:bg-white hover:border-green-100 hover:shadow-lg hover:shadow-green-500/5">
                            <span class="text-slate-800 font-bold">{{ skill }}</span>
                            <button v-if="isEditing" @click="removeSkill(skill)" class="text-slate-300 hover:text-red-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div v-if="isEditing" class="relative flex-grow flex items-center gap-2 min-w-[200px]">
                            <input v-model="form.newSkill" @keyup.enter="addSkill" placeholder="Ex: Orçamento sem compromisso, Atendimento 24h..." class="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium" />
                            <button @click="addSkill" class="px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 active:scale-95">Add</button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- VIEW DE TALENTO (Original CV) -->
            <template v-else-if="authStore.profile?.tipo_conta === 'talento'">
                <!-- Resumo e Objetivos -->
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                <div v-if="!isEditing" @click="isEditing = true" class="absolute top-8 right-8 cursor-pointer text-slate-300 hover:text-green-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>

                <div class="flex flex-col gap-8">
                    <section>
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                        <span class="w-8 h-px bg-green-200"></span> Objetivo Profissional
                    </h3>
                    <div v-if="!isEditing" class="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                        {{ authStore.profile?.objetivo_profissional || 'Qual o seu objetivo na carreira?' }}
                    </div>
                    <textarea v-else v-model="form.objetivo_profissional" rows="2" class="w-full text-xl md:text-2xl font-bold text-slate-800 bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Ex: Desenvolvedor Fullstack Sênior focado em resolver problemas..."></textarea>
                    </section>

                    <section>
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-4 flex items-center gap-2">
                        <span class="w-8 h-px bg-green-200"></span> Minha História
                    </h3>
                    <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                        {{ authStore.profile?.sobre_mim || 'Conte um pouco sobre você e sua trajetória...' }}
                    </div>
                    <textarea v-else v-model="form.sobre_mim" rows="6" class="w-full text-slate-600 text-lg leading-relaxed bg-slate-50 border-none rounded-2xl p-6 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Fale mais detalhes sobre sua vida profissional e o que te motiva..."></textarea>
                    </section>
                </div>
                </div>

                <!-- Experiências -->
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 overflow-hidden">
                <div class="flex items-center justify-between mb-10">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 flex items-center gap-2">
                    <span class="w-8 h-px bg-green-200"></span> Experiência Profissional
                    </h3>
                    <button v-if="isEditing" @click="addExperience" class="text-green-600 font-black text-sm uppercase flex items-center gap-2 hover:bg-green-50 px-4 py-2 rounded-xl transition-all">
                    <span>+ Adicionar</span>
                    </button>
                </div>

                <div class="flex flex-col gap-10">
                    <div v-for="(exp, idx) in form.experiencia_profissional" :key="idx" class="relative pl-10 border-l-2 border-slate-100 last:border-transparent pb-10 last:pb-0">
                    <div class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm transition-transform duration-300 transform group-hover:scale-125"></div>
                    
                    <div v-if="!isEditing">
                        <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
                            <span class="text-xl font-extrabold text-slate-900 leading-none">{{ exp.empresa }}</span>
                            <span class="px-3 py-1 bg-slate-100 rounded-lg text-slate-500 text-xs font-black uppercase tracking-wider">{{ exp.periodo }}</span>
                        </div>
                        <div class="text-green-600 font-bold mb-4">{{ exp.cargo }}</div>
                        <p class="text-slate-500 leading-relaxed">{{ exp.descricao }}</p>
                    </div>
                    <div v-else class="flex flex-col gap-4 bg-slate-50 p-6 rounded-[24px]">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input v-model="exp.empresa" placeholder="Empresa" class="bg-white border-none p-3 rounded-xl focus:ring-2 focus:ring-green-400 text-sm font-bold" />
                        <input v-model="exp.periodo" placeholder="Período" class="bg-white border-none p-3 rounded-xl focus:ring-2 focus:ring-green-400 text-sm font-bold" />
                        </div>
                        <input v-model="exp.cargo" placeholder="Cargo" class="bg-white border-none p-3 rounded-xl focus:ring-2 focus:ring-green-400 text-sm font-bold" />
                        <textarea v-model="exp.descricao" placeholder="Descrição das atividades" class="bg-white border-none p-4 rounded-xl focus:ring-2 focus:ring-green-400 text-sm"></textarea>
                        <button @click="removeExperience(idx)" class="self-end text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">Remover</button>
                    </div>
                    </div>

                    <div v-if="form.experiencia_profissional.length === 0 && !isEditing" class="text-center py-10">
                    <p class="text-slate-400 italic">Nenhuma experiência profissional informada.</p>
                    </div>
                </div>
                </div>

                <!-- Formação -->
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 overflow-hidden">
                <div class="flex items-center justify-between mb-10">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 flex items-center gap-2">
                    <span class="w-8 h-px bg-green-200"></span> Formação Acadêmica
                    </h3>
                    <button v-if="isEditing" @click="addEducation" class="text-green-600 font-black text-sm uppercase flex items-center gap-2 hover:bg-green-50 px-4 py-2 rounded-xl transition-all">
                    <span>+ Adicionar</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-for="(edu, idx) in form.formacao_academica" :key="idx" class="p-6 md:p-8 rounded-[32px] border-2 transition-all duration-300" :class="isEditing ? 'border-dashed border-slate-200' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-white'">
                    <div v-if="!isEditing">
                        <span class="inline-block px-3 py-1 bg-white text-green-600 text-xs font-black uppercase tracking-wider rounded-lg mb-4 shadow-sm">{{ edu.periodo }}</span>
                        <h4 class="text-lg font-extrabold text-slate-800 mb-2 leading-tight">{{ edu.curso }}</h4>
                        <p class="text-slate-500 font-bold text-sm">{{ edu.instituicao }}</p>
                    </div>
                    <div v-else class="flex flex-col gap-3">
                        <input v-model="edu.curso" placeholder="Curso" class="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-green-400 text-sm font-bold" />
                        <input v-model="edu.instituicao" placeholder="Instituição" class="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-green-400 text-sm font-bold" />
                        <input v-model="edu.periodo" placeholder="Período" class="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-green-400 text-sm font-bold" />
                        <button @click="removeEducation(idx)" class="self-end text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">Remover</button>
                    </div>
                    </div>

                    <div v-if="form.formacao_academica.length === 0 && !isEditing" class="col-span-full text-center py-10">
                    <p class="text-slate-400 italic">Nenhuma formação acadêmica informada.</p>
                    </div>
                </div>
                </div>

                <!-- Habilidades -->
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12">
                    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-green-600 mb-10 flex items-center gap-2">
                    <span class="w-8 h-px bg-green-200"></span> Habilidades e Especialidades
                    </h3>

                    <div class="flex flex-wrap gap-3">
                        <div v-for="skill in form.habilidades" :key="skill" class="group px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 transition-all hover:bg-white hover:border-green-100 hover:shadow-lg hover:shadow-green-500/5">
                            <span class="text-slate-800 font-bold">{{ skill }}</span>
                            <button v-if="isEditing" @click="removeSkill(skill)" class="text-slate-300 hover:text-red-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div v-if="isEditing" class="relative flex-grow flex items-center gap-2 min-w-[200px]">
                            <input v-model="form.newSkill" @keyup.enter="addSkill" placeholder="Adicionar nova habilidade..." class="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium" />
                            <button @click="addSkill" class="px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 active:scale-95">Add</button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Botão Salvar Flutuante para Mobile quando Editando -->
            <div v-if="isEditing" class="lg:hidden sticky bottom-8 z-40 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex gap-4">
                <button @click="isEditing = false" class="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs">Cancelar</button>
                <button @click="handleSave" :disabled="loading" class="flex-[2] py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/30">
                    {{ loading ? 'Salvando...' : 'Salvar Perfil' }}
                </button>
            </div>

            <!-- Botão Salvar Desktop -->
            <div v-if="isEditing" class="hidden lg:flex justify-end gap-4 mt-4">
                <button @click="isEditing = false" class="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Cancelar</button>
                <button @click="handleSave" :disabled="loading" class="px-12 py-5 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all shadow-xl shadow-green-600/20">
                    {{ loading ? 'Salvando Alterações...' : authStore.profile?.tipo_conta === 'empresa' ? 'Salvar Dados Emrpesa' : 'Salvar Currículo' }}
                </button>
            </div>

          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<style scoped>
/* Transições suaves adicionais */
.container {
    max-width: 1400px;
}

/* Transições de Fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
