'use strict';

const express = require('express');
const path = require('node:path');

function crearApp() {
  const app = express();

  app.use(express.json());

  const perfilRoutes = require('./routes/perfil.routes');
  app.use('/api/perfil', perfilRoutes);

  const presupuestosRoutes = require('./routes/presupuestos.routes');
  app.use('/api/presupuestos', presupuestosRoutes);

  const catalogoRoutes = require('./routes/catalogo.routes');
  app.use('/api/catalogo', catalogoRoutes);

  const clientesRoutes = require('./routes/clientes.routes');
  app.use('/api/clientes', clientesRoutes);

  const rutaEstaticos = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(rutaEstaticos));

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
  });

  return app;
}

module.exports = { crearApp };
