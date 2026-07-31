---

description: "Task list for feature implementation"
---

# Tasks: Presupuestos en PDF para Freelancers

**Input**: Design documents from `/specs/001-presupuestos-pdf/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Incluidas. `plan.md` (Testing) y `research.md` (punto 8) piden explícitamente Vitest para cálculo/numeración y `supertest` para los endpoints; `contracts/calculo.md` dice literalmente "verificable con pruebas unitarias".

**Organization**: Las tareas están agrupadas por historia de usuario (US1, US2, US3) según sus prioridades en spec.md, para poder implementarlas y probarlas de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Aplicación web con backend propio (ver plan.md → Project Structure):

- `backend/src/db/`, `backend/src/models/`, `backend/src/services/`, `backend/src/routes/`, `backend/server.js`
- `frontend/index.html`, `frontend/src/views/`, `frontend/src/styles/`, `frontend/src/main.js`
- `tests/unit/`, `tests/api/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y estructura básica

- [X] T001 Crear la estructura de carpetas del repositorio (`backend/src/{db,models,services,routes}`, `backend/data/`, `frontend/src/{views,styles}`, `tests/{unit,api,manual}`) según "Project Structure" de [plan.md](./plan.md)
- [X] T002 [P] Inicializar proyecto backend en `backend/package.json` con dependencias `express`, `pdfmake` (SQLite vía `node:sqlite` built-in, ver nota en plan.md) y devDependencies `vitest`, `supertest` (depende de T001)
- [X] T003 [P] Inicializar proyecto frontend Vite (JavaScript vanilla) en `frontend/package.json` (depende de T001)
- [X] T004 [P] Configurar `.gitignore` en la raíz excluyendo `node_modules/`, `backend/data/*.db` y los artefactos de build de `frontend/` (depende de T001)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura común que TODAS las historias de usuario necesitan antes de poder implementarse

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta que esta fase esté completa

- [X] T005 [P] Crear módulo de conexión SQLite en `backend/src/db/conexion.js` con `node:sqlite` (`DatabaseSync`), leyendo la ruta del fichero desde una variable de entorno (Principio V de la constitución) (depende de T002)
- [X] T006 Crear `backend/src/db/migraciones.js` con `CREATE TABLE IF NOT EXISTS` para `perfil`, `catalogo`, `presupuestos`, `lineas_presupuesto` (FK `presupuesto_id` con `ON DELETE CASCADE`) y `contadores_numeracion`, según el esquema de [data-model.md](./data-model.md) (depende de T005)
- [X] T007 [P] Crear el esqueleto de Express en `backend/src/app.js`: parseo de JSON, servir los estáticos del build de `frontend/`, formato uniforme de error `{ "error": "..." }`, y puntos de montaje para los routers (depende de T002)
- [X] T008 Crear el arranque del proceso en `backend/server.js`: lee `PORT` y la ruta de la BD desde variables de entorno, ejecuta las migraciones al iniciar y arranca Express (depende de T006, T007)
- [X] T009 [P] Implementar `models/perfil.js` (`obtenerPerfil`, `guardarPerfil` con upsert de la fila única) en `backend/src/models/perfil.js` según [contracts/almacenamiento.md](./contracts/almacenamiento.md) (depende de T006)
- [X] T010 Implementar `routes/perfil.routes.js` (`GET`/`PUT /api/perfil`) en `backend/src/routes/perfil.routes.js` y montarlo en `backend/src/app.js`, según [contracts/api.md](./contracts/api.md) (depende de T009, T007)
- [X] T011 [P] Crear el shell del frontend: `frontend/index.html`, navegación básica entre vistas en `frontend/src/main.js` y estilos base mobile-first en `frontend/src/styles/base.css` (depende de T003)

**Checkpoint**: Fundación lista — puede empezar la implementación de las historias de usuario

---

## Phase 3: User Story 1 - Generar un presupuesto completo en PDF (Priority: P1) 🎯 MVP

**Goal**: Un freelancer puede crear un presupuesto a mano (cliente, líneas, IVA, retención), ver el desglose calculado y descargarlo en PDF, sin necesitar perfil ni catálogo previos.

