<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types'

const authStore = useAuthStore()
const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()

const { uploadFile, loading: uploading } = useFileUpload()
const { coords, getLocation, loading: locationLoading } = useLocation()
const { translateError } = useTranslation()
const loading = computed(() => authStore.profileLoading || uploading.value || locationLoading.value)

onMounted(async () => {
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
        form.value.experiencia_profissional = Array.isArray(p.experiencia_profissional) ? JSON.parse(JSON.stringify(p.experiencia_profissional)) : []
        form.value.formacao_academica = Array.isArray(p.formacao_academica) ? JSON.parse(JSON.stringify(p.formacao_academica)) : []
        const hab = p.habilidades
        form.value.habilidades = Array.isArray(hab) ? [...hab] : []
        form.value.documento = p.documento || ''
        form.value.latitude = p.latitude || null
        form.value.longitude = p.longitude || null
    }
}, { immediate: true })

const addSkill = () => {
    if (form.value.newSkill.trim() && !form.value.habilidades.includes(form.value.newSkill.trim())) {
        form.value.habilidades.push(form.value.newSkill.trim())
        form.value.newSkill = ''
    }
}

const removeSkill = (skill: string) => {
    if (confirm(`Deseja realmente excluir a habilidade "${skill}"?`)) {
        form.value.habilidades = form.value.habilidades.filter(s => s !== skill)
    }
}

const onFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
        const file = target.files[0]
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem é muito grande. Escolha uma foto de até 5MB.')
            return
        }
        selectedFile.value = file
        const userId = authStore.profile?.id || user.value?.id
        if (!userId) {
            alert('Usuário não identificado. Tente fazer login novamente.')
            return
        }
        const fileName = `${userId}-${Date.now()}.jpg`
        try {
            const { publicUrl, error } = await uploadFile(file, `${fileName}`, 'avatars')
            if (error) {
                alert('Erro ao carregar foto: ' + translateError(error))
                return
            }
            if (publicUrl) {
                const { error: updateError } = await authStore.updateProfile({ foto: publicUrl })
                if (updateError) throw updateError
                alert('Foto atualizada com sucesso!')
            } else {
                throw new Error('URL pública não gerada após o upload.')
            }
        } catch (err: any) {
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
    }
})

const handleSave = async () => {
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
        alert('Erro ao salvar perfil: ' + translateError(error))
    }
}

const handleLogout = async () => {
    await authStore.signOut()
    navigateTo('/')
}

