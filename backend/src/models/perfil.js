'use strict';

const { obtenerConexion } = require('../db/conexion');

function bufferABase64Png(buffer) {
  if (!buffer) return null;
  return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
}

function base64PngABuffer(logo) {
  if (!logo) return null;
  const base64 = logo.includes(',') ? logo.split(',')[1] : logo;
  return Buffer.from(base64, 'base64');
}

function obtenerPerfil() {
  const db = obtenerConexion();
  const fila = db.prepare('SELECT nombre, nif, contacto, logo FROM perfil WHERE id = 1').get();
  if (!fila) return null;
  return {
    nombre: fila.nombre,
    nif: fila.nif,
    contacto: fila.contacto ?? null,
    logo: bufferABase64Png(fila.logo),
  };
}

function guardarPerfil(datos) {
  const db = obtenerConexion();
  db.prepare(
    `INSERT INTO perfil (id, nombre, nif, contacto, logo)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       nombre = excluded.nombre,
       nif = excluded.nif,
       contacto = excluded.contacto,
       logo = excluded.logo`
  ).run(datos.nombre, datos.nif, datos.contacto ?? null, base64PngABuffer(datos.logo));
  return obtenerPerfil();
}

module.exports = { obtenerPerfil, guardarPerfil };
