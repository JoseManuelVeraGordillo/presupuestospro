'use strict';

const express = require('express');
const { listarCatalogo, crearServicio, actualizarServicio, eliminarServicio } = require('../models/catalogo');

const router = express.Router();

function validarDatosServicio(body) {
  if (!body.nombre || typeof body.nombre !== 'string') {
    return 'nombre es obligatorio';
  }
  if (typeof body.precioPorDefecto !== 'number' || Number.isNaN(body.precioPorDefecto)) {
    return 'precioPorDefecto debe ser un número';
  }
  return null;
}

router.get('/', (req, res) => {
  res.json(listarCatalogo());
});

router.post('/', (req, res) => {
  const error = validarDatosServicio(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  res.status(201).json(crearServicio(req.body));
});

router.put('/:id', (req, res) => {
  const error = validarDatosServicio(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const servicio = actualizarServicio(Number(req.params.id), req.body);
  if (!servicio) {
    return res.status(404).json({ error: 'Servicio de catálogo no encontrado' });
  }
  res.json(servicio);
});

router.delete('/:id', (req, res) => {
  const eliminado = eliminarServicio(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: 'Servicio de catálogo no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
