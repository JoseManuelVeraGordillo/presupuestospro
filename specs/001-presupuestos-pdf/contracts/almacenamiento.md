# Contrato: Acceso a datos (SQLite)

**Feature**: 001-presupuestos-pdf

La base de datos es un único fichero SQLite en el disco del servidor (ver
[research.md](../research.md), puntos 1-2, y el esquema completo en
[data-model.md](../data-model.md)). No hay servicio de base de datos externo
ni en la nube. Este documento fija las operaciones mínimas que deben
implementar los módulos de `backend/src/models/`, para que las rutas
(`backend/src/routes/`) dependan de un contrato estable y no de sentencias
SQL sueltas repartidas por el código.

## `models/perfil.js`

- `obtenerPerfil()` → fila de `perfil` o `null` si no existe todavía (primer
  uso, Edge Cases). Su ausencia no debe impedir crear un presupuesto
  (FR-017).
- `guardarPerfil(datos)` → crea o actualiza (upsert) la única fila de
  `perfil`.

## `models/catalogo.js`

- `listarCatalogo()` → todas las filas de `catalogo`.
- `crearServicio(datos)` / `actualizarServicio(id, datos)` /
  `eliminarServicio(id)` — eliminar o editar un servicio **no** modifica
  ninguna fila de `lineas_presupuesto` ya creada a partir de él, porque no
  existe clave foránea entre ambas tablas (FR-002).

## `models/presupuestos.js`

- `listarPresupuestos()` → resumen de todas las filas de `presupuestos`
  (sin líneas, para listados).
- `obtenerPresupuesto(id)` → fila de `presupuestos` con sus
  `lineas_presupuesto` asociadas (`JOIN` o consulta aparte), o `null` si no
  existe.
- `crearPresupuesto(datos)` → inserta la fila y sus líneas dentro de una
  única transacción SQL, obteniendo el `numero` de
  `siguienteNumero(anioActual)` (ver más abajo) antes del `INSERT`.
- `actualizarPresupuesto(id, datos)` → sustituye cliente, tipo de IVA,
  retención y/o líneas de un presupuesto existente, en cualquier momento,
  incluso tras haber generado su PDF (FR-013). No permite modificar
  `numero`.
- `eliminarPresupuesto(id)` → borra la fila (con `ON DELETE CASCADE` sobre
  sus líneas); no libera ni reutiliza su `numero` (FR-018).

## `models/numeracion.js`

- `siguienteNumero(anio)` → dentro de una transacción SQL: lee la fila de
  `contadores_numeracion` para `anio` (si no existe, la crea con
  `ultimo_numero = 0`), la incrementa en `1`, la guarda, y devuelve
  `` `${anio}-${String(nuevoNumero).padStart(3, '0')}` ``. La transacción
  evita colisiones si se crean dos presupuestos el mismo día (Edge Cases).

## Garantías esperadas (verificables manualmente, ver quickstart.md)

- Reiniciar el servidor conserva perfil, catálogo y presupuestos sin cambios
  (SC-005, FR-017) — los datos viven en el fichero SQLite, no en memoria.
- El mismo freelancer puede acceder a los mismos datos desde varios
  dispositivos apuntando a la misma instalación (spec, Assumptions
  actualizadas) — no hay copia local por dispositivo, todo pasa por la misma
  base de datos del servidor.
- **Importante para el despliegue** (no es parte de este contrato de código,
  pero condiciona su cumplimiento): el hosting elegido debe conservar el
  fichero SQLite entre reinicios y despliegues; si el disco no es
  persistente, esta garantía no se cumple (ver research.md, punto 6).
