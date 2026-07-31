const BASE = '/api';

async function manejarRespuesta(respuesta) {
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const mensaje = (datos && datos.error) || `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }
  return datos;
}

function enviarJson(url, metodo, datos) {
  return fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
}

export async function obtenerPerfil() {
  return manejarRespuesta(await fetch(`${BASE}/perfil`));
}

export async function guardarPerfil(datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/perfil`, 'PUT', datos));
}

export async function listarCatalogo() {
  return manejarRespuesta(await fetch(`${BASE}/catalogo`));
}

export async function crearServicio(datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/catalogo`, 'POST', datos));
}

export async function actualizarServicio(id, datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/catalogo/${id}`, 'PUT', datos));
}

export async function eliminarServicio(id) {
  return manejarRespuesta(await fetch(`${BASE}/catalogo/${id}`, { method: 'DELETE' }));
}

export async function listarClientes() {
  return manejarRespuesta(await fetch(`${BASE}/clientes`));
}

export async function obtenerCliente(id) {
  return manejarRespuesta(await fetch(`${BASE}/clientes/${id}`));
}

export async function crearCliente(datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/clientes`, 'POST', datos));
}

export async function actualizarCliente(id, datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/clientes/${id}`, 'PUT', datos));
}

export async function eliminarCliente(id) {
  return manejarRespuesta(await fetch(`${BASE}/clientes/${id}`, { method: 'DELETE' }));
}

export async function listarPresupuestos() {
  return manejarRespuesta(await fetch(`${BASE}/presupuestos`));
}

export async function obtenerPresupuesto(id) {
  return manejarRespuesta(await fetch(`${BASE}/presupuestos/${id}`));
}

export async function crearPresupuesto(datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/presupuestos`, 'POST', datos));
}

export async function actualizarPresupuesto(id, datos) {
  return manejarRespuesta(await enviarJson(`${BASE}/presupuestos/${id}`, 'PUT', datos));
}

export async function cambiarEstadoPresupuesto(id, estado) {
  return manejarRespuesta(await enviarJson(`${BASE}/presupuestos/${id}/estado`, 'PATCH', { estado }));
}

export async function eliminarPresupuesto(id) {
  return manejarRespuesta(await fetch(`${BASE}/presupuestos/${id}`, { method: 'DELETE' }));
}
