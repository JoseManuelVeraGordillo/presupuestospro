'use strict';

function columnaExiste(db, tabla, columna) {
  const columnas = db.prepare(`PRAGMA table_info(${tabla})`).all();
  return columnas.some((c) => c.name === columna);
}

function ejecutarMigraciones(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS perfil (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nombre TEXT NOT NULL,
      nif TEXT NOT NULL,
      contacto TEXT,
      logo BLOB
    );

    CREATE TABLE IF NOT EXISTS catalogo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio_por_defecto REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL UNIQUE,
      fecha_emision TEXT NOT NULL,
      cliente_nombre TEXT NOT NULL,
      cliente_tipo TEXT NOT NULL CHECK (cliente_tipo IN ('empresa_autonomo', 'particular')),
      tipo_iva INTEGER NOT NULL CHECK (tipo_iva IN (21, 10, 4, 0)),
      retencion_irpf TEXT NOT NULL CHECK (retencion_irpf IN ('ninguna', '15', '7'))
    );

    CREATE TABLE IF NOT EXISTS lineas_presupuesto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      presupuesto_id INTEGER NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
      descripcion TEXT NOT NULL,
      cantidad REAL NOT NULL,
      precio_unitario REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contadores_numeracion (
      anio INTEGER PRIMARY KEY,
      ultimo_numero INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('empresa_autonomo', 'particular'))
    );
  `);

  if (!columnaExiste(db, 'presupuestos', 'estado')) {
    db.exec(`
      ALTER TABLE presupuestos ADD COLUMN estado TEXT NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado'));
    `);
  }
}

module.exports = { ejecutarMigraciones };
