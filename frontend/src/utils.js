export function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

export function formatearEuro(valor) {
  return `${Number(valor).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function formatearFecha(fechaIso) {
  if (!fechaIso) return '';
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}

export const ESTADOS_PRESUPUESTO = [
  { clave: 'borrador', etiqueta: 'Borrador' },
  { clave: 'enviado', etiqueta: 'Enviado' },
  { clave: 'aceptado', etiqueta: 'Aceptado' },
  { clave: 'rechazado', etiqueta: 'Rechazado' },
  { clave: 'caducado', etiqueta: 'Caducado' },
];

export function etiquetaEstado(clave) {
  return ESTADOS_PRESUPUESTO.find((e) => e.clave === clave)?.etiqueta ?? clave;
}
