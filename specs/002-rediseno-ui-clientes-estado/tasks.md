---

description: "Task list template for feature implementation"
---

# Tasks: Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto

**Input**: Design documents from `/specs/002-rediseno-ui-clientes-estado/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: research.md (punto 9) compromete explícitamente pruebas Vitest/Supertest para `clientes` (CRUD) y para el endpoint de cambio de estado, siguiendo el mismo patrón que `tests/api/catalogo.test.js` y `tests/api/presupuestos.test.js`. Por eso se incluyen tareas de test para US2 y US5. La navegación, el rediseño visual y el comportamiento mobile-first no tienen framework de pruebas de UI instalado (research.md) y se validan a mano con `quickstart.md` (Principio IV) — no se generan tareas de test para US1, US3 ni US4.

**Organization**: Las tareas se agrupan por historia de usuario (US1–US5, en el orden de prioridad de spec.md) para permitir implementación y prueba independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (ficheros distintos, sin dependencias entre sí)
- **[Story]**: Historia de usuario a la que pertenece (US1–US5)
- Se incluye la ruta exacta de fichero en cada descripción

## Path Conventions

Aplicación web de dos paquetes (spec 001, sin cambios de estructura): `backend/src/`, `frontend/src/`, `tests/` en la raíz del repositorio.

---

## Phase 1: Setup

No aplica: esta feature no crea ningún proyecto ni carpeta de primer nivel nueva, ni añade ninguna dependencia npm nueva (plan.md, Technical Context — "No se añade ninguna dependencia nueva para esta feature"). Se reutilizan íntegramente `backend/` y `frontend/` ya inicializados en la spec 001.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura compartida que MUST completarse antes de abordar cualquier historia de usuario.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta que esta fase esté completa.

- [X] T001 Migración: añadir tabla `clientes` (`id`, `nombre`, `tipo`) y columna `presupuestos.estado` (comprobando primero con `PRAGMA table_info` para poder ejecutar el `ALTER TABLE` una sola vez, de forma idempotente) en `backend/src/db/migraciones.js` (data-model.md, research.md punto 1)
- [X] T002 Estado efectivo del presupuesto: nueva función que deriva `caducado` a partir de `fechaValidez` cuando el estado guardado es `borrador` o `enviado` (nunca sobrescribe `aceptado`/`rechazado`), e inclusión de `estado` en `filaAResumen` y `filaACompleto` de `backend/src/models/presupuestos.js` (depends on T001; data-model.md, research.md punto 2, FR-023 a FR-027)
- [X] T003 [P] Ampliar tokens de diseño en `frontend/src/styles/base.css`: escala tipográfica, escala de espaciado y un color distinto por estado de presupuesto (borrador/enviado/aceptado/rechazado/caducado), reutilizando `--color-exito`/`--color-error` ya existentes y añadiendo los que falten en `:root` (contracts/identidad-visual.md, FR-006, FR-007)

**Checkpoint**: Foundation lista — puede empezar el trabajo de cualquier historia de usuario.

---

## Phase 3: User Story 1 - Empezar en una página de inicio con navegación común (Priority: P1) 🎯 MVP

**Goal**: Al entrar en la aplicación aparece una página de inicio con accesos a las 4 secciones y un resumen de presupuestos por estado; una navegación común visible permite moverse entre secciones sin usar el botón atrás.

**Independent Test**: Acceder a la raíz del servidor y comprobar que aparece la página de inicio con enlaces a las 4 secciones y el resumen de actividad; navegar desde cualquier sección a cualquier otra usando solo la navegación visible, sin pulsar atrás.

### Implementation for User Story 1

- [X] T004 [P] [US1] Añadir enlaces "Inicio" y "Clientes" al `<nav class="navegacion">` de `frontend/index.html`, quedando cinco enlaces (Inicio, Presupuestos, Clientes, Catálogo, Perfil) (contracts/navegacion.md, FR-002)
- [X] T005 [P] [US1] Crear vista `frontend/src/views/inicio.js` con `renderVistaInicio`: accesos a Presupuestos/Clientes/Catálogo/Perfil y resumen de presupuestos agregados por estado a partir de `listarPresupuestos()` (FR-002, FR-003, contracts/navegacion.md)
- [X] T006 [US1] Registrar la ruta `/inicio` en `frontend/src/main.js` (importar `renderVistaInicio`) y cambiar la ruta por defecto de `/presupuestos` a `/inicio` cuando `window.location.hash` está vacío (depends on T005; contracts/navegacion.md, FR-001)
- [X] T007 [US1] Tras cada navegación (`hashchange` y carga inicial), resaltar en `frontend/src/main.js` el enlace del nav (clase `.activo`) cuya ruta coincide con la actual, y retirarla de los demás (depends on T004, T006; FR-005)
- [X] T008 [P] [US1] Añadir estilos `.navegacion a.activo` en `frontend/src/styles/base.css`, usando los tokens de T003 (depends on T003)

**Checkpoint**: User Story 1 completamente funcional y probable de forma independiente.

---

## Phase 4: User Story 2 - Distinguir el estado de cada presupuesto (Priority: P1)

**Goal**: Marcar y ver de un vistazo si un presupuesto está en Borrador, Enviado, Aceptado, Rechazado o Caducado, desde el listado o desde el detalle.

**Independent Test**: Crear varios presupuestos, cambiar su estado manualmente entre Borrador/Enviado/Aceptado/Rechazado y comprobar que el listado y la página de inicio reflejan esos cambios; dejar pasar la fecha de validez de uno sin marcarlo Aceptado/Rechazado y comprobar que pasa a Caducado automáticamente.

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Tests API de cambio de estado y de la transición automática a Caducado en `tests/api/presupuestos.test.js`, incluyendo manipulación directa de `fecha_emision` vía la conexión de BD de test para simular el paso de 30 días (mismo enfoque que quickstart.md sección 2.4) (depends on T009, T010)

### Implementation for User Story 2

- [X] T009 [US2] Función `cambiarEstadoPresupuesto(id, estado)` en `backend/src/models/presupuestos.js` que actualiza la columna `estado` y devuelve el presupuesto completo con estado efectivo (depends on T002)
- [X] T010 [US2] Endpoint `PATCH /api/presupuestos/:id/estado` en `backend/src/routes/presupuestos.routes.js`: valida `estado` ∈ {borrador, enviado, aceptado, rechazado}, responde 404 si el id no existe y 400 si el valor no es válido (depends on T009; contracts/api.md, FR-024, FR-028)
- [X] T012 [P] [US2] Añadir `cambiarEstadoPresupuesto(id, estado)` en `frontend/src/api.js` (llamada `PATCH` a `/api/presupuestos/:id/estado`) (depends on T010)
- [X] T013 [US2] Badge de estado y acción rápida (selector) para cambiar el estado directamente desde `frontend/src/views/listado-presupuestos.js`, sin abrir el presupuesto (depends on T012; FR-010, FR-028)
- [X] T014 [US2] Selector de estado en el detalle de presupuesto en `frontend/src/views/presupuesto.js` (depends on T012; FR-024, FR-028)
- [X] T015 [P] [US2] Estilos `.badge-estado` (un color por estado, reutilizando los tokens de estado de T003) en `frontend/src/styles/base.css` (depends on T003; FR-010)

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Trabajar con un diseño visual profesional y coherente (Priority: P1)

**Goal**: Toda la aplicación comparte tipografía, colores, espaciado y jerarquía visual, y sigue siendo usable desde un móvil de pantalla estrecha, sin alterar ningún cálculo.

**Independent Test**: Recorrer todas las pantallas existentes y comprobar que comparten tipografía, paleta y espaciado, y que la aplicación sigue siendo usable desde una pantalla de móvil estrecha.

### Implementation for User Story 3

- [X] T016 [US3] Aplicar jerarquía tipográfica y de espaciado (títulos, cabeceras de tabla, formularios, total) con los tokens de T003 en `frontend/src/styles/base.css` (depends on T003; FR-006, FR-008, FR-009, contracts/identidad-visual.md)
- [X] T017 [P] [US3] Ajustar `frontend/src/views/catalogo.js` para usar exclusivamente los tokens/clases ya definidos, sin alterar su comportamiento (depends on T016; FR-013)
- [X] T018 [P] [US3] Ajustar `frontend/src/views/perfil.js` para usar exclusivamente los tokens/clases ya definidos, sin alterar su comportamiento (depends on T016; FR-013)
- [X] T019 [P] [US3] Ajustar `frontend/src/views/listado-presupuestos.js` y `frontend/src/views/presupuesto.js` para aplicar la jerarquía visual consistente (título/tabla/formulario/total) sin alterar ningún cálculo (depends on T016; FR-013)
- [X] T020 [US3] Revisar y ajustar el comportamiento mobile-first (sin scroll horizontal, botones ≥44px) de todas las pantallas mediante *media queries* `min-width` en `frontend/src/styles/base.css` (depends on T016; FR-011)

**Checkpoint**: User Stories 1, 2 y 3 funcionan de forma independiente.

---

## Phase 6: User Story 4 - Recibir presupuestos en PDF con la misma imagen profesional (Priority: P2)

**Goal**: El PDF descargado usa la misma tipografía y paleta de colores que la aplicación web, conservando exactamente la misma información.

**Independent Test**: Generar el PDF de un presupuesto con datos de ejemplo y comprobar visualmente que usa la misma tipografía y paleta que la aplicación, manteniendo toda la información que ya incluía.

### Implementation for User Story 4

- [X] T021 [US4] Aplicar identidad visual al PDF: constante `PALETA_MARCA` sincronizada a mano con los tokens de `frontend/src/styles/base.css`, y tipografía consistente en el `docDefinition` de `backend/src/services/generarPdf.js`, sin añadir ni quitar ningún dato existente (depends on T016; FR-014, FR-015, research.md punto 6)

**Checkpoint**: User Stories 1 a 4 funcionan de forma independiente.

---

## Phase 7: User Story 5 - Gestionar un directorio de clientes (Priority: P2)

**Goal**: Crear, ver, editar y eliminar clientes guardados, y poder elegir uno guardado (o guardar uno escrito a mano) al crear un presupuesto.

**Independent Test**: Crear dos o tres clientes, editar uno, eliminar otro, y comprobar que al crear un presupuesto nuevo se puede elegir un cliente guardado y que sus datos rellenan el presupuesto.

### Tests for User Story 5 ⚠️

- [X] T025 [P] [US5] Tests API CRUD de clientes en `tests/api/clientes.test.js` (mismo patrón que `tests/api/catalogo.test.js`, incluyendo el caso de FR-020: eliminar un cliente no afecta a presupuestos ya creados con sus datos) (depends on T024)

### Implementation for User Story 5

- [X] T022 [P] [US5] Modelo `backend/src/models/clientes.js` (mismo patrón que `backend/src/models/catalogo.js`): `listarClientes`, `obtenerCliente`, `crearCliente`, `actualizarCliente`, `eliminarCliente` (depends on T001; FR-016 a FR-019)
- [X] T023 [US5] Rutas `backend/src/routes/clientes.routes.js` (mismo patrón que `backend/src/routes/catalogo.routes.js`): `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, validando `nombre` y `tipo` (depends on T022; contracts/api.md)
- [X] T024 [US5] Registrar `/api/clientes` en `backend/src/app.js` (depends on T023)
- [X] T026 [P] [US5] Añadir `listarClientes`, `obtenerCliente`, `crearCliente`, `actualizarCliente`, `eliminarCliente` en `frontend/src/api.js` (depends on T024)
- [X] T027 [US5] Vista `frontend/src/views/clientes.js` con `renderVistaClientes` (listar/crear/editar/eliminar, mismo patrón que `frontend/src/views/catalogo.js`) (depends on T026; FR-016 a FR-019)
- [X] T028 [US5] Registrar la ruta `/clientes` en `frontend/src/main.js` (importar `renderVistaClientes`) (depends on T027)
- [X] T029 [US5] Selector de cliente guardado en `frontend/src/views/presupuesto.js`: al elegir uno, rellenar `clienteNombre`/`clienteTipo` automáticamente, editable después (depends on T026; FR-021)
- [X] T030 [US5] Opción "Guardar como cliente nuevo" en `frontend/src/views/presupuesto.js` al escribir los datos de un cliente a mano, sin ir por separado a la sección Clientes (depends on T026, T029; FR-022)

