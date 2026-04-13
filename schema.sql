-- ============================================================
--  ESQUEMA POSTGRESQL - SISTEMA DE LOTIZACIÓN
-- ============================================================

-- Extensión para UUIDs (opcional, si preferís UUID sobre serial)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  TABLA: usuarios
--  Vendedores/admin que operan el sistema
-- ============================================================
CREATE TABLE usuarios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  rol         VARCHAR(20)  NOT NULL DEFAULT 'vendedor', -- admin | vendedor
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLA: lotizaciones
--  Permite manejar varios proyectos/urbanizaciones
-- ============================================================
CREATE TABLE lotizaciones (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT,
  svg_path    VARCHAR(300),           -- ruta al archivo SVG en el servidor
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TIPO ENUM: estado_lote
-- ============================================================
CREATE TYPE estado_lote AS ENUM ('disponible', 'reservado', 'vendido');

-- ============================================================
--  TABLA: lotes
--  Un lote por cada <path> o <rect> con id en el SVG
-- ============================================================
CREATE TABLE lotes (
  id              VARCHAR(30)   PRIMARY KEY,  -- coincide con id del SVG: "lote_001"
  lotizacion_id   INTEGER       NOT NULL REFERENCES lotizaciones(id) ON DELETE CASCADE,
  estado          estado_lote   NOT NULL DEFAULT 'disponible',
  precio          NUMERIC(12,2),              -- precio actual o de venta
  monto_reserva   NUMERIC(12,2),              -- cuánto pagó para reservar
  comprador       VARCHAR(200),               -- nombre del comprador
  telefono        VARCHAR(30),                -- contacto
  cedula          VARCHAR(20),                -- cédula/RUC del comprador
  notas           TEXT,                       -- notas internas del vendedor
  area_m2         NUMERIC(10,2),              -- área del lote en m²
  updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLA: lotes_historial
--  Registro inmutable de cada cambio de estado
-- ============================================================
CREATE TABLE lotes_historial (
  id              SERIAL        PRIMARY KEY,
  lote_id         VARCHAR(30)   NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  estado_anterior estado_lote,
  estado_nuevo    estado_lote   NOT NULL,
  precio          NUMERIC(12,2),
  monto_reserva   NUMERIC(12,2),
  comprador       VARCHAR(200),
  telefono        VARCHAR(30),
  cedula          VARCHAR(20),
  notas           TEXT,
  usuario_id      INTEGER       REFERENCES usuarios(id),
  fecha           TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX idx_lotes_lotizacion   ON lotes (lotizacion_id);
CREATE INDEX idx_lotes_estado       ON lotes (estado);
CREATE INDEX idx_historial_lote     ON lotes_historial (lote_id);
CREATE INDEX idx_historial_fecha    ON lotes_historial (fecha DESC);

-- ============================================================
--  FUNCIÓN + TRIGGER: auto-guardar historial en cada UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION fn_lotes_historial()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registra si hubo cambio real
  IF OLD.estado <> NEW.estado
     OR OLD.precio IS DISTINCT FROM NEW.precio
     OR OLD.comprador IS DISTINCT FROM NEW.comprador
  THEN
    INSERT INTO lotes_historial (
      lote_id, estado_anterior, estado_nuevo,
      precio, monto_reserva, comprador, telefono, cedula, notas
    ) VALUES (
      OLD.id, OLD.estado, NEW.estado,
      NEW.precio, NEW.monto_reserva, NEW.comprador,
      NEW.telefono, NEW.cedula, NEW.notas
    );
  END IF;

  -- Actualiza el timestamp automáticamente
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lotes_historial
  BEFORE UPDATE ON lotes
  FOR EACH ROW EXECUTE FUNCTION fn_lotes_historial();

-- ============================================================
--  DATOS DE EJEMPLO
-- ============================================================
INSERT INTO lotizaciones (nombre, descripcion, svg_path)
VALUES ('Urbanización El Pinar', 'Lotización sur de la ciudad', '/assets/planos/el_pinar.svg');

INSERT INTO usuarios (nombre, email, rol)
VALUES ('Admin', 'admin@empresa.com', 'admin'),
       ('Juan Pérez', 'juan@empresa.com', 'vendedor');

-- Lotes de ejemplo (ajustá los ids para que coincidan con tu SVG)
INSERT INTO lotes (id, lotizacion_id, estado, area_m2)
SELECT
  'lote_' || LPAD(n::TEXT, 3, '0'),
  1,
  'disponible',
  200.00
FROM generate_series(1, 20) AS n;

-- Simular un lote vendido y uno reservado
UPDATE lotes SET
  estado = 'vendido',
  precio = 80000,
  comprador = 'María García',
  cedula = '0912345678',
  telefono = '0991234567'
WHERE id = 'lote_003';

UPDATE lotes SET
  estado = 'reservado',
  monto_reserva = 1000,
  precio = 75000,
  comprador = 'Carlos López',
  telefono = '0987654321'
WHERE id = 'lote_007';

-- ============================================================
--  VISTAS ÚTILES
-- ============================================================

-- Resumen del estado de la lotización
CREATE VIEW v_resumen_lotizacion AS
SELECT
  l.nombre AS lotizacion,
  COUNT(*) AS total_lotes,
  COUNT(*) FILTER (WHERE lo.estado = 'disponible')  AS disponibles,
  COUNT(*) FILTER (WHERE lo.estado = 'reservado')   AS reservados,
  COUNT(*) FILTER (WHERE lo.estado = 'vendido')     AS vendidos,
  COALESCE(SUM(lo.precio) FILTER (WHERE lo.estado = 'vendido'), 0) AS total_vendido
FROM lotizaciones l
JOIN lotes lo ON lo.lotizacion_id = l.id
GROUP BY l.id, l.nombre;

-- Historial completo con nombre de usuario
CREATE VIEW v_historial_completo AS
SELECT
  h.fecha,
  h.lote_id,
  h.estado_anterior,
  h.estado_nuevo,
  h.precio,
  h.monto_reserva,
  h.comprador,
  h.notas,
  u.nombre AS vendedor
FROM lotes_historial h
LEFT JOIN usuarios u ON u.id = h.usuario_id
ORDER BY h.fecha DESC;