**Independent Test**: Introducir a mano los datos del cliente y las líneas de un presupuesto nuevo (sin perfil ni catálogo guardados) y comprobar que el PDF descargado muestra el desglose correcto (ver quickstart.md, secciones 1-4).

### Tests for User Story 1 ⚠️

> **NOTA: Escribir estos tests PRIMERO y comprobar que fallan antes de implementar**

- [X] T012 [P] [US1] Tests unitarios de `calcularPresupuesto` en `tests/unit/calculo.test.js` (Vitest): caso de referencia (base 2.000,00 €, IVA 420,00 €, retención −300,00 €, total 2.120,00 €), redondeo estándar (2,345 → 2,35), retención siempre 0 si `clienteTipo = "particular"` aunque `retencionIrpf` != "ninguna", cantidades/precios cero o negativos sin error, `lineas = []` → todos los importes en 0 — ver [contracts/calculo.md](./contracts/calculo.md)
- [X] T013 [P] [US1] Tests unitarios de `siguienteNumero` en `tests/unit/numeracion.test.js` (Vitest): formato `AAAA-NNN`, dos presupuestos el mismo año sin colisión, reinicio del contador en un año nuevo — ver [contracts/almacenamiento.md](./contracts/almacenamiento.md)
- [X] T014 [P] [US1] Tests de API de presupuestos en `tests/api/presupuestos.test.js` (supertest): crear/editar/eliminar un presupuesto, `404` al pedir un `id` inexistente, `409` al pedir el PDF de un presupuesto sin líneas, eliminar un presupuesto y crear otro nuevo confirmando que el número eliminado no se reutiliza (FR-018) — ver [contracts/api.md](./contracts/api.md)

### Implementation for User Story 1

- [X] T015 [US1] Implementar `calcularPresupuesto(lineas, tipoIva, clienteTipo, retencionIrpf)` en `backend/src/services/calculo.js` según [contracts/calculo.md](./contracts/calculo.md) (depende de T012)
- [X] T016 [US1] Implementar `siguienteNumero(anio)` en `backend/src/services/numeracion.js`, dentro de una transacción SQL sobre `contadores_numeracion` (depende de T006, T013)
- [X] T017 [US1] Implementar `models/presupuestos.js` (`listarPresupuestos`, `obtenerPresupuesto`, `crearPresupuesto`, `actualizarPresupuesto`, `eliminarPresupuesto`) en `backend/src/models/presupuestos.js`, derivando `baseImponible`/`iva`/`retencion`/`total` en cada lectura vía `calculo.js` y `fechaValidez` como `fechaEmision + 30 días naturales` (FR-012, cálculo de fecha independiente del contrato de calculo.js) (depende de T015, T016)
- [X] T018 [US1] Implementar `generarPdf.js` en `backend/src/services/generarPdf.js` con `pdfmake`: logo opcional, datos del freelancer desde `perfil` (u omitidos si no existe), datos del cliente, número, fechas de emisión/validez en `DD/MM/AAAA`, tabla de líneas y desglose en euros con coma decimal — ver [contracts/pdf-documento.md](./contracts/pdf-documento.md) (depende de T009, T015)
- [X] T019 [US1] Implementar `routes/presupuestos.routes.js` en `backend/src/routes/presupuestos.routes.js`: `GET`/`POST`/`PUT`/`DELETE /api/presupuestos(/:id)` y `GET /api/presupuestos/:id/pdf` (respondiendo `409` si no hay líneas antes de invocar `generarPdf.js`, `404` si el `id` no existe, `400` ante `clienteTipo`/`tipoIva` inválidos), y montarlo en `backend/src/app.js` (depende de T017, T018, T014)
- [X] T020 [P] [US1] Construir la vista de presupuesto (crear/editar) en `frontend/src/views/presupuesto.js`: datos del cliente, selector de tipo de IVA, retención (solo si empresa/autónomo), añadir/editar/eliminar líneas a mano, desglose en pantalla que se recalcula automáticamente ante cualquier cambio (sin acción manual, SC-003), botón de descarga de PDF y aviso si no hay líneas al intentar descargar (FR-014) (depende de T019)
- [X] T021 [P] [US1] Construir la vista de listado de presupuestos en `frontend/src/views/listado-presupuestos.js`: número, fecha, cliente y total de cada presupuesto (`GET /api/presupuestos`), con enlaces para editar o eliminar (depende de T019)
- [X] T022 [US1] Conectar las vistas de presupuesto y listado a la navegación en `frontend/src/main.js` (depende de T011, T020, T021)

