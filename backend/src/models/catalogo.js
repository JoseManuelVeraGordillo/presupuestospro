'use strict';

const { obtenerConexion } = require('../db/conexion');

function filaAServicio(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    precioPorDefecto: fila.precio_por_defecto,
  };
}

function listarCatalogo() {
  const db = obtenerConexion();
  return db.prepare('SELECT * FROM catalogo ORDER BY nombre').all().map(filaAServicio);
}

function crearServicio(datos) {
  const db = obtenerConexion();
  const resultado = db
    .prepare('INSERT INTO catalogo (nombre, precio_por_defecto) VALUES (?, ?)')
    .run(datos.nombre, datos.precioPorDefecto);
  const fila = db.prepare('SELECT * FROM catalogo WHERE id = ?').get(Number(resultado.lastInsertRowid));
  return filaAServicio(fila);
}

function actualizarServicio(id, datos) {
  const db = obtenerConexion();
  const existente = db.prepare('SELECT id FROM catalogo WHERE id = ?').get(id);
  if (!existente) return null;

  db.prepare('UPDATE catalogo SET nombre = ?, precio_por_defecto = ? WHERE id = ?').run(
    datos.nombre,
    datos.precioPorDefecto,
    id
  );
  const fila = db.prepare('SELECT * FROM catalogo WHERE id = ?').get(id);
  return filaAServicio(fila);
}

function eliminarServicio(id) {
  const db = obtenerConexion();
  const resultado = db.prepare('DELETE FROM catalogo WHERE id = ?').run(id);
  return resultado.changes > 0;
}

module.exports = { listarCatalogo, crearServicio, actualizarServicio, eliminarServicio };