**Checkpoint**: Todas las historias de usuario funcionan de forma independiente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de que nada de lo existente se ha roto y de que se cumplen los criterios de éxito.

- [X] T031 [P] Ejecutar `npm run test` y `npm run test:api` en `backend/` y confirmar que los tests ya existentes (`tests/unit`, `tests/api/perfil.test.js`, `tests/api/catalogo.test.js`, `tests/api/presupuestos.test.js`) siguen pasando sin haber sido modificados en su comportamiento (FR-013)
- [X] T032 Ejecutar la validación manual completa de `specs/002-rediseno-ui-clientes-estado/quickstart.md` (secciones 1 a 5) y confirmar SC-001 a SC-008
- [X] T033 [P] Confirmar que `backend/src/db/migraciones.js` es idempotente: reiniciar el servidor con una base de datos ya migrada y comprobar que no falla ni intenta duplicar la tabla `clientes` ni la columna `estado`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No aplica — no bloquea nada.
- **Foundational (Phase 2)**: Sin dependencias — BLOQUEA todas las historias de usuario.
- **User Stories (Phase 3-7)**: Todas dependen de que Foundational esté completa.
  - US1, US2 y US3 (P1) pueden avanzar en paralelo una vez completada Foundational, aunque comparten `frontend/src/styles/base.css` (T003) como origen único de tokens.
  - US4 (P2) depende de que US3 haya terminado T016 (jerarquía tipográfica aplicada, base para sincronizar `PALETA_MARCA`).
  - US5 (P2) no depende de US1/US2/US3/US4, solo de Foundational (T001).
