'use strict';

const express = require('express');
const { obtenerPerfil, guardarPerfil } = require('../models/perfil');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(obtenerPerfil());
});

router.put('/', (req, res) => {
  const { nombre, nif, contacto, logo } = req.body;
  if (!nombre || !nif) {
    return res.status(400).json({ error: 'nombre y nif son obligatorios' });
  }
  res.json(guardarPerfil({ nombre, nif, contacto, logo }));
});

module.exports = router;
