---

description: "Task list for feature 003-exportar-presupuestos-zip"
---

# Tasks: Exportar todos los presupuestos en un .zip

**Input**: Design documents from `/specs/003-exportar-presupuestos-zip/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md)

**Tests**: Incluidos — `plan.md` (sección Testing) y `quickstart.md` piden explícitamente casos nuevos en `tests/api/presupuestos.test.js` para el endpoint `GET /api/presupuestos/exportar`.

**Organization**: Las tareas están agrupadas por historia de usuario (spec.md) para poder implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (fichero distinto, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3)
- Cada tarea incluye la ruta de fichero exacta

## Path Conventions

Aplicación web existente (specs 001/002): `backend/src/`, `frontend/src/`, `tests/` en la raíz del repositorio — sin cambios de estructura respecto a specs anteriores (ver `plan.md`, Project Structure).

---

## Phase 1: Setup

**Purpose**: Añadir la única dependencia nueva que exige la feature (research.md punto 1)

- [X] T001 Añadir `archiver` `^7` a `dependencies` en `backend/package.json` e instalarla (`cd backend && npm install archiver@^7`)

**Checkpoint**: Dependencia disponible para el resto de fases.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Servicio de exportación compartido por las tres historias — sin esto ninguna historia puede completarse

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta completar esta fase

- [X] T002 Crear `backend/src/services/exportarZip.js` con la función `limpiarNombreArchivo(texto)`: elimina los caracteres inválidos en nombres de archivo (`\ / : * ? " < > |` y caracteres de control), recorta espacios sobrantes y devuelve `'sin-nombre'` si el resultado queda vacío (FR-008)
- [X] T003 En `backend/src/services/exportarZip.js`, añadir `construirNombrePdf(numero, clienteNombre, nombresUsados)`: compone `"<numero> - <clienteLimpio>.pdf"` reutilizando `limpiarNombreArchivo`, y resuelve colisiones añadiendo ` (2)`, ` (3)`… al final del nombre base usando el `Set` `nombresUsados` (FR-005, FR-009) — depende de T002
- [X] T004 En `backend/src/services/exportarZip.js`, añadir `construirArchivoDatos({ perfil, catalogo, clientes, presupuestos })`: devuelve `JSON.stringify(datos, null, 2)` con la forma exacta descrita en `data-model.md` (`generadoEn` ISO 8601, `perfil`, `catalogo`, `clientes`, `presupuestos` con su forma "completa" y estado efectivo) (FR-006)
- [X] T005 En `backend/src/services/exportarZip.js`, añadir `generarZipExportacion()`: llama a `listarPresupuestos()` (modelo `presupuestos.js`), ordena por `numero` ascendente (FR-013), llama a `obtenerPresupuesto(id)` y `generarPdf()` (`services/generarPdf.js`, sin modificarlo) por cada uno; si `generarPdf()` falla para un presupuesto concreto, lo añade a un array `omitidos` y continúa con el resto sin detener la exportación (FR-002); usa `archiver('zip')` para añadir cada PDF con el nombre de `construirNombrePdf` y, al final, el fichero `datos-presupuestospro.json` de `construirArchivoDatos` (con `obtenerPerfil()`, `listarCatalogo()`, `listarClientes()` y solo los presupuestos incluidos); devuelve `{ archive, omitidos }` — depende de T003, T004
- [X] T006 Registrar `GET /exportar` en `backend/src/routes/presupuestos.routes.js` **antes** de `GET /:id/pdf` y `GET /:id` (para que `exportar` no se interprete como `:id`, contracts/api.md), delegando en `generarZipExportacion()` de T005: cabecera `Content-Type: application/zip`, `Content-Disposition: attachment; filename="presupuestospro-copia-<fechaHoyIso()>.zip"` y `archive.pipe(res)` — camino feliz únicamente, sin comprobar aún la lista vacía — depende de T005

**Checkpoint**: El endpoint genera y sirve un .zip completo para cualquier volumen de presupuestos; listo para que las historias de usuario lo prueben y lo completen.

---

## Phase 3: User Story 1 - Descargar una copia completa de todos los presupuestos (Priority: P1) 🎯 MVP

**Goal**: Un único botón "Exportar todo (.zip)" descarga un .zip con el PDF de cada presupuesto (idéntico al individual) más el archivo de datos.

**Independent Test**: Crear 3 presupuestos con datos distintos, pulsar "Exportar todo (.zip)" desde el listado y comprobar que se descarga `presupuestospro-copia-<fecha>.zip` con exactamente 3 PDF "número - cliente" más el archivo de datos.

### Tests for User Story 1

