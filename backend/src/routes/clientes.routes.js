'use strict';

const express = require('express');
const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require('../models/clientes');

const router = express.Router();

const TIPOS = ['empresa_autonomo', 'particular'];

function validarDatosCliente(body) {
  if (!body.nombre || typeof body.nombre !== 'string') {
    return 'nombre es obligatorio';
  }
  if (!TIPOS.includes(body.tipo)) {
    return `tipo debe ser uno de: ${TIPOS.join(', ')}`;
  }
  return null;
}

router.get('/', (req, res) => {
  res.json(listarClientes());
});

router.get('/:id', (req, res) => {
  const cliente = obtenerCliente(Number(req.params.id));
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  res.json(cliente);
});

router.post('/', (req, res) => {
  const error = validarDatosCliente(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  res.status(201).json(crearCliente(req.body));
});

router.put('/:id', (req, res) => {
  const error = validarDatosCliente(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const cliente = actualizarCliente(Number(req.params.id), req.body);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  res.json(cliente);
});

router.delete('/:id', (req, res) => {
  const eliminado = eliminarCliente(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
