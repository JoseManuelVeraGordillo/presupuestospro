# Implementation Plan: Presupuestos en PDF para Freelancers

**Branch**: `001-presupuestos-pdf` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-presupuestos-pdf/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Un freelancer necesita crear presupuestos con su marca (perfil, catálogo de
servicios) y descargarlos en PDF con el desglose de IVA y retención de IRPF ya
calculado. Decisión explícita del usuario para esta versión: backend con
**Node.js + Express + SQLite**, para que el mismo freelancer pueda acceder a
sus datos desde varios dispositivos (móvil y ordenador) apuntando a la misma
instalación. Sigue sin haber cuentas de usuario, sin base de datos en la nube
(SQLite es un fichero local del propio servidor) y sin soporte para que
varios freelancers distintos compartan una misma instalación.

**Enfoque técnico**: una única instalación de un servidor Node.js/Express por
freelancer, con un fichero SQLite como almacén de datos, sirviendo tanto la
API como los archivos estáticos de una interfaz web sencilla (mobile-first).
El PDF se genera en el propio servidor y se descarga a través de un endpoint.

## Decisión de arquitectura: por qué backend y no solo navegador

En la primera versión de este plan se propuso una aplicación 100% en el
navegador (sin servidor), que era la opción más simple según el Principio I
de la constitución. El usuario ha pedido explícitamente cambiar a un backend
con Node.js + Express + SQLite, con el objetivo concreto de que **un mismo
freelancer** pueda usar la aplicación desde varios dispositivos sin perder ni
duplicar sus datos. Ese objetivo **no se puede lograr** con almacenamiento
exclusivo en el navegador (cada dispositivo tendría sus propios datos,
aislados) — un servidor con una base de datos persistente es la forma más
simple de resolverlo. Se confirmó con el usuario que:

- Es **una instalación del servidor por freelancer** (no un servidor
  compartido entre freelancers distintos), por lo que no hace falta ningún
  sistema de cuentas ni de identificadores por usuario — sigue sin haber
  login.
- SQLite se ejecuta como un fichero en el propio servidor, no como un
  servicio de base de datos en la nube gestionado por terceros.

Este cambio se registra como una desviación justificada del Principio I de
Simplicidad (ver "Complexity Tracking" más abajo), porque introduce una pieza
de infraestructura (un servidor con estado) que la versión anterior del plan
evitaba.

**Riesgo a tener en cuenta (negocio)**: al no haber cuentas ni contraseña,
cualquier persona que conozca la URL del servidor podría ver y editar los
datos del freelancer (perfil, clientes, presupuestos). Esto es aceptable si el
freelancer controla quién conoce esa URL (p. ej. no la publica ni la indexa
un buscador), pero es un riesgo real de confidencialidad que no existía con
el enfoque 100% navegador (donde solo el dueño del dispositivo tenía acceso
físico a los datos). No se añade ningún mecanismo de protección en esta
versión por no estar pedido en la spec (Principio III); se deja documentado
para que el usuario decida conscientemente si lo acepta o lo convierte en una
futura spec (p. ej. un código de acceso compartido, sin llegar a ser un
sistema de cuentas).

## Technical Context

**Language/Version**: Node.js (LTS 20.x) en el backend; JavaScript
(ES2022+) + HTML5/CSS3 en el frontend servido por el propio backend.

**Primary Dependencies**:
- `express` — servidor HTTP y API REST.
- `node:sqlite` (`DatabaseSync`) — módulo nativo incluido en Node.js
  (estable desde Node 22.5+, usado aquí con Node 20.x LTS o superior) para
  acceso a SQLite con API síncrona simple (evita la complejidad de
  callbacks/promesas para un volumen de datos bajo y un solo proceso).
  **Nota de implementación** (2026-07-30): se sustituyó `better-sqlite3` por
  este módulo built-in durante `/speckit-implement` porque `better-sqlite3`
  exige compilar un módulo nativo (node-gyp) y el entorno de desarrollo no
  tenía instalado el workload de C++ de Visual Studio; `node:sqlite` ofrece
  la misma API síncrona sin ninguna compilación nativa. No cambia ninguna
  decisión de arquitectura (sigue siendo un único fichero SQLite local).
- `pdfmake` — generación del PDF, ejecutada ahora en el servidor (Node),
  servida como descarga desde un endpoint.
- Frontend sin framework pesado: JavaScript vanilla organizado en módulos,
  que llama a la API mediante `fetch`. Vite solo como herramienta de
  build/desarrollo del frontend (los archivos resultantes los sirve Express).

**Storage**: SQLite, un único fichero (p. ej. `data/presupuestospro.db`) en el
disco del servidor. No hay base de datos en la nube ni servicio de terceros;
la base de datos es local a la instalación de cada freelancer.

**Testing**: Vitest (o el test runner nativo de Node) para las pruebas
unitarias de cálculo y numeración; `supertest` para pruebas ligeras de los
endpoints de la API. Verificación manual guiada (quickstart.md) para los
flujos completos de usuario y para el acceso multi-dispositivo, en línea con
el Principio IV (verificable por una persona no técnica).

**Target Platform**: Servidor Node.js (Linux, en cualquier hosting que
soporte procesos Node persistentes con disco persistente para el fichero
SQLite); clientes: navegador web moderno, con diseño mobile-first.

**Project Type**: Aplicación web con backend propio (API + servidor de
archivos estáticos) y frontend integrado servido por el mismo proceso.

