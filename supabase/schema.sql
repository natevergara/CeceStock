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
-- La app solo necesita CONSULTAR e INSERTAR conteos: no se permite UPDATE ni DELETE.
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;

-- Política antigua (FOR ALL) que permitía modificar y borrar con la anon key.
DROP POLICY IF EXISTS "Escritura pública inventory_counts" ON public.inventory_counts;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública inventory_counts') THEN
        CREATE POLICY "Lectura pública inventory_counts" ON public.inventory_counts FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Inserción pública inventory_counts') THEN
        CREATE POLICY "Inserción pública inventory_counts" ON public.inventory_counts FOR INSERT WITH CHECK (true);
    END IF;
END $$;
