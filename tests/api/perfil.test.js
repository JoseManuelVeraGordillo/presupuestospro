import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaBdTemporal = path.join(__dirname, '..', '..', 'backend', 'data', 'test-api-perfil.db');

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

describe('API /api/perfil', () => {
  it('GET devuelve null si no está configurado todavía', async () => {
    const res = await request(app).get('/api/perfil');
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('PUT crea el perfil y un GET posterior devuelve los datos guardados', async () => {
    const put = await request(app)
      .put('/api/perfil')
      .send({ nombre: 'Ana Freelance', nif: '12345678Z', contacto: 'ana@example.com' });
    expect(put.status).toBe(200);
    expect(put.body).toMatchObject({ nombre: 'Ana Freelance', nif: '12345678Z', contacto: 'ana@example.com' });

    const get = await request(app).get('/api/perfil');
    expect(get.body).toMatchObject({ nombre: 'Ana Freelance', nif: '12345678Z' });
  });

  it('PUT actualiza el perfil existente (upsert de la fila única)', async () => {
    await request(app).put('/api/perfil').send({ nombre: 'Ana', nif: '111', contacto: 'a@x.com' });
    const actualizar = await request(app).put('/api/perfil').send({ nombre: 'Ana Actualizada', nif: '222' });
    expect(actualizar.status).toBe(200);
    expect(actualizar.body.nombre).toBe('Ana Actualizada');

    const get = await request(app).get('/api/perfil');
    expect(get.body.nombre).toBe('Ana Actualizada');
    expect(get.body.nif).toBe('222');
  });

  it('devuelve 400 si falta nombre o nif', async () => {
    const res = await request(app).put('/api/perfil').send({ contacto: 'solo-contacto@x.com' });
    expect(res.status).toBe(400);
  });
});
