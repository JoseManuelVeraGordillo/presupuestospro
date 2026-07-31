'use strict';

const { obtenerConexion } = require('../db/conexion');

function filaACliente(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    tipo: fila.tipo,
  };
}

function listarClientes() {
  const db = obtenerConexion();
  return db.prepare('SELECT * FROM clientes ORDER BY nombre').all().map(filaACliente);
}

function obtenerCliente(id) {
  const db = obtenerConexion();
  const fila = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  if (!fila) return null;
  return filaACliente(fila);
}

function crearCliente(datos) {
  const db = obtenerConexion();
  const resultado = db
    .prepare('INSERT INTO clientes (nombre, tipo) VALUES (?, ?)')
    .run(datos.nombre, datos.tipo);
  return obtenerCliente(Number(resultado.lastInsertRowid));
}

function actualizarCliente(id, datos) {
  const db = obtenerConexion();
  const existente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(id);
  if (!existente) return null;

  db.prepare('UPDATE clientes SET nombre = ?, tipo = ? WHERE id = ?').run(datos.nombre, datos.tipo, id);
  return obtenerCliente(id);
}

function eliminarCliente(id) {
  const db = obtenerConexion();
  const resultado = db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  return resultado.changes > 0;
}

module.exports = { listarClientes, obtenerCliente, crearCliente, actualizarCliente, eliminarCliente };
