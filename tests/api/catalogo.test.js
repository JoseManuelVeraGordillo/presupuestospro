import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaBdTemporal = path.join(__dirname, '..', '..', 'backend', 'data', 'test-api-catalogo.db');

fs.rmSync(rutaBdTemporal, { force: true });
process.env.DB_PATH = rutaBdTemporal;

let app;

beforeAll(async () => {
  const { obtenerConexion } = await import('../../backend/src/db/conexion.js');
  const { ejecutarMigraciones } = await import('../../backend/src/db/migraciones.js');
  ejecutarMigraciones(obtenerConexion());

  const { crearApp } = await import('../../backend/src/app.js');
  app = crearApp();
});

describe('API /api/catalogo', () => {
  it('crea, lista y edita un servicio', async () => {
    const crear = await request(app)
      .post('/api/catalogo')
      .send({ nombre: 'Diseño de logo', precioPorDefecto: 300 });
    expect(crear.status).toBe(201);
    expect(crear.body).toMatchObject({ nombre: 'Diseño de logo', precioPorDefecto: 300 });

    const listar = await request(app).get('/api/catalogo');
    expect(listar.status).toBe(200);
    expect(listar.body.some((s) => s.id === crear.body.id)).toBe(true);

    const editar = await request(app)
      .put(`/api/catalogo/${crear.body.id}`)
      .send({ nombre: 'Diseño de logo (editado)', precioPorDefecto: 350 });
    expect(editar.status).toBe(200);
    expect(editar.body.precioPorDefecto).toBe(350);
  });

  it('elimina un servicio', async () => {
    const crear = await request(app).post('/api/catalogo').send({ nombre: 'Temporal', precioPorDefecto: 50 });
    const eliminar = await request(app).delete(`/api/catalogo/${crear.body.id}`);
    expect(eliminar.status).toBe(204);

    const listar = await request(app).get('/api/catalogo');
    expect(listar.body.some((s) => s.id === crear.body.id)).toBe(false);
  });

  it('devuelve 404 al editar o eliminar un id inexistente', async () => {
    const editar = await request(app).put('/api/catalogo/999999').send({ nombre: 'X', precioPorDefecto: 1 });
    expect(editar.status).toBe(404);

    const eliminar = await request(app).delete('/api/catalogo/999999');
    expect(eliminar.status).toBe(404);
  });

  it('editar o eliminar un servicio no afecta a las líneas ya copiadas en presupuestos existentes (FR-002)', async () => {
    const servicio = await request(app)
      .post('/api/catalogo')
      .send({ nombre: 'Consultoría', precioPorDefecto: 100 });

    const presupuesto = await request(app)
      .post('/api/presupuestos')
      .send({
        clienteNombre: 'Cliente Catálogo',
        clienteTipo: 'particular',
        tipoIva: 21,
        retencionIrpf: 'ninguna',
        lineas: [{ descripcion: servicio.body.nombre, cantidad: 1, precioUnitario: servicio.body.precioPorDefecto }],
      });
    expect(presupuesto.body.lineas[0].precioUnitario).toBe(100);

    await request(app)
      .put(`/api/catalogo/${servicio.body.id}`)
      .send({ nombre: 'Consultoría (nuevo precio)', precioPorDefecto: 200 });
    await request(app).delete(`/api/catalogo/${servicio.body.id}`);

    const presupuestoTrasCambios = await request(app).get(`/api/presupuestos/${presupuesto.body.id}`);
    expect(presupuestoTrasCambios.body.lineas[0].precioUnitario).toBe(100);
    expect(presupuestoTrasCambios.body.lineas[0].descripcion).toBe('Consultoría');
  });
});
