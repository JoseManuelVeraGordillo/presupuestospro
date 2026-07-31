import { listarPresupuestos, eliminarPresupuesto, cambiarEstadoPresupuesto, exportarPresupuestos } from '../api.js';
import { escaparHtml, formatearEuro, formatearFecha, ESTADOS_PRESUPUESTO } from '../utils.js';

const ESTADOS_EDITABLES = ESTADOS_PRESUPUESTO.filter((e) => e.clave !== 'caducado');

function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

export async function renderVistaListadoPresupuestos(contenedor) {
  async function render() {
    const presupuestos = await listarPresupuestos();

    contenedor.innerHTML = `
      <h2>Presupuestos</h2>
      <p>
        <a href="#/presupuesto/nuevo"><button type="button">+ Nuevo presupuesto</button></a>
        <button type="button" class="secundario" data-exportar-todo>Exportar todo (.zip)</button>
      </p>
      <p class="aviso-error" data-aviso-exportar hidden></p>
      ${
        presupuestos.length === 0
          ? '<p>Todavía no hay presupuestos.</p>'
          : `<ul class="lista-items">
              ${presupuestos
                .map(
                  (p) => `
                <li>
                  <span>
                    <strong>${escaparHtml(p.numero)}</strong> — ${formatearFecha(p.fechaEmision)} —
                    ${escaparHtml(p.clienteNombre)} — ${formatearEuro(p.total)}
                    <span class="badge-estado badge-estado-${p.estado}">${ESTADOS_PRESUPUESTO.find((e) => e.clave === p.estado)?.etiqueta ?? p.estado}</span>
                  </span>
                  <span class="acciones">
                    <select data-cambiar-estado="${p.id}" ${p.estado === 'caducado' ? 'title="Caducado se calcula automáticamente; elige otro estado para cambiarlo a mano"' : ''}>
                      <option value="">Cambiar estado…</option>
                      ${ESTADOS_EDITABLES.map((e) => `<option value="${e.clave}">${e.etiqueta}</option>`).join('')}
                    </select>
                    <a href="#/presupuesto/${p.id}"><button type="button" class="secundario">Editar</button></a>
                    <button type="button" class="peligro" data-eliminar="${p.id}">Eliminar</button>
                  </span>
                </li>`
                )
                .join('')}
            </ul>`
      }
    `;

    contenedor.querySelectorAll('[data-eliminar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        const id = Number(boton.dataset.eliminar);
        if (window.confirm('¿Eliminar este presupuesto? Su número no se reutilizará.')) {
          await eliminarPresupuesto(id);
          render();
        }
      });
    });

    contenedor.querySelectorAll('[data-cambiar-estado]').forEach((selector) => {
      selector.addEventListener('change', async (e) => {
        const id = Number(selector.dataset.cambiarEstado);
        const nuevoEstado = e.target.value;
        if (!nuevoEstado) return;
        await cambiarEstadoPresupuesto(id, nuevoEstado);
        render();
      });
    });

    const botonExportar = contenedor.querySelector('[data-exportar-todo]');
    const avisoExportar = contenedor.querySelector('[data-aviso-exportar]');
    botonExportar.addEventListener('click', async () => {
      avisoExportar.hidden = true;
      botonExportar.disabled = true;
      const textoOriginal = botonExportar.textContent;
      botonExportar.textContent = 'Generando copia…';
      try {
        const { blob, nombreArchivo, omitidos } = await exportarPresupuestos();
        descargarBlob(blob, nombreArchivo);
        if (omitidos.length > 0) {
          avisoExportar.textContent = `No se pudieron incluir estos presupuestos: ${omitidos.join(', ')}.`;
          avisoExportar.hidden = false;
        }
      } catch (error) {
        avisoExportar.textContent = error.message;
        avisoExportar.hidden = false;
      } finally {
        botonExportar.disabled = false;
        botonExportar.textContent = textoOriginal;
      }
    });
  }

  await render();
}
