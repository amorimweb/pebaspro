<script setup lang="ts">
import type { Database } from '~/types/database.types'

import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard'
})

const authStore = useAuthStore()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const router = useRouter()
const { criarVaga, loading } = useVagas()

// Form state
const form = ref({
    titulo: '',
    descricao: '',
    requisitos: '',
    beneficios: '',
    tipo: 'CLT',
    jornada: '44h semanais',
    salario: '',
    local: 'Nossa Região',
    modalidade: 'presencial',
    whatsapp: '',
    email: '',
    tipo_contato: 'whatsapp',
    encerramento: '',
    categoria_id: null as string | null,
    habilidades_exigidas: [] as string[],
    nivel_experiencia: 'Pleno'
})

// Skills management
const newSkill = ref('')

const addSkill = () => {
    if (newSkill.value && !form.value.habilidades_exigidas.includes(newSkill.value)) {
        form.value.habilidades_exigidas.push(newSkill.value)
        newSkill.value = ''
    }
}

const removeSkill = (skill: string) => {
    form.value.habilidades_exigidas = form.value.habilidades_exigidas.filter(s => s !== skill)
}

// Auto-preencher dados da empresa
watch(() => authStore.profile, (newProfile) => {
    if (newProfile) {
        if (!form.value.whatsapp) form.value.whatsapp = newProfile.telefone || ''
        if (!form.value.email) form.value.email = newProfile.email || ''
    }
}, { immediate: true })

