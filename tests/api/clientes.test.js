import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaBdTemporal = path.join(__dirname, '..', '..', 'backend', 'data', 'test-api-clientes.db');

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

describe('API /api/clientes', () => {
  it('crea, lista, obtiene y edita un cliente', async () => {
    const crear = await request(app).post('/api/clientes').send({ nombre: 'Cliente S.L.', tipo: 'empresa_autonomo' });
    expect(crear.status).toBe(201);
    expect(crear.body).toMatchObject({ nombre: 'Cliente S.L.', tipo: 'empresa_autonomo' });

    const listar = await request(app).get('/api/clientes');
    expect(listar.status).toBe(200);
    expect(listar.body.some((c) => c.id === crear.body.id)).toBe(true);

    const obtener = await request(app).get(`/api/clientes/${crear.body.id}`);
    expect(obtener.status).toBe(200);
    expect(obtener.body.nombre).toBe('Cliente S.L.');

    const editar = await request(app)
      .put(`/api/clientes/${crear.body.id}`)
      .send({ nombre: 'Cliente Editado', tipo: 'particular' });
    expect(editar.status).toBe(200);
    expect(editar.body).toMatchObject({ nombre: 'Cliente Editado', tipo: 'particular' });
  });

  it('elimina un cliente', async () => {
    const crear = await request(app).post('/api/clientes').send({ nombre: 'Temporal', tipo: 'particular' });
    const eliminar = await request(app).delete(`/api/clientes/${crear.body.id}`);
    expect(eliminar.status).toBe(204);

    const listar = await request(app).get('/api/clientes');
    expect(listar.body.some((c) => c.id === crear.body.id)).toBe(false);
  });

  it('devuelve 400 si falta nombre o el tipo no es válido', async () => {
    const sinNombre = await request(app).post('/api/clientes').send({ tipo: 'particular' });
    expect(sinNombre.status).toBe(400);

    const tipoInvalido = await request(app).post('/api/clientes').send({ nombre: 'X', tipo: 'no-valido' });
    expect(tipoInvalido.status).toBe(400);
  });

  it('devuelve 404 al pedir, editar o eliminar un id inexistente', async () => {
    const obtener = await request(app).get('/api/clientes/999999');
    expect(obtener.status).toBe(404);

    const editar = await request(app).put('/api/clientes/999999').send({ nombre: 'X', tipo: 'particular' });
    expect(editar.status).toBe(404);

    const eliminar = await request(app).delete('/api/clientes/999999');
    expect(eliminar.status).toBe(404);
  });

  it('eliminar un cliente no afecta a los presupuestos ya creados con sus datos (FR-020)', async () => {
    const cliente = await request(app).post('/api/clientes').send({ nombre: 'Cliente Duradero', tipo: 'empresa_autonomo' });

    const presupuesto = await request(app)
      .post('/api/presupuestos')
      .send({
        clienteNombre: cliente.body.nombre,
        clienteTipo: cliente.body.tipo,
        tipoIva: 21,
        retencionIrpf: 'ninguna',
        lineas: [{ descripcion: 'Servicio', cantidad: 1, precioUnitario: 100 }],
      });
    expect(presupuesto.body.clienteNombre).toBe('Cliente Duradero');

    await request(app).delete(`/api/clientes/${cliente.body.id}`);

    const presupuestoTrasBorrar = await request(app).get(`/api/presupuestos/${presupuesto.body.id}`);
    expect(presupuestoTrasBorrar.body.clienteNombre).toBe('Cliente Duradero');
    expect(presupuestoTrasBorrar.body.clienteTipo).toBe('empresa_autonomo');
  });
});
