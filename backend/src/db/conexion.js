'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

let instancia = null;

function obtenerConexion() {
  if (instancia) return instancia;

  const rutaBd = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'presupuestospro.db');
  fs.mkdirSync(path.dirname(rutaBd), { recursive: true });

  instancia = new DatabaseSync(rutaBd);
  instancia.exec('PRAGMA foreign_keys = ON');
  return instancia;
}

function cerrarConexion() {
  if (instancia) {
    instancia.close();
    instancia = null;
  }
}

module.exports = { obtenerConexion, cerrarConexion };
