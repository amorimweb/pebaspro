<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCurriculum } from '~/composables/useCurriculum'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const { curriculum, fetchCurriculum } = useCurriculum()

const loading = ref(true)

const form = ref({
    objetivo_profissional: '',
    biografia: '',
    habilidades: [] as string[],
    experiencia_profissional: [] as any[],
    formacao_academica: [] as any[],
    latitude: null as number | null,
    longitude: null as number | null
})

const hydrateForm = (data: any) => {
    if (!data) return
    form.value.objetivo_profissional = data.objetivo_profissional || ''
    form.value.biografia = data.biografia || ''
    form.value.habilidades = data.habilidades || []
    form.value.experiencia_profissional = Array.isArray(data.experiencia_profissional) ? data.experiencia_profissional : []
    form.value.formacao_academica = Array.isArray(data.formacao_academica) ? data.formacao_academica : []
}

watch(curriculum, (newVal) => {
    if (newVal) hydrateForm(newVal)
}, { immediate: true })

onMounted(async () => {
    await fetchCurriculum()
    if (!curriculum.value && authStore.profile) {
        hydrateForm(authStore.profile)
    }
    loading.value = false
})

const goBack = () => navigateTo('/painel/talento/curriculo')
const printPage = () => window.print()

const formatDate = (dateStr: string, opts?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return ''
    const defaults: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }
    return new Date(dateStr).toLocaleDateString('pt-BR', opts || defaults)
}

const initials = computed(() => {
    const name = authStore.profile?.nome || ''
    return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
})
</script>

<template>
  <div class="print-root">

    <!-- ── Toolbar (screen only) ── -->
    <div class="toolbar print:hidden">
      <button @click="goBack" class="btn-toolbar">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Voltar
      </button>
      <div class="toolbar-center">
        <span class="toolbar-label">Visualização de Impressão</span>
        <span class="toolbar-hint">Dica: Defina margens como <strong>Nenhuma</strong> na janela de impressão</span>
      </div>
      <button @click="printPage" class="btn-print">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        Imprimir
      </button>
    </div>

    <!-- ── A4 Document ── -->
    <div class="a4-wrapper">
      <div class="a4-page">

        <!-- ══ LEFT SIDEBAR ══ -->
        <aside class="sidebar">

          <!-- Photo -->
          <div class="sidebar-photo-wrap">
            <div class="sidebar-photo-ring">
              <img
                v-if="authStore.profile?.foto"
                :src="authStore.profile.foto"
                class="sidebar-photo-img"
                alt="Foto de perfil"
              />
              <span v-else class="sidebar-photo-initials">{{ initials }}</span>
            </div>
          </div>

          <!-- Name block -->
          <div class="sidebar-name-block">
            <h1 class="sidebar-name">{{ authStore.profile?.nome }}</h1>
          </div>

          <!-- Divider -->
          <div class="sidebar-divider"></div>

          <!-- Contato -->
          <div v-if="authStore.profile?.email || authStore.profile?.telefone || authStore.profile?.endereco" class="sidebar-section">
            <h4 class="sidebar-section-title">Contato</h4>
            <div class="sidebar-contact-list">
              <div v-if="authStore.profile?.email" class="contact-item">
                <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>{{ authStore.profile.email }}</span>
              </div>
              <div v-if="authStore.profile?.telefone" class="contact-item">
                <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>{{ authStore.profile.telefone }}</span>
              </div>
              <div v-if="authStore.profile?.endereco" class="contact-item">
                <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{{ authStore.profile.endereco }}</span>
              </div>
            </div>
          </div>

          <!-- Habilidades -->
          <div v-if="form.habilidades.length" class="sidebar-section">
            <h4 class="sidebar-section-title">Competências</h4>
            <div class="skill-list">
              <div v-for="skill in form.habilidades" :key="skill" class="skill-item">
                <span class="skill-dot"></span>
                <span>{{ skill }}</span>
              </div>
            </div>
          </div>

          <!-- Rodapé -->
          <div class="sidebar-footer">
            <p>Pebas Pro</p>
            <p>Onde o talento encontra a oportunidade</p>
          </div>
        </aside>

        <!-- ══ MAIN CONTENT ══ -->
        <main class="main-content">

          <!-- Loading -->
          <div v-if="loading" class="loading-msg print:hidden">Carregando currículo...</div>

          <!-- Header: Nome + Título -->
          <div class="main-header">
            <h1 class="main-name">{{ authStore.profile?.nome }}</h1>
            <p class="main-title">{{ form.objetivo_profissional || 'Profissional' }}</p>
          </div>

          <!-- Sobre Mim -->
          <section v-if="form.biografia" class="cv-section">
            <div class="section-header">
              <span class="section-bar"></span>
              <h2 class="section-title">Sobre Mim</h2>
            </div>
            <p class="bio-text">{{ form.biografia }}</p>
          </section>

          <!-- Experiência Profissional -->
          <section v-if="form.experiencia_profissional.length" class="cv-section">
            <div class="section-header">
              <span class="section-bar"></span>
              <h2 class="section-title">Experiência Profissional</h2>
            </div>
            <div class="timeline">
              <div
                v-for="(exp, idx) in form.experiencia_profissional"
                :key="idx"
                class="timeline-item"
              >
                <div class="timeline-dot"></div>
                <div class="timeline-body">
                  <div class="timeline-header">
                    <div>
                      <h3 class="exp-cargo">{{ exp.cargo }}</h3>
                      <p class="exp-empresa">{{ exp.empresa }}</p>
                    </div>
                    <span class="exp-period">
                      {{ formatDate(exp.inicio) }} — {{ exp.atual ? 'Presente' : formatDate(exp.fim) }}
                      <span v-if="exp.atual" class="period-dot"></span>
                    </span>
                  </div>
                  <p v-if="exp.descricao" class="exp-desc">{{ exp.descricao }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Formação Acadêmica -->
          <section v-if="form.formacao_academica.length" class="cv-section">
            <div class="section-header">
              <span class="section-bar"></span>
              <h2 class="section-title">Formação Acadêmica</h2>
            </div>
            <div class="edu-list">
              <div
                v-for="(edu, idx) in form.formacao_academica"
                :key="idx"
                class="edu-line"
              >
                <h4 class="edu-line-curso">{{ edu.curso }}</h4>
                <p class="edu-line-sub">
                  <span class="edu-line-inst">{{ edu.instituicao }}</span>
                  <span class="edu-line-sep">·</span>
                  <span class="edu-line-nivel">{{ edu.nivel }}</span>
                  <span class="edu-line-sep">·</span>
                  <span class="edu-line-year">{{ formatDate(edu.fim, { year: 'numeric' }) }}</span>
                </p>
              </div>
            </div>
          </section>

          <!-- Sem dados -->
          <div v-if="!loading && !form.biografia && !form.experiencia_profissional.length && !form.formacao_academica.length" class="empty-msg print:hidden">
            <p>Nenhuma informação preenchida ainda.</p>
            <a href="/painel/talento/curriculo" class="empty-link">Preencher meu currículo</a>
          </div>

        </main>
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── Reset ── */
* { box-sizing: border-box; margin: 0; padding: 0; }
h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; margin: 0; padding: 0; }
p { margin: 0; padding: 0; }

