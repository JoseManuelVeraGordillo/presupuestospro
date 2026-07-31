# Research: Exportar todos los presupuestos en un .zip

## 1. Librería para generar el .zip

**Decision**: añadir `archiver` (^7) como dependencia nueva de `backend/`.

**Rationale**: `node:sqlite` demuestra que este proyecto prioriza dependencias
sin compilación nativa (se descartó `better-sqlite3` por esa razón, según
CLAUDE.md). Node.js no incluye de fábrica un escritor del contenedor ZIP (solo
`zlib` para compresión bruta), así que generar un .zip exige una librería.
`archiver` es pura JavaScript (sin binarios nativos), es la opción más usada
del ecosistema Node/Express para este caso exacto ("stream un .zip como
respuesta HTTP"), y permite ir añadiendo entradas (buffers en memoria, en este
caso) y volcarlas directamente a `res` con `archive.pipe(res)`, sin tener que
montar el .zip completo en memoria antes de empezar a responder. Esto encaja
con el volumen esperado (50+ presupuestos, PDFs ya generados como Buffer) sin
introducir un segundo búfer gigante.

**Alternatives considered**:
- `jszip`: API en memoria (`generateAsync({ type: 'nodebuffer' })`); obliga a
  tener el .zip completo construido en memoria antes de enviar nada al
  cliente. Con 50+ PDFs de varias páginas cada uno, es más memoria pico sin
  ninguna ventaja adicional.
- `yazl`: también pura JS y más minimalista que `archiver`, pero con una API
  de más bajo nivel (hay que gestionar manualmente el volcado a stream); no
  aporta nada sobre `archiver` para este caso y `archiver` es más estándar y
  mejor documentado.
- Implementar el formato ZIP a mano sobre `zlib`: descartado por complejidad
  innecesaria (Principio I, Simplicidad Ante Todo) frente a una librería ya
  probada.

