'use strict';

const archiver = require('archiver');
const { listarPresupuestos, obtenerPresupuesto } = require('../models/presupuestos');
const { obtenerPerfil } = require('../models/perfil');
const { listarCatalogo } = require('../models/catalogo');
const { listarClientes } = require('../models/clientes');
const { generarPdf } = require('./generarPdf');

const CARACTERES_INVALIDOS = /[\\/:*?"<>|\x00-\x1f]/g;

function limpiarNombreArchivo(texto) {
  const limpio = String(texto ?? '').replace(CARACTERES_INVALIDOS, '').trim();
  return limpio || 'sin-nombre';
}

function construirNombrePdf(numero, clienteNombre, nombresUsados) {
  const base = `${numero} - ${limpiarNombreArchivo(clienteNombre)}`;
  let nombre = `${base}.pdf`;
  let sufijo = 2;
  while (nombresUsados.has(nombre)) {
    nombre = `${base} (${sufijo}).pdf`;
    sufijo += 1;
  }
  nombresUsados.add(nombre);
  return nombre;
}

function construirArchivoDatos({ perfil, catalogo, clientes, presupuestos }) {
  const datos = {
    generadoEn: new Date().toISOString(),
    perfil: perfil ?? null,
    catalogo,
    clientes,
    presupuestos,
  };
  return JSON.stringify(datos, null, 2);
}

function fechaHoyIso() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function nombreZip() {
  return `presupuestospro-copia-${fechaHoyIso()}.zip`;
}

async function generarZipExportacion() {
  const resumenes = [...listarPresupuestos()].sort((a, b) => a.numero.localeCompare(b.numero));

  const archive = archiver('zip', { zlib: { level: 9 } });
  const nombresUsados = new Set();
  const omitidos = [];
  const presupuestosIncluidos = [];

  for (const resumen of resumenes) {
    const presupuesto = obtenerPresupuesto(resumen.id);
    try {
      const pdfBuffer = await generarPdf(presupuesto);
      const nombrePdf = construirNombrePdf(presupuesto.numero, presupuesto.clienteNombre, nombresUsados);
      archive.append(pdfBuffer, { name: nombrePdf });
      presupuestosIncluidos.push(presupuesto);
    } catch (error) {
      omitidos.push(presupuesto.numero);
    }
  }

  const archivoDatos = construirArchivoDatos({
    perfil: obtenerPerfil(),
    catalogo: listarCatalogo(),
    clientes: listarClientes(),
    presupuestos: presupuestosIncluidos,
  });
  archive.append(archivoDatos, { name: 'datos-presupuestospro.json' });
  archive.finalize();

  return { archive, omitidos };
}

module.exports = {
  limpiarNombreArchivo,
  construirNombrePdf,
  construirArchivoDatos,
  generarZipExportacion,
  nombreZip,
};
