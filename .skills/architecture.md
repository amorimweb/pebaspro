# Architecture Decisions

## Por que usar server/api em vez de chamar Supabase direto no cliente?

**Problema:** Se você usar o Supabase client com `service_role` no browser, essa chave privilegiada fica exposta no JavaScript público. Qualquer pessoa pode abrir o DevTools e ver a chave.

**Solução:** Todas as chamadas ao banco passam pelo `server/api/`. O browser nunca vê a `service_role` key. O Nuxt server-side tem acesso às variáveis de ambiente reais.

```
Browser → $fetch('/api/posts') → server/api/posts/index.get.ts → Supabase
```

**Exceção:** É seguro usar o `supabase.auth` no cliente com a `anon key`, pois ela é projetada para ser pública. O que NÃO deve ficar no client é a `service_role` key.

---

## Por que Pinia em vez de useState ou useFetch diretamente?

| Critério | Pinia Store | useState | useFetch direto |
|---|---|---|---|
| Compartilhar estado entre componentes | ✅ | ✅ | ❌ |
| Persistir ao navegar entre páginas | ✅ | ✅ | ❌ |
| Actions com loading/error state | ✅ | Manual | Parcial |
| DevTools | ✅ | ❌ | ❌ |
| Reutilizável em qualquer lugar | ✅ | ❌ | ❌ |

**Regra:** Use `useFetch` ou `$fetch` apenas dentro das stores. Componentes nunca chamam a API diretamente.

---

## SSR Considerations

Nuxt roda código tanto no servidor (SSR) quanto no cliente. Cuidados:

1. **`useNuxtApp().$supabase`** só existe no cliente (plugin marcado com `.client.ts`)
2. **`useRuntimeConfig()`** funciona nos dois lados, mas `runtimeConfig.supabaseServiceKey` só retorna valor no servidor
3. Para SSR de páginas protegidas, use `server/api` para buscar dados já no servidor, e hydrate via store no `app:created` hook se necessário

**Padrão recomendado para páginas com dados iniciais:**
```vue
<script setup lang="ts">
// Roda no servidor → dados chegam já pré-renderizados
const store = usePostsStore()
await store.fetchAll()  // usa $fetch que funciona em SSR
</script>
```

---

## Estrutura de pastas: por que um arquivo por operação?

```
server/api/posts/
├── index.get.ts    → GET /api/posts
├── index.post.ts   → POST /api/posts
├── [id].get.ts     → GET /api/posts/:id
├── [id].put.ts     → PUT /api/posts/:id
└── [id].delete.ts  → DELETE /api/posts/:id
```

Nuxt infere o método HTTP pelo sufixo do arquivo (`.get.ts`, `.post.ts` etc.). Isso é mais explícito e fácil de navegar do que um único arquivo com um switch de métodos.

---

## Checklist ao criar uma nova feature

```
Nova tabela "products" no Supabase
    │
    ├── 1. app/types/products.ts          (Product, CreateProductPayload, UpdateProductPayload)
    ├── 2. server/api/products/           (index.get, index.post, [id].get, [id].put, [id].delete)
    ├── 3. app/stores/products.ts         (state, getters, actions com loading/error)
    └── 4. app/pages/products/            (index.vue usando o store)
```

Seguindo essa ordem, você sempre tem tipagem antes de usar, API antes do store, e store antes da UI.
