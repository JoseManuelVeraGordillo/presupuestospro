import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaBdTemporal = path.join(__dirname, '..', '..', 'backend', 'data', 'test-numeracion.db');

fs.rmSync(rutaBdTemporal, { force: true });
process.env.DB_PATH = rutaBdTemporal;

let siguienteNumero;

beforeAll(async () => {
  const { obtenerConexion } = await import('../../backend/src/db/conexion.js');
  const { ejecutarMigraciones } = await import('../../backend/src/db/migraciones.js');
  ejecutarMigraciones(obtenerConexion());

  ({ siguienteNumero } = await import('../../backend/src/services/numeracion.js'));
});

describe('siguienteNumero', () => {
  it('genera el formato AAAA-NNN', () => {
    const numero = siguienteNumero(2030);
    expect(numero).toMatch(/^2030-\d{3}$/);
  });

  it('dos presupuestos el mismo año no colisionan', () => {
    const primero = siguienteNumero(2031);
    const segundo = siguienteNumero(2031);

    expect(primero).toBe('2031-001');
    expect(segundo).toBe('2031-002');
    expect(primero).not.toBe(segundo);
  });

  it('el contador se reinicia en un año nuevo', () => {
    const numero = siguienteNumero(2032);
    expect(numero).toBe('2032-001');
  });
});
