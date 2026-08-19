# Implementation Plan: Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto

**Branch**: `002-rediseno-ui-clientes-estado` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-rediseno-ui-clientes-estado/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

**Actualización 2026-07-31**: La parte de rediseño visual de este plan (Technical
Context, Constitution Check y Project Structure en lo referente a `base.css` y
`generarPdf.js`) se actualiza para reflejar la dirección concreta "Banca privada"
(FR-029 a FR-039 de la spec, detallados en
`specs/pre-spec-rediseno-visual-banca-privada.md`). El resto del plan (clientes,
estado, home, navegación) no cambia. El PDF queda explícitamente fuera de esta
iteración: las referencias a `generarPdf.js`/`PALETA_MARCA` de la versión anterior
de este plan se marcan como retiradas, no se ejecutan.

## Summary

PresupuestosPro (spec 001) ya funciona: un freelancer crea presupuestos,
mantiene un catálogo y un perfil, y descarga PDFs, todo servido por un único
proceso Node.js/Express con SQLite y un frontend vanilla JS servido como
estáticos. Esta iteración no cambia esa arquitectura ni la lógica de cálculo:
añade una página de inicio y una navegación común (para no depender del
botón atrás), rediseña visualmente la aplicación **web** (no el PDF, ver
actualización 2026-07-31) con la dirección concreta "Banca privada" (paleta
de azules marinos, tipografía Inter, radio 6px, tarjetas con sombra — FR-029
a FR-039), añade un directorio de clientes reutilizable (CRUD) y añade un
campo de estado al presupuesto (Borrador/Enviado/Aceptado/Rechazado, con
Caducado calculado). Todo se construye extendiendo los patrones ya
existentes (funciones planas por entidad, sin ORM, sin framework de
frontend, tokens CSS en `:root`), sin introducir piezas de infraestructura
nuevas.

## Technical Context

**Language/Version**: Node.js ≥22.5.0 (backend, usa `node:sqlite` nativo);
JavaScript ES2022+ (frontend, módulos ES nativos sin transpilación more allá
de lo que hace Vite en build).

**Primary Dependencies**:
- Backend: `express` ^4.19 (API + estáticos), `pdfmake` ^0.2 (PDF),
  `node:sqlite` (`DatabaseSync`, built-in, sin dependencia externa).
- Frontend: sin framework (vanilla JS + DOM), router hash-based propio
  (`frontend/src/main.js`), `fetch` para llamar a la API. `vite` ^5.4 solo
  como herramienta de build/dev.
- No se añade ninguna dependencia nueva para esta feature (ni librería de
  componentes, ni gestor de estado, ni librería de diseño/CSS).
- **Actualización 2026-07-31**: La tipografía Inter (FR-030) se sirve
  auto-alojada como ficheros `.woff2` estáticos en `frontend/public/fonts/`
  con `@font-face` en `base.css`, sin añadir ningún paquete npm (ni
  `@fontsource/inter` ni similar) ni cargarla desde un CDN externo (ver
  research.md, punto 10).

**Storage**: SQLite, fichero único (`backend/data/presupuestospro.db`),
gestionado con SQL directo (sin ORM). Se amplía con una tabla `clientes`
nueva y una columna `estado` nueva en `presupuestos`; el resto del esquema
(perfil, catálogo, líneas, contador de numeración) no cambia.

**Testing**: Vitest (`tests/unit`, cálculo/numeración) + Supertest
(`tests/api`, endpoints Express) ya en uso; se añaden pruebas del mismo tipo
para `clientes` y para el nuevo endpoint de cambio de estado. No hay
framework de pruebas de frontend instalado; la validación de UI (navegación,
diseño visual, mobile-first) es manual y guiada por `quickstart.md`
(Principio IV).

**Target Platform**: Igual que spec 001 — servidor Node.js con disco
persistente para el fichero SQLite; clientes: navegador web moderno,
mobile-first.

**Project Type**: Aplicación web (backend Express + frontend estático servido
por el mismo proceso) — sin cambios respecto a spec 001.

**Performance Goals**: Sin objetivos nuevos; el volumen sigue siendo el de un
único freelancer por instalación (decenas/cientos de presupuestos y
clientes), igual que spec 001.

**Constraints**: El rediseño y las funciones nuevas (clientes, estado) MUST
NOT modificar la lógica de cálculo, la numeración ni el comportamiento ya
existente de los endpoints de presupuestos/perfil/catálogo descritos en
spec 001 (FR-013). Todo texto de cara al usuario en español de España.
Enfoque mobile-first ya existente, se mantiene.

