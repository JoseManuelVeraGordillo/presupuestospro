'use strict';

const { obtenerConexion } = require('../db/conexion');

function siguienteNumero(anio) {
  const db = obtenerConexion();

  db.exec('BEGIN IMMEDIATE');
  try {
    const fila = db.prepare('SELECT ultimo_numero FROM contadores_numeracion WHERE anio = ?').get(anio);
    const ultimoNumero = fila ? fila.ultimo_numero : 0;
    const nuevoNumero = ultimoNumero + 1;

    if (fila) {
      db.prepare('UPDATE contadores_numeracion SET ultimo_numero = ? WHERE anio = ?').run(nuevoNumero, anio);
    } else {
      db.prepare('INSERT INTO contadores_numeracion (anio, ultimo_numero) VALUES (?, ?)').run(anio, nuevoNumero);
    }

    db.exec('COMMIT');
    return `${anio}-${String(nuevoNumero).padStart(3, '0')}`;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = { siguienteNumero };