- **Polish (Phase 8)**: Depende de que todas las historias que se vayan a entregar estén completas.

### User Story Dependencies

- **US1 (P1)**: Depende de Foundational. Sin dependencias de otras historias (el resumen por estado ya recibe `estado` real gracias a T002).
- **US2 (P1)**: Depende de Foundational. Independiente de US1/US3, aunque comparte tokens de color (T003).
- **US3 (P1)**: Depende de Foundational. Independiente de US1/US2 en su implementación, aunque su Independent Test recorre también Inicio y el listado ya construidos por US1/US2.
- **US4 (P2)**: Depende de Foundational y de T016 (US3).
- **US5 (P2)**: Depende de Foundational (T001). Independiente del resto de historias.

### Within Each User Story

- Backend antes que frontend cuando el frontend consume el nuevo endpoint/modelo (US2, US5).
- Tests (cuando existen, US2 y US5) se escriben contra el endpoint ya implementado, siguiendo el mismo patrón ya usado en `tests/api/catalogo.test.js` y `tests/api/presupuestos.test.js`.
- Dentro de US5: modelo → rutas → registro en `app.js` → tests / `api.js` frontend → vista → ruta en `main.js` → integración en `presupuesto.js`.

### Parallel Opportunities

- T003 (tokens) puede ejecutarse en paralelo con T001+T002 (migración + estado efectivo): ficheros distintos.
- Dentro de US1: T004 (index.html) y T005 (inicio.js) en paralelo; T008 (CSS) en paralelo con T006/T007.
- Dentro de US2: T011 (tests), T012 (api.js) y T015 (CSS) pueden ir en paralelo entre sí una vez completado T010.
- Dentro de US3: T017, T018 y T019 (ajustes por vista) en paralelo una vez completado T016.
- Dentro de US5: T022 (modelo) en paralelo con el resto de Foundational; T025 (tests) y T026 (api.js frontend) en paralelo una vez completado T024.
- Una vez completada Foundational, US1, US2, US3 y US5 pueden trabajarse en paralelo por distintas personas; US4 debe esperar a T016.

