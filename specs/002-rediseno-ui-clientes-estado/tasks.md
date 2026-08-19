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

### Actualización 2026-07-31 (dirección "Banca privada", FR-029 a FR-039)

> Los tokens de T003/T016 se sustituyen por los valores exactos de
> `contracts/identidad-visual.md`. No se repiten tareas ya hechas (T003-T020
> siguen completadas); estas tareas son la diferencia entre lo ya construido
> y la nueva dirección visual concreta.

- [X] T034 [US3] Añadir los ficheros `.woff2` de Inter (pesos 400/500/600) en `frontend/public/fonts/` y declarar `@font-face` en `frontend/src/styles/base.css`, sin añadir ninguna dependencia npm ni CDN externo (research.md punto 10; FR-030) — implementado con un único fichero `Inter-Variable.woff2` (subconjunto latino, variable font) referenciado en 3 bloques `@font-face` con `font-weight` 400/500/600, en vez de 3 ficheros estáticos separados
- [X] T035 [US3] Sustituir los valores de los tokens de color en `:root` de `frontend/src/styles/base.css` por los de `contracts/identidad-visual.md`: `--color-fondo` `#F7F8FA`, nuevo `--color-superficie` `#FFFFFF`, `--color-texto` `#0B1F3A`, nuevo `--color-texto-secundario` `#5B6B84`, `--color-primario` `#2E5AAC`, nuevo `--color-primario-oscuro` `#0B1F3A`, `--color-exito` `#1E7A4C`, `--color-error` `#B4232C`, nuevo `--color-alerta` `#9A6700`, `--color-borde` `#E1E4E9` (depends on T034, mismo fichero; FR-029)
- [X] T036 [US3] Cambiar `--radio` a `6px` en `frontend/src/styles/base.css` y aplicar `--color-superficie` como fondo de tarjetas/formularios (depends on T035, mismo fichero; FR-033)
- [X] T037 [US3] Sustituir el borde de `.lista-items li` por `box-shadow: 0 1px 2px rgba(11,31,58,0.06)` en `frontend/src/styles/base.css` (depends on T036, mismo fichero; FR-034)
- [X] T038 [US3] Reescribir `.badge-estado-*` en `frontend/src/styles/base.css` con la fórmula fondo-10/12%-opacidad + texto-100% del color de estado, añadiendo el color de Caducado (`--color-alerta`) que antes no existía como token propio (depends on T035, mismo fichero; FR-032) — logrado sustituyendo los valores de los tokens `--color-estado-*-fondo`; las reglas `.badge-estado-*` ya los consumían sin cambios propios
- [X] T039 [US3] Aplicar `font-weight: 600` y `font-variant-numeric: tabular-nums` a los importes en euros en `frontend/src/styles/base.css` (clase de importe/total) y usarla en `frontend/src/views/listado-presupuestos.js` y `frontend/src/views/presupuesto.js` (depends on T035; FR-031)
- [X] T040 [US3] Añadir estados `:hover`/`:focus-visible` visibles (distintos del reposo) a `button`, `select`, `input` y `.navegacion a` en `frontend/src/styles/base.css` (depends on T035, mismo fichero; FR-036)
- [X] T041 [US3] Distinguir `button.peligro` ("Eliminar") de los botones no destructivos por más de un atributo (p. ej. icono o posición, además del color) en `frontend/src/styles/base.css` y en las vistas que lo usan (depends on T035, mismo fichero; FR-037) — añadido icono `⚠` antes del texto, además del color de error
- [X] T042 [P] [US3] Corregir `frontend/src/views/inicio.js`: los 4 accesos a Presupuestos/Clientes/Catálogo/Perfil deben usar una clase estilada (no un `<a>` sin clase, que hoy hereda el subrayado y el color azul/morado por defecto del navegador) (FR-038) — clase `.acceso-seccion` nueva, más el reset global de `a` en base.css
- [X] T043 [US3] Auditar `frontend/src/views/catalogo.js`, `clientes.js`, `perfil.js` y `presupuesto.js` en busca de cualquier `<a>` sin clase que pueda heredar el estilo por defecto del navegador, y aplicarles la clase/estilo de enlace ya definida (FR-038; no paralelizable con T039 — ambas tocan `presupuesto.js`) — auditoría confirma que `catalogo.js`, `clientes.js` y `perfil.js` no contienen ningún `<a>`; el único enlace de `presupuesto.js` ya queda cubierto por el reset global de `a` (color primario, sin subrayado por defecto)
- [X] T044 [US3] Definir un contenedor de ancho máximo consistente (reutilizar `.contenido` o equivalente) y aplicarlo también a `frontend/src/views/inicio.js`, para que ninguna vista quede con contenido sin centrar en escritorio ≥1280px (depends on T035, T042, mismos ficheros; FR-039) — `main#app.contenido` ya envolvía todas las vistas incluida `inicio.js` a través de `main.js`; el ajuste real fue ampliar `max-width` de 720px a 960px para reducir el vacío sin estructurar en escritorio ancho
- [X] T045 [US3] Distinguir el bloque de navegación/acciones primarias (p. ej. "+ Nuevo presupuesto", "Exportar todo (.zip)") del listado de datos por más de un atributo visual en `frontend/src/views/listado-presupuestos.js` y `frontend/src/styles/base.css` (depends on T035, T039, mismos ficheros; FR-035) — nueva clase `.acciones-principales` (fondo de superficie + sombra) aplicada al contenedor de esos botones
- [ ] T046 [US3] Ejecutar la sección 3 (pasos 1-11) de `specs/002-rediseno-ui-clientes-estado/quickstart.md` y confirmar SC-006, SC-007, SC-009 y SC-010 (depends on T034-T045) — app ya levantada (`backend` :3000, `frontend`/Vite :5173) con Node v24.18.0; pendiente de que el usuario recorra los pasos a ojo en el navegador
- [X] T048 [US3] *(2026-08-03, fuera de FR — petición directa del usuario)* Añadir un icono dentro de los botones de toda la app para mejorar su identificación: clases `.con-icono` + `.icono-nuevo`/`.icono-editar`/`.icono-guardar`/`.icono-exportar`/`.icono-quitar` en `frontend/src/styles/base.css` (símbolos Unicode vía `::before`, mismo patrón que `button.peligro`), aplicadas en `listado-presupuestos.js`, `catalogo.js`, `clientes.js`, `perfil.js` y `presupuesto.js`. No ligado a ningún FR de esta spec (ver nota en "Notes")