const handleSubmit = async () => {
    const userId = authStore.profile?.id || user.value?.id
    if (!userId) {
        alert('Usuário não autenticado')
        return
    }

    if (!form.value.titulo || !form.value.descricao) {
        alert('Preencha os campos obrigatórios (Título e Descrição)')
        return
    }

    try {
        const result = await criarVaga({
            titulo: form.value.titulo,
            descricao: form.value.descricao,
            requisitos: form.value.requisitos || null,
            beneficios: form.value.beneficios || null,
            tipo: form.value.tipo,
            jornada: form.value.jornada,
            salario: form.value.salario || null,
            local: form.value.local,
            modalidade: form.value.modalidade,
            whatsapp: form.value.whatsapp || null,
            email: form.value.email || null,
            tipo_contato: form.value.tipo_contato,
            encerramento: form.value.encerramento || null,
            categoria_id: form.value.categoria_id,
            habilidades_exigidas: form.value.habilidades_exigidas.length > 0 ? form.value.habilidades_exigidas : null,
            nivel_experiencia: form.value.nivel_experiencia
        })
        
        if (result?.error) throw result.error

        alert('Vaga criada com sucesso!')
        await router.push('/painel/empresa/vagas')
        
    } catch (e: any) {
        console.error('Erro ao criar vaga:', e)
        alert(`Erro ao criar vaga: ${e.message || 'Tente novamente.'}`)
    }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8 flex items-center gap-4">
        <NuxtLink to="/painel/empresa/vagas" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </NuxtLink>
        <div>
            <h1 class="text-3xl font-black text-slate-900">Nova Vaga</h1>
            <p class="text-slate-500 font-medium">Preencha os dados abaixo para anunciar uma nova oportunidade.</p>
        </div>
    </div>

    <div class="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10">
        <form @submit.prevent="handleSubmit" class="space-y-8">
            
            <!-- Título -->
            <div>
                <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Título da Vaga <span class="text-red-500">*</span></label>
                <input v-model="form.titulo" required type="text" placeholder="Ex: Eletricista Industrial Pleno" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium text-lg" />
            </div>

            <!-- Descrição -->
            <div>
                <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Descrição da Vaga <span class="text-red-500">*</span></label>
                <textarea v-model="form.descricao" required rows="5" placeholder="Descreva as responsabilidades e o dia a dia da função..." class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium leading-relaxed"></textarea>
            </div>

            <!-- Requisitos -->
            <div>
                <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Requisitos</label>
                <textarea v-model="form.requisitos" rows="3" placeholder="Ex: Curso técnico, CNH B, Experiência de 2 anos..." class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium leading-relaxed"></textarea>
            </div>

            <!-- Benefícios -->
            <div>
                <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Benefícios</label>
                <textarea v-model="form.beneficios" rows="3" placeholder="Ex: Vale transporte, Vale refeição, Plano de saúde..." class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium leading-relaxed"></textarea>
            </div>

            <!-- Grid: Tipo, Jornada, Nível -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Tipo de Contrato</label>
                    <select v-model="form.tipo" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold cursor-pointer">
                        <option value="CLT">CLT (Efetivo)</option>
                        <option value="PJ">PJ</option>
                        <option value="Temporário">Temporário</option>
                        <option value="Estágio">Estágio</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Jornada</label>
                    <select v-model="form.jornada" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold cursor-pointer">
                        <option value="40h semanais">40h semanais</option>
                        <option value="44h semanais">44h semanais</option>
                        <option value="Meio período">Meio período</option>
                        <option value="Escala 12x36">Escala 12x36</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Nível</label>
                    <select v-model="form.nivel_experiencia" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold cursor-pointer">
                        <option value="Júnior">Júnior</option>
                        <option value="Pleno">Pleno</option>
                        <option value="Sênior">Sênior</option>
                    </select>
                </div>
            </div>

            <!-- Grid: Salário, Local, Modalidade -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Salário</label>
                    <input v-model="form.salario" type="text" placeholder="Ex: R$ 3.000 - R$ 5.000" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium" />
                </div>
                <div>
                    <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Local</label>
                    <input v-model="form.local" type="text" placeholder="Ex: Toda a região" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium" />
                </div>
                <div>
                    <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Modalidade</label>
                    <select v-model="form.modalidade" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold cursor-pointer">
                        <option value="presencial">Presencial</option>
                        <option value="híbrido">Híbrido</option>
                        <option value="remoto">Remoto</option>
                    </select>
                </div>
            </div>

            <!-- Seção de Contato -->
            <div class="space-y-6 bg-slate-50 p-8 rounded-[24px] border-2 border-slate-100">
                <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <span class="p-2 bg-green-600 text-white rounded-lg">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    </span>
                    Canais de Contato
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-1">
                        <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Tipo de Contato</label>
                        <select v-model="form.tipo_contato" class="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold cursor-pointer">
                            <option value="whatsapp">Apenas WhatsApp</option>
                            <option value="email">Apenas E-mail</option>
                            <option value="ambos">Ambos (WhatsApp + E-mail)</option>
                        </select>
                    </div>

                    <div v-if="form.tipo_contato === 'whatsapp' || form.tipo_contato === 'ambos'">
                        <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">WhatsApp</label>
                        <input v-model="form.whatsapp" type="tel" placeholder="(94) 99999-9999" class="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium" />
                    </div>

                    <div v-if="form.tipo_contato === 'email' || form.tipo_contato === 'ambos'">
                        <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">E-mail para Vaga</label>
                        <input v-model="form.email" type="email" placeholder="empresa@exemplo.com" class="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium" />
                    </div>
                </div>
            </div>

            <!-- Encerramento -->
            <div>
                <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Data de Encerramento</label>
                <input v-model="form.encerramento" type="date" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-bold" />
            </div>

            <!-- Habilidades Exigidas -->
            <div>
                <label class="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Habilidades Exigidas</label>
                <div class="flex gap-3 mb-4">
                    <input v-model="newSkill" @keydown.enter.prevent="addSkill" type="text" placeholder="Digite e aperte Enter" class="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium" />
                    <button type="button" @click="addSkill" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition active:scale-95">Adicionar</button>
                </div>
                <div class="flex flex-wrap gap-3">
                    <span v-for="skill in form.habilidades_exigidas" :key="skill" class="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-3 border border-green-100">
                        {{ skill }}
                        <button type="button" @click="removeSkill(skill)" class="w-5 h-5 flex items-center justify-center bg-green-200 rounded-full text-green-800 hover:bg-green-300 transition-colors">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </span>
                </div>
            </div>

            <div class="h-px bg-slate-100 my-8"></div>

            <div class="flex items-center justify-end gap-4">
                <NuxtLink to="/painel/empresa/vagas" class="px-8 py-4 text-slate-600 font-black hover:bg-slate-100 rounded-2xl transition-colors uppercase text-sm tracking-widest">
                    Cancelar
                </NuxtLink>
                <button type="submit" :disabled="loading" class="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                    {{ loading ? 'Publicando...' : 'Publicar Vaga' }}
                </button>
            </div>

        </form>
    </div>
  </div>
</template>
