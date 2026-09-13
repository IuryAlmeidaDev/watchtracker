# Supabase Backend, Auth, Storage & Vercel Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar o Supabase como backend completo (PostgreSQL com RLS, Auth via email/senha e Storage de múltiplas fotos) e implementar interface em abas (Meu Ranking, Minha Coleção e Catálogo/Explorar) no WatchTracker com deploy configurado para a Vercel.

**Architecture:** A aplicação continuará como um SPA em React 19 + Vite + TypeScript. O cliente do Supabase (`@supabase/supabase-js`) gerenciará autenticação e persistência de dados de usuários diretamente no frontend com Row Level Security (RLS). As fotos dos relógios serão servidas via bucket público no Supabase Storage e gerenciadas/populadas via script de seed pelo desenvolvedor.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, `@supabase/supabase-js`, `@dnd-kit`, `zustand`, `lucide-react`, `embla-carousel-react`, Playwright.

**Spec:** [docs/superpowers/specs/2026-09-13-supabase-backend-auth-storage-design.md](file:///C:/Users/iuryc/projects/watchtracker/docs/superpowers/specs/2026-09-13-supabase-backend-auth-storage-design.md)

## Global Constraints

- Preservar rigorosamente a identidade visual descrita em `DESIGN.md` (tons escuros `#131614`, `#1b201c`, acento sage `#c2ceab`, tipografia Manrope e DM Sans).
- Manter acessibilidade com dnd-kit e botões de subir/descer para reordenação.
- As operações no banco devem ter políticas RLS ativas para garantir isolamento estrito entre usuários.
- Nenhuma chave secreta de serviço (`SUPABASE_SERVICE_ROLE_KEY`) deve ser exposta no código frontend ou no bundle do Vite.

---

### Task 1: Instalação do SDK Supabase, Types de Banco e Migração SQL

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `supabase/migrations/20260913000000_initial_schema.sql`
- Create: `src/types/database.ts`
- Create: `src/lib/supabase.ts`

**Interfaces:**
- Produces: `supabase` (instância configurada do SupabaseClient exportada de `src/lib/supabase.ts`)
- Produces: `Database`, `WatchRecord`, `WatchImageRecord`, `UserRankingRecord`, `UserCollectionRecord` exportados de `src/types/database.ts`

- [ ] **Step 1: Instalar dependência `@supabase/supabase-js`**

Execute:
```powershell
npm install @supabase/supabase-js
```

- [ ] **Step 2: Criar arquivo `.env.example`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\.env.example`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada
```

- [ ] **Step 3: Criar arquivo de migração SQL inicial com Schema e RLS**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\supabase\migrations\20260913000000_initial_schema.sql`:
```sql
-- Habilitar extensão para UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Relógios do Catálogo (mantida pelo Dev)
CREATE TABLE IF NOT EXISTS public.watches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    reference TEXT,
    price_estimate TEXT NOT NULL,
    specs TEXT NOT NULL,
    store_name TEXT,
    store_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Imagens dos Relógios (múltiplas fotos por relógio)
CREATE TABLE IF NOT EXISTS public.watch_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watch_id UUID NOT NULL REFERENCES public.watches(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela do Ranking de Próximas Compras do Usuário
CREATE TABLE IF NOT EXISTS public.user_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    watch_id UUID NOT NULL REFERENCES public.watches(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_rankings_user_watch_unique UNIQUE (user_id, watch_id)
);

-- 4. Tabela da Coleção Pessoal do Usuário (relógios adquiridos)
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    watch_id UUID NOT NULL REFERENCES public.watches(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_collections_user_watch_unique UNIQUE (user_id, watch_id)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_watch_images_watch_id ON public.watch_images(watch_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON public.user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);

-- Habilitação de RLS em todas as tabelas
ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para watches e watch_images (Leitura pública, escrita dev/service_role)
CREATE POLICY "watches_public_read" ON public.watches
    FOR SELECT USING (true);

CREATE POLICY "watch_images_public_read" ON public.watch_images
    FOR SELECT USING (true);

-- Políticas de RLS para user_rankings (Isolamento por usuário)
CREATE POLICY "user_rankings_select" ON public.user_rankings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_rankings_insert" ON public.user_rankings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_rankings_update" ON public.user_rankings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_rankings_delete" ON public.user_rankings
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para user_collections (Isolamento por usuário)
CREATE POLICY "user_collections_select" ON public.user_collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_collections_insert" ON public.user_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_collections_update" ON public.user_collections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_collections_delete" ON public.user_collections
    FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket 'watch-photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('watch-photos', 'watch-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_watch_photos_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'watch-photos');
```

- [ ] **Step 4: Criar tipos TypeScript de banco em `src/types/database.ts`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\types\database.ts`:
```typescript
export interface WatchRecord {
  id: string;
  brand: string;
  model: string;
  reference: string | null;
  price_estimate: string;
  specs: string;
  store_name: string | null;
  store_url: string | null;
  created_at: string;
  images?: WatchImageRecord[];
}

export interface WatchImageRecord {
  id: string;
  watch_id: string;
  image_url: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface UserRankingRecord {
  id: string;
  user_id: string;
  watch_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  watch?: WatchRecord;
}

export interface UserCollectionRecord {
  id: string;
  user_id: string;
  watch_id: string;
  acquired_at: string | null;
  created_at: string;
  watch?: WatchRecord;
}
```

- [ ] **Step 5: Criar cliente Supabase em `src/lib/supabase.ts`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\lib\supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

- [ ] **Step 6: Verificar compilação com `npm run build`**

Execute:
```powershell
npm run build
```
Resultado esperado: Build executa sem erros de tipo no TypeScript.

- [ ] **Step 7: Commitar alterações**

Execute:
```powershell
git add package.json package-lock.json .env.example supabase/migrations/20260913000000_initial_schema.sql src/types/database.ts src/lib/supabase.ts
git commit -m "feat: add supabase client, database types and initial sql migration"
```

---

### Task 2: Script de Seed e Upload para o Desenvolvedor

**Files:**
- Create: `scripts/seed-catalog.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `watches` do arquivo existente `src/data/watches.ts`
- Produces: Executável via `npm run seed` para popular o Supabase com dados e imagens quando as chaves de ambiente forem fornecidas.

- [ ] **Step 1: Adicionar tsx como devDependency para rodar scripts TypeScript**

Execute:
```powershell
npm install -D tsx dotenv
```

- [ ] **Step 2: Criar script `scripts/seed-catalog.ts`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\scripts\seed-catalog.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { watches as existingWatches } from '../src/data/watches';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERRO: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados no arquivo .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('--- Iniciando Seed do Catálogo no Supabase ---');

  for (const item of existingWatches) {
    const priceEstimate = typeof item.preco === 'number' 
      ? `≈ R$ ${item.preco}` 
      : `R$ ${item.preco.min} - R$ ${item.preco.max}`;

    const { data: watch, error: watchError } = await supabase
      .from('watches')
      .upsert({
        brand: item.marca,
        model: item.nome,
        price_estimate: priceEstimate,
        specs: item.especificacoes,
        store_name: item.loja,
        store_url: item.url ?? null,
      }, { onConflict: 'brand,model' })
      .select('id')
      .single();

    if (watchError) {
      console.error(`Erro ao inserir relógio ${item.marca} ${item.nome}:`, watchError.message);
      continue;
    }

    console.log(`Relógio registrado: ${item.marca} ${item.nome} (${watch.id})`);

    // Upload de imagem caso exista localmente em public/
    if (item.imagem && item.imagem.startsWith('/watches/')) {
      const localImagePath = path.join(process.cwd(), 'public', item.imagem);
      if (fs.existsSync(localImagePath)) {
        const fileBuffer = fs.readFileSync(localImagePath);
        const fileName = path.basename(item.imagem);
        const storagePath = `watches/${watch.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('watch-photos')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Erro no upload da foto ${fileName}:`, uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('watch-photos')
            .getPublicUrl(storagePath);

          await supabase.from('watch_images').upsert({
            watch_id: watch.id,
            image_url: publicUrlData.publicUrl,
            display_order: 0,
            is_cover: true,
          }, { onConflict: 'watch_id,image_url' });

          console.log(`Foto enviada com sucesso: ${publicUrlData.publicUrl}`);
        }
      }
    }
  }

  console.log('--- Seed concluído com sucesso! ---');
}

seed().catch(err => {
  console.error('Falha inesperada no script de seed:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Adicionar comando `seed` em `package.json`**

Edite `package.json` adicionando `"seed": "tsx scripts/seed-catalog.ts"` aos scripts:
```json
"scripts": {
  "dev": "vite --host 127.0.0.1",
  "build": "tsc -b && vite build",
  "preview": "vite preview --host 127.0.0.1",
  "test": "playwright test",
  "seed": "tsx scripts/seed-catalog.ts"
}
```

- [ ] **Step 4: Testar validação do script sem variáveis**

Execute:
```powershell
npm run seed
```
Resultado esperado: O script encerra com a mensagem explicativa de que `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` precisam ser definidos no `.env`.

- [ ] **Step 5: Commitar script de seed**

Execute:
```powershell
git add package.json package-lock.json scripts/seed-catalog.ts
git commit -m "feat: add developer seed script for catalog and storage uploads"
```

---

### Task 3: Gerenciamento de Autenticação (Auth Store & Modal de Login)

**Files:**
- Create: `src/store/authStore.ts`
- Create: `src/components/AuthModal.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `useAuthStore` com `{ user, session, loading, signIn, signUp, signOut, checkSession }`
- Produces: `AuthModal` componente com props `{ isOpen: boolean; onClose: () => void }`

- [ ] **Step 1: Criar store de autenticação em `src/store/authStore.ts`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\store\authStore.ts`:
```typescript
import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  checkSession: async () => {
    if (!isSupabaseConfigured) {
      set({ loading: false });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Verifique o arquivo .env.' };
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }
    set({ session: data.session, user: data.user, loading: false });
    return { error: null };
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não configurado. Verifique o arquivo .env.' };
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }
    set({ session: data.session, user: data.user, loading: false });
    return { error: null };
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, session: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
```

- [ ] **Step 2: Criar componente `AuthModal.tsx`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\components\AuthModal.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { X, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { signIn, signUp, loading, clearError } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setEmail('');
      setPassword('');
      setLocalError(null);
      clearError();
    }
  }, [isOpen, defaultMode, clearError]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const res = mode === 'login' 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (res.error) {
      setLocalError(res.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{mode === 'login' ? 'Acessar Conta' : 'Criar Conta'}</h2>
            <p className="modal-subtitle">
              {mode === 'login' 
                ? 'Entre para salvar seu ranking e sua coleção' 
                : 'Crie sua conta para organizar seus relógios'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            type="button" 
            className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setLocalError(null); }}
          >
            Entrar
          </button>
          <button 
            type="button" 
            className={`modal-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setLocalError(null); }}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {localError && (
            <div className="modal-alert" role="alert">
              {localError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">E-mail</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Senha</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Adicionar estilos do Modal em `src/index.css`**

Adicione os seguintes estilos harmonizados ao final de `src/index.css`:
```css
/* Modal de Autenticação */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 13, 11, 0.82);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-card {
  background-color: var(--color-surface, #1b201c);
  border: 1px solid var(--color-card-border, #30382f);
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-title {
  font-family: var(--font-display, "Manrope", sans-serif);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text, #f0f0e9);
  letter-spacing: -0.4px;
}

.modal-subtitle {
  font-family: var(--font-body, "DM Sans", sans-serif);
  font-size: 13px;
  color: var(--color-muted, #a6aea6);
  margin-top: 4px;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--color-muted, #a6aea6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}

.modal-close:hover {
  color: var(--color-text, #f0f0e9);
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-line, #313731);
  margin-bottom: 20px;
}

.modal-tab {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-muted, #a6aea6);
  font-family: var(--font-display, "Manrope", sans-serif);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-tab.active {
  color: var(--color-accent, #c2ceab);
  border-bottom-color: var(--color-accent, #c2ceab);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-alert {
  background-color: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-family: var(--font-display, "Manrope", sans-serif);
  color: var(--color-muted, #a6aea6);
  margin-bottom: 6px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--color-muted, #a6aea6);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  background-color: var(--color-background, #131614);
  border: 1px solid var(--color-card-border, #30382f);
  border-radius: 6px;
  padding: 10px 12px 10px 36px;
  color: var(--color-text, #f0f0e9);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-wrap input:focus {
  border-color: var(--color-accent, #c2ceab);
}

.modal-submit {
  margin-top: 8px;
  background-color: var(--color-priority-background, #36422e);
  color: var(--color-priority-text, #d5e3c4);
  border: 1px solid var(--color-priority-border, #59654e);
  padding: 12px;
  border-radius: 6px;
  font-family: var(--font-display, "Manrope", sans-serif);
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.modal-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.modal-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 4: Verificar compilação com `npm run build`**

Execute:
```powershell
npm run build
```

- [ ] **Step 5: Commitar arquivos de autenticação**

Execute:
```powershell
git add src/store/authStore.ts src/components/AuthModal.tsx src/index.css
git commit -m "feat: add auth store, auth modal component and modal styles"
```

---

### Task 4: Galeria de Múltiplas Fotos (`WatchImageGallery`)

**Files:**
- Create: `src/components/WatchImageGallery.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `WatchImageGallery` componente com props `{ images: string[]; alt: string }`

- [ ] **Step 1: Criar componente `WatchImageGallery.tsx`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\components\WatchImageGallery.tsx`:
```tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface WatchImageGalleryProps {
  images: string[];
  alt: string;
}

export function WatchImageGallery({ images, alt }: WatchImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const validImages = images.filter((img) => !failedImages[img]);

  if (!validImages.length) {
    return (
      <div className="photo-placeholder">
        <ImageIcon size={26} strokeWidth={1} />
        <span>Foto em breve</span>
      </div>
    );
  }

  const currentImage = validImages[currentIndex] || validImages[0];
  const hasMultiple = validImages.length > 1;

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="image-gallery">
      <img
        src={currentImage}
        alt={`${alt} - foto ${currentIndex + 1}`}
        loading="lazy"
        onError={() => setFailedImages((prev) => ({ ...prev, [currentImage]: true }))}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            className="gallery-nav prev"
            onClick={handlePrev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="gallery-nav next"
            onClick={handleNext}
            aria-label="Próxima foto"
          >
            <ChevronRight size={16} />
          </button>
          <div className="gallery-dots">
            {validImages.map((_, idx) => (
              <span
                key={idx}
                className={`gallery-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Adicionar estilos para a galeria em `src/index.css`**

Adicione ao `src/index.css`:
```css
/* Galeria de Fotos */
.image-gallery {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--rounded-photo, 8px);
  overflow: hidden;
  background-color: var(--color-photo-background, #141915);
}

.image-gallery img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(19, 22, 20, 0.7);
  border: 1px solid var(--color-line, #313731);
  color: var(--color-text, #f0f0e9);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;
}

.image-gallery:hover .gallery-nav {
  opacity: 1;
}

.gallery-nav:hover {
  background-color: var(--color-control-hover, #364032);
}

.gallery-nav.prev { left: 4px; }
.gallery-nav.next { right: 4px; }

.gallery-dots {
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.gallery-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.gallery-dot.active {
  background-color: var(--color-accent, #c2ceab);
  width: 12px;
  border-radius: 3px;
}
```

- [ ] **Step 3: Testar compilação**

Execute:
```powershell
npm run build
```

- [ ] **Step 4: Commitar componente de galeria**

Execute:
```powershell
git add src/components/WatchImageGallery.tsx src/index.css
git commit -m "feat: add multi-image gallery component and styles"
```

---

### Task 5: Camada de Dados Unificada do Catálogo e Usuário (`catalogStore`)

**Files:**
- Create: `src/store/catalogStore.ts`

**Interfaces:**
- Consumes: `supabase` de `src/lib/supabase.ts`, dados locais de fallback de `src/data/watches.ts`
- Produces: `useCatalogStore` com estado:
  - `watches`: lista de todos os modelos do catálogo
  - `ranking`: lista ordenada de IDs ou objetos no ranking do usuário
  - `collection`: lista de IDs ou objetos na coleção do usuário
  - Métodos: `loadData()`, `addToRanking(watchId)`, `removeFromRanking(watchId)`, `reorderRanking(activeId, overId)`, `addToCollection(watchId)`, `removeFromCollection(watchId)`, `moveToCollection(watchId)`

- [ ] **Step 1: Criar `src/store/catalogStore.ts` com suporte híbrido (Supabase + Fallback local para visitantes)**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\store\catalogStore.ts`:
```typescript
import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { watches as initialLocalWatches, type Watch } from '../data/watches';
import type { WatchRecord } from '../types/database';

export interface WatchItem {
  id: string;
  brand: string;
  model: string;
  priceEstimate: string;
  specs: string;
  storeName: string | null;
  storeUrl: string | null;
  images: string[];
}

interface CatalogState {
  watches: WatchItem[];
  rankingIds: string[];
  collectionIds: string[];
  loading: boolean;
  syncError: boolean;
  loadData: (userId?: string) => Promise<void>;
  addToRanking: (watchId: string, userId?: string) => Promise<void>;
  removeFromRanking: (watchId: string, userId?: string) => Promise<void>;
  reorderRanking: (activeId: string, overId: string, userId?: string) => Promise<void>;
  addToCollection: (watchId: string, userId?: string) => Promise<void>;
  removeFromCollection: (watchId: string, userId?: string) => Promise<void>;
  moveToCollection: (watchId: string, userId?: string) => Promise<void>;
}

function mapLegacyWatch(w: Watch): WatchItem {
  return {
    id: w.id,
    brand: w.marca,
    model: w.nome,
    priceEstimate: typeof w.preco === 'number' ? `≈ R$ ${w.preco}` : `R$ ${w.preco.min}–R$ ${w.preco.max}`,
    specs: w.especificacoes,
    storeName: w.loja,
    storeUrl: w.url ?? null,
    images: w.imagem ? [w.imagem] : [],
  };
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  watches: initialLocalWatches.map(mapLegacyWatch),
  rankingIds: initialLocalWatches.map((w) => w.id),
  collectionIds: [],
  loading: false,
  syncError: false,

  loadData: async (userId) => {
    set({ loading: true, syncError: false });

    // Fallback se o Supabase não estiver configurado ou usuário não logado
    if (!isSupabaseConfigured) {
      set({ loading: false });
      return;
    }

    try {
      // 1. Carregar catálogo público e imagens
      const { data: dbWatches } = await supabase
        .from('watches')
        .select(`
          id, brand, model, reference, price_estimate, specs, store_name, store_url, created_at,
          watch_images ( image_url, display_order, is_cover )
        `)
        .order('brand', { ascending: true });

      if (dbWatches && dbWatches.length > 0) {
        const formatted: WatchItem[] = (dbWatches as (WatchRecord & { watch_images: { image_url: string; display_order: number }[] })[]).map((w) => ({
          id: w.id,
          brand: w.brand,
          model: w.model,
          priceEstimate: w.price_estimate,
          specs: w.specs,
          storeName: w.store_name,
          storeUrl: w.store_url,
          images: w.watch_images
            ? w.watch_images.sort((a, b) => a.display_order - b.display_order).map((img) => img.image_url)
            : [],
        }));
        set({ watches: formatted });
      }

      // 2. Se o usuário estiver logado, carregar seu ranking e coleção
      if (userId) {
        const [rankingRes, collectionRes] = await Promise.all([
          supabase.from('user_rankings').select('watch_id, position').eq('user_id', userId).order('position'),
          supabase.from('user_collections').select('watch_id').eq('user_id', userId),
        ]);

        if (rankingRes.data) {
          set({ rankingIds: rankingRes.data.map((r) => r.watch_id) });
        }
        if (collectionRes.data) {
          set({ collectionIds: collectionRes.data.map((c) => c.watch_id) });
        }
      }
    } catch {
      set({ syncError: true });
    } finally {
      set({ loading: false });
    }
  },

  addToRanking: async (watchId, userId) => {
    const current = get().rankingIds;
    if (current.includes(watchId)) return;

    const updated = [...current, watchId];
    set({ rankingIds: updated });

    if (userId && isSupabaseConfigured) {
      const position = updated.length;
      const { error } = await supabase.from('user_rankings').insert({
        user_id: userId,
        watch_id: watchId,
        position,
      });
      if (error) set({ syncError: true });
    }
  },

  removeFromRanking: async (watchId, userId) => {
    const current = get().rankingIds;
    const updated = current.filter((id) => id !== watchId);
    set({ rankingIds: updated });

    if (userId && isSupabaseConfigured) {
      await supabase.from('user_rankings').delete().eq('user_id', userId).eq('watch_id', watchId);
    }
  },

  reorderRanking: async (activeId, overId, userId) => {
    const current = get().rankingIds;
    const from = current.indexOf(activeId);
    const to = current.indexOf(overId);

    if (from < 0 || to < 0 || from === to) return;

    const newOrder = arrayMove(current, from, to);
    set({ rankingIds: newOrder });

    if (userId && isSupabaseConfigured) {
      try {
        const updates = newOrder.map((id, index) => ({
          user_id: userId,
          watch_id: id,
          position: index + 1,
        }));
        const { error } = await supabase.from('user_rankings').upsert(updates, { onConflict: 'user_id,watch_id' });
        if (error) set({ syncError: true });
      } catch {
        set({ syncError: true });
      }
    }
  },

  addToCollection: async (watchId, userId) => {
    const current = get().collectionIds;
    if (current.includes(watchId)) return;

    const updated = [...current, watchId];
    set({ collectionIds: updated });

    if (userId && isSupabaseConfigured) {
      const { error } = await supabase.from('user_collections').insert({
        user_id: userId,
        watch_id: watchId,
      });
      if (error) set({ syncError: true });
    }
  },

  removeFromCollection: async (watchId, userId) => {
    const current = get().collectionIds;
    const updated = current.filter((id) => id !== watchId);
    set({ collectionIds: updated });

    if (userId && isSupabaseConfigured) {
      await supabase.from('user_collections').delete().eq('user_id', userId).eq('watch_id', watchId);
    }
  },

  moveToCollection: async (watchId, userId) => {
    await get().removeFromRanking(watchId, userId);
    await get().addToCollection(watchId, userId);
  },
}));
```

- [ ] **Step 2: Verificar integridade do build com TypeScript**

Execute:
```powershell
npm run build
```

- [ ] **Step 3: Commitar store unificado**

Execute:
```powershell
git add src/store/catalogStore.ts
git commit -m "feat: add unified catalog and user state store with supabase sync"
```

---

### Task 6: Visualizações em Abas (Catálogo, Coleção e Ranking Atualizado)

**Files:**
- Create: `src/components/CatalogView.tsx`
- Create: `src/components/CollectionView.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: Visualização com abas operacionais (`ranking`, `collection`, `catalog`)
- Mantém: Compatibilidade com dnd-kit e responsividade mobile

- [ ] **Step 1: Criar componente `CatalogView.tsx`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\components\CatalogView.tsx`:
```tsx
import { ArrowUpRight, Plus, Check, Heart } from 'lucide-react';
import { WatchImageGallery } from './WatchImageGallery';
import type { WatchItem } from '../store/catalogStore';

interface CatalogViewProps {
  watches: WatchItem[];
  rankingIds: string[];
  collectionIds: string[];
  onAddToRanking: (id: string) => void;
  onAddToCollection: (id: string) => void;
  onRequireAuth: () => void;
  isAuthenticated: boolean;
}

export function CatalogView({
  watches,
  rankingIds,
  collectionIds,
  onAddToRanking,
  onAddToCollection,
  onRequireAuth,
  isAuthenticated,
}: CatalogViewProps) {
  return (
    <div className="catalog-grid">
      {watches.map((watch) => {
        const inRanking = rankingIds.includes(watch.id);
        const inCollection = collectionIds.includes(watch.id);

        return (
          <article key={watch.id} className="catalog-card">
            <div className="catalog-photo-wrap">
              <WatchImageGallery images={watch.images} alt={`${watch.brand} ${watch.model}`} />
            </div>

            <div className="catalog-content">
              <div className="brand-line">
                <span className="brand">{watch.brand}</span>
                <span className="catalog-price">{watch.priceEstimate}</span>
              </div>

              <h3 className="catalog-model">{watch.model}</h3>
              <p className="catalog-specs">{watch.specs}</p>

              <div className="catalog-actions">
                <button
                  type="button"
                  className={`action-btn ${inRanking ? 'active' : ''}`}
                  onClick={() => (isAuthenticated ? onAddToRanking(watch.id) : onRequireAuth())}
                  disabled={inRanking}
                >
                  {inRanking ? <Check size={14} /> : <Heart size={14} />}
                  {inRanking ? 'No Ranking' : '+ Ranking'}
                </button>

                <button
                  type="button"
                  className={`action-btn ${inCollection ? 'active' : ''}`}
                  onClick={() => (isAuthenticated ? onAddToCollection(watch.id) : onRequireAuth())}
                  disabled={inCollection}
                >
                  {inCollection ? <Check size={14} /> : <Plus size={14} />}
                  {inCollection ? 'Na Coleção' : '+ Coleção'}
                </button>

                {watch.storeUrl && (
                  <a
                    href={watch.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="catalog-link"
                  >
                    Ver Loja <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Criar componente `CollectionView.tsx`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\src\components\CollectionView.tsx`:
```tsx
import { Trash2, ArrowUpRight } from 'lucide-react';
import { WatchImageGallery } from './WatchImageGallery';
import type { WatchItem } from '../store/catalogStore';

interface CollectionViewProps {
  collectionWatches: WatchItem[];
  onRemove: (id: string) => void;
  onExploreCatalog: () => void;
}

export function CollectionView({ collectionWatches, onRemove, onExploreCatalog }: CollectionViewProps) {
  if (collectionWatches.length === 0) {
    return (
      <div className="empty-collection">
        <p>Sua coleção pessoal ainda não possui relógios adicionados.</p>
        <button type="button" className="btn-explore" onClick={onExploreCatalog}>
          Explorar Catálogo e Adicionar
        </button>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {collectionWatches.map((watch) => (
        <article key={watch.id} className="catalog-card">
          <div className="catalog-photo-wrap">
            <WatchImageGallery images={watch.images} alt={`${watch.brand} ${watch.model}`} />
          </div>

          <div className="catalog-content">
            <div className="brand-line">
              <span className="brand">{watch.brand}</span>
              <span className="catalog-price">{watch.priceEstimate}</span>
            </div>

            <h3 className="catalog-model">{watch.model}</h3>
            <p className="catalog-specs">{watch.specs}</p>

            <div className="catalog-actions">
              <button
                type="button"
                className="action-btn remove"
                onClick={() => onRemove(watch.id)}
              >
                <Trash2 size={14} /> Remover da Coleção
              </button>

              {watch.storeUrl && (
                <a
                  href={watch.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="catalog-link"
                >
                  Ver Loja <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Refatorar `src/App.tsx` para incorporar Abas, Auth e Visualizações**

Substitua o conteúdo de `src/App.tsx` com a versão unificada com suporte a abas e autenticação:
```tsx
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Check,
  GripVertical,
  Watch as WatchIcon,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

import { useAuthStore } from './store/authStore';
import { useCatalogStore, type WatchItem } from './store/catalogStore';
import { AuthModal } from './components/AuthModal';
import { CatalogView } from './components/CatalogView';
import { CollectionView } from './components/CollectionView';
import { WatchImageGallery } from './components/WatchImageGallery';

function WatchRankingCard({
  watch,
  index,
  count,
  onMove,
  onMoveToCollection,
  onRemove,
}: {
  watch: WatchItem;
  index: number;
  count: number;
  onMove: (delta: number) => void;
  onMoveToCollection: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: watch.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`watch-row ${isDragging ? 'dragging' : ''}`}
      data-watch-id={watch.id}
    >
      <div className="rank">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          aria-label={`Arrastar ${watch.model}`}
        >
          <GripVertical size={20} />
        </button>
      </div>

      <div className="watch-photo">
        <WatchImageGallery images={watch.images} alt={`${watch.brand} ${watch.model}`} />
      </div>

      <div className="watch-info">
        <div className="brand-line">
          <span className="brand">{watch.brand}</span>
          {index === 0 && <span className="priority">Próxima compra</span>}
        </div>
        <h3>{watch.model}</h3>
        <p className="specs">{watch.specs}</p>
        <div className="row-quick-actions">
          <button
            type="button"
            className="btn-quick-action"
            onClick={onMoveToCollection}
            title="Comprei! Mover para Minha Coleção"
          >
            <CheckCircle2 size={13} /> Comprei!
          </button>
          <button
            type="button"
            className="btn-quick-action remove"
            onClick={onRemove}
            title="Remover do ranking"
          >
            <Trash2 size={13} /> Remover
          </button>
        </div>
      </div>

      <div className="watch-value">
        <span className="price-label">Valor estimado</span>
        <p className="price">{watch.priceEstimate}</p>
        {watch.storeUrl ? (
          <a href={watch.storeUrl} target="_blank" rel="noopener noreferrer">
            Ver na {watch.storeName ?? 'loja'}
            <ArrowUpRight size={15} />
          </a>
        ) : (
          <span className="store-name">{watch.storeName ?? 'Loja'} · link em breve</span>
        )}
      </div>

      <div className="move-buttons">
        <button
          aria-label={`Subir ${watch.model}`}
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <ArrowUp size={16} />
        </button>
        <button
          aria-label={`Descer ${watch.model}`}
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          <ArrowDown size={16} />
        </button>
      </div>
    </li>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'ranking' | 'collection' | 'catalog'>('ranking');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const { user, checkSession, signOut } = useAuthStore();
  const {
    watches,
    rankingIds,
    collectionIds,
    syncError,
    loadData,
    reorderRanking,
    addToRanking,
    removeFromRanking,
    addToCollection,
    removeFromCollection,
    moveToCollection,
  } = useCatalogStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    loadData(user?.id);
  }, [user?.id, loadData]);

  const orderedRanking = rankingIds
    .map((id) => watches.find((w) => w.id === id))
    .filter((w): w is WatchItem => Boolean(w));

  const collectionWatches = collectionIds
    .map((id) => watches.find((w) => w.id === id))
    .filter((w): w is WatchItem => Boolean(w));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleMoveWatch(activeId: string, overId: string) {
    reorderRanking(activeId, overId, user?.id);
    const watch = watches.find((w) => w.id === activeId);
    if (watch) {
      setAnnouncement(`${watch.model} movido para nova posição.`);
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      handleMoveWatch(String(active.id), String(over.id));
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="WatchTracker início">
          <WatchIcon size={25} strokeWidth={1.6} />
          <span>
            Watch<span className="wordmark-light">Tracker</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Navegação principal">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            Meu Ranking <span className="tab-badge">{orderedRanking.length}</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            Minha Coleção <span className="tab-badge">{collectionWatches.length}</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Explorar Catálogo
          </button>
        </nav>

        <div className="header-auth">
          {user ? (
            <div className="user-profile">
              <span className="user-email" title={user.email}>
                <UserIcon size={14} />
                <span className="email-truncate">{user.email}</span>
              </span>
              <button
                type="button"
                className="btn-signout"
                onClick={() => signOut()}
                aria-label="Sair da conta"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-signin"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      <main id="main">
        {activeTab === 'ranking' && (
          <>
            <section className="intro">
              <div>
                <h1>
                  A próxima escolha.<br />
                  <span>No seu tempo.</span>
                </h1>
                <p>
                  Os relógios que merecem um lugar na coleção.<br className="desktop-break" />
                  Organize os favoritos e escolha o próximo.
                </p>
              </div>
              <div className="collection-note">
                <span className="note-line" />
                <p>
                  O melhor relógio é aquele<br />
                  que faz sentido para você.
                </p>
              </div>
            </section>

            <section aria-labelledby="ranking-title" className="ranking-section">
              <div className="ranking-toolbar">
                <div className="ranking-title">
                  <h2>Minha seleção</h2>
                  <span className="count">{orderedRanking.length}</span>
                </div>
                <span className="saved-status">
                  <Check size={14} />
                  {user ? 'Sincronizado na nuvem' : 'Salvo neste navegador'}
                </span>
              </div>
              <div className="list-caption">
                <p>Arraste pela alça para mudar a prioridade.</p>
                <span>Da próxima compra aos planos futuros</span>
              </div>

              {syncError && (
                <p role="alert" className="storage-alert">
                  Não foi possível salvar na nuvem. Verifique sua conexão.
                </p>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={rankingIds} strategy={verticalListSortingStrategy}>
                  <ol className="watch-list">
                    {orderedRanking.map((watch, index) => (
                      <WatchRankingCard
                        key={watch.id}
                        watch={watch}
                        index={index}
                        count={orderedRanking.length}
                        onMove={(delta) => {
                          const targetId = rankingIds[index + delta];
                          if (targetId) handleMoveWatch(watch.id, targetId);
                        }}
                        onMoveToCollection={() => moveToCollection(watch.id, user?.id)}
                        onRemove={() => removeFromRanking(watch.id, user?.id)}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>

              {!orderedRanking.length && (
                <div className="empty-state">
                  <p>Seu ranking está vazio.</p>
                  <button
                    type="button"
                    className="btn-explore"
                    onClick={() => setActiveTab('catalog')}
                  >
                    Navegar pelo Catálogo
                  </button>
                </div>
              )}
              <p className="sr-only" role="status">
                {announcement}
              </p>
            </section>
          </>
        )}

        {activeTab === 'collection' && (
          <section className="collection-section">
            <div className="ranking-toolbar">
              <div className="ranking-title">
                <h2>Minha Coleção</h2>
                <span className="count">{collectionWatches.length}</span>
              </div>
            </div>
            <CollectionView
              collectionWatches={collectionWatches}
              onRemove={(id) => removeFromCollection(id, user?.id)}
              onExploreCatalog={() => setActiveTab('catalog')}
            />
          </section>
        )}

        {activeTab === 'catalog' && (
          <section className="catalog-section">
            <div className="ranking-toolbar">
              <div className="ranking-title">
                <h2>Catálogo de Modelos</h2>
                <span className="count">{watches.length}</span>
              </div>
            </div>
            <CatalogView
              watches={watches}
              rankingIds={rankingIds}
              collectionIds={collectionIds}
              onAddToRanking={(id) => addToRanking(id, user?.id)}
              onAddToCollection={(id) => addToCollection(id, user?.id)}
              onRequireAuth={() => setIsAuthModalOpen(true)}
              isAuthenticated={Boolean(user)}
            />
          </section>
        )}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <footer>
        <span>
          <WatchIcon size={15} /> Escolher também faz parte da coleção.
        </span>
        <p>Valores aproximados, sujeitos a variação.</p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 4: Adicionar estilos para as abas, catálogo e coleção em `src/index.css`**

Adicione ao final de `src/index.css`:
```css
/* Navegação por Abas no Header */
.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-tab {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-muted, #a6aea6);
  padding: 6px 12px;
  border-radius: 6px;
  font-family: var(--font-display, "Manrope", sans-serif);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: var(--color-text, #f0f0e9);
  background-color: var(--color-surface, #1b201c);
}

.nav-tab.active {
  color: var(--color-accent, #c2ceab);
  background-color: var(--color-surface, #1b201c);
  border-color: var(--color-card-border, #30382f);
}

.tab-badge {
  background-color: var(--color-count-background, #2a3228);
  color: var(--color-accent, #c2ceab);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
}

/* Autenticação no Header */
.header-auth {
  display: flex;
  align-items: center;
}

.btn-signin {
  background-color: var(--color-surface, #1b201c);
  border: 1px solid var(--color-card-border, #30382f);
  color: var(--color-text, #f0f0e9);
  padding: 6px 14px;
  border-radius: 6px;
  font-family: var(--font-display, "Manrope", sans-serif);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-signin:hover {
  border-color: var(--color-accent, #c2ceab);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-surface, #1b201c);
  border: 1px solid var(--color-card-border, #30382f);
  padding: 4px 8px;
  border-radius: 6px;
}

.user-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-muted, #a6aea6);
  max-width: 140px;
}

.email-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-signout {
  background: transparent;
  border: none;
  color: var(--color-muted, #a6aea6);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.btn-signout:hover {
  color: #fca5a5;
}

/* Botões Rápidos no Card do Ranking */
.row-quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.btn-quick-action {
  background: transparent;
  border: 1px solid var(--color-tag-border, #424b40);
  color: var(--color-tag-text, #c3cbc1);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}

.btn-quick-action:hover {
  background-color: var(--color-control-hover, #364032);
  color: var(--color-control-hover-text, #eff2e7);
}

.btn-quick-action.remove:hover {
  border-color: rgba(220, 38, 38, 0.4);
  color: #fca5a5;
}

/* Grids do Catálogo e Coleção */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.catalog-card {
  background-color: var(--color-surface, #1b201c);
  border: 1px solid var(--color-card-border, #30382f);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.catalog-photo-wrap {
  width: 100%;
  height: 200px;
  background-color: var(--color-photo-background, #141915);
}

.catalog-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.catalog-price {
  font-family: var(--font-display, "Manrope", sans-serif);
  font-size: 14px;
  color: var(--color-accent, #c2ceab);
}

.catalog-model {
  font-family: var(--font-display, "Manrope", sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text, #f0f0e9);
  margin: 6px 0;
}

.catalog-specs {
  font-size: 13px;
  color: var(--color-muted, #a6aea6);
  line-height: 1.5;
  flex: 1;
  margin-bottom: 16px;
}

.catalog-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--color-line, #313731);
}

.action-btn {
  background-color: var(--color-background, #131614);
  border: 1px solid var(--color-card-border, #30382f);
  color: var(--color-text, #f0f0e9);
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}

.action-btn:hover:not(:disabled) {
  border-color: var(--color-accent, #c2ceab);
}

.action-btn.active {
  background-color: var(--color-priority-background, #36422e);
  color: var(--color-priority-text, #d5e3c4);
  border-color: var(--color-priority-border, #59654e);
}

.action-btn.remove {
  color: #fca5a5;
}

.catalog-link {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-muted, #a6aea6);
  display: flex;
  align-items: center;
  gap: 2px;
  text-decoration: none;
}

.catalog-link:hover {
  color: var(--color-accent, #c2ceab);
  text-decoration: underline;
}

.empty-collection, .empty-state {
  padding: 48px 16px;
  text-align: center;
  color: var(--color-muted, #a6aea6);
}

.btn-explore {
  margin-top: 12px;
  background-color: var(--color-priority-background, #36422e);
  color: var(--color-priority-text, #d5e3c4);
  border: 1px solid var(--color-priority-border, #59654e);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
```

- [ ] **Step 5: Executar build para validar tipagem e empacotamento**

Execute:
```powershell
npm run build
```

- [ ] **Step 6: Commitar interface das abas e catálogo**

Execute:
```powershell
git add src/components/CatalogView.tsx src/components/CollectionView.tsx src/App.tsx src/index.css
git commit -m "feat: add tab navigation, catalog view, collection view and header auth"
```

---

### Task 7: Configuração de Deploy para Vercel e Validação E2E

**Files:**
- Create: `vercel.json`
- Modify: `tests/ranking.spec.ts`

**Interfaces:**
- Produces: `vercel.json` garantindo SPA routing correto em produção
- Valida: Testes automatizados passando no Playwright

- [ ] **Step 1: Criar arquivo de configuração `vercel.json`**

Crie o arquivo `C:\Users\iuryc\projects\watchtracker\vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Atualizar testes em `tests/ranking.spec.ts` para validar navegação em abas**

Atualize `tests/ranking.spec.ts` com verificações das novas abas:
```typescript
import { test, expect } from '@playwright/test';

test('carrega a aba Meu Ranking por padrão e permite alternar para o Catálogo', async ({ page }) => {
  await page.goto('/');

  // Verifica se a aba Meu Ranking está ativa
  await expect(page.getByRole('button', { name: /Meu Ranking/ })).toBeVisible();

  // Alterna para Explorar Catálogo
  await page.getByRole('button', { name: 'Explorar Catálogo' }).click();

  // Verifica título do catálogo
  await expect(page.getByRole('heading', { name: 'Catálogo de Modelos' })).toBeVisible();

  // Alterna para Minha Coleção
  await page.getByRole('button', { name: /Minha Coleção/ })).click();
  await expect(page.getByRole('heading', { name: 'Minha Coleção' })).toBeVisible();
});

test('botão de entrar abre o modal de autenticação', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Acessar Conta' })).toBeVisible();

  // Fecha o modal
  await page.getByLabel('Fechar modal').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

- [ ] **Step 3: Rodar os testes no Playwright**

Execute:
```powershell
npx playwright test
```
Resultado esperado: Testes passam com sucesso.

- [ ] **Step 4: Commitar configuração da Vercel e testes**

Execute:
```powershell
git add vercel.json tests/ranking.spec.ts
git commit -m "chore: add vercel configuration and update e2e tests for tabs and auth"
```
