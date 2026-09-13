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