- [X] T007 [P] [US1] Test API en `tests/api/presupuestos.test.js`: con al menos un presupuesto guardado, `GET /api/presupuestos/exportar` devuelve `200`, `Content-Type: application/zip` y `Content-Disposition` con el patrón `presupuestospro-copia-<AAAA-MM-DD>.zip`

### Implementation for User Story 1

- [X] T008 [US1] Añadir `exportarPresupuestos()` en `frontend/src/api.js`: hace `fetch` a `${BASE}/presupuestos/exportar` (sin pasar por `manejarRespuesta`, que asume JSON); si la respuesta es correcta devuelve `{ blob: await respuesta.blob(), omitidos: respuesta.headers.get('X-Presupuestos-Omitidos') }`; si no, lanza un `Error` con el mensaje del cuerpo JSON de error (research.md punto 5)
- [X] T009 [US1] En `frontend/src/views/listado-presupuestos.js`, añadir el botón "Exportar todo (.zip)" junto al listado; al pulsarlo, llama a `exportarPresupuestos()` y, con el `blob` recibido, dispara la descarga con un `<a>` temporal + `URL.createObjectURL`, nombrando el fichero `presupuestospro-copia-<fecha de hoy>.zip` (FR-001, FR-002, FR-004) — depende de T008
- [X] T010 [US1] Verificar manualmente el bloque 1 de `quickstart.md` (descarga completa con 3 presupuestos, PDF idéntico al de descarga individual, caso de un único presupuesto)

**Checkpoint**: User Story 1 (MVP) completa y verificable de forma independiente.

---

## Phase 4: User Story 2 - Recibir un aviso claro cuando no hay nada que exportar (Priority: P2)

**Goal**: Sin presupuestos guardados, el botón avisa en vez de descargar un .zip vacío.

**Independent Test**: En una instalación sin presupuestos, pulsar "Exportar todo (.zip)" y comprobar que aparece un aviso y no se descarga ningún archivo.

### Tests for User Story 2

- [X] T011 [P] [US2] Test API en `tests/api/presupuestos.test.js`: sin ningún presupuesto guardado, `GET /api/presupuestos/exportar` devuelve `409` con `{ "error": "..." }` y ningún cuerpo binario

### Implementation for User Story 2

- [X] T012 [US2] En el handler de `GET /exportar` de `backend/src/routes/presupuestos.routes.js`, comprobar antes de llamar a `generarZipExportacion()` si `listarPresupuestos()` está vacío y, en ese caso, devolver `409 { error: 'No hay presupuestos guardados para exportar.' }` sin generar ningún .zip (FR-010) — depende de T006
- [X] T013 [US2] En `frontend/src/views/listado-presupuestos.js`, capturar el error 409 de `exportarPresupuestos()` en el manejador del botón y mostrar su mensaje sin iniciar ninguna descarga (FR-010) — depende de T009
- [X] T014 [US2] Verificar manualmente el bloque 2 de `quickstart.md` (instalación sin presupuestos → aviso, sin descarga)

**Checkpoint**: User Story 1 y 2 funcionan juntas de forma independiente.

---

## Phase 5: User Story 3 - Exportar de forma fiable con nombres de cliente conflictivos o volúmenes grandes (Priority: P3)

**Goal**: La exportación no falla nunca por caracteres conflictivos en el nombre del cliente ni por un volumen alto de presupuestos, y el freelancer ve en todo momento que el proceso está en curso.

**Independent Test**: Crear un cliente con un nombre con caracteres conflictivos (p. ej. "Diseño/Web S.L.") y comprobar que el .zip se genera con un nombre de PDF válido; por separado, crear 50+ presupuestos y comprobar que la exportación se completa mostrando en todo momento que está trabajando.

### Tests for User Story 3

- [X] T015 [P] [US3] Test API en `tests/api/presupuestos.test.js`: crear un presupuesto con un cliente cuyo nombre incluya caracteres inválidos para nombres de archivo (p. ej. `"Diseño/Web S.L."`) y comprobar que `GET /api/presupuestos/exportar` sigue devolviendo `200` sin error

### Implementation for User Story 3

- [X] T016 [US3] En `backend/src/routes/presupuestos.routes.js`, tras `generarZipExportacion()`, si `omitidos.length > 0` añadir la cabecera `X-Presupuestos-Omitidos` con los números separados por comas, antes de enviar la respuesta (FR-002, research.md punto 3) — depende de T006
- [X] T017 [US3] En `frontend/src/views/listado-presupuestos.js`, tras completar la descarga con éxito, leer `omitidos` de la respuesta de `exportarPresupuestos()` y, si no está vacío, mostrar un aviso con los números de presupuesto que no se pudieron incluir — depende de T009
- [X] T018 [US3] En `frontend/src/views/listado-presupuestos.js`, deshabilitar el botón "Exportar todo (.zip)" y cambiar su texto a "Generando copia…" mientras la promesa de `exportarPresupuestos()` está pendiente, reactivándolo en un bloque `finally` para que un segundo clic no inicie una exportación en paralelo (FR-012) — depende de T009
- [X] T019 [P] [US3] Añadir en `frontend/src/styles/base.css` un estilo mínimo para el botón deshabilitado durante la exportación, reutilizando los tokens `:root` ya existentes (sin spinners ni animaciones, research.md punto 6)
- [X] T020 [US3] Verificar manualmente el bloque 3 de `quickstart.md` completo: caracteres conflictivos, colisión de nombres con sufijo " (2)", y 50+ presupuestos con indicador de progreso visible y doble clic sin duplicar la exportación

