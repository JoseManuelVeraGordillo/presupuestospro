'use strict';

const { obtenerConexion } = require('../db/conexion');
const { calcularPresupuesto } = require('../services/calculo');
const { siguienteNumero } = require('../services/numeracion');

function fechaHoyIso() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function sumarDias(fechaIso, dias) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia + dias);
  const anioResultado = fecha.getFullYear();
  const mesResultado = String(fecha.getMonth() + 1).padStart(2, '0');
  const diaResultado = String(fecha.getDate()).padStart(2, '0');
  return `${anioResultado}-${mesResultado}-${diaResultado}`;
}

function retencionIrpfATexto(retencionIrpf) {
  return retencionIrpf === 'ninguna' ? 'ninguna' : String(retencionIrpf);
}

function retencionIrpfANumeroOTexto(retencionIrpfTexto) {
  return retencionIrpfTexto === 'ninguna' ? 'ninguna' : Number(retencionIrpfTexto);
}

function estadoEfectivo(estadoGuardado, fechaValidez) {
  if (estadoGuardado === 'aceptado' || estadoGuardado === 'rechazado') {
    return estadoGuardado;
  }
  const hoy = fechaHoyIso();
  if (hoy > fechaValidez) {
    return 'caducado';
  }
  return estadoGuardado;
}

function obtenerLineas(presupuestoId) {
  const db = obtenerConexion();
  return db
    .prepare(
      'SELECT id, descripcion, cantidad, precio_unitario FROM lineas_presupuesto WHERE presupuesto_id = ? ORDER BY id'
    )
    .all(presupuestoId)
    .map((l) => ({
      id: l.id,
      descripcion: l.descripcion,
      cantidad: l.cantidad,
      precioUnitario: l.precio_unitario,
    }));
}

function filaAResumen(fila) {
  const lineas = obtenerLineas(fila.id);
  const { total } = calcularPresupuesto(
    lineas,
    fila.tipo_iva,
    fila.cliente_tipo,
    retencionIrpfANumeroOTexto(fila.retencion_irpf)
  );
  const fechaValidez = sumarDias(fila.fecha_emision, 30);
  return {
    id: fila.id,
    numero: fila.numero,
    fechaEmision: fila.fecha_emision,
    clienteNombre: fila.cliente_nombre,
    total,
    estado: estadoEfectivo(fila.estado, fechaValidez),
  };
}

function filaACompleto(fila) {
  const lineas = obtenerLineas(fila.id);
  const retencionIrpf = retencionIrpfANumeroOTexto(fila.retencion_irpf);
  const desglose = calcularPresupuesto(lineas, fila.tipo_iva, fila.cliente_tipo, retencionIrpf);
  const fechaValidez = sumarDias(fila.fecha_emision, 30);

  return {
    id: fila.id,
    numero: fila.numero,
    fechaEmision: fila.fecha_emision,
    fechaValidez,
    clienteNombre: fila.cliente_nombre,
    clienteTipo: fila.cliente_tipo,
    tipoIva: fila.tipo_iva,
    retencionIrpf,
    lineas,
    ...desglose,
    estado: estadoEfectivo(fila.estado, fechaValidez),
  };
}

function listarPresupuestos() {
  const db = obtenerConexion();
  const filas = db.prepare('SELECT * FROM presupuestos ORDER BY id DESC').all();
  return filas.map(filaAResumen);
}

function obtenerPresupuesto(id) {
  const db = obtenerConexion();
  const fila = db.prepare('SELECT * FROM presupuestos WHERE id = ?').get(id);
  if (!fila) return null;
  return filaACompleto(fila);
}

function insertarLineas(db, presupuestoId, lineas) {
  const insertar = db.prepare(
    'INSERT INTO lineas_presupuesto (presupuesto_id, descripcion, cantidad, precio_unitario) VALUES (?, ?, ?, ?)'
  );
  for (const linea of lineas) {
    insertar.run(presupuestoId, linea.descripcion, linea.cantidad, linea.precioUnitario);
  }
}

function crearPresupuesto(datos) {
  const db = obtenerConexion();
  const fechaEmision = fechaHoyIso();
  const anio = Number(fechaEmision.slice(0, 4));
  const numero = siguienteNumero(anio);

  db.exec('BEGIN IMMEDIATE');
  try {
    const resultado = db
      .prepare(
        `INSERT INTO presupuestos (numero, fecha_emision, cliente_nombre, cliente_tipo, tipo_iva, retencion_irpf)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        numero,
        fechaEmision,
        datos.clienteNombre,
        datos.clienteTipo,
        datos.tipoIva,
        retencionIrpfATexto(datos.retencionIrpf)
      );

    const presupuestoId = Number(resultado.lastInsertRowid);
    insertarLineas(db, presupuestoId, datos.lineas || []);

    db.exec('COMMIT');
    return obtenerPresupuesto(presupuestoId);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function actualizarPresupuesto(id, datos) {
  const db = obtenerConexion();
  const existente = db.prepare('SELECT id FROM presupuestos WHERE id = ?').get(id);
  if (!existente) return null;

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(
      `UPDATE presupuestos
       SET cliente_nombre = ?, cliente_tipo = ?, tipo_iva = ?, retencion_irpf = ?
       WHERE id = ?`
    ).run(datos.clienteNombre, datos.clienteTipo, datos.tipoIva, retencionIrpfATexto(datos.retencionIrpf), id);

    db.prepare('DELETE FROM lineas_presupuesto WHERE presupuesto_id = ?').run(id);
    insertarLineas(db, id, datos.lineas || []);

    db.exec('COMMIT');
    return obtenerPresupuesto(id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function cambiarEstadoPresupuesto(id, estado) {
  const db = obtenerConexion();
  const existente = db.prepare('SELECT id FROM presupuestos WHERE id = ?').get(id);
  if (!existente) return null;

  db.prepare('UPDATE presupuestos SET estado = ? WHERE id = ?').run(estado, id);
  return obtenerPresupuesto(id);
}

function eliminarPresupuesto(id) {
  const db = obtenerConexion();
  const resultado = db.prepare('DELETE FROM presupuestos WHERE id = ?').run(id);
  return resultado.changes > 0;
}

module.exports = {
  listarPresupuestos,
  obtenerPresupuesto,
  crearPresupuesto,
  actualizarPresupuesto,
  cambiarEstadoPresupuesto,
  eliminarPresupuesto,
};
