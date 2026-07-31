// Réplica del contrato en backend/src/services/calculo.js, usada únicamente
// para la vista previa instantánea en pantalla (SC-003). El servidor
// siempre recalcula y es la única fuente de verdad al guardar o generar el PDF.

function redondear(valor, decimales = 2) {
  const factor = 10 ** decimales;
  const conCorreccion = Number((valor * factor).toFixed(8));
  return Math.round(conCorreccion) / factor;
}

export function calcularPresupuesto(lineas, tipoIva, clienteTipo, retencionIrpf) {
  const baseImponibleSinRedondear = lineas.reduce(
    (acumulado, linea) => acumulado + (Number(linea.cantidad) || 0) * (Number(linea.precioUnitario) || 0),
    0
  );

  const baseImponible = redondear(baseImponibleSinRedondear);
  const iva = redondear(baseImponible * (tipoIva / 100));

  const porcentajeRetencion =
    clienteTipo === 'empresa_autonomo' && retencionIrpf !== 'ninguna' ? Number(retencionIrpf) : 0;
  const retencion = redondear(baseImponible * (porcentajeRetencion / 100));

  const total = redondear(baseImponible + iva - retencion);

  return { baseImponible, iva, retencion, total };
}
