import { listarCatalogo, crearServicio, actualizarServicio, eliminarServicio } from '../api.js';
import { escaparHtml, formatearEuro } from '../utils.js';

export async function renderVistaCatalogo(contenedor) {
  async function render() {
    const servicios = await listarCatalogo();

    contenedor.innerHTML = `
      <h2>Catálogo de servicios</h2>

      <form id="form-nuevo-servicio">
        <label>Nombre del servicio
          <input type="text" name="nombre" placeholder="p. ej. Diseño de logo" required />
        </label>
        <label>Precio por defecto (€)
          <input type="number" name="precioPorDefecto" step="0.01" min="0" required />
        </label>
        <button type="submit">Añadir al catálogo</button>
      </form>

      <h3>Servicios guardados</h3>
      ${
        servicios.length === 0
          ? '<p>Todavía no hay servicios en el catálogo.</p>'
          : `<ul class="lista-items">
              ${servicios
                .map(
                  (s) => `
                <li>
                  <span>${escaparHtml(s.nombre)} — ${formatearEuro(s.precioPorDefecto)}</span>
                  <span class="acciones">
                    <button type="button" class="secundario" data-editar="${s.id}">Editar</button>
                    <button type="button" class="peligro" data-eliminar="${s.id}">Eliminar</button>
                  </span>
                </li>`
                )
                .join('')}
            </ul>`
      }
    `;

    contenedor.querySelector('#form-nuevo-servicio').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formulario = e.target;
      await crearServicio({
        nombre: formulario.nombre.value,
        precioPorDefecto: Number(formulario.precioPorDefecto.value),
      });
      render();
    });

    contenedor.querySelectorAll('[data-editar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        const servicio = servicios.find((s) => s.id === Number(boton.dataset.editar));
        const nuevoNombre = window.prompt('Nombre del servicio', servicio.nombre);
        if (nuevoNombre === null) return;
        const nuevoPrecioTexto = window.prompt('Precio por defecto (€)', servicio.precioPorDefecto);
        if (nuevoPrecioTexto === null) return;
        await actualizarServicio(servicio.id, {
          nombre: nuevoNombre,
          precioPorDefecto: Number(nuevoPrecioTexto),
        });
        render();
      });
    });

    contenedor.querySelectorAll('[data-eliminar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        if (window.confirm('¿Eliminar este servicio del catálogo? Los presupuestos ya creados no se verán afectados.')) {
          await eliminarServicio(Number(boton.dataset.eliminar));
          render();
        }
      });
    });
  }

  await render();
}
