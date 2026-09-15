# Migração do WatchTracker para Astro - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o WatchTracker de uma SPA pura (Vite + React) para Astro com renderização estática (SSG), mantendo todas as interatividades como Ilha React e adicionando páginas estáticas dedicadas por relógio com metatags OpenGraph ricas.

**Architecture:** O Astro 5 compila o site em modo `output: 'static'` usando a integração `@astrojs/react` e Tailwind CSS v4 via `@tailwindcss/vite`. A página principal (`src/pages/index.astro`) renderiza a casca HTML e hidrata o `App.tsx` via `client:load`. Novas rotas dinâmicas em `src/pages/relogios/[id].astro` geram páginas estáticas ricas para cada relógio a partir do catálogo base.

**Tech Stack:** Astro 5, React 19, TypeScript, Tailwind CSS v4, `@astrojs/react`, `@dnd-kit`, Zustand, Supabase.

**Spec:** `docs/superpowers/specs/2026-09-15-astro-migration-design.md`

## Global Constraints
- Manter compatibilidade com React 19 e as dependências atuais (`@base-ui/react`, `@dnd-kit`, `@supabase/supabase-js`, Zustand).
- Manter o prefixo de variáveis de ambiente `VITE_` e `PUBLIC_` no Astro para preservar as variáveis do Supabase sem quebras.
- Gerar build estático em `dist/` compatível com o deploy atual na Vercel.

---

### Task 1: Instalar dependências do Astro e configurar `astro.config.mjs`

**Files:**
- Modify: `package.json`
- Create: `astro.config.mjs`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: Configurações de build do Vite e Tailwind existentes.
- Produces: Ambiente Astro configurado para rodar `astro dev` e `astro build`.

- [ ] **Step 1: Instalar dependências do Astro**
```powershell
npm.cmd install astro @astrojs/react @astrojs/check --save-dev
```

- [ ] **Step 2: Criar `astro.config.mjs` com React e Tailwind v4**
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['VITE_', 'PUBLIC_'],
  },
});
```

- [ ] **Step 3: Atualizar scripts no `package.json`**
Alterar scripts para usar os comandos do Astro:
- `"dev": "astro dev --host 127.0.0.1"`
- `"build": "astro build"`
- `"preview": "astro preview --host 127.0.0.1"`

- [ ] **Step 4: Atualizar `tsconfig.json` para suportar JSX e Astro**
Garantir que `"jsx": "react-jsx"` e `"moduleResolution": "bundler"` estejam definidos.

- [ ] **Step 5: Testar inicialização de tipos**
Executar: `npx.cmd astro check` ou verificar parsing da configuração.

- [ ] **Step 6: Commit**
```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json; git commit -m "build: configure Astro with React and Tailwind v4"
```

---

### Task 2: Criar Layout Base com SEO e OpenGraph (`src/layouts/Layout.astro`)

**Files:**
- Create: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `src/index.css`, fontes `@fontsource/dm-sans` e `@fontsource/manrope`.
- Produces: Layout padrão com `<head>` dinâmico, metatags OpenGraph e prevenção de flash de tema escuro.

- [ ] **Step 1: Criar o arquivo `src/layouts/Layout.astro`**
```astro
---
import '@fontsource/dm-sans';
import '@fontsource/manrope';
import '../index.css';

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

const {
  title = "WatchTracker — Minha seleção",
  description = "Sua próxima escolha, no seu tempo. Organize seu ranking pessoal de relógios.",
  image = "/favicon.svg",
} = Astro.props;

const canonicalURL = Astro.site ? new URL(Astro.url.pathname, Astro.site) : Astro.url;
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content="#f8f9fa" />

    <!-- OpenGraph / Facebook / WhatsApp -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />

    <!-- Prevenção de FOUC / Tema Flash -->
    <script is:inline>
      try {
        const theme = localStorage.getItem('watchtracker-theme') || 'dark';
        document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
      } catch {}
    </script>
  </head>
  <body class="min-h-screen bg-[var(--tone-canvas)] text-[var(--tone-ink)] selection:bg-[var(--tone-accent)] selection:text-[var(--tone-canvas)]">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Commit**
