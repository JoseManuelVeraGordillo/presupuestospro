import { renderVistaPresupuesto } from './views/presupuesto.js';
import { renderVistaListadoPresupuestos } from './views/listado-presupuestos.js';
import { renderVistaCatalogo } from './views/catalogo.js';
import { renderVistaPerfil } from './views/perfil.js';
import { renderVistaInicio } from './views/inicio.js';
import { renderVistaClientes } from './views/clientes.js';

const rutas = [];

function registrarRuta(patron, renderizador) {
  const nombres = [];
  const regex = new RegExp(
    '^' +
      patron.replace(/:[^/]+/g, (coincidencia) => {
        nombres.push(coincidencia.slice(1));
        return '([^/]+)';
      }) +
      '$'
  );
  rutas.push({ regex, nombres, renderizador });
}

function encontrarRuta(ruta) {
  for (const r of rutas) {
    const coincidencia = ruta.match(r.regex);
    if (coincidencia) {
      const params = {};
      r.nombres.forEach((nombre, i) => {
        params[nombre] = coincidencia[i + 1];
      });
      return { renderizador: r.renderizador, params };
    }
  }
  return null;
}

function resaltarEnlaceActivo(ruta) {
  const seccionActiva = '/' + ruta.split('/')[1];
  document.querySelectorAll('.navegacion a').forEach((enlace) => {
    const rutaEnlace = enlace.getAttribute('href').slice(1);
    enlace.classList.toggle('activo', rutaEnlace === seccionActiva);
  });
}

async function navegar() {
  const contenedor = document.getElementById('app');
  const ruta = window.location.hash.slice(1) || '/inicio';
  const encontrada = encontrarRuta(ruta);
  contenedor.innerHTML = '';
  if (encontrada) {
    await encontrada.renderizador(contenedor, encontrada.params);
  } else {
    contenedor.innerHTML = '<p>Página no encontrada.</p>';
  }
  resaltarEnlaceActivo(ruta);
}

registrarRuta('/inicio', renderVistaInicio);
registrarRuta('/presupuestos', renderVistaListadoPresupuestos);
registrarRuta('/presupuesto/:id', renderVistaPresupuesto);
registrarRuta('/clientes', renderVistaClientes);
registrarRuta('/catalogo', renderVistaCatalogo);
registrarRuta('/perfil', renderVistaPerfil);

window.addEventListener('hashchange', navegar);
window.addEventListener('DOMContentLoaded', navegar);

export { registrarRuta, navegar };
