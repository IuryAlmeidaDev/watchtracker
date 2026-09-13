# WatchTracker — Integração Backend Supabase (Auth, Database & Storage) e Deploy Vercel

**Data:** 2026-09-13  
**Status:** Aprovado para Planejamento  
**Projeto:** WatchTracker (`C:\Users\iuryc\projects\watchtracker`)

---

## 1. Visão Geral e Objetivos

Evoluir o WatchTracker de uma aplicação React estática com persistência exclusivamente local para uma aplicação web completa, suportada pelo **Supabase** como Backend-as-a-Service e hospedada na **Vercel**.

### Objetivos Principais:
1. **Autenticação de Usuários:** Cadastro e login via Email e Senha utilizando Supabase Auth.
2. **Catálogo Centralizado de Relógios:** Modelos gerenciados e cadastrados pelo desenvolvedor via scripts e banco de dados, com suporte a múltiplas fotos por modelo.
3. **Storage de Imagens:** Armazenamento otimizado de fotografias de alta qualidade no Supabase Storage.
4. **Duas Áreas Pessoais para o Usuário:**
   - **Meu Ranking:** Lista pessoal priorizada dos próximos relógios desejados com ordenação interativa (drag-and-drop).
   - **Minha Coleção:** Vitrine dos relógios que o usuário já possui.
5. **Explorar / Catálogo Geral:** Interface em abas para navegar por todos os modelos cadastrados, alternar fotos e adicionar diretamente às suas listas pessoais.

---

## 2. Arquitetura de Dados (PostgreSQL no Supabase)

### 2.1. Tabelas

#### `watches` (Catálogo Global mantido pelo Administrador/Dev)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `brand`: `TEXT NOT NULL` (ex: "Seiko")
- `model`: `TEXT NOT NULL` (ex: "Presage Cocktail Time")
- `reference`: `TEXT` (ex: "SRPB43J1")
- `price_estimate`: `TEXT NOT NULL` (ex: "R$ 2.500 - R$ 3.000")
- `specs`: `JSONB DEFAULT '{}'::jsonb` (movimento, caixa, resistência, etc.)
- `store_url`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

#### `watch_images` (Múltiplas Fotos por Relógio)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `watch_id`: `UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE`
- `image_url`: `TEXT NOT NULL`
- `display_order`: `INTEGER NOT NULL DEFAULT 0`
- `is_cover`: `BOOLEAN NOT NULL DEFAULT false`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`

#### `user_rankings` (Ranking Pessoal de Próximos Relógios)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `watch_id`: `UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE`
- `position`: `INTEGER NOT NULL` (1 para o topo da lista de desejos)
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ DEFAULT now()`
- *Constraint:* `UNIQUE (user_id, watch_id)`

#### `user_collections` (Minha Coleção — Relógios Adquiridos)
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `watch_id`: `UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE`
- `acquired_at`: `TIMESTAMPTZ DEFAULT now()`
- `created_at`: `TIMESTAMPTZ DEFAULT now()`
- *Constraint:* `UNIQUE (user_id, watch_id)`

---

## 3. Segurança e Políticas de Acesso (Row Level Security - RLS)

Todas as tabelas terão **Row Level Security (RLS)** habilitado:

1. **`watches` e `watch_images`:**
   - `SELECT`: Liberado para usuários anônimos e autenticados (`anon`, `authenticated`).
   - `INSERT`, `UPDATE`, `DELETE`: Bloqueado para usuários comuns; permitido apenas via `service_role` (scripts do desenvolvedor).
2. **`user_rankings` e `user_collections`:**
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Permitido exclusivamente onde `auth.uid() = user_id`.
3. **Supabase Storage Bucket (`watch-photos`):**
   - Bucket configurado como **público para leitura** (URLs diretas de CDN).
   - Upload, remoção e substituição de arquivos restritos a chaves administrativas (`service_role`).

---

## 4. Estrutura do Front-end (React + Vite)

### 4.1. Navegação e Layout
- **Barra Superior (Header):**
  - Identidade visual WatchTracker.
  - Abas de alternância de visualização:
    1. **Meu Ranking** (com badge indicando total de itens)
    2. **Minha Coleção** (com badge indicando total de itens)
    3. **Catálogo / Explorar** (visão geral dos relógios disponíveis)
  - Botão de Ação de Conta: "Entrar" para visitantes ou "Email / Sair" para usuários logados.

### 4.2. Componentes e Funcionalidades por Aba
- **Meu Ranking:**
  - Lista vertical com drag-and-drop (`dnd-kit`) e botões acessíveis para subir/descer posições.
  - Posição `#01` com estilo de destaque de "Próxima Aquisição".
  - Ação de remover do ranking.
  - Ação *"Mover para Minha Coleção"* (remove do ranking e adiciona à coleção).
- **Minha Coleção:**
  - Grid de cards elegantes exibindo os relógios que o usuário já possui.
  - Ação de remover da coleção.
- **Catálogo / Explorar:**
  - Vitrine completa dos relógios cadastrados no banco.
  - Galeria de múltiplas fotos em cada cartão (navegação por carrossel ou miniaturas).
  - Indicadores de status: se o modelo já está no ranking ou na coleção do usuário.
  - Botões de ação rápida: `+ Adicionar ao Ranking` e `+ Adicionar à Coleção`.

### 4.3. Autenticação na Interface
- Modal limpo e responsivo com abas "Entrar" e "Criar Conta".
- Validação de campos (email e senha mínima).
- Fechamento com tecla Escape ou clique fora.
- Feedback imediato de erros (ex: credenciais inválidas).

---

## 5. Automação do Desenvolvedor (Seed & Fotos)

- Criação de um script Node/TypeScript (`scripts/seed-catalog.ts` ou similar).
- O desenvolvedor organiza os dados e fotos na pasta local (ex: `assets/watches/`).
- O script lê os metadados, faz upload das fotos para o bucket `watch-photos` no Supabase Storage e insere ou atualiza os registros correspondentes na tabela `watches` e `watch_images`.

---

## 6. Configuração de Ambiente e Deploy

### 6.1. Variáveis de Ambiente
- `VITE_SUPABASE_URL`: Endpoint da API do projeto no Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave pública para o cliente frontend.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave privada exclusiva para o script local de seed/upload (nunca exposta no frontend).

### 6.2. Deploy na Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Criação de `vercel.json` para regras de reescrita SPA garantindo roteamento sem 404.
