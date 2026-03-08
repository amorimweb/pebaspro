---
name: nuxt-supabase-starter
description: >
  Use this skill whenever the user wants to build, scaffold, or expand a Nuxt 4 project with Tailwind CSS and Supabase. 
  Triggers include: setting up a new Nuxt project with auth/database, adding Supabase tables to an existing Nuxt app, 
  creating Pinia stores for data fetching, setting up server/api routes with Supabase, adding type-safe data layers, 
  or any request to "bootstrap", "scaffold", "start", or "add a new table/feature" in a Nuxt+Supabase project.
  Always use this skill before writing any Nuxt/Supabase/Pinia code to ensure consistent architecture.
---

# Nuxt 4 + Tailwind + Supabase Starter Skill

This skill guides you to build and expand a production-ready Nuxt 4 app with:
- **Supabase** for database + auth (via secure `server/api` routes — never expose keys client-side)
- **Pinia** for client state management
- **Tailwind CSS** for styling
- **TypeScript** types auto-derived from each table

---

## When to use this skill

- Scaffolding a brand new project → follow **Phase 1: Initial Setup**
- Adding a new Supabase table to existing project → jump to **Phase 4: New Table Checklist**
- Debugging auth or API issues → see **references/patterns.md**
- Reviewing architecture decisions → see **references/architecture.md**

---

## Phase 1: Initial Setup

### 1.1 — Create the Nuxt project

```bash
npx nuxi@latest init my-app
cd my-app
```

### 1.2 — Install dependencies

```bash
npm install @supabase/supabase-js @pinia/nuxt pinia
npm install -D tailwindcss @tailwindcss/vite
```

### 1.3 — Configure `nuxt.config.ts`

```ts
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    // Server-only (never exposed to client)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    // Public (safe to expose)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
})
```

