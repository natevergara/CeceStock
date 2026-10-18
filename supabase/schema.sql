-- ==============================================================================
-- CECESTOCK: ESQUEMA DE INVENTARIO FÍSICO RÁPIDO (CECE BOUTIQUE)
-- ==============================================================================

-- TABLA: CONTEOS DE INVENTARIO
CREATE TABLE IF NOT EXISTS public.inventory_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    color_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS Y POLÍTICAS DE ACCESO
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública inventory_counts') THEN
        CREATE POLICY "Lectura pública inventory_counts" ON public.inventory_counts FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Escritura pública inventory_counts') THEN
        CREATE POLICY "Escritura pública inventory_counts" ON public.inventory_counts FOR ALL USING (true);
    END IF;
END $$;