Esta adición se documenta también en el "Complexity Tracking" del plan.md,
por ser la primera dependencia nueva desde la spec 001 (CLAUDE.md: "Sin
frameworks ni librerías nuevas salvo decisión explícita del usuario y
justificada en el plan.md").

## 2. Formato del "archivo de datos" dentro del .zip

**Decision**: un único fichero `datos-presupuestospro.json`, con
`JSON.stringify(datos, null, 2)` (JSON legible, indentado), conteniendo
`perfil`, `catalogo`, `clientes` y `presupuestos` (cada presupuesto con su
forma "completa", la misma que ya devuelve `obtenerPresupuesto(id)`: líneas,
importes desglosados y estado efectivo).

**Rationale**: la spec exige "formato legible como texto plano estructurado"
(FR-006) y explícitamente "no un formato binario opaco" (Assumptions). JSON
es texto plano, estructurado, legible por un humano razonable, sin
dependencias nuevas para escribirlo (el runtime de Node ya lo soporta) y es
el formato más directo para una futura spec de "restaurar la aplicación"
(parseable 1:1 a los mismos objetos que ya maneja el backend). El logotipo del
perfil se incluye dentro de este mismo JSON como cadena `data:image/png;
base64,...`, reutilizando tal cual el campo `logo` que ya produce
`obtenerPerfil()` — evita crear un segundo fichero binario dentro del .zip
solo para el logo (Principio I).

**Alternatives considered**:
- CSV: no soporta bien estructuras anidadas (líneas dentro de cada
  presupuesto, perfil con logo) sin normalizar en varios ficheros; la spec ya
  excluye "exportar a Excel/CSV" como fuera de alcance para el propósito de
  visualización, y aquí el propósito es restauración, no análisis tabular.
- Fichero binario propio (p. ej. un volcado serializado): descartado
  explícitamente por las Assumptions de la spec ("no en un formato binario
  opaco").
- Un .json por entidad (`perfil.json`, `clientes.json`, etc.) dentro del
  .zip: añade más ficheros y más lógica de nombrado sin ningún beneficio de
  legibilidad o de restauración futura frente a un único fichero (Principio
  I); la spec pide explícitamente "un único archivo de datos" (FR-006).

## 3. Cómo comunicar los presupuestos omitidos por fallo (FR-002)

**Decision**: cuando la generación de un PDF concreto falla, el backend
continúa con el resto y añade una cabecera de respuesta
`X-Presupuestos-Omitidos` con la lista de números de presupuesto omitidos
separados por comas (p. ej. `2026-005,2026-007`); el frontend la lee tras
completar la descarga y muestra un aviso solo si la cabecera está presente.

**Rationale**: la respuesta HTTP de este endpoint es el propio binario del
.zip (`Content-Type: application/zip`), así que no hay hueco en el cuerpo de
la respuesta para añadir un mensaje sin romper el fichero descargado. Una
cabecera HTTP es el mecanismo estándar para adjuntar metadatos junto a una
respuesta binaria sin tocar su contenido, y es trivial de leer desde
`fetch()` (`respuesta.headers.get(...)`) antes de convertir el cuerpo a
`Blob`. Evita introducir un segundo formato de respuesta (p. ej. multipart) o
un segundo endpoint solo para reportar errores.

**Alternatives considered**:
- Incluir un fichero adicional `errores.txt` dentro del .zip: el freelancer
  no lo vería hasta descomprimir, y la spec pide que "al finalizar, se avise
  al freelancer", lo que implica un aviso en la propia interfaz, no un
  fichero que hay que ir a abrir.
- Respuesta multipart (JSON + binario en una sola respuesta): mucha más
  complejidad en backend y frontend para un caso que, en la práctica, es
  poco frecuente (Principio I).

## 4. Limpieza de caracteres conflictivos y colisiones de nombre (FR-008, FR-009)

**Decision**: una función `limpiarNombreArchivo(texto)` en el nuevo servicio
de exportación elimina los caracteres inválidos en nombres de archivo de
Windows/macOS/Linux (`\ / : * ? " < > |` y caracteres de control) y recorta
espacios sobrantes; si el resultado queda vacío, se usa `'sin-nombre'`. Las
colisiones dentro de un mismo .zip se resuelven añadiendo ` (2)`, ` (3)`, …
al final del nombre base, llevando un `Set` de nombres ya usados durante la
generación de ese .zip (en memoria, no persistido).

**Rationale**: cubre el superconjunto de caracteres prohibidos en los tres
sistemas operativos habituales (Windows es el más restrictivo y determina el
conjunto), coincide exactamente con el ejemplo de la clarificación de la spec
("2026-001 - Estudio García (2).pdf"), y no depende de ninguna librería
nueva.

## 5. Endpoint y patrón de descarga en el frontend

**Decision**: `GET /api/presupuestos/exportar`, registrado en
`presupuestos.routes.js` **antes** de `GET /:id/pdf` y `GET /:id` (mismo
segmento de ruta; se evita cualquier ambigüedad con el parámetro `:id`). El
frontend usa `fetch()` (no el patrón de `<a>` sintético que ya existe para el
PDF individual) porque necesita saber cuándo la descarga ha terminado de
verdad para reactivar el botón (FR-012) y para leer la cabecera de omitidos
(punto 3); construye un `Blob` a partir de la respuesta y dispara la descarga
con un `<a>` temporal + `URL.createObjectURL`, igual que ya hace el
navegador con el `<a>` existente pero pilotado desde JS.

**Rationale**: es el único patrón existente en el frontend (`api.js` +
`manejarRespuesta`) que permite: (a) deshabilitar el botón mientras la
promesa está pendiente, (b) distinguir una respuesta de error JSON (0
presupuestos → 409) de una respuesta binaria de éxito, y (c) leer cabeceras
de la respuesta antes de descargar. Es una función nueva y aislada en
`api.js` (no pasa por `manejarRespuesta`, que asume JSON), consistente con
que ya no existe ningún otro caso de descarga binaria vía `fetch` en este
proyecto.

## 6. Indicador de progreso (FR-012)

**Decision**: no existe ningún componente de "cargando" reutilizable en el
proyecto; se añade el patrón mínimo ya usado implícitamente en otros botones
(atributo `disabled` + cambio de texto del botón), sin introducir un
componente de spinner nuevo. El botón pasa de "Exportar todo (.zip)" a
"Generando copia…" y queda `disabled` mientras la promesa de `fetch` está
pendiente; se reactiva en un bloque `finally`.

**Rationale**: Principio I (Simplicidad) y consistencia visual con el resto
de la interfaz, que no usa animaciones ni spinners en ningún otro punto.