**Scale/Scope**: Un freelancer por instalación; añade 1 tabla (`clientes`) y
1 columna (`presupuestos.estado`); añade 2 vistas de frontend (Inicio,
Clientes) y amplía 2 existentes (listado y detalle de presupuestos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Simplicidad Ante Todo | Se reutilizan los patrones ya existentes (funciones planas por entidad sin ORM, SQL directo, frontend vanilla, tokens CSS en `:root`). No se introduce ningún framework, librería de diseño ni infraestructura nueva; el directorio de clientes sigue el mismo patrón que `catalogo`, y el estado se deriva en lectura (sin *cron jobs* para "caducar" presupuestos). | ✅ PASS |
| II. Idioma y Mercado (Español de España, Euro) | Los textos nuevos (Inicio, Clientes, etiquetas de estado) están en español de España; los importes siguen formateándose con `formatearEuro` (es-ES, coma decimal). | ✅ PASS |
| III. Cero Alcance Fantasma | Solo se construye lo que confirma la spec 002 (clarificado explícitamente con el usuario): página de inicio, navegación común, rediseño visual, clientes y estado. *(Actualización 2026-07-31: "PDF a juego" retirado del alcance — ver nota bajo esta tabla.)* Quedan fuera notificaciones, envío de email, historial de estados e import/export masivo de clientes, tal como fijan las Assumptions de la spec. | ✅ PASS |
| IV. Verificable por una Persona No Técnica | Todos los criterios de éxito (navegación, resumen de la home, colores por estado, mobile, cálculo sin cambios) se verifican a mano desde la interfaz, documentado en quickstart.md. *(PDF retirado de esta lista, actualización 2026-07-31.)* | ✅ PASS |
| V. Respeto por los Datos del Usuario | El directorio de clientes solo guarda nombre/razón social y tipo (lo mínimo ya usado hoy para un cliente); ningún secreto nuevo se introduce en código (la ruta de la BD sigue viniendo de `DB_PATH`, variable de entorno). | ✅ PASS |

**Re-comprobación tras el diseño (Fase 1)**: research.md, data-model.md,
contracts/ y quickstart.md confirman que no se introduce ninguna pieza de
infraestructura nueva ni ninguna funcionalidad fuera de la spec 002; los 5
principios se mantienen en ✅ PASS. No hay ninguna desviación que registrar
en "Complexity Tracking".

**Re-comprobación tras la actualización 2026-07-31** (dirección "Banca
privada", FR-029 a FR-039): sigue sin introducirse infraestructura nueva —
Inter se auto-aloja como ficheros estáticos, sin paquete npm ni CDN (ver
Technical Context); el PDF queda explícitamente fuera de esta iteración
(Principio III, Cero Alcance Fantasma: no se toca `generarPdf.js` porque no
está pedido en esta actualización). Los 5 principios se mantienen en ✅ PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-rediseno-ui-clientes-estado/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Misma estructura que spec 001 (backend Express + frontend estático); se
# amplían los ficheros marcados con (+) y se añaden los marcados con (nuevo).
backend/
├── src/
│   ├── db/
│   │   ├── conexion.js
│   │   └── migraciones.js          # (+) tabla `clientes`; columna `estado` en `presupuestos`
│   ├── models/
│   │   ├── perfil.js
│   │   ├── catalogo.js
│   │   ├── clientes.js             # (nuevo) mismo patrón que catalogo.js
│   │   └── presupuestos.js         # (+) estado (guardado + calculado: Caducado)
│   ├── services/
│   │   ├── calculo.js              # sin cambios
│   │   ├── numeracion.js           # sin cambios
│   │   └── generarPdf.js           # sin cambios (PDF fuera de alcance, actualización 2026-07-31)
│   ├── routes/
│   │   ├── perfil.routes.js
│   │   ├── catalogo.routes.js
│   │   ├── clientes.routes.js      # (nuevo) CRUD, mismo patrón que catalogo.routes.js
│   │   └── presupuestos.routes.js  # (+) PATCH /:id/estado
│   └── app.js                      # (+) registra /api/clientes
├── data/
└── server.js

frontend/
├── index.html                      # (+) enlaces Inicio y Clientes en el nav común
├── public/
│   └── fonts/                      # (nuevo, 2026-07-31) .woff2 de Inter auto-alojados (FR-030)
├── src/
│   ├── main.js                     # (+) ruta por defecto "/inicio", resaltar enlace activo
│   ├── api.js                      # (+) llamadas a /api/clientes y PATCH estado
│   ├── views/
│   │   ├── inicio.js               # (nuevo) accesos a secciones + resumen por estado
│   │   ├── clientes.js             # (nuevo) listar/crear/editar/eliminar, mismo patrón que catalogo.js
│   │   ├── listado-presupuestos.js # (+) badge de estado, acción rápida de cambio de estado
│   │   ├── presupuesto.js          # (+) selector de cliente guardado + "guardar como cliente", selector de estado
│   │   ├── catalogo.js             # sin cambios funcionales
│   │   └── perfil.js               # sin cambios funcionales
│   └── styles/
│       └── base.css                # (+) tokens de color/tipografía/espaciado ampliados, estilos de badge y nav activo;
│                                    #     (actualización 2026-07-31) tokens sustituidos por los valores exactos de
│                                    #     FR-029 a FR-039 ("Banca privada"), @font-face de Inter, radio 6px, sombra de tarjeta
└── (build de Vite → servido por backend/src/app.js)

tests/
├── unit/                           # sin cambios (cálculo, numeración)
├── api/
│   ├── presupuestos.test.js        # (+) casos de estado
│   ├── catalogo.test.js            # sin cambios
│   ├── perfil.test.js              # sin cambios
│   └── clientes.test.js            # (nuevo) CRUD de clientes
└── manual/                         # checklists de verificación (ver quickstart.md)
```

**Structure Decision**: No se crea ningún proyecto ni carpeta de primer nivel
nueva; se amplía la misma aplicación web de dos paquetes (`backend/` +
`frontend/`) de la spec 001, siguiendo exactamente los mismos patrones por
capa (`db/` → `models/` → `routes/` en el backend; `views/` + `api.js` en el
frontend) para que `clientes` y `estado` sean indistinguibles en estilo del
resto del código ya existente.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

*Sin violaciones que justificar: no hay filas en esta tabla.*
