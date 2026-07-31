# Implementation Plan: Exportar todos los presupuestos en un .zip

**Branch**: `003-exportar-presupuestos-zip` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-exportar-presupuestos-zip/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

PresupuestosPro (specs 001 y 002) ya genera presupuestos, los muestra en un
listado con estado y descarga el PDF de uno a uno. Esta iteración añade un
único botón "Exportar todo (.zip)" en el listado de presupuestos que genera
y descarga, bajo demanda, un .zip con el PDF de cada presupuesto existente
(reutilizando tal cual `services/generarPdf.js`) más un único fichero de
datos en JSON legible (presupuestos, catálogo, clientes y perfil con logo)
pensado para una futura restauración. Es una operación exclusivamente de
lectura: no se persiste ni se modifica nada. Se añade una única dependencia
nueva de backend (`archiver`, para construir el .zip) porque Node.js no
incluye de fábrica un escritor de contenedor ZIP; el resto se construye
extendiendo los patrones ya existentes (capas `models/` → `services/` →
`routes/` en backend, `views/` + `api.js` en frontend), sin frameworks ni
infraestructura nueva.

## Technical Context

**Language/Version**: Node.js ≥22.5.0 (backend, usa `node:sqlite` nativo);
JavaScript ES2022+ (frontend, módulos ES nativos).

**Primary Dependencies**:
- Backend: `express` ^4.19 (API + estáticos), `pdfmake` ^0.2 (PDF, sin
  cambios), `node:sqlite` (`DatabaseSync`, built-in). Se añade **una
  dependencia nueva**: `archiver` ^7, para generar el .zip en streaming
  (justificado en `research.md` punto 1 y en "Complexity Tracking" abajo,
  porque Node no incluye un escritor de ZIP de fábrica).
- Frontend: sin framework (vanilla JS + DOM), `fetch` para llamar a la API
  (nuevo uso: lectura de una respuesta binaria + cabecera personalizada, ver
  research.md punto 5). `vite` ^5.4 solo como build/dev. No se añade ninguna
  dependencia de frontend.

**Storage**: SQLite, mismo fichero único (`backend/data/presupuestospro.db`).
No se añade ninguna tabla ni columna (ver `data-model.md`): la exportación
lee `presupuestos`, `lineas_presupuesto`, `clientes`, `catalogo` y `perfil`
tal cual existen hoy, sin escribir nada.

**Testing**: Vitest (`tests/unit`, sin cambios) + Supertest (`tests/api`) ya
en uso; se añaden casos en `tests/api/presupuestos.test.js` para
`GET /api/presupuestos/exportar` (caso vacío → 409, caso con datos → 200 +
cabeceras + contenido del .zip, limpieza de nombres y colisiones). No hay
framework de pruebas de frontend instalado; la descarga real desde el
navegador, el indicador de progreso y la apariencia del .zip descomprimido
se validan a mano según `quickstart.md` (Principio IV).

**Target Platform**: Igual que specs anteriores — servidor Node.js con
disco persistente para el fichero SQLite; clientes: navegador web moderno.
Sin cambios de plataforma.

**Project Type**: Aplicación web (backend Express + frontend estático
servido por el mismo proceso) — sin cambios respecto a specs 001/002.

**Performance Goals**: Sin objetivo de latencia explícito (la propia spec
renuncia a un límite de tiempo, FR-011); el objetivo es que la interfaz
nunca parezca congelada mientras dura la exportación (FR-012), no una cota
de milisegundos. Volumen de referencia: 50+ presupuestos (User Story 3,
SC-004) sin límite máximo.

**Constraints**: La exportación NO DEBE modificar ningún dato existente
(FR-007, operación de solo lectura). Cada PDF dentro del .zip DEBE ser
exactamente el mismo documento que la descarga individual (FR-003) — se
logra reutilizando la misma función `generarPdf(presupuesto)` sin
modificarla. El .zip NUNCA debe fallar por culpa de un nombre de cliente con
caracteres conflictivos (FR-008) ni por colisiones de nombre entre PDF
(FR-009). Todo texto de cara al usuario en español de España.