**Checkpoint**: Las tres historias de usuario funcionan de forma independiente y conjunta.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final y mantenimiento documental transversal

- [X] T021 Ejecutar `npm test` y `npm run test:api` en `backend/` y confirmar que toda la suite pasa, incluidos los casos nuevos de `tests/api/presupuestos.test.js`
- [X] T022 Ejecutar de principio a fin la guía completa de `quickstart.md` (los 3 bloques) como verificación final antes de dar la feature por completa
- [X] T023 Actualizar `CLAUDE.md` con las decisiones de diseño y convenciones nuevas de esta feature, una línea por decisión, con referencia `[003] ...` (p. ej. adopción de `archiver` como primera dependencia nueva desde spec 001, patrón de descarga binaria por `fetch` + `Blob` en `api.js`, uso de una cabecera HTTP custom para adjuntar metadatos junto a una respuesta binaria) — solo información transversal reutilizable por futuras specs, no el detalle de esta feature (plan.md, "Fase Final: Mantenimiento de CLAUDE.md")

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede empezar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA las tres historias de usuario
- **User Story 1 (Phase 3)**: depende de Foundational; es el MVP
- **User Story 2 (Phase 4)**: depende de Foundational y de T006/T009 (extiende la ruta y el manejador del botón de US1)
- **User Story 3 (Phase 5)**: depende de Foundational y de T006/T009 (extiende la misma ruta y el mismo manejador del botón)
- **Polish (Phase 6)**: depende de que las historias que se quieran entregar estén completas

### User Story Dependencies

- **User Story 1 (P1)**: sin dependencias de otras historias — es la base sobre la que se registran la ruta y el botón
- **User Story 2 (P2)**: reutiliza la ruta (T006) y el manejador del botón (T009) de US1, pero es probable y verificable de forma independiente (basta con vaciar los presupuestos)
- **User Story 3 (P3)**: reutiliza la misma ruta y manejador de botón; sus criterios (caracteres conflictivos, colisiones, volumen) son verificables de forma independiente de US2

### Within Each User Story

- Tests antes que la implementación correspondiente
- Backend (ruta) antes que frontend cuando frontend depende de una cabecera o código de estado nuevo
- Historia completa antes de pasar a la siguiente por prioridad

### Parallel Opportunities

- Todas las tareas de una fase marcadas [P] pueden ejecutarse en paralelo (ficheros distintos)
- T002-T005 son secuenciales (mismo fichero `exportarZip.js`); T006 puede empezar en cuanto T005 termine
- T007 (test) puede ejecutarse en paralelo con T008 (api.js) al ser ficheros distintos, aunque T007 debe fallar antes de completar T008-T009
- T019 (CSS) es independiente de T016-T018 (backend/JS) dentro de la Fase 5

---

## Parallel Example: User Story 1

```bash
# T007 (test) es independiente de T008 (api.js); T009 depende de T008:
Task: "Test API GET /api/presupuestos/exportar con datos en tests/api/presupuestos.test.js"
Task: "Añadir exportarPresupuestos() en frontend/src/api.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 únicamente)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational (CRÍTICO — bloquea las tres historias)
3. Completar Fase 3: User Story 1
4. **PARAR y VALIDAR**: probar User Story 1 de forma independiente (bloque 1 de quickstart.md)
5. Desplegar/hacer demo si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. Añadir User Story 1 → validar de forma independiente → MVP listo
3. Añadir User Story 2 → validar de forma independiente
4. Añadir User Story 3 → validar de forma independiente
5. Fase 6 (Polish) → suite completa + quickstart.md de principio a fin + mantenimiento de CLAUDE.md

---

## Notes

- [P] = ficheros distintos, sin dependencias pendientes entre sí
- [Story] mapea cada tarea a su historia de usuario para trazabilidad
- Verificar que los tests fallan antes de implementar
- Parar en cada checkpoint para validar la historia de forma independiente
- Evitar: tareas vagas, conflictos de fichero simultáneos, dependencias cruzadas entre historias que rompan su independencia
