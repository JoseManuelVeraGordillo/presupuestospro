import { listarPresupuestos } from '../api.js';
import { ESTADOS_PRESUPUESTO } from '../utils.js';

function contarPorEstado(presupuestos) {
  const conteo = Object.fromEntries(ESTADOS_PRESUPUESTO.map((e) => [e.clave, 0]));
  presupuestos.forEach((p) => {
    if (conteo[p.estado] !== undefined) {
      conteo[p.estado] += 1;
    }
  });
  return conteo;
}

export async function renderVistaInicio(contenedor) {
  const presupuestos = await listarPresupuestos();
  const conteo = contarPorEstado(presupuestos);

  contenedor.innerHTML = `
    <h2>Inicio</h2>
    <p>Accede a cada sección de PresupuestosPro:</p>

    <ul class="lista-items">
      <li><a class="acceso-seccion" href="#/presupuestos">Presupuestos</a></li>
      <li><a class="acceso-seccion" href="#/clientes">Clientes</a></li>
      <li><a class="acceso-seccion" href="#/catalogo">Catálogo</a></li>
      <li><a class="acceso-seccion" href="#/perfil">Perfil</a></li>
    </ul>

    <h3>Resumen de presupuestos por estado</h3>
    <ul class="lista-items resumen-estados">
      ${ESTADOS_PRESUPUESTO.map(
        (e) => `
        <li>
          <span class="badge-estado badge-estado-${e.clave}">${e.etiqueta}</span>
          <strong>${conteo[e.clave]}</strong>
        </li>`
      ).join('')}
    </ul>
  `;
}