**Checkpoint**: User Story 1 completamente funcional y probable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Reutilizar un catálogo de servicios (Priority: P2)

**Goal**: Un freelancer mantiene un catálogo de servicios habituales y los añade a un presupuesto con un clic.

**Independent Test**: Crear 2-3 servicios en el catálogo, añadir una línea desde el catálogo a un presupuesto nuevo y comprobar que se rellena con nombre y precio guardados (ver quickstart.md, sección 5).

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Tests de API de catálogo en `tests/api/catalogo.test.js` (supertest): crear, listar, editar un servicio (sin afectar a líneas ya copiadas en presupuestos existentes) y eliminarlo (idem) — ver [contracts/almacenamiento.md](./contracts/almacenamiento.md), FR-002

### Implementation for User Story 2

- [X] T024 [P] [US2] Implementar `models/catalogo.js` (`listarCatalogo`, `crearServicio`, `actualizarServicio`, `eliminarServicio`) en `backend/src/models/catalogo.js`, sin clave foránea hacia `lineas_presupuesto` (depende de T006, T023)
- [X] T025 [US2] Implementar `routes/catalogo.routes.js` (`GET`/`POST /api/catalogo`, `PUT`/`DELETE /api/catalogo/:id`) en `backend/src/routes/catalogo.routes.js` y montarlo en `backend/src/app.js` (depende de T024)
- [X] T026 [P] [US2] Construir la vista de gestión del catálogo en `frontend/src/views/catalogo.js`: listar, crear, editar y eliminar servicios (nombre + precio por defecto) (depende de T025)
- [X] T027 [US2] Añadir el control "añadir desde catálogo" a la vista de presupuesto en `frontend/src/views/presupuesto.js`: seleccionar un servicio rellena una línea nueva con su descripción y precio, editable después (depende de T020, T026)
- [X] T028 [US2] Conectar la vista de catálogo a la navegación en `frontend/src/main.js` (depende de T026)

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Guardar el perfil de marca una sola vez (Priority: P3)

**Goal**: Un freelancer configura su perfil (nombre, NIF, contacto, logo) una vez y los presupuestos nuevos lo usan automáticamente.

**Independent Test**: Configurar el perfil, cerrar y reabrir la aplicación, y comprobar que un presupuesto nuevo ya trae esos datos rellenos (ver quickstart.md, sección 6).

> Nota: el modelo y los endpoints de `perfil` (`GET`/`PUT /api/perfil`) ya se implementaron en la Fase 2 (Foundational, T009-T010) porque `generarPdf.js` de la US1 necesita poder leer un perfil ausente sin fallar. Esta fase añade la funcionalidad de cara al freelancer: la pantalla de configuración y el autorrelleno.

### Tests for User Story 3 ⚠️

- [X] T029 [P] [US3] Tests de API de perfil en `tests/api/perfil.test.js` (supertest): `GET` devuelve `null` si no está configurado, `PUT` crea/actualiza la fila única, `GET` posterior devuelve los datos guardados — ver [contracts/api.md](./contracts/api.md)

### Implementation for User Story 3

- [X] T030 [P] [US3] Construir la vista de perfil en `frontend/src/views/perfil.js`: formulario de nombre, NIF, contacto y logo (subida de imagen), guardado vía `PUT /api/perfil` (depende de T029)
- [X] T031 [US3] Autorrellenar los datos del freelancer en un presupuesto nuevo desde `GET /api/perfil` en `frontend/src/views/presupuesto.js` (depende de T020, T030)
- [X] T032 [US3] Conectar la vista de perfil a la navegación en `frontend/src/main.js` (depende de T030)

**Checkpoint**: Las tres historias de usuario funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias de usuario