```powershell
git add src/layouts/Layout.astro; git commit -m "feat: add Astro base layout with OpenGraph SEO and theme script"
```

---

### Task 3: Criar a Página Inicial com a Ilha React (`src/pages/index.astro`)

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/layouts/Layout.astro`, `src/App.tsx`.
- Produces: Rota `/` que carrega a aplicação completa existente como ilha interativa.

- [ ] **Step 1: Criar o arquivo `src/pages/index.astro`**
```astro
---
import Layout from '../layouts/Layout.astro';
import App from '../App';
---

<Layout>
  <App client:load />
</Layout>
```

- [ ] **Step 2: Validar importações de clientes em `App.tsx`**
Garantir que todas as chamadas de browser APIs em `App.tsx` estejam protegidas ou rodem dentro de `useEffect` (já estão).

- [ ] **Step 3: Commit**
```powershell
git add src/pages/index.astro; git commit -m "feat: create index.astro mounting App as a React island"
```

---

### Task 4: Criar Páginas Estáticas Dedicadas (`src/pages/relogios/[id].astro`)

**Files:**
- Create: `src/pages/relogios/[id].astro`

**Interfaces:**
- Consumes: `src/data/watches.ts`, `src/lib/watch-details.ts`, `src/layouts/Layout.astro`.
- Produces: Rotas `/relogios/:id` com ficha técnica completa, galeria de imagens, botão voltar e metatags específicas.

- [ ] **Step 1: Criar `src/pages/relogios/[id].astro`**
```astro
---
import Layout from '../../layouts/Layout.astro';
import { watches } from '../../data/watches';
import { getWatchDetails } from '../../lib/watch-details';
import { ArrowLeft, ExternalLink, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export function getStaticPaths() {
  return watches.map((w) => ({
    params: { id: w.id },
    props: { watch: w },
  }));
}

const { watch } = Astro.props;
const watchItem = {
  id: watch.id,
  brand: watch.marca,
  model: watch.nome,
  priceEstimate: typeof watch.preco === 'number' ? `≈ R$ ${watch.preco}` : `R$ ${watch.preco.min}–R$ ${watch.preco.max}`,
  specs: watch.especificacoes,
  storeName: watch.loja,
  storeUrl: watch.url ?? null,
  images: watch.imagem ? [watch.imagem] : [],
};

const { images, facts } = getWatchDetails(watchItem);
const primaryImage = images[0] || '/favicon.svg';
const pageTitle = `${watch.marca} ${watch.nome} — WatchTracker`;
const pageDescription = `Especificações, fotos e detalhes do relógio ${watch.marca} ${watch.nome}. ${watch.especificacoes}`;
---

<Layout title={pageTitle} description={pageDescription} image={primaryImage}>
  <main class="app-shell py-8">
    <nav class="mb-8 flex items-center justify-between border-b border-[var(--tone-line)] pb-4">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-[var(--tone-accent)] hover:underline">
        <ArrowLeft size={16} /> Voltar para o Catálogo
      </a>
      <span class="text-xs uppercase tracking-wider text-[var(--tone-muted)] font-mono">
        Ficha Técnica Oficial
      </span>
    </nav>

    <article class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Coluna da Galeria -->
      <section class="lg:col-span-6 space-y-4">
        <div class="aspect-square w-full rounded-2xl bg-[var(--tone-surface)] border border-[var(--tone-line)] overflow-hidden p-6 flex items-center justify-center shadow-lg">
          <img
            src={primaryImage}
            alt={`${watch.marca} ${watch.nome}`}
            class="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {images.length > 1 && (
          <div class="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div class="aspect-square rounded-lg border border-[var(--tone-line)] bg-[var(--tone-surface)] p-2 overflow-hidden flex items-center justify-center">
                <img src={img} alt={`Foto ${idx + 1} de ${watch.nome}`} class="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        )}
      </section>

      <!-- Coluna de Informações e Ficha Técnica -->
      <section class="lg:col-span-6 flex flex-col justify-between">
        <div class="space-y-6">
          <div>
            <span class="text-xs font-semibold uppercase tracking-widest text-[var(--tone-accent)]">
              {watch.marca}
            </span>
            <h1 class="text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--tone-ink)] mt-1 font-['Manrope']">
              {watch.nome}
            </h1>
            <p class="text-2xl font-medium text-[var(--tone-accent)] mt-3 font-mono">
              {watchItem.priceEstimate}
            </p>
          </div>

          <div class="rounded-xl border border-[var(--tone-line)] bg-[var(--tone-surface)] p-5 space-y-3">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-[var(--tone-muted)] flex items-center gap-2">
              <Sparkles size={16} class="text-[var(--tone-accent)]" /> Resumo do Modelo
            </h2>
            <p class="text-sm leading-relaxed text-[var(--tone-secondary-ink)]">
              {watch.especificacoes}
            </p>
          </div>

          {facts && Object.keys(facts).length > 0 && (
            <div class="space-y-3">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-[var(--tone-muted)] flex items-center gap-2">
                <ShieldCheck size={16} class="text-[var(--tone-accent)]" /> Especificações do Fabricante
              </h2>
              <dl class="divide-y divide-[var(--tone-line)] rounded-xl border border-[var(--tone-line)] bg-[var(--tone-surface)] text-sm">
                {Object.entries(facts).map(([key, val]) => (
                  <div class="flex justify-between py-2.5 px-4">
                    <dt class="text-[var(--tone-muted)] font-medium">{key}</dt>
                    <dd class="text-[var(--tone-ink)] text-right font-medium">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div class="pt-8 mt-6 border-t border-[var(--tone-line)] flex flex-wrap gap-4 items-center justify-between">
          <a
            href={`/?watch=${watch.id}`}
            class="px-6 py-3 rounded-lg bg-[var(--tone-accent)] text-[var(--tone-canvas)] font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
          >
            Abrir no Catálogo Principal
          </a>

          {watch.url && (
            <a
              href={watch.url}
              target="_blank"
              rel="noopener noreferrer"
              class="px-5 py-3 rounded-lg border border-[var(--tone-line)] bg-[var(--tone-surface)] text-[var(--tone-ink)] text-sm hover:bg-[var(--tone-raised)] transition-colors flex items-center gap-2"
            >
              Comprar na {watch.loja} <ExternalLink size={14} />
            </a>
          )}
        </div>
      </section>
    </article>
  </main>
</Layout>
```

- [ ] **Step 2: Commit**
```powershell
git add src/pages/relogios/[id].astro; git commit -m "feat: add dedicated static watch detail pages with rich specifications"
```

---

### Task 5: Adicionar Link para a Página Dedicada nos Detalhes do Relógio

**Files:**
- Modify: `src/components/WatchDialogContent.tsx`

**Interfaces:**
- Consumes: `watch.id`.
- Produces: Botão que navega para `/relogios/${watch.id}`.

- [ ] **Step 1: Adicionar o link no modal de detalhes**
No rodapé ou cabeçalho do `WatchDialogContent`, incluir um link elegante:
```tsx
<a
  href={`/relogios/${watch.id}`}
  className="inline-flex items-center gap-1.5 text-xs text-[var(--tone-accent)] hover:underline font-medium"
>
  Ver página dedicada completa →
</a>
```

- [ ] **Step 2: Commit**
```powershell
git add src/components/WatchDialogContent.tsx; git commit -m "feat: add dedicated page link in watch details modal"
```

---

### Task 6: Verificação de Build, Testes e Limpeza

**Files:**
- Clean up: `index.html` (não mais necessário no Astro)
- Test: Build e execução

- [ ] **Step 1: Executar `npm run build`**
```powershell
npm.cmd run build
```
Verificar se gera:
- `dist/index.html`
- `dist/relogios/casio-f91w/index.html`
- `dist/relogios/...` para todos os 8 relógios da lista.

- [ ] **Step 2: Testar no navegador com preview**
```powershell
npm.cmd run preview
```
Conferir visualmente a página inicial e a página `/relogios/...`.

- [ ] **Step 3: Commit final**
```powershell
git add .; git commit -m "chore: complete Astro migration verification and build validation"
```
