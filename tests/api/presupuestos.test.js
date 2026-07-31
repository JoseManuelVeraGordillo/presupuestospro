import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaBdTemporal = path.join(__dirname, '..', '..', 'backend', 'data', 'test-api-presupuestos.db');

fs.rmSync(rutaBdTemporal, { force: true });
process.env.DB_PATH = rutaBdTemporal;

let app;
let db;

beforeAll(async () => {
  const { obtenerConexion } = await import('../../backend/src/db/conexion.js');
  const { ejecutarMigraciones } = await import('../../backend/src/db/migraciones.js');
  db = obtenerConexion();
  ejecutarMigraciones(db);

  const { crearApp } = await import('../../backend/src/app.js');
  app = crearApp();
});

function fijarFechaEmisionHaceDias(id, dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  const fechaIso = fecha.toISOString().slice(0, 10);
  db.prepare('UPDATE presupuestos SET fecha_emision = ? WHERE id = ?').run(fechaIso, id);
}

function datosPresupuesto(overrides = {}) {
  return {
    clienteNombre: 'Cliente de prueba',
    clienteTipo: 'empresa_autonomo',
    tipoIva: 21,
    retencionIrpf: 15,
    lineas: [{ descripcion: 'Servicio', cantidad: 1, precioUnitario: 100 }],
    ...overrides,
  };
}

describe('API /api/presupuestos', () => {
  it('crea, edita y elimina un presupuesto', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    expect(crear.status).toBe(201);
    expect(crear.body.numero).toMatch(/^\d{4}-\d{3}$/);
    expect(crear.body.total).toBe(106.0);

    const id = crear.body.id;

    const editar = await request(app)
      .put(`/api/presupuestos/${id}`)
      .send(
        datosPresupuesto({
          clienteNombre: 'Cliente Editado',
          clienteTipo: 'particular',
          tipoIva: 10,
          retencionIrpf: 'ninguna',
          lineas: [],
        })
      );
    expect(editar.status).toBe(200);
    expect(editar.body.clienteNombre).toBe('Cliente Editado');
    expect(editar.body.lineas).toEqual([]);

    const eliminar = await request(app).delete(`/api/presupuestos/${id}`);
    expect(eliminar.status).toBe(204);

    const obtenerTrasBorrar = await request(app).get(`/api/presupuestos/${id}`);
    expect(obtenerTrasBorrar.status).toBe(404);
  });

  it('devuelve 404 al pedir un id inexistente', async () => {
    const res = await request(app).get('/api/presupuestos/999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('devuelve 404 al editar o borrar un id inexistente', async () => {
    const editar = await request(app).put('/api/presupuestos/999999').send(datosPresupuesto());
    expect(editar.status).toBe(404);

    const borrar = await request(app).delete('/api/presupuestos/999999');
    expect(borrar.status).toBe(404);
  });

  it('devuelve 409 al pedir el PDF de un presupuesto sin líneas', async () => {
    const crear = await request(app)
      .post('/api/presupuestos')
      .send(datosPresupuesto({ lineas: [] }));
    expect(crear.status).toBe(201);

    const res = await request(app).get(`/api/presupuestos/${crear.body.id}/pdf`);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('genera el PDF cuando el presupuesto tiene líneas', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    const res = await request(app).get(`/api/presupuestos/${crear.body.id}/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('devuelve 400 ante clienteTipo o tipoIva inválidos', async () => {
    const clienteInvalido = await request(app)
      .post('/api/presupuestos')
      .send(datosPresupuesto({ clienteTipo: 'no-valido' }));
    expect(clienteInvalido.status).toBe(400);

    const ivaInvalido = await request(app)
      .post('/api/presupuestos')
      .send(datosPresupuesto({ tipoIva: 99 }));
    expect(ivaInvalido.status).toBe(400);
  });

  it('acepta líneas con cantidad o precio unitario en cero o negativo (FR-004)', async () => {
    const res = await request(app)
      .post('/api/presupuestos')
      .send(
        datosPresupuesto({
          lineas: [{ descripcion: 'Ajuste', cantidad: -1, precioUnitario: 50 }],
        })
      );
    expect(res.status).toBe(201);
    expect(res.body.baseImponible).toBe(-50);
  });

  it('al eliminar un presupuesto y crear otro nuevo, el número eliminado no se reutiliza (FR-018)', async () => {
    const primero = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    await request(app).delete(`/api/presupuestos/${primero.body.id}`);

    const segundo = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    expect(segundo.body.numero).not.toBe(primero.body.numero);
  });

  it('un presupuesto recién creado empieza en estado Borrador (FR-023)', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    expect(crear.body.estado).toBe('borrador');
  });

  it('cambia de estado con PATCH /:id/estado (FR-024, FR-028)', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    const id = crear.body.id;

    const aEnviado = await request(app).patch(`/api/presupuestos/${id}/estado`).send({ estado: 'enviado' });
    expect(aEnviado.status).toBe(200);
    expect(aEnviado.body.estado).toBe('enviado');

    const aAceptado = await request(app).patch(`/api/presupuestos/${id}/estado`).send({ estado: 'aceptado' });
    expect(aAceptado.status).toBe(200);
    expect(aAceptado.body.estado).toBe('aceptado');

    const deVueltaABorrador = await request(app)
      .patch(`/api/presupuestos/${id}/estado`)
      .send({ estado: 'borrador' });
    expect(deVueltaABorrador.status).toBe(200);
    expect(deVueltaABorrador.body.estado).toBe('borrador');
  });

  it('devuelve 400 con un estado no válido y 404 con un id inexistente (FR-024)', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());

    const invalido = await request(app)
      .patch(`/api/presupuestos/${crear.body.id}/estado`)
      .send({ estado: 'caducado' });
    expect(invalido.status).toBe(400);

    const inexistente = await request(app).patch('/api/presupuestos/999999/estado').send({ estado: 'enviado' });
    expect(inexistente.status).toBe(404);
  });

  it('pasa a Caducado automáticamente al vencer la fecha de validez sin marcarlo Aceptado/Rechazado (FR-025)', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    fijarFechaEmisionHaceDias(crear.body.id, 31);

    const consulta = await request(app).get(`/api/presupuestos/${crear.body.id}`);
    expect(consulta.body.estado).toBe('caducado');
  });

  it('conserva Aceptado/Rechazado aunque venza la fecha de validez (FR-026)', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    await request(app).patch(`/api/presupuestos/${crear.body.id}/estado`).send({ estado: 'rechazado' });
    fijarFechaEmisionHaceDias(crear.body.id, 31);

    const consulta = await request(app).get(`/api/presupuestos/${crear.body.id}`);
    expect(consulta.body.estado).toBe('rechazado');
  });

  it('descargar el PDF no cambia el estado del presupuesto (FR-024)', async () => {
    const crear = await request(app).post('/api/presupuestos').send(datosPresupuesto());
    await request(app).get(`/api/presupuestos/${crear.body.id}/pdf`);

    const consulta = await request(app).get(`/api/presupuestos/${crear.body.id}`);
    expect(consulta.body.estado).toBe('borrador');
  });
});
