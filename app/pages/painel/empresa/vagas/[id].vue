<script setup lang="ts">
import type { Database } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { atualizarVaga, buscarVaga, loading } = useVagas()

const vacancyId = route.params.id as string

// Form state
const form = ref({
    titulo: '',
    descricao: '',
    requisitos: '',
    beneficios: '',
    tipo: 'CLT',
    jornada: '44h semanais',
    salario: '',
    local: 'Parauapebas - PA',
    modalidade: 'presencial',
    whatsapp: '',
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
    if (confirm(`Deseja realmente excluir a habilidade "${skill}" de foma definitiva?`)) {
        form.value.habilidades_exigidas = form.value.habilidades_exigidas.filter(s => s !== skill)
    }
}

const fetchVaga = async () => {
    const { data, error } = await buscarVaga(vacancyId)
    if (data && !error) {
        form.value = {
            titulo: data.titulo || '',
            descricao: data.descricao || '',
            requisitos: data.requisitos || '',
            beneficios: data.beneficios || '',
            tipo: data.tipo || 'CLT',
            jornada: data.jornada || '44h semanais',
            salario: data.salario || '',
            local: data.local || 'Parauapebas - PA',
            modalidade: data.modalidade || 'presencial',
            whatsapp: data.whatsapp || '',
            encerramento: data.encerramento || '',
            categoria_id: data.categoria_id || null,
            habilidades_exigidas: data.habilidades_exigidas || [],
            nivel_experiencia: data.nivel_experiencia || 'Pleno'
        }
    } else {
        alert('Erro ao carregar vaga.')
        router.push('/painel/empresa/vagas')
    }
}

onMounted(() => {
    fetchVaga()
})

const handleSubmit = async () => {
    if (!user.value?.id) {
        alert('Usuário não autenticado')
        return
    }

    try {
        const { error } = await atualizarVaga(vacancyId, {
            ...form.value,
            updated_at: new Date().toISOString()
        })
        
        if (error) throw error
        
        alert('Vaga atualizada com sucesso!')
        router.push('/painel/empresa/vagas')
        
    } catch (error: any) {
        console.error('Erro ao atualizar vaga:', error)
        alert(`Erro ao atualizar vaga: ${error.message || 'Tente novamente.'}`)
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
            <h1 class="text-3xl font-black text-slate-900">Editar Vaga</h1>
            <p class="text-slate-500 font-medium">Atualize os dados da sua oportunidade.</p>
        </div>
    </div>

    <div class="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
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
                    <input v-model="form.local" type="text" placeholder="Ex: Parauapebas - PA" class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium" />
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

            <div class="flex items-center justify-end gap-4 mt-8">
                <NuxtLink to="/painel/empresa/vagas" class="px-8 py-4 text-slate-600 font-black hover:bg-slate-100 rounded-2xl transition-colors uppercase text-sm tracking-widest">
                    Cancelar
                </NuxtLink>
                <button type="submit" :disabled="loading" class="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
                    {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
            </div>

        </form>
    </div>
  </div>
</template>