**Performance Goals**: Respuesta de la API percibida como instantánea
(volumen bajo, un solo freelancer por instalación); generación de PDF en
segundos para el volumen de líneas típico de un presupuesto.

**Constraints**: Sin cuentas de usuario ni contraseñas. Sin base de datos en
la nube (SQLite local al servidor). Una instalación por freelancer (sin
multi-tenant). El hosting elegido debe ofrecer **disco persistente** para el
fichero SQLite — si el hosting borra el disco en cada despliegue (típico de
algunas plataformas "serverless"), se perderían todos los datos; este es un
requisito técnico no negociable para esta arquitectura.

**Scale/Scope**: Un freelancer por instalación; volumen de datos bajo
(decenas o pocos cientos de presupuestos y servicios de catálogo); acceso
concurrente desde, como mucho, un puñado de dispositivos del mismo
freelancer.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Simplicidad Ante Todo | Se introduce un servidor con estado (Express + SQLite) en lugar de la opción más simple (sitio 100% estático). Es una desviación deliberada, solicitada explícitamente por el usuario para lograr acceso multi-dispositivo del mismo freelancer, algo que el enfoque solo-navegador no puede ofrecer. Documentada en "Complexity Tracking". | ⚠️ Desviación justificada (ver Complexity Tracking) |
| II. Idioma y Mercado (Español de España, Euro) | Sin cambios: interfaz, mensajes y PDF en español de España, importes en euros con coma decimal. | ✅ PASS |
| III. Cero Alcance Fantasma | No se añaden cuentas de usuario, multi-tenant, ni ningún mecanismo de protección de acceso no pedido en la spec; el riesgo de acceso sin autenticación queda documentado, no resuelto con funcionalidad no solicitada. | ✅ PASS |
| IV. Verificable por una Persona No Técnica | Todos los criterios de éxito, incluida la prueba de acceso desde varios dispositivos, se verifican usando la interfaz y el PDF descargado, documentados como pasos manuales en quickstart.md. | ✅ PASS |
| V. Respeto por los Datos del Usuario | Solo se piden los datos imprescindibles. Al existir ahora un backend, cualquier configuración sensible (p. ej. la ruta del fichero de base de datos o el puerto del servidor) se gestiona mediante variables de entorno, nunca en el código fuente. | ✅ PASS |

**Re-comprobación tras el diseño (Fase 1)**: research.md, data-model.md,
contracts/ y quickstart.md mantienen el alcance a "una instalación por
freelancer, sin cuentas, sin BD en la nube, sin funcionalidad no pedida por
la spec". La única desviación respecto a la constitución sigue siendo la
introducción del servidor con estado, ya justificada abajo; el resto de
principios se mantienen en ✅ PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-pdf/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Backend Express + frontend servido como archivos estáticos por el mismo proceso
backend/
├── src/
│   ├── db/
│   │   ├── conexion.js          # apertura del fichero SQLite (better-sqlite3)
│   │   └── migraciones.js       # creación de tablas si no existen
│   ├── models/                   # acceso a datos por entidad (SQL directo, sin ORM)
│   │   ├── perfil.js
│   │   ├── catalogo.js
│   │   └── presupuestos.js
│   ├── services/
│   │   ├── calculo.js            # base, IVA, retención, total, redondeo
│   │   ├── numeracion.js         # AAAA-NNN correlativo, reinicio anual
│   │   └── generarPdf.js         # construcción del documento con pdfmake
│   ├── routes/                    # endpoints Express (ver contracts/api.md)
│   │   ├── perfil.routes.js
│   │   ├── catalogo.routes.js
│   │   └── presupuestos.routes.js
│   └── app.js                     # configuración de Express (rutas + estáticos)
├── data/                           # fichero presupuestospro.db (persistente, fuera de git)
└── server.js                       # arranque del proceso Node

frontend/
├── index.html
├── src/
│   ├── views/                     # pantallas: perfil, catálogo, presupuesto
│   ├── styles/                    # CSS mobile-first
│   └── main.js                    # arranque, llamadas a la API vía fetch
└── (build de Vite → servido por backend/src/app.js como estáticos)

tests/
├── unit/                           # cálculo, redondeo, numeración (Vitest)
├── api/                            # pruebas de endpoints (supertest)
└── manual/                         # checklists de verificación (ver quickstart.md)
```

**Structure Decision**: Un único proceso Node.js (`backend/`) sirve tanto la
API REST como los archivos estáticos del frontend (`frontend/`, compilado con
Vite). Esto evita desplegar dos servicios separados (mantiene el despliegue
en una sola pieza, mitigando parte de la complejidad añadida por tener
backend). La separación en `db/` (acceso a SQLite), `models/` (consultas por
entidad), `services/` (cálculo, numeración y PDF, sin dependencias de
Express) y `routes/` (capa HTTP) mantiene el código organizado sin introducir
patrones adicionales (nada de ORM, nada de arquitectura en capas más allá de
esta separación mínima).

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Servidor con estado (Express) + base de datos (SQLite) en lugar de sitio 100% estático | El usuario requiere que un mismo freelancer acceda a los mismos datos desde varios dispositivos (móvil + ordenador) | Almacenamiento solo en el navegador (IndexedDB/localStorage) aísla los datos por dispositivo: no puede cumplir el requisito de acceso multi-dispositivo bajo ninguna configuración, por simple que sea |