body { font-family: 'Inter', sans-serif; background: #f1f5f9; }

/* ── Toolbar ── */
.toolbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  background: #0f172a; padding: 0.75rem 1.5rem; gap: 1rem;
}
.toolbar-center { display: flex; flex-direction: column; align-items: center; flex: 1; }
.toolbar-label { color: #94a3b8; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; }
.toolbar-hint { color: #475569; font-size: 0.65rem; margin-top: 2px; }
.btn-toolbar {
  display: flex; align-items: center; gap: 0.5rem;
  background: #1e293b; color: #94a3b8;
  border: 1px solid #334155; border-radius: 0.5rem;
  padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.btn-toolbar:hover { background: #334155; color: #e2e8f0; }
.btn-print {
  display: flex; align-items: center; gap: 0.5rem;
  background: #16a34a; color: white;
  border: none; border-radius: 0.5rem;
  padding: 0.5rem 1.25rem; font-size: 0.75rem; font-weight: 800;
  cursor: pointer; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.1em;
}
.btn-print:hover { background: #15803d; }

/* ── A4 Wrapper ── */
.print-root { min-height: 100vh; background: #f1f5f9; }
.a4-wrapper { padding: 5rem 1rem 3rem; display: flex; justify-content: center; }
.a4-page {
  display: flex; flex-direction: row;
  width: 210mm; min-height: 297mm;
  background: white;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
  border-radius: 4px;
  overflow: hidden;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 220px; min-width: 220px;
  background: #0f172a;
  color: white;
  display: flex; flex-direction: column;
  padding: 2rem 1.5rem;
  gap: 0;
}

/* Photo */
.sidebar-photo-wrap { display: flex; justify-content: center; margin-bottom: 1.25rem; }
.sidebar-photo-ring {
  width: 96px; height: 96px; border-radius: 50%;
  border: 3px solid #22d3ee;
  overflow: hidden; background: #1e293b;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 4px rgba(34,211,238,0.15);
}
.sidebar-photo-img { width: 100%; height: 100%; object-fit: cover; }
.sidebar-photo-initials { font-size: 2rem; font-weight: 900; color: #334155; text-transform: uppercase; }

/* Name block in sidebar */
.sidebar-name-block { text-align: center; margin-bottom: 1.5rem; }
.sidebar-name { font-size: 1rem; font-weight: 900; color: white; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.03em; }
.sidebar-title { font-size: 0.65rem; font-weight: 700; color: #22d3ee; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 0.3rem; }

.sidebar-divider { height: 1px; background: #1e293b; margin-bottom: 1.25rem; }

/* Sidebar Section */
.sidebar-section { margin-bottom: 1.5rem; }
.sidebar-section-title {
  font-size: 0.6rem; font-weight: 900; text-transform: uppercase;
  letter-spacing: 0.2em; color: #64748b;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 0.4rem; margin-bottom: 0.75rem;
}

/* Contacts */
.sidebar-contact-list { display: flex; flex-direction: column; gap: 0.6rem; }
.contact-item { display: flex; align-items: flex-start; gap: 0.5rem; }
.contact-icon { width: 12px; height: 12px; flex-shrink: 0; color: #22d3ee; margin-top: 2px; }
.contact-item span { font-size: 0.65rem; font-weight: 500; color: #cbd5e1; word-break: break-all; line-height: 1.4; }

/* Skills */
.skill-list { display: flex; flex-direction: column; gap: 0.4rem; }
.skill-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.65rem; font-weight: 600; color: #cbd5e1; }
.skill-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; flex-shrink: 0; }

/* Footer */
.sidebar-footer { margin-top: auto; padding-top: 1rem; opacity: 0.25; }
.sidebar-footer p { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; line-height: 1.6; }

/* ── MAIN CONTENT ── */
.main-content { flex: 1; padding: 2.5rem 2rem; display: flex; flex-direction: column; gap: 0; background: white; }

/* Section */
.cv-section { margin-bottom: 1.75rem; }
.section-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
.section-bar { display: inline-block; width: 3px; height: 18px; background: #22d3ee; border-radius: 2px; flex-shrink: 0; }
.section-title { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #0f172a; }

/* Bio */
.bio-text { font-size: 0.72rem; color: #475569; line-height: 1.65; white-space: pre-line; }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 1.25rem; padding-left: 0.75rem; border-left: 2px solid #e2e8f0; }
.timeline-item { position: relative; padding-left: 1rem; }
.timeline-dot {
  position: absolute; left: -1.4rem; top: 0.35rem;
  width: 10px; height: 10px; border-radius: 50%;
  background: #0f172a; border: 2px solid #22d3ee;
}
.timeline-body {}
.timeline-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.3rem; }
.exp-cargo { font-size: 0.8rem; font-weight: 800; color: #0f172a; }
.exp-empresa { font-size: 0.7rem; font-weight: 700; color: #22d3ee; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.1rem; }
.exp-period {
  font-size: 0.6rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;
  letter-spacing: 0.1em; white-space: nowrap; display: flex; align-items: center; gap: 0.3rem;
}
.period-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; animation: pulse 2s infinite; }
.exp-desc { font-size: 0.67rem; color: #64748b; line-height: 1.55; margin-top: 0.35rem; }

/* Education */
.edu-list { display: flex; flex-direction: column; gap: 0.75rem; }
.edu-line { display: flex; flex-direction: column; gap: 0.15rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
.edu-line:last-child { border-bottom: none; }
.edu-line-curso { font-size: 0.78rem; font-weight: 800; color: #0f172a; margin: 0; }
.edu-line-sub { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; margin: 0; }
.edu-line-inst { font-size: 0.67rem; font-weight: 600; color: #475569; }
.edu-line-nivel { font-size: 0.63rem; font-weight: 700; color: #64748b; }
.edu-line-year { font-size: 0.63rem; font-weight: 600; color: #94a3b8; }
.edu-line-sep { font-size: 0.6rem; color: #cbd5e1; font-weight: 400; }

/* Main header */
.main-header { margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 2px solid #e2e8f0; }
.main-name { font-size: 1.5rem; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.2; }
.main-title { font-size: 0.7rem; font-weight: 500; color: #94a3b8; letter-spacing: 0.04em; margin-top: 0.25rem; }

/* Loading & Empty */
.loading-msg { color: #94a3b8; font-size: 0.8rem; margin: auto; }
.empty-msg { text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.8rem; }
.empty-link { color: #3b82f6; font-weight: 700; text-decoration: underline; margin-top: 0.5rem; display: block; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── PRINT STYLES ── */
@media print {
  @page { margin: 0; size: A4; }

  body { background: white !important; }

  .print-root { background: white !important; }
  .a4-wrapper { padding: 0 !important; display: block; }

  .a4-page {
    width: 100% !important;
    min-height: 100vh !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .sidebar {
    background: #0f172a !important;
    color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .sidebar-photo-ring {
    border-color: #22d3ee !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .sidebar-title, .contact-icon, .skill-dot, .timeline-dot, .exp-empresa, .section-bar {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .edu-card { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  .print\:hidden { display: none !important; }

  .period-dot { animation: none !important; }

  .btn-print, .btn-toolbar, .toolbar { display: none !important; }
}
</style>
