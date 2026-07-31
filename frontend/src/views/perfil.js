import { obtenerPerfil, guardarPerfil } from '../api.js';
import { escaparHtml } from '../utils.js';

function leerArchivoComoBase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

export async function renderVistaPerfil(contenedor) {
  let perfil = await obtenerPerfil();
  let logoPendiente = perfil ? perfil.logo : null;
  let mensaje = '';

  function render() {
    contenedor.innerHTML = `
      <h2>Perfil del freelancer</h2>
      <p>Estos datos se usan automáticamente en todos los presupuestos nuevos y en el PDF descargado.</p>

      <form id="form-perfil">
        <label>Nombre o razón social
          <input type="text" name="nombre" value="${escaparHtml(perfil?.nombre || '')}" required />
        </label>
        <label>NIF
          <input type="text" name="nif" value="${escaparHtml(perfil?.nif || '')}" required />
        </label>
        <label>Contacto (email, teléfono...)
          <input type="text" name="contacto" value="${escaparHtml(perfil?.contacto || '')}" />
        </label>
        <label>Logo
          <input type="file" name="logo" accept="image/png,image/jpeg" />
        </label>
        ${logoPendiente ? `<img src="${logoPendiente}" alt="Logo actual" style="max-width:120px" />` : ''}
        ${logoPendiente ? '<button type="button" id="quitar-logo" class="secundario">Quitar logo</button>' : ''}
        <button type="submit">Guardar perfil</button>
      </form>
      ${mensaje ? `<p>${escaparHtml(mensaje)}</p>` : ''}
    `;

    const quitarLogo = contenedor.querySelector('#quitar-logo');
    if (quitarLogo) {
      quitarLogo.addEventListener('click', () => {
        logoPendiente = null;
        render();
      });
    }

    contenedor.querySelector('#form-perfil').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formulario = e.target;
      const archivoLogo = formulario.logo.files[0];
      if (archivoLogo) {
        logoPendiente = await leerArchivoComoBase64(archivoLogo);
      }

      perfil = await guardarPerfil({
        nombre: formulario.nombre.value,
        nif: formulario.nif.value,
        contacto: formulario.contacto.value,
        logo: logoPendiente,
      });
      logoPendiente = perfil.logo;
      mensaje = 'Perfil guardado.';
      render();
    });
  }

  render();
}
