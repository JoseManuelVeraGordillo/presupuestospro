'use strict';

const express = require('express');
const {
  listarPresupuestos,
  obtenerPresupuesto,
  crearPresupuesto,
  actualizarPresupuesto,
  cambiarEstadoPresupuesto,
  eliminarPresupuesto,
} = require('../models/presupuestos');
const { generarPdf } = require('../services/generarPdf');
const { generarZipExportacion, nombreZip } = require('../services/exportarZip');

const router = express.Router();

const CLIENTE_TIPOS = ['empresa_autonomo', 'particular'];
const TIPOS_IVA = [21, 10, 4, 0];
const RETENCIONES = ['ninguna', 15, 7];
const ESTADOS = ['borrador', 'enviado', 'aceptado', 'rechazado'];

function validarDatosPresupuesto(body) {
  if (!body.clienteNombre || typeof body.clienteNombre !== 'string') {
    return 'clienteNombre es obligatorio';
  }
  if (!CLIENTE_TIPOS.includes(body.clienteTipo)) {
    return `clienteTipo debe ser uno de: ${CLIENTE_TIPOS.join(', ')}`;
  }
  if (!TIPOS_IVA.includes(body.tipoIva)) {
    return `tipoIva debe ser uno de: ${TIPOS_IVA.join(', ')}`;
  }
  if (!RETENCIONES.includes(body.retencionIrpf)) {
    return `retencionIrpf debe ser uno de: ${RETENCIONES.join(', ')}`;
  }
  if (body.lineas !== undefined && !Array.isArray(body.lineas)) {
    return 'lineas debe ser un array';
  }
  return null;
}

router.get('/', (req, res) => {
  res.json(listarPresupuestos());
});

router.get('/exportar', async (req, res, next) => {
  try {
    if (listarPresupuestos().length === 0) {
      return res.status(409).json({ error: 'No hay presupuestos guardados para exportar.' });
    }
    const { archive, omitidos } = await generarZipExportacion();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreZip()}"`);
    if (omitidos.length > 0) {
      res.setHeader('X-Presupuestos-Omitidos', omitidos.join(','));
    }
    archive.on('error', next);
    archive.pipe(res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const presupuesto = obtenerPresupuesto(Number(req.params.id));
    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    if (presupuesto.lineas.length === 0) {
      return res
        .status(409)
        .json({ error: 'El presupuesto no tiene ninguna línea; añade al menos una para generar el PDF' });
    }
    const pdfBuffer = await generarPdf(presupuesto);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res) => {
  const presupuesto = obtenerPresupuesto(Number(req.params.id));
  if (!presupuesto) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  res.json(presupuesto);
});

router.post('/', (req, res) => {
  const error = validarDatosPresupuesto(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  res.status(201).json(crearPresupuesto(req.body));
});

router.put('/:id', (req, res) => {
  const error = validarDatosPresupuesto(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const presupuesto = actualizarPresupuesto(Number(req.params.id), req.body);
  if (!presupuesto) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  res.json(presupuesto);
});

router.patch('/:id/estado', (req, res) => {
  if (!ESTADOS.includes(req.body.estado)) {
    return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS.join(', ')}` });
  }
  const presupuesto = cambiarEstadoPresupuesto(Number(req.params.id), req.body.estado);
  if (!presupuesto) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  res.json(presupuesto);
});

router.delete('/:id', (req, res) => {
  const eliminado = eliminarPresupuesto(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