**Checkpoint**: User Story 3 refleja la dirección visual "Banca privada" con valores exactos y verificables.

---

## Phase 6: User Story 4 - Recibir presupuestos en PDF con la misma imagen profesional (Priority: P2)

> **Retirada de esta spec (actualización 2026-07-31).** La dirección "Banca privada"
> excluye el PDF de esta iteración (ver spec.md, User Story 4 retirada). T021 ya
> estaba completada antes de esta actualización y se conserva como registro
> histórico; no se añaden nuevas tareas de PDF en esta fase.

~~**Goal**: El PDF descargado usa la misma tipografía y paleta de colores que la aplicación web, conservando exactamente la misma información.~~

~~**Independent Test**: Generar el PDF de un presupuesto con datos de ejemplo y comprobar visualmente que usa la misma tipografía y paleta que la aplicación, manteniendo toda la información que ya incluía.~~

### Implementation for User Story 4

- [X] T021 [US4] Aplicar identidad visual al PDF: constante `PALETA_MARCA` sincronizada a mano con los tokens de `frontend/src/styles/base.css`, y tipografía consistente en el `docDefinition` de `backend/src/services/generarPdf.js`, sin añadir ni quitar ningún dato existente (depends on T016; FR-014, FR-015 — ambos retirados, ver nota arriba; research.md punto 6 — retirado)

**Checkpoint**: User Stories 1 a 4 funcionan de forma independiente (T021 histórico; sin trabajo pendiente de PDF en esta actualización).

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
- [X] T032 Ejecutar la validación manual completa de `specs/002-rediseno-ui-clientes-estado/quickstart.md` (secciones 1 a 5) y confirmar SC-001 a SC-008 *(ejecutada antes de la actualización 2026-07-31; SC-008 quedó retirado después — ver T046 y T047 para la revalidación posterior a la dirección "Banca privada")*
- [ ] T047 [P] Repetir la validación manual de `specs/002-rediseno-ui-clientes-estado/quickstart.md` (secciones 1, 2, 3 y 5 — la 4 está retirada) tras completar T034-T045, y confirmar SC-001 a SC-007, SC-009 y SC-010 (depends on T034-T046) — **bloqueada** por la misma razón que T046 (sin Node.js en este entorno); pendiente de que el usuario la ejecute con `npm run dev` en local
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
- **US3 (P1)**: Depende de Foundational. Independiente de US1/US2 en su implementación, aunque su Independent Test recorre también Inicio y el listado ya construidos por US1/US2. **Actualización 2026-07-31**: T034-T045 (dirección "Banca privada") no dependen de US1/US2/US4/US5, pero T042 toca `inicio.js` (US1) y T039/T045 tocan `listado-presupuestos.js`/`presupuesto.js` (US2), así que conviene aplicarlas con US1/US2 ya funcionando para no perder de vista una regresión cruzada.
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
- **Actualización 2026-07-31**: T034-T041 tocan todas el mismo fichero (`base.css`) de forma secuencial, sin paralelismo entre sí. T042 (`inicio.js`) es paralelizable con T034-T041. T043 (`catalogo.js`/`clientes.js`/`perfil.js`/`presupuesto.js`) es paralelizable con T034-T038, T040-T042, pero no con T039 (comparten `presupuesto.js`). T044 y T045 dependen de ficheros ya tocados por tareas anteriores y no son paralelizables. T046 es la validación final de esta actualización.

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
8. *(2026-07-31)* Actualización "Banca privada" (T034-T047) → sustituye los tokens
   genéricos de US3 por los valores exactos de FR-029 a FR-039, sin tocar el PDF.

### Parallel Team Strategy

Tras Foundational: una persona en US1, otra en US2, otra en US5 (todas independientes); US3 puede empezar en paralelo pero su Independent Test final conviene ejecutarlo tras US1/US2 para revisar también Inicio y los badges; US4 se aborda tras cerrar T016 de US3.

---

## Notes

- [P] = ficheros distintos, sin dependencias entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Cada historia de usuario debe poder completarse y probarse de forma independiente.
- Ningún endpoint, cálculo ni comportamiento de la spec 001 (perfil, catálogo, presupuestos existentes) debe cambiar (FR-013) — verificado en T031.
- Commit tras cada tarea o grupo lógico de tareas.
- **Actualización 2026-07-31**: T034-T047 son la incorporación de la dirección visual
  "Banca privada" (FR-029 a FR-039, `specs/pre-spec-rediseno-visual-banca-privada.md`).
  T001-T033 ya estaban completadas antes de esta actualización y no se repiten. No hay
  tareas para User Story 4 (PDF): queda retirada del alcance (ver spec, Assumptions).
- **T048 (2026-08-03)**: petición directa del usuario, fuera de los FR de esta spec
  (FR-037 solo cubre el icono del botón "Eliminar", ya existente). Tratado como tweak
  informal — si se quiere trazabilidad completa, convendría formalizarlo como FR propio
  en una futura revisión, en vez de dejarlo solo aquí.
