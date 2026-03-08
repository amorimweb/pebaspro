# Patterns & Advanced Flows

## Error Handling in API Routes

Always use `createError` with meaningful HTTP status codes:

```ts
// server/api/posts/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()

  if (error?.code === 'PGRST116') throw createError({ statusCode: 404, message: 'Post não encontrado' })
  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
```

## Auth Guards (Middleware)

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return navigateTo('/login')
})
```

Usage in a page:
```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

## Row Level Security (RLS) — recommended Supabase policies

Enable RLS on all tables. Example for `posts`:

```sql
-- Users can only see their own posts
CREATE POLICY "user_select" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_delete" ON posts FOR DELETE USING (auth.uid() = user_id);
```

## Passing User JWT to server/api (for RLS-aware queries)

If you want the server to respect RLS instead of bypassing it, pass the user's token:

```ts
// server/api/posts/index.get.ts
export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  const { data, error } = await supabase.from('posts').select('*')
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

Client-side: attach the token to the request from the store:
```ts
const { $supabase } = useNuxtApp()
const session = (await $supabase.auth.getSession()).data.session
const posts = await $fetch('/api/posts', {
  headers: { Authorization: `Bearer ${session?.access_token}` }
})
```

## Optimistic Updates in Pinia

Update the local state immediately, then rollback on error:

```ts
async function remove(id: string) {
  const backup = [...posts.value]
  posts.value = posts.value.filter(p => p.id !== id)  // optimistic
  try {
    await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
  } catch (e: any) {
    posts.value = backup  // rollback
    error.value = e.message
  }
}
```

## Pagination

```ts
// server/api/posts/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 10)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = useSupabaseServer()
  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { data, total: count, page, limit }
})
```

## Input Validation (zod)

```bash
npm install zod
```

```ts
// server/api/posts/index.post.ts
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  user_id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const result = schema.safeParse(raw)
  if (!result.success) throw createError({ statusCode: 422, message: JSON.stringify(result.error.flatten()) })

  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('posts').insert(result.data).select().single()
  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
```
