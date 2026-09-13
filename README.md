# WatchTracker

> **Sua próxima escolha, no seu tempo.** Organize seu ranking pessoal de relógios, acompanhe sua coleção e explore modelos com múltiplas fotos.

🌐 **Acesse a aplicação em produção:**  
👉 **[https://watchtracker-roan.vercel.app](https://watchtracker-roan.vercel.app)**

---

## 🚀 Tecnologias

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Embla Carousel
- **Interatividade & Drag-and-Drop:** `@dnd-kit/core` e `@dnd-kit/sortable`
- **Gerenciamento de Estado:** Zustand
- **Backend & Banco de Dados:** Supabase (PostgreSQL com Row Level Security - RLS)
- **Autenticação:** Supabase Auth (Email e Senha com isolamento por usuário)
- **Armazenamento de Imagens:** Supabase Storage (Bucket público `watch-photos`)
- **Testes & Qualidade:** Playwright E2E
- **Hospedagem & CI/CD:** Vercel

---

## 📱 Funcionalidades

1. **Meu Ranking (Próximas Compras):**
   - Reordenação interativa por arrastar (drag-and-drop) ou botões acessíveis de subir/descer.
   - Posição `#01` destacada como "Próxima compra".
   - Botão rápido *"Comprei!"* que move o relógio diretamente para a sua coleção pessoal.
   - Sincronização automática na nuvem para usuários logados.

2. **Minha Coleção (Relógios Adquiridos):**
   - Vitrine dedicada com os modelos que já fazem parte da sua coleção pessoal.
   - Opção de remover relógio da coleção.

3. **Explorar Catálogo:**
   - Vitrine completa de relógios disponíveis com dados detalhados (marca, especificações, faixa de preço e links de lojas).
   - **Galeria de múltiplas fotos:** navegue entre diferentes ângulos dos relógios.
   - Ações rápidas para adicionar ao Ranking ou à Coleção com 1 clique.

4. **Autenticação Segura:**
   - Modal elegante de login e cadastro com validação de credenciais.
   - Modo visitante disponível para explorar o catálogo livremente.

---

## 🛠️ Como Rodar Localmente

### 1. Clonar o repositório
```sh
git clone https://github.com/IuryAlmeidaDev/watchtracker.git
cd watchtracker
```

### 2. Instalar dependências
```sh
npm install
```
*(No Windows PowerShell com scripts restritos, use `npm.cmd`)*

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada
```

### 4. Iniciar o servidor de desenvolvimento
```sh
npm run dev
```
Acesse em: `http://localhost:5173`

---

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor local do Vite.
- `npm run build`: Compila TypeScript e gera o bundle de produção em `dist/`.
- `npm test`: Executa os testes automatizados E2E no Playwright.
- `npm run seed`: Script para o desenvolvedor popular o catálogo no Supabase e fazer upload das fotos locais para o Supabase Storage.

---

## 🌐 Deploy na Vercel

O projeto conta com arquivo [`vercel.json`](./vercel.json) configurado para roteamento SPA e cache otimizado de assets estáticos.

Variáveis necessárias na Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