---

## Parallel Example: User Story 5

```bash
# Tras completar Foundational (T001):
Task: "Modelo backend/src/models/clientes.js (mismo patrón que catalogo.js)"

# Tras completar T024 (registro en app.js):
Task: "Tests API CRUD de clientes en tests/api/clientes.test.js"
Task: "Funciones de clientes en frontend/src/api.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 2: Foundational (T001-T003).
2. Completar Phase 3: User Story 1 (T004-T008).
3. **STOP and VALIDATE**: navegar la aplicación entera usando solo el nav común, sin botón atrás; comprobar el resumen de la home (con presupuestos ya existentes, todos en Borrador por defecto).

### Incremental Delivery

1. Foundational → base lista.
2. US1 → Inicio + navegación común (MVP).
3. US2 → estados visibles y accionables.
4. US3 → rediseño visual coherente en toda la app.
5. US4 → PDF a juego (depende de US3).
6. US5 → directorio de clientes.
7. Polish → regresión de spec 001 + `quickstart.md` completo.

### Parallel Team Strategy

Tras Foundational: una persona en US1, otra en US2, otra en US5 (todas independientes); US3 puede empezar en paralelo pero su Independent Test final conviene ejecutarlo tras US1/US2 para revisar también Inicio y los badges; US4 se aborda tras cerrar T016 de US3.

---

## Notes

- [P] = ficheros distintos, sin dependencias entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Cada historia de usuario debe poder completarse y probarse de forma independiente.
- Ningún endpoint, cálculo ni comportamiento de la spec 001 (perfil, catálogo, presupuestos existentes) debe cambiar (FR-013) — verificado en T031.
- Commit tras cada tarea o grupo lógico de tareas.
