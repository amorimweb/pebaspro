<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCurriculum } from '~/composables/useCurriculum'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const { curriculum, fetchCurriculum } = useCurriculum()
const user = useSupabaseUser()

onMounted(async () => {
    await fetchCurriculum()
})

const printResume = () => {
    window.print()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 pb-20 print:bg-white print:pb-0">
    <!-- Header / Actions -->
    <div class="bg-white border-b border-slate-200/60 pb-8 pt-8 mb-8 print:hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 class="text-3xl font-black text-slate-900 tracking-tight">Meu Currículo Profissional 📄</h1>
                    <p class="text-slate-500 font-medium">Esta é a visão que as empresas terão do seu perfil.</p>
                </div>
                
                <div class="flex items-center gap-3">
                    <button 
                        @click="printResume" 
                        class="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition shadow-sm active:scale-95"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm0 0h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 01-1-3.8l-2.5-2m0 0a2 2 0 01 2-2h4a2 2 0 011 3.8l-2.5 2"></path></svg>
                        Imprimir / PDF
                    </button>
                    <NuxtLink 
                        to="/curriculo/editar"
                        class="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition shadow-xl shadow-slate-900/10 active:scale-95 uppercase text-xs tracking-widest"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Editar Currículo
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>

    <!-- Resume Content (Paper Style) -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-2xl border-t-[12px] border-slate-900 p-8 md:p-16 relative overflow-hidden min-h-[1100px] print:shadow-none print:border-t-0 print:p-0">
            <!-- Decorative Element -->
            <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none print:hidden">
                <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
            </div>

            <!-- Header -->
            <header class="border-b-4 border-slate-900 pb-12 mb-12 flex flex-col md:flex-row items-center md:items-start gap-10">
                <!-- Avatar -->
                <div class="shrink-0">
                    <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative bg-slate-50">
                        <img 
                            :src="authStore.profile?.foto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (authStore.profile?.nome || 'fallback')" 
                            class="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div class="flex-1 space-y-6 text-center md:text-left">
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{{ authStore.profile?.nome }}</h1>
                    
                    <div class="flex flex-wrap justify-center md:justify-start gap-y-3 gap-x-6 text-slate-500 font-bold uppercase tracking-widest text-xs">
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            {{ authStore.profile?.telefone || 'Não informado' }}
                        </span>
                        <span class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002-2z"/></svg>
                            {{ user?.email }}
                        </span>
                        <span v-if="authStore.profile?.endereco" class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            {{ authStore.profile?.endereco }}
                        </span>
                    </div>
                </div>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <!-- Main Column (2/3) -->
                <div class="lg:col-span-2 space-y-16">
                    <!-- Objetivo -->
                    <section>
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <span class="w-8 h-1 bg-slate-900"></span>
                            Objetivo Profissional
                        </h3>
                        <p class="text-slate-600 text-base leading-loose text-justify">
                            {{ curriculum?.objetivo_profissional || 'Objetivo não informado.' }}
                        </p>
                    </section>

                    <!-- Sobre Mim -->
                    <section>
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <span class="w-8 h-1 bg-slate-900"></span>
                            Sobre Mim / Perfil
                        </h3>
                        <p class="text-slate-600 text-base leading-loose whitespace-pre-line text-justify">
                            {{ curriculum?.biografia || 'Nenhuma descrição detalhada informada.' }}
                        </p>
                    </section>

                    <!-- Experiência -->
                    <section>
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span class="w-8 h-1 bg-slate-900"></span>
                            Experiência Profissional
                        </h3>
                        <div class="space-y-12">
                            <template v-if="curriculum?.experiencia_profissional?.length">
                                <div v-for="(exp, idx) in curriculum.experiencia_profissional" :key="idx" class="relative pl-8 border-l-2 border-slate-100">
                                    <div class="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-slate-900 rounded-full"></div>
                                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                        <h4 class="text-lg font-black text-slate-900 uppercase tracking-tight">{{ exp.cargo }}</h4>
                                        <span class="text-[10px] font-black bg-slate-900 px-3 py-1 rounded text-white uppercase tracking-widest">
                                            {{ exp.inicio ? new Date(exp.inicio).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '' }} 
                                            - 
                                            {{ exp.atual ? 'Atualmente' : (exp.fim ? new Date(exp.fim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '') }}
                                        </span>
                                    </div>
                                    <p class="text-slate-500 font-black text-xs uppercase tracking-widest mb-4">{{ exp.empresa }}</p>
                                    <p class="text-slate-600 text-sm leading-relaxed text-justify">{{ exp.descricao }}</p>
                                </div>
                            </template>
                            <p v-else class="text-slate-400 text-sm italic">Nenhuma experiência profissional registrada.</p>
                        </div>
                    </section>
                </div>

                <!-- Side Column (1/3) -->
                <div class="space-y-16">
                    <!-- Habilidades -->
                    <section>
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span class="w-8 h-1 bg-slate-900"></span>
                            Habilidades
                        </h3>
                        <div class="flex flex-col gap-3">
                            <template v-if="curriculum?.habilidades?.length">
                                <div v-for="skill in curriculum.habilidades" :key="skill" class="flex items-center gap-3 group">
                                    <div class="w-2 h-2 rounded-full bg-slate-900 group-hover:scale-150 transition-all"></div>
                                    <span class="text-slate-700 font-bold text-sm">{{ skill }}</span>
                                </div>
                            </template>
                            <p v-else class="text-slate-400 text-sm italic">Nenhuma habilidade informada.</p>
                        </div>
                    </section>

                    <!-- Formação -->
                    <section>
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <span class="w-8 h-1 bg-slate-900"></span>
                            Formação
                        </h3>
                        <div class="space-y-8">
                            <template v-if="curriculum?.formacao_academica?.length">
                                <div v-for="(edu, idx) in curriculum.formacao_academica" :key="idx" class="space-y-2">
                                    <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight">{{ edu.curso }}</h4>
                                    <p class="text-slate-500 font-bold text-xs">{{ edu.instituicao }}</p>
                                    <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>{{ edu.nivel }}</span>
                                        <span>{{ edu.fim ? new Date(edu.fim).getFullYear() : '' }}</span>
                                    </div>
                                </div>
                            </template>
                            <p v-else class="text-slate-400 text-sm italic">Nenhuma formação acadêmica registrada.</p>
                        </div>
                    </section>
                </div>
            </div>

            <!-- Footer -->
            <footer class="mt-24 pt-10 border-t-2 border-slate-100 text-center">
                <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                    Gerado via Pebas Pro
                </p>
                <p class="text-slate-300 text-[8px] font-bold uppercase tracking-widest">
                    Onde o talento encontra a oportunidade certa
                </p>
            </footer>
        </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
    .print\:hidden {
        display: none !important;
    }
    .pebaspro-layout > main {
        padding-top: 0 !important;
    }
    
    /* Forçar fidelidade visual */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    /* Forçar Layout de Grade em 3 colunas para o currículo */
    .lg\:grid-cols-3 {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 3rem !important; /* gap-12 equiv */
    }
    .lg\:col-span-2 {
        grid-column: span 2 / span 2 !important;
    }

    /* Manter layout do cabeçalho alinhado à esquerda como no desktop */
    header.flex-col {
        flex-direction: row !important;
        align-items: flex-start !important;
        text-align: left !important;
        gap: 2.5rem !important;
    }

    body {
        background-color: white !important;
    }

    /* Remover margens excessivas do navegador */
    @page {
        margin: 1cm;
    }
}
</style>
