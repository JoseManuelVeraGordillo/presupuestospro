'use strict';

const { crearApp } = require('./src/app');
const { obtenerConexion } = require('./src/db/conexion');
const { ejecutarMigraciones } = require('./src/db/migraciones');

const db = obtenerConexion();
ejecutarMigraciones(db);

const app = crearApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PresupuestosPro escuchando en el puerto ${PORT}`);
});
