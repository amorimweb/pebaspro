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
        
        // Uso de JSON.parse(JSON.stringify()) para quebra de reatividade profunda e evitar erro de inferência infinita (lint)
        form.value.experiencia_profissional = Array.isArray(p.experiencia_profissional) ? JSON.parse(JSON.stringify(p.experiencia_profissional)) : []
        form.value.formacao_academica = Array.isArray(p.formacao_academica) ? JSON.parse(JSON.stringify(p.formacao_academica)) : []
        
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
        
        // Validação básica de tamanho (ex: 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem é muito grande. Escolha uma foto de até 5MB.')
            return
        }

        selectedFile.value = file
        
        // Priorizar o ID do perfil do store, que já está garantido se a página carregou
        const userId = authStore.profile?.id || user.value?.id
        if (!userId) {
            alert('Usuário não identificado. Tente fazer login novamente.')
            return
        }

        const fileName = `${userId}-${Date.now()}.jpg`
        
        try {
            console.log('Iniciando upload da foto no bucket avatars:', fileName)
            // Alterado para o bucket 'avatars' solicitado pelo usuário
            const { publicUrl, error } = await uploadFile(file, `${fileName}`, 'avatars')
            
            if (error) {
                console.error('Erro retornado pelo uploadFile:', error)
                alert('Erro ao carregar foto: ' + error)
                return
            }

            if (publicUrl) {
                console.log('Upload concluído com sucesso. Salvando URL no perfil:', publicUrl)
                const { error: updateError } = await authStore.updateProfile({ foto: publicUrl })
                
                if (updateError) {
                    throw updateError
                }
                
                alert('Foto atualizada com sucesso!')
            } else {
                throw new Error('URL pública não gerada após o upload.')
            }
        } catch (err: any) {
            console.error('Exceção no onFileChange:', err)
            alert('Ocorreu um erro inesperado ao atualizar sua foto. Verifique sua conexão ou tente novamente mais tarde.')
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

    <div class="py-8 md:py-16">
      <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Sidebar: Perfil e Navegação -->
          <aside v-if="authStore.profile?.tipo_conta !== 'talento'" class="w-full lg:w-80 flex-shrink-0">
            <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 sticky top-24">
              <div class="flex flex-col items-center text-center">
                <div class="relative mb-6">
                  <div class="w-32 h-32 md:w-36 md:h-36 bg-green-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative group/avatar">
                    <Transition name="fade" mode="out-in">
                      <img v-if="authStore.profile?.foto" :key="authStore.profile.foto" :src="authStore.profile.foto" :alt="authStore.profile.nome || 'Avatar'" class="w-full h-full object-cover" />
                      <span v-else :key="'letter'" class="text-5xl font-black text-green-600 uppercase flex items-center justify-center w-full h-full bg-green-50">{{ authStore.profile?.nome?.charAt(0) || '?' }}</span>
                    </Transition>
                  </div>
                  <button v-if="isEditing" @click="fileInput?.click()" class="absolute bottom-2 right-2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-400 transition-colors border-2 border-white z-10" :disabled="uploading">
                    <svg v-if="!uploading" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812 1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </button>
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
                </div>

                <h2 class="text-2xl font-bold text-slate-900 mb-1 leading-tight uppercase">{{ authStore.profile?.nome || 'Nome da Conta' }}</h2>
                <p class="text-green-600 font-bold text-sm uppercase tracking-wider mb-2">
                    {{ authStore.profile?.tipo_conta === 'empresa' ? 'Empresa' : (authStore.profile?.profissao || 'Profissão não informada') }}
                </p>
                <p class="text-slate-400 text-sm mb-8 break-all">{{ user?.email }}</p>

                <nav class="w-full flex flex-col gap-2 text-left">
                  <NuxtLink to="/" class="w-full px-6 py-4 rounded-2xl hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Página Inicial
                  </NuxtLink>
                  
                  <template v-if="authStore.profile?.tipo_conta !== 'talento'">
                    <button @click="isEditing = !isEditing" :class="isEditing ? 'bg-green-500 text-white' : 'hover:bg-slate-50 text-slate-600'" class="w-full px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {{ isEditing ? 'Editando Perfil' : 'Editar Informações' }}
                    </button>
                  </template>
                </nav>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="flex-grow flex flex-col gap-8">
            
            <!-- VIEW DE EMPRESA -->
            <template v-if="authStore.profile?.tipo_conta === 'empresa'">
                 <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 relative">
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
                                <div>
                                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">WhatsApp / Telefone</label>
                                    <div v-if="!isEditing" class="flex items-center gap-3">
                                        <div class="text-xl font-bold text-slate-800">{{ authStore.profile?.telefone || 'Não informado' }}</div>
                                        <a v-if="authStore.profile?.telefone" :href="`https://wa.me/55${authStore.profile?.telefone.replace(/\D/g, '')}`" target="_blank" class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                            WhatsApp
                                        </a>
                                    </div>
                                    <input v-else v-model="form.telefone" class="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400" placeholder="(00) 00000-0000" />
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
                <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12 relative">
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

            <template v-else-if="authStore.profile?.tipo_conta === 'talento'">
                <!-- Currículo Estilo Papel -->
                <div class="bg-white rounded-none shadow-2xl border-t-[12px] border-green-600 p-8 md:p-16 relative overflow-hidden">
                    <!-- Marca d'água ou Detalhe decorativo -->
                    <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
                    </div>

                    <!-- Header do Currículo -->
                    <header class="border-b-2 border-slate-100 pb-10 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <!-- Avatar dentro do currículo -->
                        <div class="relative group shrink-0">
                            <div class="w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-lg">
                                <img 
                                    :src="authStore.profile?.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'" 
                                    class="w-full h-full object-cover"
                                />
                            </div>
                            <!-- Botão de Upload discreto no currículo -->
                            <button @click="fileInput?.click()" class="absolute -bottom-2 -right-2 p-2 bg-white text-slate-600 rounded-lg shadow-md border border-slate-100 hover:text-green-600 transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 011.664.89l.812 1.22A2 2 0 0010.07 10H14a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </button>
                        </div>

                        <div class="flex-1 space-y-4 text-center md:text-left">
                            <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">{{ authStore.profile?.nome }}</h1>
                            <div class="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    {{ authStore.profile?.telefone || 'Telefone não informado' }}
                                </span>
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002-2z"/></svg>
                                    {{ user?.email }}
                                </span>
                                <span v-if="authStore.profile?.endereco" class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    {{ authStore.profile?.endereco }}
                                </span>
                            </div>
                        </div>
                        <NuxtLink to="/painel/talento/curriculo" class="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Editar Currículo
                        </NuxtLink>
                    </header>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <!-- Coluna Principal (2/3) -->
                        <div class="lg:col-span-2 space-y-12">
                            <!-- Objetivo Profissional -->
                            <section>
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span class="w-4 h-0.5 bg-green-500"></span>
                                    Objetivo Profissional
                                </h3>
                                <p class="text-lg text-slate-800 leading-tight">
                                    {{ authStore.profile?.curriculo?.objetivo_profissional || authStore.profile?.objetivo_profissional || 'Objetivo não informado' }}
                                </p>
                            </section>

                            <!-- Biografia -->
                            <section>
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span class="w-4 h-0.5 bg-green-500"></span>
                                    Sobre Mim / Biografia
                                </h3>
                                <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {{ authStore.profile?.curriculo?.biografia || authStore.profile?.sobre_mim || 'Adicione uma breve descrição sobre sua trajetória...' }}
                                </p>
                            </section>

                            <!-- Experiência Profissional -->
                            <section>
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span class="w-4 h-0.5 bg-green-500"></span>
                                    Experiência Profissional
                                </h3>
                                <div class="space-y-8">
                                    <template v-if="authStore.profile?.curriculo?.experiencia_profissional?.length">
                                        <div v-for="(exp, idx) in authStore.profile.curriculo.experiencia_profissional" :key="idx" class="relative pl-6 border-l border-slate-100">
                                            <div class="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-white border border-green-500 rounded-full"></div>
                                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                <h4 class="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{{ exp.cargo }}</h4>
                                                <span class="text-[9px] font-black bg-slate-50 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">
                                                    {{ exp.inicio ? new Date(exp.inicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '' }} 
                                                    - 
                                                    {{ exp.atual ? 'Atualmente' : (exp.fim ? new Date(exp.fim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '') }}
                                                </span>
                                            </div>
                                            <p class="text-green-600 font-bold text-[10px] uppercase tracking-widest mb-1">{{ exp.empresa }}</p>
                                            <p class="text-slate-500 text-xs leading-relaxed">{{ exp.descricao }}</p>
                                        </div>
                                    </template>
                                    <p v-else class="text-slate-400 text-xs italic">Nenhuma experiência profissional informada.</p>
                                </div>
                            </section>

                            <!-- Formação Acadêmica -->
                            <section>
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span class="w-4 h-0.5 bg-green-500"></span>
                                    Formação Acadêmica
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <template v-if="authStore.profile?.curriculo?.formacao_academica?.length">
                                        <div v-for="(edu, idx) in authStore.profile.curriculo.formacao_academica" :key="idx" class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <h4 class="text-sm font-extrabold text-slate-800 mb-1">{{ edu.curso }}</h4>
                                            <p class="text-green-600 font-bold text-xs mb-3">{{ edu.instituicao }}</p>
                                            <div class="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                <span>{{ edu.nivel }}</span>
                                                <span>{{ edu.fim ? new Date(edu.fim).toLocaleDateString('pt-BR', { year: 'numeric' }) : '' }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <p v-else class="text-slate-400 text-xs italic col-span-2">Nenhuma formação acadêmica informada.</p>
                                </div>
                            </section>
                        </div>

                        <!-- Coluna Lateral (1/3) -->
                        <div class="space-y-12">
                            <!-- Habilidades -->
                            <section>
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span class="w-4 h-0.5 bg-green-500"></span>
                                    Habilidades
                                </h3>
                                <div class="flex flex-wrap gap-1.5">
                                    <template v-if="authStore.profile?.curriculo?.habilidades?.length">
                                        <span v-for="skill in authStore.profile.curriculo.habilidades" :key="skill" class="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[9px] font-black uppercase tracking-wider border border-green-100">
                                            {{ skill }}
                                        </span>
                                    </template>
                                    <p v-else class="text-slate-400 text-xs italic">Nenhuma habilidade listada.</p>
                                </div>
                            </section>

                            <!-- Localização -->
                            <section v-if="authStore.profile?.curriculo?.latitude">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span class="w-4 h-0.5 bg-green-500"></span>
                                    Localização
                                </h3>
                                <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                                    <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-blue-900 font-bold text-[10px] uppercase truncate">Destaque Regional</p>
                                        <p class="text-blue-700 text-[9px] uppercase tracking-wider">Ativo</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    
                    <!-- Footer do Currículo -->
                    <footer class="mt-20 pt-10 border-t border-slate-100 text-center">
                        <p class="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                            Gerado via Pebas Pro • Onde o talento encontra a oportunidade
                        </p>
                    </footer>
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
                    {{ loading ? 'Salvando Alterações...' : authStore.profile?.tipo_conta === 'empresa' ? 'Salvar Dados Empresa' : 'Salvar Currículo' }}
                </button>
            </div>

        </div>
      </div>
    </div>
  </div>
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
