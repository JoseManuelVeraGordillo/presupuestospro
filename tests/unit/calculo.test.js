import { describe, it, expect } from 'vitest';
import { calcularPresupuesto } from '../../backend/src/services/calculo.js';

describe('calcularPresupuesto', () => {
  it('caso de referencia: base 2.000,00 €, IVA 420,00 €, retención 300,00 €, total 2.120,00 €', () => {
    const lineas = [
      { cantidad: 1, precioUnitario: 1500.0 },
      { cantidad: 1, precioUnitario: 500.0 },
    ];
    const resultado = calcularPresupuesto(lineas, 21, 'empresa_autonomo', 15);

    expect(resultado.baseImponible).toBe(2000.0);
    expect(resultado.iva).toBe(420.0);
    expect(resultado.retencion).toBe(300.0);
    expect(resultado.total).toBe(2120.0);
  });

  it('redondeo estándar: 2,345 € se redondea a 2,35 €', () => {
    const lineas = [{ cantidad: 1, precioUnitario: 2.345 }];
    const resultado = calcularPresupuesto(lineas, 0, 'particular', 'ninguna');

    expect(resultado.baseImponible).toBe(2.35);
  });

  it('la retención siempre es 0 si clienteTipo es "particular", aunque retencionIrpf no sea "ninguna"', () => {
    const lineas = [{ cantidad: 1, precioUnitario: 1000.0 }];
    const resultado = calcularPresupuesto(lineas, 21, 'particular', 15);

    expect(resultado.retencion).toBe(0);
    expect(resultado.total).toBe(1210.0);
  });

  it('acepta cantidades y precios cero o negativos sin lanzar error', () => {
    const lineas = [
      { cantidad: 0, precioUnitario: 100 },
      { cantidad: -2, precioUnitario: 50 },
    ];

    expect(() => calcularPresupuesto(lineas, 21, 'particular', 'ninguna')).not.toThrow();

    const resultado = calcularPresupuesto(lineas, 21, 'particular', 'ninguna');
    expect(resultado.baseImponible).toBe(-100);
  });

  it('con lineas = [] devuelve todos los importes en 0', () => {
    const resultado = calcularPresupuesto([], 21, 'empresa_autonomo', 15);

    expect(resultado).toEqual({ baseImponible: 0, iva: 0, retencion: 0, total: 0 });
  });
});
