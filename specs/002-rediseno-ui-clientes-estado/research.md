# Research: Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto

**Fecha**: 2026-07-30 | **Feature**: 002-rediseno-ui-clientes-estado

Punto de partida: la aplicación de la spec 001 ya está implementada y en uso
(Node.js/Express + `node:sqlite` + `pdfmake` en el backend; frontend vanilla
JS con router hash-based y CSS con tokens en `:root`, servido como estáticos
por el propio Express). No hace falta investigar arquitectura desde cero —
las decisiones de esta fase son sobre **cómo encajar** los cambios nuevos
(clientes, estado, home, rediseño) en ese sistema ya existente sin romper
FR-013 (la lógica de negocio, los cálculos y el comportamiento ya existente
de la API no cambian).

## 1. Cómo añadir esquema nuevo sin ORM ni librería de migraciones

- **Decision**: Ampliar `ejecutarMigraciones()` con un `CREATE TABLE IF NOT
  EXISTS clientes (...)` (mismo patrón que `catalogo`), y añadir la columna
  `estado` a `presupuestos` comprobando primero con `PRAGMA table_info` si ya
  existe (para poder ejecutar `ALTER TABLE presupuestos ADD COLUMN estado
  TEXT NOT NULL DEFAULT 'borrador' CHECK (...)` una sola vez, de forma
  idempotente en cada arranque del servidor).
- **Rationale**: Mantiene el patrón ya usado (SQL directo, sin ORM, sin
  librería de migraciones) — Principio I. El valor por defecto `'borrador'`
  cumple además el requisito de la spec de que los presupuestos ya existentes
  se consideren en Borrador tras la actualización, sin necesidad de un script
  de datos aparte.
- **Alternatives considered**: Introducir una librería de migraciones
  (knex, umzug, node-pg-migrate) — rechazada por ser una capa nueva
  desproporcionada para una tabla y una columna.

## 2. Cómo representar el estado "Caducado"

- **Decision**: `presupuestos.estado` solo almacena `borrador`, `enviado`,
  `aceptado` o `rechazado`. "Caducado" **no se guarda**: se calcula en la
  capa de modelo (`presupuestos.js`, donde ya se calcula `fechaValidez`)
  comparando la fecha de hoy con `fechaValidez`, y solo sustituye al estado
  guardado cuando este es `borrador` o `enviado`. El campo `estado` que
  devuelve la API es siempre el estado efectivo (ya incluye este cálculo).
- **Rationale**: Evita un job en segundo plano que "caduque" presupuestos
  periódicamente — el estado efectivo siempre se deriva en el momento de
  leer, por lo que nunca puede quedar desactualizado. Coherente con FR-024,
  FR-025 y con el Principio I (nada de infraestructura de tareas
  programadas para algo que se puede calcular al vuelo).
- **Alternatives considered**: Cron/job periódico que actualice `estado` a
  `caducado` en la base de datos — rechazado por complejidad innecesaria y
  porque además complicaría FR-026 (siempre editable: habría que "revivir"
  filas que el job ya hubiera marcado).

## 3. Cambiar el estado desde el listado sin reenviar todo el presupuesto

- **Decision**: Nuevo endpoint `PATCH /api/presupuestos/:id/estado` que solo
  acepta `{ "estado": "borrador" | "enviado" | "aceptado" | "rechazado" }` y
  actualiza esa columna. Tanto la acción rápida del listado como el selector
  del detalle llaman a este mismo endpoint.
- **Rationale**: El listado no carga las líneas de cada presupuesto (ver
  `filaAResumen`); reutilizar `PUT /api/presupuestos/:id` obligaría a enviar
  también `lineas`, `clienteNombre`, `tipoIva`, etc. solo para cambiar una
  etiqueta. Un endpoint mínimo evita esa sobrecarga y dice explícitamente
  "esto solo cambia el estado" (FR-028).
- **Alternatives considered**: Reutilizar `PUT /:id` completo desde el
  listado (obligaría a hacer primero un `GET` del presupuesto completo antes
  de poder cambiar el estado desde una fila del listado) — rechazado por
  añadir una llamada de red y complejidad de UI innecesarias.

## 4. Resumen de actividad de la página de inicio

- **Decision**: El resumen (número de presupuestos por estado) se calcula en
  el **frontend**, agregando la respuesta ya existente de `GET
  /api/presupuestos` (que pasa a incluir `estado` en cada elemento del
  listado). No se crea un endpoint de agregación en el backend.
- **Rationale**: El volumen de datos de un único freelancer (decenas o pocos
  cientos de presupuestos) hace trivial este conteo en el cliente; añadir un
  endpoint dedicado solo para sumar por estado sería una capa de más para
  este tamaño de proyecto (Principio I).
- **Alternatives considered**: `GET /api/presupuestos/resumen` — rechazado,
  no aporta nada que el frontend no pueda calcular ya con los datos que
  recibe.

## 5. Directorio de clientes: relación con `presupuestos`

- **Decision**: Tabla `clientes` independiente (`id`, `nombre`, `tipo`), sin
  clave foránea desde `presupuestos`. Elegir un cliente guardado en el
  formulario de presupuesto solo copia sus valores (`clienteNombre`,
  `clienteTipo`) al presupuesto en ese momento, igual que ya ocurre hoy con
  las líneas tomadas del catálogo.