**Scale/Scope**: Un freelancer por instalación (igual que specs anteriores);
añade 1 endpoint de backend, 1 servicio nuevo (`services/exportarZip.js`), 1
función nueva en `api.js`, y una ampliación del listado de presupuestos en
el frontend (botón + indicador de progreso). No añade vistas nuevas ni
cambia el esquema de datos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Simplicidad Ante Todo | Se reutiliza `generarPdf.js` sin modificarlo y el patrón de capas ya existente (`models/` → `services/` → `routes/`). La única pieza nueva de infraestructura (`archiver`) es la mínima imprescindible, ya que Node no ofrece un escritor de ZIP nativo; se descartan alternativas más complejas (formato ZIP a mano) y menos ajustadas al streaming ya disponible (`jszip`), ver research.md punto 1. El fichero de datos es un único JSON, no un formato por entidad. | ✅ PASS |
| II. Idioma y Mercado (Español de España, Euro) | Todos los textos nuevos (botón, aviso de "no hay presupuestos", indicador de progreso, aviso de presupuestos omitidos) están en español de España. Los importes dentro del .zip (PDF y JSON) siguen usando exactamente los mismos valores/formato ya calculados por `services/calculo.js`, sin tocar el formateo. | ✅ PASS |
| III. Cero Alcance Fantasma | Solo se construye lo que pide la spec 003 y sus clarificaciones (botón único, .zip con PDF + datos, aviso sin datos, limpieza de nombres, colisiones con sufijo, indicador de progreso, orden ascendente, sin timeout explícito). Quedan fuera, tal como fija la spec: importar la copia, exportar a Excel/CSV, copias automáticas/programadas, envío por email o subida a la nube. | ✅ PASS |
| IV. Verificable por una Persona No Técnica | Los 5 criterios de éxito (SC-001 a SC-005) se verifican descargando y descomprimiendo el .zip desde la propia interfaz, sin leer código ni logs — documentado en quickstart.md. | ✅ PASS |
| V. Respeto por los Datos del Usuario | La exportación es de solo lectura (FR-007): no crea, modifica ni borra ningún dato. El fichero de datos incluye únicamente información que el freelancer ya introdujo voluntariamente en la app (nada nuevo se solicita); no se introduce ningún secreto en código (la ruta de la BD sigue viniendo de `DB_PATH`, variable de entorno; `archiver` no requiere credenciales). | ✅ PASS |

**Re-comprobación tras el diseño (Fase 1)**: research.md, data-model.md,
contracts/ y quickstart.md confirman que la única desviación real de la
"simplicidad por defecto" es la dependencia `archiver`, ya justificada y
registrada en "Complexity Tracking" abajo; no aparece ninguna otra pieza de
infraestructura ni funcionalidad fuera de la spec 003. Los 5 principios se
mantienen en ✅ PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-exportar-presupuestos-zip/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Misma estructura que specs 001/002 (backend Express + frontend estático);
# se amplían los ficheros marcados con (+) y se añaden los marcados con
# (nuevo).
backend/
├── package.json                    # (+) añade dependencia `archiver`
├── src/
│   ├── models/
│   │   ├── presupuestos.js         # sin cambios (ya expone listarPresupuestos/obtenerPresupuesto)
│   │   ├── clientes.js             # sin cambios
│   │   ├── catalogo.js             # sin cambios
│   │   └── perfil.js               # sin cambios
│   ├── services/
│   │   ├── generarPdf.js           # sin cambios (se reutiliza tal cual, FR-003)
│   │   └── exportarZip.js          # (nuevo) construye el .zip: limpieza de nombres, colisiones, fichero de datos, cabecera de omitidos
│   ├── routes/
│   │   └── presupuestos.routes.js  # (+) GET /exportar (registrada antes de /:id/pdf y /:id)
│   └── app.js                      # sin cambios (la ruta nueva se registra dentro de presupuestos.routes.js, ya montado)
└── data/

frontend/
├── src/
│   ├── api.js                      # (+) nueva función de descarga binaria para /api/presupuestos/exportar (no pasa por manejarRespuesta)
│   ├── views/
│   │   └── listado-presupuestos.js # (+) botón "Exportar todo (.zip)", estado disabled/"Generando copia…", aviso sin presupuestos y aviso de omitidos
│   └── styles/
│       └── base.css                # (+) estilo mínimo para botón deshabilitado durante la exportación (reutiliza tokens ya existentes)
└── (build de Vite → servido por backend/src/app.js)

tests/
├── unit/                           # sin cambios
├── api/
│   └── presupuestos.test.js        # (+) casos de GET /exportar (vacío → 409, éxito → 200 + cabeceras + contenido del .zip)
└── manual/                         # checklists de verificación (ver quickstart.md)
```

**Structure Decision**: No se crea ningún proyecto ni carpeta de primer
nivel nueva; se amplía la misma aplicación web de dos paquetes (`backend/` +
`frontend/`) de specs 001/002. La única pieza genuinamente nueva es el
servicio `backend/src/services/exportarZip.js`, que sigue el mismo patrón de
capas que el resto (llama a los `models/` existentes, no accede a SQLite
directamente), para que la exportación no introduzca una vía de acceso a
datos distinta a la ya establecida.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Nueva dependencia de backend: `archiver` | El .zip descargable (FR-002, FR-004) es el propio objetivo de la feature; Node.js no incluye de fábrica un escritor del contenedor ZIP (solo `zlib` para compresión bruta), y permite volcar el .zip directamente a la respuesta HTTP en streaming sin montar todo el archivo en memoria (ver research.md punto 1) | Implementar el formato ZIP a mano sobre `zlib`: complejidad y superficie de error muy superiores a las de una librería madura y ampliamente usada, sin ningún beneficio para un producto de un solo freelancer por instalación |
