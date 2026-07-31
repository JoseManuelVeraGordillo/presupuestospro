'use strict';

const PdfPrinter = require('pdfmake/src/printer');
const vfs = require('pdfmake/build/vfs_fonts');
const { obtenerPerfil } = require('../models/perfil');

const fonts = {
  Roboto: {
    normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
    bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
    italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
    bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64'),
  },
};

const CLIENTE_TIPO_TEXTO = {
  empresa_autonomo: 'Empresa/Autónomo',
  particular: 'Particular',
};

// Debe mantenerse sincronizada a mano con los tokens de :root en
// frontend/src/styles/base.css (research.md punto 6: frontend y backend son
// paquetes npm independientes, sin build ni bundler compartido).
const PALETA_MARCA = {
  primario: '#1d4e89',
  texto: '#1a1a1a',
  borde: '#d0d5dd',
};

function formatearEuro(valor) {
  return `${valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function formatearFecha(fechaIso) {
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}

function construirDocDefinition(presupuesto, perfil) {
  const content = [];

  if (perfil && perfil.logo) {
    content.push({ image: perfil.logo, width: 120, margin: [0, 0, 0, 10] });
  }

  if (perfil) {
    content.push({ text: perfil.nombre, style: 'nombreFreelancer' });
    content.push({ text: `NIF: ${perfil.nif}`, color: PALETA_MARCA.texto });
    if (perfil.contacto) {
      content.push({ text: perfil.contacto, color: PALETA_MARCA.texto });
    }
  }

  content.push({ text: `Presupuesto ${presupuesto.numero}`, style: 'titulo', margin: [0, 20, 0, 10] });

  content.push({
    columns: [
      { text: `Fecha de emisión: ${formatearFecha(presupuesto.fechaEmision)}` },
      { text: `Válido hasta: ${formatearFecha(presupuesto.fechaValidez)}` },
    ],
  });

  content.push({
    text: [{ text: 'Cliente: ', bold: true }, `${presupuesto.clienteNombre} (${CLIENTE_TIPO_TEXTO[presupuesto.clienteTipo]})`],
    margin: [0, 10, 0, 10],
  });

  const filasTabla = presupuesto.lineas.map((linea) => [
    linea.descripcion,
    String(linea.cantidad),
    formatearEuro(linea.precioUnitario),
    formatearEuro(linea.cantidad * linea.precioUnitario),
  ]);

  content.push({
    table: {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: [
        [
          { text: 'Descripción', bold: true, color: '#fff', fillColor: PALETA_MARCA.primario },
          { text: 'Cantidad', bold: true, color: '#fff', fillColor: PALETA_MARCA.primario },
          { text: 'Precio unitario', bold: true, color: '#fff', fillColor: PALETA_MARCA.primario },
          { text: 'Subtotal', bold: true, color: '#fff', fillColor: PALETA_MARCA.primario },
        ],
        ...filasTabla,
      ],
    },
    layout: {
      hLineColor: () => PALETA_MARCA.borde,
      vLineColor: () => PALETA_MARCA.borde,
    },
  });

  const desglose = [
    ['Base imponible', formatearEuro(presupuesto.baseImponible)],
    [`IVA (${presupuesto.tipoIva}%)`, formatearEuro(presupuesto.iva)],
  ];
  if (presupuesto.retencion > 0) {
    desglose.push(['Retención', `−${formatearEuro(presupuesto.retencion)}`]);
  }
  desglose.push(['Total', formatearEuro(presupuesto.total)]);

  content.push({
    margin: [0, 10, 0, 0],
    layout: 'noBorders',
    table: {
      widths: ['*', 'auto'],
      body: desglose.map(([etiqueta, valor], indice) => {
        const esTotal = indice === desglose.length - 1;
        return [
          { text: etiqueta, bold: esTotal, fontSize: esTotal ? 13 : 10, color: esTotal ? PALETA_MARCA.primario : PALETA_MARCA.texto },
          {
            text: valor,
            bold: esTotal,
            fontSize: esTotal ? 13 : 10,
            color: esTotal ? PALETA_MARCA.primario : PALETA_MARCA.texto,
            alignment: 'right',
          },
        ];
      }),
    },
  });

  return {
    content,
    styles: {
      titulo: { fontSize: 16, bold: true, color: PALETA_MARCA.primario },
      nombreFreelancer: { fontSize: 13, bold: true, color: PALETA_MARCA.texto },
    },
    defaultStyle: { font: 'Roboto', fontSize: 10, color: PALETA_MARCA.texto },
  };
}

function generarPdf(presupuesto) {
  const perfil = obtenerPerfil();
  const printer = new PdfPrinter(fonts);
  const docDefinition = construirDocDefinition(presupuesto, perfil);
  const doc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

module.exports = { generarPdf };