- **Rationale**: `presupuestos.cliente_nombre` / `cliente_tipo` ya existen
  como columnas de texto plano (spec 001) y **no pueden cambiar** (FR-013).
  Copiar el valor en vez de enlazar por `cliente_id` cumple directamente
  FR-020 (borrar un cliente no afecta a presupuestos ya creados) sin tener
  que gestionar integridad referencial ni decidir qué hacer con presupuestos
  huérfanos al borrar un cliente.
- **Alternatives considered**: `cliente_id` como columna FK nullable en
  `presupuestos` — rechazada: acoplaría presupuestos ya emitidos al ciclo de
  vida del cliente guardado (contradice FR-020) y sería un cambio de esquema
  mayor del estrictamente necesario en una tabla que la spec pide no tocar
  más de lo imprescindible.

## 6. Identidad visual compartida entre la web y el PDF

- **Decision**: Los tokens de color/tipografía/espaciado viven en `:root` de
  `frontend/src/styles/base.css` (ya el único lugar de la paleta hoy, FR-007).
  En el backend, `generarPdf.js` define una pequeña constante
  (`PALETA_MARCA`) con los mismos valores hexadecimales usados en `base.css`,
  con un comentario que indica que debe mantenerse sincronizada a mano.
- **Rationale**: `frontend/` y `backend/` son dos paquetes npm
  independientes sin build compartido ni bundler común; crear un paquete de
  "design tokens" compartido (p. ej. un JSON consumido por Vite y por Node)
  sería una pieza de infraestructura nueva no justificada por el tamaño de
  la paleta (un puñado de colores) — Principio I. Duplicar esa constante
  pequeña con un comentario de sincronización es la opción más simple que
  cumple FR-014.
- **Alternatives considered**: Paquete compartido de tokens de diseño
  (workspace npm + JSON) — rechazado por complejidad desproporcionada al
  tamaño del cambio.

## 7. Navegación común visible en todas las páginas

- **Decision**: Mantener el `<header>`/`<nav>` estático de
  `frontend/index.html` (fuera de `#app`, el contenedor que gestiona el
  router hash-based) y añadirle los enlaces a "Inicio" y "Clientes". Ampliar
  `main.js` para, tras cada navegación, marcar con una clase `.activo` el
  enlace del nav que corresponde a la ruta actual (FR-005).
- **Rationale**: El nav ya persiste entre navegaciones hoy, porque el router
  solo sustituye el contenido de `#app` — cumple FR-004 sin cambios
  estructurales. No hace falta convertirlo en un componente reutilizable ni
  introducir un mini-framework de plantillas para lograr "navegación común".
- **Alternatives considered**: Extraer un layout/componente de navegación
  reutilizable con una librería de plantillas — rechazado, el HTML estático
  actual ya cumple el requisito con un cambio mínimo (añadir enlaces +
  resaltar el activo).

## 8. Ruta raíz → página de inicio

- **Decision**: Cambiar el valor por defecto del router (cuando
  `window.location.hash` está vacío) de `/presupuestos` a `/inicio`, y
  registrar una vista nueva `renderVistaInicio`.
- **Rationale**: `index.html` es siempre el documento que Express sirve en
  la raíz (`/`); al ser una SPA de una sola página, "acceder a la raíz del
  servidor" (FR-001) se traduce en que el router del lado cliente muestre
  `/inicio` quando no hay ninguna ruta específica en el hash — sin tocar
  `app.js` ni el servidor.
- **Alternatives considered**: Servir un `index.html` distinto para `/` vs.
  el resto de rutas desde Express — rechazado, rompería el patrón de SPA de
  un solo `index.html` ya usado y no aporta nada que el router del cliente
  no resuelva ya.

## 9. Estrategia de pruebas

- **Decision**: Añadir pruebas Vitest/Supertest para `clientes` (CRUD) y
  para `PATCH /api/presupuestos/:id/estado` (incluida la transición
  automática a `caducado`), siguiendo el mismo patrón que
  `tests/api/catalogo.test.js` y `tests/api/presupuestos.test.js`. La
  navegación, el rediseño visual y el comportamiento mobile-first se
  verifican a mano según `quickstart.md` (Principio IV) — no hay framework
  de pruebas de UI instalado y no se añade ninguno para esta feature.
- **Rationale**: Mismo patrón ya validado en spec 001; añadir un framework
  de pruebas de UI (Playwright, Cypress) sería desproporcionado para el
  alcance de este cambio y no lo pide la spec.
- **Alternatives considered**: Añadir Playwright/Cypress para probar
  navegación y estilos — rechazado por Principio I y III (no pedido en la
  spec).

## Resumen de decisiones (Technical Context)

Todas las incógnitas de la sección "Technical Context" del plan quedan
resueltas reutilizando el sistema ya existente; no quedan puntos con "NEEDS
CLARIFICATION". No hay ninguna desviación de la constitución que registrar
en "Complexity Tracking" — todas las decisiones anteriores refuerzan el
Principio I en vez de desviarse de él.
