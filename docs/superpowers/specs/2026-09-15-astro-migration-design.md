# Design Doc: Migração do WatchTracker para Astro (Arquitetura Estática Híbrida)

**Data:** 2026-09-15  
**Status:** Aprovado  
**Projeto:** [WatchTracker](https://github.com/IuryAlmeidaDev/watchtracker)  
**Autor:** Antigravity & Iury Almeida  

---

## 1. Contexto e Objetivos

O **WatchTracker** é atualmente uma aplicação SPA (Single Page Application) construída sobre React 19 + Vite + Tailwind CSS v4 + Base UI + dnd-kit + Supabase + Zustand.

### 1.1 Problema Atual
- Por ser uma SPA pura gerada pelo Vite com um `index.html` estático contendo `<div id="root"></div>`:
  - O compartilhamento em redes sociais (WhatsApp, Twitter/X, Telegram) não exibe imagens ricas dos relógios nem títulos dinâmicos por modelo.
  - Não existem páginas individuais acessíveis e indexáveis para cada relógio da coleção.
  - O navegador do cliente precisa baixar e avaliar todo o bundle JavaScript antes de renderizar qualquer elemento visual.

### 1.2 Objetivos da Migração
1. **Preservação de 100% das Funcionalidades:** Manter ranking interativo com Drag-and-Drop (`@dnd-kit`), abas de Catálogo e Coleção, autenticação Supabase, persistência local e alternância de temas claro/escuro.
2. **Páginas Dedicadas por Relógio:** Criar rotas estáticas `/relogios/[id]` pré-renderizadas no build com galeria de fotos em alta qualidade, ficha técnica completa e metatags OpenGraph específicas por modelo.
3. **SEO e Social Sharing (OpenGraph):** Links compartilhados do catálogo ou de qualquer relógio específico exibirão automaticamente o card com imagem, marca, modelo e valor no WhatsApp/Telegram/Twitter.
4. **Zero Impacto no Deploy:** Manter build estático (`output: 'static'`) publicado na Vercel com velocidade máxima e custo zero de infraestrutura.

---

## 2. Arquitetura e Decisões Técnicas

```
┌─────────────────────────────────────────────────────────────┐
│                       Astro 5 (SSG)                         │
├───────────────────────────────┬─────────────────────────────┤
│   Rota Principal (/)          │   Rotas de Relógio          │
│   src/pages/index.astro       │   src/pages/relogios/[id]   │
│   ┌─────────────────────────┐ │   ┌───────────────────────┐ │
│   │ Layout.astro (Head/SEO) │ │   │ Layout.astro (Head)   │ │
│   │ ┌─────────────────────┐ │ │   │ ┌───────────────────┐ │ │
│   │ │ App.tsx             │ │ │   │ │ Ficha Técnica     │ │ │
│   │ │ (client:load)       │ │ │   │ │ Galeria de Fotos  │ │ │
│   │ │ - DnD Ranking       │ │ │   │ │ Botão "Ver no     │ │ │
│   │ │ - Catálogo          │ │ │   │ │ Catálogo"         │ │ │
│   │ │ - Coleção           │ │ │   │ └───────────────────┘ │ │
│   │ │ - Supabase / Zustand│ │ │   └───────────────────────┘ │
│   │ └─────────────────────┘ │ │   (HTML Puro, Zero JS)      │
│   └─────────────────────────┘ │                             │
└───────────────────────────────┴─────────────────────────────┘
```

### 2.1 Toolchain & Compatibilidade
- **Astro 5:** Motor principal de build e geração estática.
- **`@astrojs/react`:** Integração oficial para execução de componentes React 19 como ilhas.
- **Tailwind CSS v4 (`@tailwindcss/vite`):** Integrado diretamente no bloco `vite.plugins` do `astro.config.mjs`.
- **Compatibilidade de Variáveis de Ambiente:** Configuração de `vite.envPrefix: ['VITE_', 'PUBLIC_']` para permitir que o cliente Supabase continue utilizando `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY` sem necessidade de alterar segredos na Vercel.

---

## 3. Estrutura de Arquivos e Componentes

### 3.1 `astro.config.mjs`
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

### 3.2 `src/layouts/Layout.astro`
Centraliza a estrutura HTML, fontes (`@fontsource/dm-sans`, `@fontsource/manrope`), CSS global (`src/index.css`), tema escuro/claro sem flash visual, e metadados OpenGraph.

Props:
- `title`: Título da página (default: "WatchTracker — Minha seleção").
- `description`: Descrição da página.
- `image`: URL da imagem para OpenGraph e Twitter Cards.
- `type`: Tipo do objeto OpenGraph (default: "website").

### 3.3 `src/pages/index.astro`
Carrega o layout e renderiza a aplicação principal como uma ilha interativa:
```astro
---
import Layout from '../layouts/Layout.astro';
import App from '../App';
---
<Layout>
  <App client:load />
</Layout>
```

### 3.4 `src/pages/relogios/[id].astro`
Gera as páginas individuais no build via `getStaticPaths()` consumindo os modelos de `src/data/watches.ts` e enriquecendo com as especificações de `src/lib/watch-details.ts`.
- Contém metatags ricas com a foto principal do relógio.
- Renderiza galeria de fotos, especificações técnicas detalhadas, preço e link para a loja.
- Possui botão de ação "Voltar para o catálogo".

---

## 4. Estratégia de Testes e Validação

1. **Build Estático:** Execução de `npm run build` confirmando que todas as rotas estáticas (`/` e `/relogios/*`) são geradas sem erros.
2. **Interatividade na Home:** Testar no navegador se drag-and-drop, filtros, alternância de abas, modais e persistência continuam 100% operacionais.
3. **Páginas Dedicadas:** Validar a renderização visual e metatags de cada rota de relógio.
4. **Testes Automatizados:** Executar a suíte Playwright existente adaptada para a nova porta/ambiente.
