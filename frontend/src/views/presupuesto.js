import {
  obtenerPresupuesto,
  crearPresupuesto,
  actualizarPresupuesto,
  cambiarEstadoPresupuesto,
  listarCatalogo,
  obtenerPerfil,
  listarClientes,
  crearCliente,
} from '../api.js';
import { calcularPresupuesto } from '../calculo.js';
import { escaparHtml, formatearEuro, ESTADOS_PRESUPUESTO } from '../utils.js';

const ESTADOS_EDITABLES = ESTADOS_PRESUPUESTO.filter((e) => e.clave !== 'caducado');

function lineaVacia() {
  return { descripcion: '', cantidad: 1, precioUnitario: 0 };
}

export async function renderVistaPresupuesto(contenedor, params) {
  let id = params.id && params.id !== 'nuevo' ? Number(params.id) : null;
  let numero = null;
  let estadoPresupuesto = null;

  let estado = {
    clienteNombre: '',
    clienteTipo: 'particular',
    tipoIva: 21,
    retencionIrpf: 'ninguna',
    lineas: [],
  };

  if (id) {
    const presupuesto = await obtenerPresupuesto(id);
    estado = {
      clienteNombre: presupuesto.clienteNombre,
      clienteTipo: presupuesto.clienteTipo,
      tipoIva: presupuesto.tipoIva,
      retencionIrpf: presupuesto.retencionIrpf,
      lineas: presupuesto.lineas.map((l) => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
      })),
    };
    numero = presupuesto.numero;
    estadoPresupuesto = presupuesto.estado;
  }

  const catalogo = await listarCatalogo();
  const perfil = await obtenerPerfil();
  const clientes = await listarClientes();
  let guardarComoClienteNuevo = false;

  function actualizarDesglose() {
    const desglose = calcularPresupuesto(estado.lineas, estado.tipoIva, estado.clienteTipo, estado.retencionIrpf);
    const nodo = contenedor.querySelector('#desglose-contenido');
    if (nodo) {
      nodo.innerHTML = `
        <p>Base imponible: <span class="importe">${formatearEuro(desglose.baseImponible)}</span></p>
        <p>IVA (${estado.tipoIva}%): <span class="importe">${formatearEuro(desglose.iva)}</span></p>
        ${desglose.retencion > 0 ? `<p>Retención: <span class="importe">−${formatearEuro(desglose.retencion)}</span></p>` : ''}
        <p class="total">Total: ${formatearEuro(desglose.total)}</p>
      `;
    }
    return desglose;
  }

  async function guardar() {
    if (guardarComoClienteNuevo && estado.clienteNombre) {
      await crearCliente({ nombre: estado.clienteNombre, tipo: estado.clienteTipo });
      guardarComoClienteNuevo = false;
    }
    if (id) {
      const actualizado = await actualizarPresupuesto(id, estado);
      numero = actualizado.numero;
    } else {
      const creado = await crearPresupuesto(estado);
      id = creado.id;
      numero = creado.numero;
      window.history.replaceState(null, '', `#/presupuesto/${id}`);
    }
  }

  async function descargarPdf() {
    const avisoVacio = contenedor.querySelector('#aviso-vacio');
    if (estado.lineas.length === 0) {
      if (avisoVacio) avisoVacio.hidden = false;
      return;
    }
    if (avisoVacio) avisoVacio.hidden = true;

    await guardar();
    render();

    const enlace = document.createElement('a');
    enlace.href = `/api/presupuestos/${id}/pdf`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  }

  function render() {
    const desgloseInicial = calcularPresupuesto(estado.lineas, estado.tipoIva, estado.clienteTipo, estado.retencionIrpf);

    contenedor.innerHTML = `
      <h2>${numero ? `Presupuesto ${numero}` : 'Presupuesto nuevo'}</h2>

      ${
        id
          ? `<p>
              <span class="badge-estado badge-estado-${estadoPresupuesto}">${ESTADOS_PRESUPUESTO.find((e) => e.clave === estadoPresupuesto)?.etiqueta ?? estadoPresupuesto}</span>
              <label style="display:inline-flex; align-items:center; gap:0.5rem; margin-left:0.5rem">
                Cambiar estado
                <select id="campo-estado">
                  ${ESTADOS_EDITABLES.map((e) => `<option value="${e.clave}" ${estadoPresupuesto === e.clave ? 'selected' : ''}>${e.etiqueta}</option>`).join('')}
                </select>
              </label>
            </p>`
          : ''
      }

      <p>
        ${
          perfil
            ? `Emisor: <strong>${escaparHtml(perfil.nombre)}</strong> (NIF ${escaparHtml(perfil.nif)}) — se añade automáticamente al PDF.`
            : `No has configurado tu perfil todavía. <a href="#/perfil">Configúralo</a> para que tus datos aparezcan automáticamente en el PDF (no es obligatorio para crear este presupuesto).`
        }
      </p>

      <form>
        ${
          clientes.length > 0
            ? `<label>Cliente guardado
                <select id="selector-cliente">
                  <option value="">Elegir cliente guardado…</option>
                  ${clientes.map((c) => `<option value="${c.id}">${escaparHtml(c.nombre)}</option>`).join('')}
                </select>
              </label>`
            : ''
        }
        <label>Nombre del cliente
          <input type="text" id="campo-clienteNombre" value="${escaparHtml(estado.clienteNombre)}" placeholder="Nombre o razón social" />
        </label>
        <label>Tipo de cliente
          <select id="campo-clienteTipo">
            <option value="particular" ${estado.clienteTipo === 'particular' ? 'selected' : ''}>Particular</option>
            <option value="empresa_autonomo" ${estado.clienteTipo === 'empresa_autonomo' ? 'selected' : ''}>Empresa/Autónomo</option>
          </select>
        </label>
        <label style="flex-direction:row; align-items:center">
          <input type="checkbox" id="campo-guardar-cliente" style="width:auto" ${guardarComoClienteNuevo ? 'checked' : ''} />
          Guardar como cliente nuevo al guardar el presupuesto
        </label>
        <label>Tipo de IVA
          <select id="campo-tipoIva">
            ${[21, 10, 4, 0].map((v) => `<option value="${v}" ${estado.tipoIva === v ? 'selected' : ''}>${v}%</option>`).join('')}
          </select>
        </label>
        ${
          estado.clienteTipo === 'empresa_autonomo'
            ? `<label>Retención de IRPF
          <select id="campo-retencionIrpf">
            <option value="ninguna" ${estado.retencionIrpf === 'ninguna' ? 'selected' : ''}>Ninguna</option>
            <option value="15" ${estado.retencionIrpf === 15 ? 'selected' : ''}>15%</option>
            <option value="7" ${estado.retencionIrpf === 7 ? 'selected' : ''}>7%</option>
          </select>
        </label>`
            : ''
        }
      </form>

      <h3>Líneas del presupuesto</h3>
      <ul class="lista-items" id="lista-lineas">
        ${estado.lineas
          .map(
            (l, i) => `
          <li>
            <input type="text" data-indice="${i}" data-campo="descripcion" value="${escaparHtml(l.descripcion)}" placeholder="Descripción" />
            <input type="number" data-indice="${i}" data-campo="cantidad" value="${l.cantidad}" step="any" style="max-width:5rem" />
            <input type="number" data-indice="${i}" data-campo="precioUnitario" value="${l.precioUnitario}" step="any" style="max-width:7rem" />
            <button type="button" class="secundario peligro" data-eliminar="${i}">Eliminar</button>
          </li>`
          )
          .join('')}
      </ul>
      <button type="button" id="anadir-linea" class="secundario con-icono icono-nuevo">Añadir línea a mano</button>

      ${
        catalogo.length > 0
          ? `<div class="acciones">
              <select id="selector-catalogo">
                <option value="">Añadir desde catálogo…</option>
                ${catalogo.map((s) => `<option value="${s.id}">${escaparHtml(s.nombre)} (${formatearEuro(s.precioPorDefecto)})</option>`).join('')}
              </select>
            </div>`
          : ''
      }

      <div class="desglose">
        <div id="desglose-contenido">
          <p>Base imponible: ${formatearEuro(desgloseInicial.baseImponible)}</p>
          <p>IVA (${estado.tipoIva}%): ${formatearEuro(desgloseInicial.iva)}</p>
          ${desgloseInicial.retencion > 0 ? `<p>Retención: −${formatearEuro(desgloseInicial.retencion)}</p>` : ''}
          <p class="total">Total: ${formatearEuro(desgloseInicial.total)}</p>
        </div>
      </div>

      <p id="aviso-vacio" class="aviso-error" hidden>No se puede descargar el PDF: añade al menos una línea.</p>

      <div class="acciones">
        <button type="button" id="guardar" class="con-icono icono-guardar">${id ? 'Guardar cambios' : 'Guardar presupuesto'}</button>
        <button type="button" id="descargar-pdf" class="secundario con-icono icono-exportar">Descargar PDF</button>
      </div>
    `;

    const campoEstado = contenedor.querySelector('#campo-estado');
    if (campoEstado) {
      campoEstado.addEventListener('change', async (e) => {
        const actualizado = await cambiarEstadoPresupuesto(id, e.target.value);
        estadoPresupuesto = actualizado.estado;
        render();
      });
    }

    const selectorCliente = contenedor.querySelector('#selector-cliente');
    if (selectorCliente) {
      selectorCliente.addEventListener('change', (e) => {
        const cliente = clientes.find((c) => c.id === Number(e.target.value));
        if (cliente) {
          estado.clienteNombre = cliente.nombre;
          estado.clienteTipo = cliente.tipo;
          if (estado.clienteTipo !== 'empresa_autonomo') {
            estado.retencionIrpf = 'ninguna';
          }
          render();
        }
      });
    }

    contenedor.querySelector('#campo-clienteNombre').addEventListener('input', (e) => {
      estado.clienteNombre = e.target.value;
    });

    contenedor.querySelector('#campo-guardar-cliente').addEventListener('change', (e) => {
      guardarComoClienteNuevo = e.target.checked;
    });

    contenedor.querySelector('#campo-clienteTipo').addEventListener('change', (e) => {
      estado.clienteTipo = e.target.value;
      if (estado.clienteTipo !== 'empresa_autonomo') {
        estado.retencionIrpf = 'ninguna';
      }
      render();
    });

    contenedor.querySelector('#campo-tipoIva').addEventListener('change', (e) => {
      estado.tipoIva = Number(e.target.value);
      actualizarDesglose();
    });

    const campoRetencion = contenedor.querySelector('#campo-retencionIrpf');
    if (campoRetencion) {
      campoRetencion.addEventListener('change', (e) => {
        estado.retencionIrpf = e.target.value === 'ninguna' ? 'ninguna' : Number(e.target.value);
        actualizarDesglose();
      });
    }

    contenedor.querySelectorAll('#lista-lineas input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const indice = Number(e.target.dataset.indice);
        const campo = e.target.dataset.campo;
        estado.lineas[indice][campo] = campo === 'descripcion' ? e.target.value : Number(e.target.value);
        actualizarDesglose();
      });
    });

    contenedor.querySelectorAll('[data-eliminar]').forEach((boton) => {
      boton.addEventListener('click', (e) => {
        const indice = Number(e.target.dataset.eliminar);
        estado.lineas.splice(indice, 1);
        render();
      });
    });

    contenedor.querySelector('#anadir-linea').addEventListener('click', () => {
      estado.lineas.push(lineaVacia());
      render();
    });

    const selectorCatalogo = contenedor.querySelector('#selector-catalogo');
    if (selectorCatalogo) {
      selectorCatalogo.addEventListener('change', (e) => {
        const servicio = catalogo.find((s) => s.id === Number(e.target.value));
        if (servicio) {
          estado.lineas.push({ descripcion: servicio.nombre, cantidad: 1, precioUnitario: servicio.precioPorDefecto });
          render();
        }
      });
    }

    contenedor.querySelector('#guardar').addEventListener('click', async () => {
      await guardar();
      render();
    });

    contenedor.querySelector('#descargar-pdf').addEventListener('click', () => {
      descargarPdf();
    });
  }

  render();
}