> **Nuxt 4 note:** O `compatibilityVersion: 4` não é mais necessário — é o comportamento padrão no Nuxt 4.
```

### 1.4 — Setup Tailwind

```css
/* app/assets/css/main.css */
@import "tailwindcss";
```

### 1.5 — Environment variables

```bash
# .env  (never commit this file!)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key   # server only!
```

Add `.env` to `.gitignore`.

---

## Phase 2: Supabase Clients

Create two separate Supabase clients — one for server routes (privileged), one for client plugins (anon).

### 2.1 — Server utility (privileged)

```ts
// server/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function useSupabaseServer() {
  const config = useRuntimeConfig()
  return createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey  // uses service role key — server only!
  )
}
```

### 2.2 — Client plugin (anon/user auth)

```ts
// app/plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )
  return { provide: { supabase } }
})
```

---

## Phase 3: Auth API Routes

All Supabase calls go through `server/api/`. This ensures keys are never exposed to the browser.

### 3.1 — Login

```ts
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw createError({ statusCode: 401, message: error.message })
  return data
})
```

### 3.2 — Register

```ts
// server/api/auth/register.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
```

### 3.3 — Logout

```ts
// server/api/auth/logout.post.ts
export default defineEventHandler(async () => {
  const supabase = useSupabaseServer()
  const { error } = await supabase.auth.signOut()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
```

---

## Phase 4: New Table Checklist ✅

> **Every time you add a new Supabase table, follow ALL steps below in order.**

Given a table called `posts` with columns: `id`, `title`, `content`, `user_id`, `created_at`

---

### Step 1 — Define the TypeScript type

```ts
// app/types/posts.ts
export interface Post {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
}

export interface CreatePostPayload {
  title: string
  content: string
  user_id: string
}

export interface UpdatePostPayload {
  id: string
  title?: string
  content?: string
}
```

**Rule:** One file per table in `types/`. Always export a main interface, a `Create` payload, and an `Update` payload.

---

### Step 2 — Create server/api CRUD routes

```ts
// server/api/posts/index.get.ts  — List all posts
export default defineEventHandler(async () => {
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

```ts
// server/api/posts/index.post.ts  — Create post
import type { CreatePostPayload } from '~/types/posts'

export default defineEventHandler(async (event) => {
  const body: CreatePostPayload = await readBody(event)
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('posts').insert(body).select().single()
  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
```

```ts
// server/api/posts/[id].get.ts  — Get one post
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 404, message: error.message })
  return data
})
```

```ts
// server/api/posts/[id].put.ts  — Update post
import type { UpdatePostPayload } from '~/types/posts'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body: UpdatePostPayload = await readBody(event)
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('posts').update(body).eq('id', id).select().single()
  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
```

```ts
// server/api/posts/[id].delete.ts  — Delete post
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = useSupabaseServer()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw createError({ statusCode: 400, message: error.message })
  return { success: true }
})
```

---

### Step 3 — Create the Pinia store

```ts
// app/stores/posts.ts
import { defineStore } from 'pinia'
import type { Post, CreatePostPayload, UpdatePostPayload } from '~/types/posts'

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const count = computed(() => posts.value.length)
  const getById = (id: string) => posts.value.find(p => p.id === id)

  // Actions
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      posts.value = await $fetch<Post[]>('/api/posts')
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value = null
    try {
      currentPost.value = await $fetch<Post>(`/api/posts/${id}`)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreatePostPayload) {
    loading.value = true
    error.value = null
    try {
      const newPost = await $fetch<Post>('/api/posts', { method: 'POST', body: payload })
      posts.value.unshift(newPost)
      return newPost
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function update(payload: UpdatePostPayload) {
    loading.value = true
    error.value = null
    try {
      const updated = await $fetch<Post>(`/api/posts/${payload.id}`, { method: 'PUT', body: payload })
      const idx = posts.value.findIndex(p => p.id === payload.id)
      if (idx !== -1) posts.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
      posts.value = posts.value.filter(p => p.id !== id)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { posts, currentPost, loading, error, count, getById, fetchAll, fetchOne, create, update, remove }
})
```

---

### Step 4 — Use in a Vue component

```vue
<!-- app/pages/posts/index.vue -->
<script setup lang="ts">
const store = usePostsStore()
await store.fetchAll()
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div v-if="store.loading" class="text-gray-500">Carregando...</div>
    <div v-else-if="store.error" class="text-red-500">{{ store.error }}</div>
    <ul v-else class="space-y-4">
      <li v-for="post in store.posts" :key="post.id"
          class="p-4 bg-white rounded-xl shadow">
        <h2 class="font-bold text-lg">{{ post.title }}</h2>
        <p class="text-gray-600">{{ post.content }}</p>
      </li>
    </ul>
  </div>
</template>
```

---

## Phase 5: Auth com Sessão Persistente

> **Problema clássico:** O Pinia store vive só em memória. Ao dar refresh na página, o store é resetado e o usuário é jogado de volta para o login — mesmo que a sessão Supabase ainda seja válida.
>
> **Solução em 3 camadas:**
> 1. `pinia-plugin-persistedstate` salva o store em cookie (SSR-safe)
> 2. Plugin de hidratação reidrata o store no boot da app
> 3. Middleware de auth lê o cookie antes de redirecionar

---

### 5.1 — Instalar persistedstate

```bash
npm install pinia-plugin-persistedstate
```

Adicionar ao `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',   // ← adicionar
  ],
  piniaPluginPersistedstate: {
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 8,  // 8 horas
    },
  },
  // resto da config...
})
```

---

### 5.2 — Auth Store com persistência

```ts
// app/stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      user.value = data.user
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  // Reidrata o user buscando a sessão ativa no Supabase
  async function hydrate() {
    if (user.value) return  // já tem dados, não precisa buscar
    try {
      const data = await $fetch<{ user: User | null }>('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, loading, isLoggedIn, login, logout, hydrate }
}, {
  persist: {
    storage: piniaPluginPersistedstate.cookies(),   // persiste em cookie SSR-safe
    pick: ['user'],                                  // só persiste o user, não loading
  },
})
```

---

### 5.3 — Rota server para verificar sessão atual

```ts
// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const supabase = useSupabaseServer()

  // Lê o token do cookie enviado pelo browser
  const token = getCookie(event, 'sb-access-token')
  if (!token) return { user: null }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return { user: null }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
    }
  }
})
```

---

### 5.4 — Plugin de hidratação no boot

```ts
// app/plugins/auth.ts  (sem .client — roda em SSR também)
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  await auth.hydrate()
})
```

Este plugin garante que ao carregar qualquer página (inclusive no servidor), o store já esteja populado com o usuário antes de qualquer middleware rodar.

---

### 5.5 — Middleware de auth robusto

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  // Com hidratação garantida pelo plugin, esse check é confiável
  if (!auth.isLoggedIn) {
    return navigateTo('/login')
  }
})
```

---

### 5.6 — Fluxo completo

```
1. Usuário faz login
   → store.user é populado
   → pinia-persistedstate salva em cookie automaticamente

2. Usuário dá refresh
   → Nuxt inicia, plugin auth.ts roda
   → auth.hydrate() chama /api/auth/me com o cookie
   → /api/auth/me valida o token no Supabase
   → store.user é reidratado antes de qualquer redirect

3. Middleware de auth roda
   → store.user já existe → usuário permanece na página ✅
   → store.user null → redireciona para /login ✅
```

---

## Folder Structure Reference

> **Nuxt 4** move todo o código da aplicação para dentro do diretório `app/`. O `server/` fica na raiz.

```
my-app/
├── app/                               ← NOVO em Nuxt 4: todo o código da app aqui
│   ├── assets/css/main.css
│   ├── plugins/
│   │   ├── supabase.client.ts         ← cliente anon para o browser
│   │   └── auth.ts                    ← hidrata o store no boot (SSR + client)
│   ├── stores/
│   │   ├── auth.ts                    ← store com persist em cookie
│   │   └── [table].ts                 ← um store por tabela
│   ├── types/
│   │   └── [table].ts                 ← um arquivo de tipos por tabela
│   ├── pages/
│   ├── components/
│   └── middleware/
│       └── auth.ts                    ← guard de rota
├── server/                            ← fora do app/, na raiz
│   ├── utils/supabase.ts              ← cliente Supabase privilegiado
│   └── api/
│       ├── auth/
│       │   ├── login.post.ts
│       │   ├── register.post.ts
│       │   ├── logout.post.ts
│       │   └── me.get.ts              ← verifica sessão ativa
│       └── [table]/                   ← uma pasta por tabela
│           ├── index.get.ts
│           ├── index.post.ts
│           ├── [id].get.ts
│           ├── [id].put.ts
│           └── [id].delete.ts
├── nuxt.config.ts
└── .env                               ← nunca commitar!
```

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_KEY` only exists in `runtimeConfig` (server-only, sem `public.`)
- [ ] Todas as leituras/escritas no DB passam por `server/api/`
- [ ] `.env` está no `.gitignore`
- [ ] RLS (Row Level Security) habilitado no Supabase dashboard para cada tabela
- [ ] Inputs validados/sanitizados em todos os routes POST/PUT
- [ ] `pinia-plugin-persistedstate` configurado com cookies SSR-safe (não localStorage)
- [ ] Plugin `auth.ts` hidrata o store antes dos middlewares rodarem
- [ ] `server/api/auth/me.get.ts` valida o token no Supabase (não confia só no cookie)

---

## Quick Reference

For detailed patterns, edge cases, and advanced flows, read:
- **references/patterns.md** — error handling, auth guards, RLS tips, optimistic updates
- **references/architecture.md** — why server/api only, Pinia vs useState, SSR considerations
