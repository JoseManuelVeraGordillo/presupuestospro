import { listarClientes, crearCliente, actualizarCliente, eliminarCliente } from '../api.js';
import { escaparHtml } from '../utils.js';

const TIPO_TEXTO = {
  empresa_autonomo: 'Empresa/Autónomo',
  particular: 'Particular',
};

export async function renderVistaClientes(contenedor) {
  async function render() {
    const clientes = await listarClientes();

    contenedor.innerHTML = `
      <h2>Clientes</h2>

      <form id="form-nuevo-cliente">
        <label>Nombre o razón social
          <input type="text" name="nombre" placeholder="p. ej. Cliente Ejemplo S.L." required />
        </label>
        <label>Tipo
          <select name="tipo">
            <option value="particular">Particular</option>
            <option value="empresa_autonomo">Empresa/Autónomo</option>
          </select>
        </label>
        <button type="submit">Añadir cliente</button>
      </form>

      <h3>Clientes guardados</h3>
      ${
        clientes.length === 0
          ? '<p>Todavía no hay clientes guardados.</p>'
          : `<ul class="lista-items">
              ${clientes
                .map(
                  (c) => `
                <li>
                  <span>${escaparHtml(c.nombre)} — ${TIPO_TEXTO[c.tipo]}</span>
                  <span class="acciones">
                    <button type="button" class="secundario" data-editar="${c.id}">Editar</button>
                    <button type="button" class="peligro" data-eliminar="${c.id}">Eliminar</button>
                  </span>
                </li>`
                )
                .join('')}
            </ul>`
      }
    `;

    contenedor.querySelector('#form-nuevo-cliente').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formulario = e.target;
      await crearCliente({
        nombre: formulario.nombre.value,
        tipo: formulario.tipo.value,
      });
      render();
    });

    contenedor.querySelectorAll('[data-editar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        const cliente = clientes.find((c) => c.id === Number(boton.dataset.editar));
        const nuevoNombre = window.prompt('Nombre o razón social', cliente.nombre);
        if (nuevoNombre === null) return;
        const nuevoTipo = window.prompt('Tipo (particular / empresa_autonomo)', cliente.tipo);
        if (nuevoTipo === null) return;
        await actualizarCliente(cliente.id, {
          nombre: nuevoNombre,
          tipo: nuevoTipo === 'empresa_autonomo' ? 'empresa_autonomo' : 'particular',
        });
        render();
      });
    });

    contenedor.querySelectorAll('[data-eliminar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        if (window.confirm('¿Eliminar este cliente? Los presupuestos ya creados no se verán afectados.')) {
          await eliminarCliente(Number(boton.dataset.eliminar));
          render();
        }
      });
    });
  }

  await render();
}