definePageMeta({
    layout: 'default'
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50/80">
    <!-- Input Global para Foto -->
    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full">

      <!-- ═══ HERO CARD ═══ -->
      <div class="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
        <!-- Cover Banner -->
        <div class="h-36 md:h-52 bg-gradient-to-br from-green-600 via-green-700 to-green-900 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 pointer-events-none">
            <svg class="absolute -right-24 -top-24 text-white" width="500" height="500" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="50"/></svg>
            <svg class="absolute -left-16 bottom-0 text-white" width="200" height="200" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
          </div>
        </div>

        <!-- Profile Info Bar -->
        <div class="px-6 md:px-10 pb-8 flex flex-col sm:flex-row items-end sm:items-center gap-5 -mt-14 md:-mt-16">
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[32px] p-1.5 shadow-2xl">
              <div class="w-full h-full rounded-[26px] bg-slate-50 overflow-hidden border border-slate-100">
                <Transition name="fade" mode="out-in">
                  <img v-if="authStore.profile?.foto" :key="authStore.profile.foto" :src="authStore.profile.foto" :alt="authStore.profile.nome || 'Avatar'" class="w-full h-full object-cover" />
                  <span v-else :key="'letter'" class="text-5xl font-black text-green-600 uppercase flex items-center justify-center w-full h-full">{{ authStore.profile?.nome?.charAt(0) || '?' }}</span>
                </Transition>
              </div>
              <div v-if="uploading" class="absolute inset-1.5 bg-black/20 backdrop-blur-sm rounded-[26px] flex items-center justify-center z-10">
                <div class="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <button @click="fileInput?.click()" :disabled="uploading" class="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-slate-700 rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all border border-slate-100 z-20 active:scale-95 group/btn">
              <svg v-if="!uploading" class="w-5 h-5 group-hover/btn:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812 1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <div v-else class="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>

          <!-- Name & Email -->
          <div class="flex-1 mt-4 sm:mt-10 overflow-hidden">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <h1 class="text-2xl md:text-3xl font-black text-slate-900 truncate uppercase tracking-tight">{{ authStore.profile?.nome || 'Meu Perfil' }}</h1>
                  <span class="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100 shrink-0">
                    {{ authStore.profile?.tipo_conta === 'talento' ? 'Candidato' : authStore.profile?.tipo_conta === 'empresa' ? 'Empresa' : 'Prestador' }}
                  </span>
                </div>
                <p class="text-slate-400 font-semibold text-sm truncate">{{ user?.email }}</p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <button
                  @click="isEditing = !isEditing"
                  :class="isEditing ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800'"
                  class="px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 border border-transparent"
                >
                  {{ isEditing ? 'Cancelar' : 'Editar Perfil' }}
                </button>
                <button v-if="!isEditing" @click="handleLogout" title="Sair" class="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-2xl hover:bg-red-50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CONTENT AREA ═══ -->

      <!-- VIEW: TALENTO -->
      <template v-if="authStore.profile?.tipo_conta === 'talento'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Contatos -->
          <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 flex flex-col">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-8 flex items-center gap-2">
              <span class="w-6 h-px bg-green-100"></span> Dados de Contato
            </h3>
            <div class="space-y-6 flex-grow">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome Completo</label>
                <div v-if="!isEditing" class="text-lg font-bold text-slate-800">{{ authStore.profile?.nome || '—' }}</div>
                <input v-else v-model="form.nome" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                  <div v-if="!isEditing" class="text-base font-bold text-slate-800">{{ authStore.profile?.telefone || '—' }}</div>
                  <input v-else v-model="form.telefone" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Endereço</label>
                  <div v-if="!isEditing" class="text-base font-bold text-slate-800 truncate">{{ authStore.profile?.endereco || '—' }}</div>
                  <input v-else v-model="form.endereco" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="Cidade, Estado" />
                </div>
              </div>
            </div>
            <div v-if="isEditing" class="mt-8 pt-6 border-t border-slate-50">
              <button @click="handleSave" :disabled="loading" class="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50">
                {{ loading ? 'Salvando...' : 'Salvar Informações' }}
              </button>
            </div>
          </div>

          <!-- Currículo CTA -->
          <div class="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div class="absolute top-0 right-0 opacity-10 pointer-events-none p-4">
              <svg width="140" height="140" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
            </div>
            <div class="relative z-10 flex flex-col h-full">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-6">Currículo</p>
              <div class="flex-grow mb-8">
                <h4 class="text-2xl font-black mb-3 leading-tight">Seu currículo está pronto para brilhar! ✨</h4>
                <p class="text-slate-400 text-sm leading-relaxed">Mantenha suas informações profissionais atualizadas para aumentar suas chances com as empresas.</p>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/curriculo" class="flex items-center justify-between w-full p-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl group">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white text-lg shrink-0">📄</div>
                    <div class="text-left">
                      <p class="font-black text-[11px] uppercase tracking-widest">Ver Meu Currículo</p>
                      <p class="text-[10px] text-slate-400 uppercase">Visualização de Empresa</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </NuxtLink>
                <NuxtLink to="/curriculo/editar" class="flex items-center justify-between w-full p-4 bg-white text-slate-900 hover:bg-slate-100 transition-all rounded-2xl group shadow-lg shadow-white/5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg shrink-0">✍️</div>
                    <div class="text-left">
                      <p class="font-black text-[11px] uppercase tracking-widest">Editar Conteúdo</p>
                      <p class="text-[10px] text-slate-500 uppercase font-black">Experiências e Formação</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- VIEW: EMPRESA -->
      <template v-else-if="authStore.profile?.tipo_conta === 'empresa'">
        <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12">
          <div class="flex flex-col gap-10">
            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-8 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Identificação Institucional
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Empresa</label>
                  <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.nome || '—' }}</div>
                  <input v-else v-model="form.nome" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" />
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CNPJ / Documento</label>
                  <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.documento || '—' }}</div>
                  <input v-else v-model="form.documento" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp de Contato</label>
                  <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.telefone || '—' }}</div>
                  <input v-else v-model="form.telefone" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-6 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Proposta de Valor
              </h3>
              <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg whitespace-pre-line bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                {{ authStore.profile?.sobre_mim || 'Adicione uma descrição sobre a empresa...' }}
              </div>
              <textarea v-else v-model="form.sobre_mim" rows="6" class="w-full text-slate-600 text-lg leading-relaxed bg-slate-50 border-none rounded-3xl p-8 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Descreva sua empresa, missão, valores..."></textarea>
            </section>

            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-6 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Localização
              </h3>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Endereço Público</label>
                <div v-if="!isEditing" class="text-slate-700 leading-relaxed text-lg font-bold">{{ authStore.profile?.endereco || '—' }}</div>
                <input v-else v-model="form.endereco" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="Ex: Av. Brasil, 1000 - Centro, Pebas" />
              </div>
              <div v-if="isEditing" class="mt-4 bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center justify-between gap-6">
                <div>
                  <h4 class="font-black text-green-900 text-sm uppercase mb-1">Precisão no Mapa</h4>
                  <p class="text-xs text-green-700 font-medium">Capture sua localização atual para aparecer no mapa de vagas.</p>
                </div>
                <button @click="handleGetLocation" :disabled="loading" class="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 shrink-0">
                  {{ locationLoading ? 'Obtendo...' : 'Capturar GPS' }}
                </button>
              </div>
              <div v-else-if="authStore.profile?.latitude" class="mt-3 flex items-center gap-2 text-green-600 font-bold text-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Localização Geográfica Ativada
              </div>
            </section>

            <div v-if="isEditing" class="pt-8 border-t border-slate-50">
              <button @click="handleSave" :disabled="loading" class="w-full py-5 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50">
                {{ loading ? 'Salvando...' : 'Atualizar Dados da Empresa' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- VIEW: PRESTADOR -->
      <template v-else-if="authStore.profile?.tipo_conta === 'prestador'">
        <div class="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-12">
          <div class="flex flex-col gap-10">
            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-8 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Minha Especialidade
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome Profissional</label>
                  <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.nome || '—' }}</div>
                  <input v-else v-model="form.nome" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" />
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Documento</label>
                  <div class="text-xl font-bold text-slate-800">{{ authStore.profile?.documento || '—' }}</div>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-6 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Apresentação
              </h3>
              <div v-if="!isEditing" class="text-slate-600 leading-relaxed text-lg whitespace-pre-line bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                {{ authStore.profile?.sobre_mim || 'Adicione uma descrição sobre os serviços que você presta...' }}
              </div>
              <textarea v-else v-model="form.sobre_mim" rows="6" class="w-full text-slate-600 text-lg leading-relaxed bg-slate-50 border-none rounded-3xl p-8 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Descreva sua experiência e como você trabalha..."></textarea>
            </section>

            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-6 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Contato e Localização
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp / Telefone</label>
                  <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.telefone || '—' }}</div>
                  <input v-else v-model="form.telefone" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Endereço Principal</label>
                  <div v-if="!isEditing" class="text-xl font-bold text-slate-800">{{ authStore.profile?.endereco || '—' }}</div>
                  <input v-else v-model="form.endereco" class="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-green-400 transition-all" placeholder="Ex: Av. Brasil, 1000" />
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-6 flex items-center gap-2">
                <span class="w-6 h-px bg-green-100"></span> Diferenciais e Competências
              </h3>
              <div class="flex flex-wrap gap-3">
                <div v-for="skill in form.habilidades" :key="skill" class="group px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 transition-all hover:bg-white hover:border-green-100 hover:shadow-lg hover:shadow-green-500/5">
                  <span class="text-slate-800 font-bold text-sm">{{ skill }}</span>
                  <button v-if="isEditing" @click="removeSkill(skill)" class="text-slate-300 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div v-if="isEditing" class="relative flex-grow flex items-center gap-2 min-w-[220px]">
                  <input v-model="form.newSkill" @keyup.enter="addSkill" placeholder="Ex: Atendimento 24h..." class="w-full bg-slate-50 border-none px-5 py-2.5 rounded-2xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium text-sm" />
                  <button @click="addSkill" class="px-5 py-2.5 bg-green-500 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 active:scale-95">Add</button>
                </div>
              </div>
            </section>

            <div v-if="isEditing" class="pt-8 border-t border-slate-50">
              <button @click="handleSave" :disabled="loading" class="w-full py-5 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50">
                {{ loading ? 'Salvando...' : 'Atualizar Perfil' }}
              </button>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