- [X] T033 [P] Añadir los scripts `test` y `test:api` a `backend/package.json` (Vitest y supertest respectivamente, ver quickstart.md "Pruebas automáticas")
- [X] T034 [P] Repasar el diseño mobile-first (tamaño de botones, formularios legibles) en `frontend/src/styles/` en un viewport de móvil real o emulado (Principio IV, quickstart.md sección 10)
- [X] T035 Crear `backend/.env.example` documentando `PORT` y la ruta del fichero SQLite como variables de entorno, sin secretos en el código fuente (Principio V)
- [X] T036 Ejecutar la validación manual completa de [quickstart.md](./quickstart.md) (secciones 1 a 10 y 8bis, incluido el acceso multi-dispositivo) y corregir cualquier desviación encontrada. Secciones 1-9 y 8bis verificadas mediante un script automatizado equivalente a los pasos manuales (todas las aserciones en verde: desglose, redondeo, recalculo, numeración, catálogo, perfil, persistencia y edición tras PDF). **Nota**: la sección 10 (uso táctil real en un navegador móvil) no se ha podido verificar en este entorno por no disponer de una herramienta de automatización de navegador; se revisó el CSS (`frontend/src/styles/base.css`) para cumplir con las prácticas mobile-first (botones ≥44px, formularios en columna única, sin anchos fijos), pero queda pendiente de una comprobación visual real por parte del usuario.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede empezar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias de usuario
- **User Story 1 (Phase 3)**: depende de Foundational — sin dependencias de otras historias
- **User Story 2 (Phase 4)**: depende de Foundational; T027 además depende de la vista de presupuesto de US1 (T020)
- **User Story 3 (Phase 5)**: depende de Foundational (el modelo/API de perfil ya existen desde T009-T010); T031 además depende de la vista de presupuesto de US1 (T020)
- **Polish (Phase 6)**: depende de que las historias de usuario deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: independiente — es el MVP
- **US2 (P2)**: independiente a nivel de backend (modelo/rutas de catálogo); su integración visual (T027) se apoya en la vista de presupuesto creada en US1, sin romper su funcionamiento
- **US3 (P3)**: el modelo/API de perfil es fundacional (T009-T010); la funcionalidad de cara al usuario (T030-T032) se apoya en la vista de presupuesto de US1 para el autorrelleno (T031), sin romper su funcionamiento

### Within Each User Story

- Tests antes que la implementación (deben fallar primero)
- Servicios (`calculo.js`, `numeracion.js`) antes que modelos que dependen de ellos
- Modelos antes que rutas
- Rutas (backend) antes que las vistas de frontend que las consumen
- Historia completa y comprobada antes de pasar a la siguiente prioridad

### Parallel Opportunities

- Todas las tareas [P] de Setup (T002-T004) en paralelo tras T001
- T005, T007, T009, T011 de Foundational en paralelo (archivos distintos); T006, T008, T010 son secuenciales por sus dependencias
- Los tres bloques de tests de US1 (T012-T014) en paralelo
- T020 y T021 (vistas de US1) en paralelo tras T019
- T023 (tests US2) y T029 (tests US3) pueden ejecutarse en paralelo entre sí si se trabaja en varias historias a la vez tras Foundational

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de la User Story 1:
Task: "Tests unitarios de calcularPresupuesto en tests/unit/calculo.test.js"
Task: "Tests unitarios de siguienteNumero en tests/unit/numeracion.test.js"
Task: "Tests de API de presupuestos en tests/api/presupuestos.test.js"

# Lanzar juntas las vistas de frontend de la User Story 1 (tras T019):
Task: "Vista de presupuesto en frontend/src/views/presupuesto.js"
Task: "Vista de listado de presupuestos en frontend/src/views/listado-presupuestos.js"
```

---

## Implementation Strategy

### MVP First (solo User Story 1)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational (bloquea todo lo demás)
3. Completar Fase 3: User Story 1
4. **PARAR y VALIDAR**: probar User Story 1 de forma independiente con quickstart.md, secciones 1-4
5. Desplegar/mostrar si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. Añadir US1 → validar de forma independiente → Demo (¡MVP!)
3. Añadir US2 → validar de forma independiente → Demo
4. Añadir US3 → validar de forma independiente → Demo
5. Fase 6 (Polish) → validación completa de quickstart.md (incluido acceso multi-dispositivo)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- [Story] mapea cada tarea a su historia de usuario para trazabilidad
- Cada historia de usuario debe quedar completable y comprobable de forma independiente
- Comprobar que los tests fallan antes de implementar
- Confirmar cada checkpoint con quickstart.md antes de pasar a la siguiente fase
