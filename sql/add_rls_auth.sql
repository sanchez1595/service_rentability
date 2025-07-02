-- Agregar columna user_id a todas las tablas si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE metas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar RLS (Row Level Security) en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para productos
CREATE POLICY "Users can view their own productos"
  ON productos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productos"
  ON productos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productos"
  ON productos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own productos"
  ON productos FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas para ventas
CREATE POLICY "Users can view their own ventas"
  ON ventas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ventas"
  ON ventas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ventas"
  ON ventas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ventas"
  ON ventas FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas para configuracion
CREATE POLICY "Users can view their own configuracion"
  ON configuracion FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configuracion"
  ON configuracion FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuracion"
  ON configuracion FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configuracion"
  ON configuracion FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas para metas
CREATE POLICY "Users can view their own metas"
  ON metas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metas"
  ON metas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metas"
  ON metas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metas"
  ON metas FOR DELETE
  USING (auth.uid() = user_id);

-- Crear políticas para alertas
CREATE POLICY "Users can view their own alertas"
  ON alertas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alertas"
  ON alertas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alertas"
  ON alertas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alertas"
  ON alertas FOR DELETE
  USING (auth.uid() = user_id);

-- Función para asignar automáticamente el user_id en inserts
CREATE OR REPLACE FUNCTION assign_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers para asignar automáticamente el user_id
CREATE TRIGGER set_user_id_productos
  BEFORE INSERT ON productos
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_id();

CREATE TRIGGER set_user_id_ventas
  BEFORE INSERT ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_id();

CREATE TRIGGER set_user_id_configuracion
  BEFORE INSERT ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_id();

CREATE TRIGGER set_user_id_metas
  BEFORE INSERT ON metas
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_id();

CREATE TRIGGER set_user_id_alertas
  BEFORE INSERT ON alertas
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_id(); 