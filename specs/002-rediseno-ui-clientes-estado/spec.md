# Feature Specification: Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto

**Feature Branch**: `002-rediseno-ui-clientes-estado`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 001) con cambios, alterar la funcionalidad, permíteme crear clientes, guardar clientes, ver clientes y borrar clientes. Primero: añadir una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos en español de España. La lógica de negocio, los cálculos, la API y el esquema de datos no deben cambiar en absoluto."

**Actualización 2026-07-31**: La sección de rediseño visual (User Story 3) se sustituye por
la dirección de producto "Banca privada", detallada en
`specs/pre-spec-rediseno-visual-banca-privada.md` (paleta, tipografía y demás tokens
concretos, con criterios de aceptación verificables sí/no). Esa dirección **excluye
explícitamente el PDF de esta iteración**; por eso User Story 4 y los requisitos FR-014/
FR-015 quedan retirados de esta spec (ver nota en su sección y en Clarifications,
sesión 2026-07-31). El resto del contenido de esta spec (página de inicio, estados de
presupuesto, gestión de clientes) no se ve alterado por esta actualización.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Empezar en una página de inicio con navegación común (Priority: P1) 🎯 MVP

Como freelancer, quiero que al entrar en la aplicación aparezca una página de inicio
con accesos claros a Presupuestos, Clientes, Catálogo y Perfil, y una navegación
visible en todas las pantallas, para moverme por la aplicación sin perderme ni tener
que usar el botón atrás del navegador.

**Why this priority**: Es el primer cambio explícitamente pedido y la base de la
mejora de usabilidad: sin un punto de entrada claro y una navegación común, el resto
del rediseño no se puede recorrer de forma coherente.

**Independent Test**: Puede probarse accediendo a la raíz del servidor y comprobando
que aparece la página de inicio con enlaces a las 4 secciones y un resumen de
actividad; y navegando desde cualquier sección a cualquier otra usando solo la
navegación visible, sin pulsar atrás.

**Acceptance Scenarios**:

1. **Given** la aplicación recién abierta, **When** el freelancer accede a la raíz
   del servidor, **Then** ve una página de inicio con enlaces claros a Presupuestos,
   Clientes, Catálogo y Perfil.
2. **Given** la página de inicio, **When** el freelancer la consulta, **Then** ve un
   resumen de actividad con el número de presupuestos agrupados por estado.
3. **Given** cualquier página de la aplicación (por ejemplo, el Catálogo), **When**
   el freelancer quiere ir a otra sección (por ejemplo, Clientes), **Then** puede
   hacerlo usando la navegación común visible en esa misma página, sin necesidad de
   volver a la página de inicio ni usar el botón atrás.
4. **Given** el freelancer está en una sección concreta, **When** mira la navegación
   común, **Then** puede identificar en qué sección se encuentra actualmente.

---

### User Story 2 - Distinguir el estado de cada presupuesto (Priority: P1)

Como freelancer, quiero marcar y ver de un vistazo si un presupuesto está en
Borrador, Enviado, Aceptado, Rechazado o Caducado, para saber en qué punto está cada
encargo sin tener que abrirlo y sin llevar el seguimiento aparte.

**Why this priority**: Es condición necesaria tanto para el resumen de actividad de
la página de inicio (User Story 1) como para los "estados visuales distinguibles"
pedidos explícitamente en el rediseño; sin este dato no hay nada que resumir ni que
colorear.

**Independent Test**: Puede probarse creando varios presupuestos, cambiando su
estado manualmente entre Borrador, Enviado, Aceptado y Rechazado, y comprobando que
el listado de presupuestos y la página de inicio reflejan esos cambios; y dejando
pasar la fecha de validez de uno sin marcarlo como Aceptado ni Rechazado para
comprobar que pasa a Caducado automáticamente.

**Acceptance Scenarios**:

1. **Given** un presupuesto recién creado, **When** el freelancer lo consulta,
   **Then** aparece en estado Borrador por defecto.
2. **Given** un presupuesto en Borrador, **When** el freelancer lo marca como
   Enviado, Aceptado o Rechazado (desde su detalle o con una acción rápida en el
   listado, sin necesidad de abrirlo), **Then** el listado de presupuestos y el
   detalle muestran el nuevo estado de forma visualmente distinguible (p. ej. color
   o etiqueta distinta para cada uno).
3. **Given** un presupuesto cuya fecha de validez (30 días desde la emisión) ya ha
   pasado y que no ha sido marcado como Aceptado ni Rechazado, **When** el freelancer
   lo consulta, **Then** aparece como Caducado sin que haya tenido que marcarlo a
   mano.
4. **Given** un presupuesto ya marcado como Aceptado o Rechazado, **When** pasa su
   fecha de validez, **Then** conserva su estado (Aceptado o Rechazado) y no cambia
   a Caducado.
5. **Given** varios presupuestos en distintos estados, **When** el freelancer
   consulta la página de inicio, **Then** ve cuántos presupuestos hay en cada
   estado, y esa cifra coincide con lo que ve en el listado de presupuestos.

---

### User Story 3 - Trabajar con un diseño visual tipo "banca privada" (Priority: P1)

Como freelancer, quiero que toda la aplicación tenga el aspecto sobrio y solvente de
un dashboard financiero (tipo Mercury o el panel de Stripe), con una única paleta de
azules marinos, tipografía técnica consistente y componentes sin adornos, para
transmitir la misma confianza que espero que mis clientes perciban en un extracto
bancario o una factura de gestoría, no la de un prototipo sin estilar.

**Why this priority**: Es el segundo cambio explícitamente pedido y el motivo
principal de esta mejora; sin él, la página de inicio y los estados de presupuesto
seguirían conviviendo con una apariencia inconsistente en el resto de pantallas. La
dirección concreta ("Banca privada") y sus valores exactos están fijados en
`specs/pre-spec-rediseno-visual-banca-privada.md`.

**Independent Test**: Puede probarse recorriendo todas las pantallas existentes
(inicio, presupuestos, clientes, catálogo, perfil) e inspeccionando directamente sus
valores: color exacto de fondo/texto/acento, familia tipográfica, radio de esquina,
tratamiento de tarjetas (sombra) y estados `:hover`/`:focus`, comprobando que
coinciden con los tokens fijados en FR-029 a FR-039; y comprobando que la aplicación
sigue siendo usable desde una pantalla de móvil estrecha.

**Acceptance Scenarios**:

1. **Given** cualquier enlace de la interfaz, **When** el freelancer lo inspecciona,
   **Then** no muestra el subrayado ni el color azul/morado por defecto del
   navegador; usa los colores de la paleta definida (FR-029, FR-038).
2. **Given** cualquier texto de la aplicación, **When** se compara su tipografía,
   **Then** todos usan la familia Inter (pesos 400/500/600), sin depender de la
   fuente del sistema como familia principal (FR-030).
3. **Given** un importe en euros mostrado en un listado, un desglose o un total,
   **When** el freelancer lo mira, **Then** aparece en peso 600 con cifras
   tabulares, nunca en gris ni en peso normal (FR-031).
4. **Given** presupuestos en distintos estados, **When** el freelancer los ve como
   badge en cualquier lugar (listado, detalle, resumen de inicio), **Then** cada
   badge usa fondo del color de estado al 10-12% de opacidad y texto del mismo color
   al 100%, con los valores exactos de la paleta (FR-032), y no con colores sueltos
   ajenos a ella.
5. **Given** cualquier botón, campo de formulario o tarjeta, **When** el freelancer
   los compara entre pantallas, **Then** todos comparten el mismo radio de esquina
   (FR-033) y las tarjetas de lista se diferencian del fondo mediante sombra, no solo
   borde (FR-034).
6. **Given** el bloque de navegación/acciones primarias y el bloque de datos en una
   misma pantalla (p. ej. "+ Nuevo presupuesto" frente al listado de presupuestos),
   **When** el freelancer los compara, **Then** se distinguen por más de un atributo
   visual, no solo por el color de relleno (FR-035).
7. **Given** cualquier botón, `select` o pestaña de navegación, **When** recibe el
   foco o el cursor pasa por encima, **Then** su aspecto cambia de forma visible
   respecto al estado en reposo (FR-036).
8. **Given** una acción destructiva como "Eliminar", **When** se muestra junto a
   acciones no destructivas, **Then** se distingue por el color de error y por al
   menos un atributo adicional, no solo por el color (FR-037).
9. **Given** cualquier pantalla en una resolución de escritorio de 1280px o más,
   **When** el freelancer la observa, **Then** el contenido está contenido en un
   ancho máximo consistente y centrado, sin vacíos sin estructurar junto al
   contenido (FR-039).
10. **Given** la aplicación abierta en un móvil de pantalla estrecha, **When** el
    freelancer recorre cualquier pantalla, **Then** el contenido se ve y se usa
    correctamente, sin scroll horizontal ni elementos cortados.
11. **Given** un presupuesto con base imponible, IVA, retención y total, **When** el
    freelancer lo consulta antes y después del rediseño, **Then** las cifras
    mostradas son exactamente las mismas (el rediseño no cambia ningún cálculo).

---

### User Story 4 - Recibir presupuestos en PDF con la misma imagen profesional (Priority: P2)

> **Retirada de esta spec (actualización 2026-07-31).** La dirección "Banca privada"
> (`specs/pre-spec-rediseno-visual-banca-privada.md`) excluye explícitamente el PDF
> de esta iteración: el rediseño se limita a la interfaz web. Esta User Story y los
> requisitos FR-014/FR-015 se conservan aquí tachados como registro histórico de lo
> que se pidió originalmente, pero no forman parte del alcance actual. Alinear el PDF
> con la nueva identidad visual requeriría una spec propia (ver "Assumptions").

Como freelancer, quiero que el PDF que descargo y envío a mis clientes tenga el
mismo aspecto profesional y sobrio que la aplicación, para que la imagen que reciben
mis clientes sea coherente con la que yo mismo veo al trabajar.

~~**Why this priority**: Extiende el rediseño (User Story 3) al documento final que
llega al cliente; aporta valor una vez que la identidad visual de la aplicación ya
está definida, pero puede probarse de forma independiente descargando un PDF.~~

~~**Independent Test**: Puede probarse generando el PDF de un presupuesto con datos de
ejemplo y comprobando visualmente que usa la misma tipografía y paleta de colores
que la aplicación, manteniendo toda la información que ya incluía.~~

~~**Acceptance Scenarios**:~~

~~1. **Given** un presupuesto con datos completos, **When** el freelancer descarga su
   PDF, **Then** el documento usa la misma tipografía y paleta de colores que la
   aplicación web.~~
~~2. **Given** el PDF descargado, **When** el freelancer lo compara con la versión
   anterior al rediseño, **Then** contiene exactamente la misma información (logo,
   datos del freelancer, datos del cliente, número, fechas, líneas y desglose de
   importes), solo con una presentación distinta.~~

---

### User Story 5 - Gestionar un directorio de clientes (Priority: P2)

Como freelancer, quiero crear, ver, editar y eliminar clientes guardados, y poder
elegir uno guardado al crear un presupuesto, para no tener que volver a escribir los
datos de mis clientes habituales cada vez.

**Why this priority**: Aporta valor de ahorro de tiempo por sí sola, de forma similar
al catálogo de servicios de la spec 001, pero no es imprescindible para emitir un
presupuesto (sigue siendo posible escribir los datos del cliente a mano, como ya
permitía la spec 001).

**Independent Test**: Puede probarse creando dos o tres clientes, editando uno,
eliminando otro, y comprobando que al crear un presupuesto nuevo se puede elegir un
cliente guardado y que sus datos rellenan el presupuesto.

**Acceptance Scenarios**:

1. **Given** la sección de Clientes, **When** el freelancer crea un cliente nuevo
   con nombre/razón social y tipo (empresa/autónomo o particular), **Then** el
   cliente queda guardado y aparece en el listado de clientes.
2. **Given** un cliente guardado, **When** el freelancer edita sus datos, **Then**
   los cambios se reflejan en el listado de clientes.
3. **Given** un cliente guardado, **When** el freelancer lo elimina, **Then** deja
   de aparecer en el listado de clientes, pero los presupuestos ya creados con sus
   datos no cambian ni desaparecen.
4. **Given** un presupuesto nuevo, **When** el freelancer elige un cliente guardado
   en lugar de escribirlo a mano, **Then** el nombre/razón social y el tipo de
   cliente se rellenan automáticamente, editables antes de generar el PDF.
5. **Given** un presupuesto nuevo, **When** el freelancer prefiere no usar el
   directorio, **Then** puede seguir escribiendo los datos del cliente a mano, como
   en la versión anterior.
6. **Given** un presupuesto nuevo con los datos de un cliente escritos a mano,
   **When** el freelancer decide guardarlo, **Then** puede guardarlo como cliente
   nuevo en el directorio en el mismo paso, sin ir por separado a la sección
   Clientes.

---

### Edge Cases

- Página de inicio sin presupuestos creados: el resumen de actividad muestra todos
  los estados en cero, sin error.
- Cliente eliminado que fue usado en presupuestos ya creados: esos presupuestos
  conservan su copia independiente de los datos del cliente, sin verse afectados.
- Dos clientes guardados con el mismo nombre: se permite sin restricción, igual que
  ocurre hoy con los servicios del catálogo.
- Presupuesto marcado como Aceptado o Rechazado cuya fecha de validez ya pasó: se
  mantiene en ese estado; el sistema nunca lo pasa a Caducado automáticamente
  (aunque el freelancer sigue pudiendo cambiar su estado a mano en cualquier
  momento, como cualquier otro presupuesto).
- Presupuesto Caducado que el cliente acepta o rechaza fuera de plazo: el
  freelancer puede marcarlo manualmente como Aceptado o Rechazado en cualquier
  momento; ningún estado queda bloqueado para edición manual.
- Presupuestos creados antes de esta mejora, sin estado guardado previamente: se
  consideran en Borrador por defecto al mostrarse.
- Navegación común en pantalla de móvil muy estrecha: todas las secciones deben
  seguir siendo accesibles (p. ej. mediante un menú compacto), sin ocultar ninguna
  permanentemente.
- Cambio de estado de un presupuesto que ya tiene PDF descargado previamente: se
  permite sin restricción; no bloquea la edición ni la descarga posterior, igual que
  ya ocurre con las líneas del presupuesto (spec 001).
- Descarga del PDF de un presupuesto en Borrador: el estado no cambia
  automáticamente a Enviado; el freelancer debe marcarlo a mano si procede.

## Clarifications

### Session 2026-07-30

- Q: La petición pide un directorio de clientes reutilizable (crear/ver/editar/
  borrar), pero la spec 001 dice explícitamente que no existe tal directorio y que
  la API/esquema no deben cambiar en absoluto. ¿Se añade igualmente la gestión de
  clientes como una entidad nueva, aunque implique nueva API y nueva tabla? → A: Sí,
  se añade gestión de clientes como una entidad nueva (crear, ver, editar, eliminar),
  ampliando el alcance más allá de un rediseño puramente visual.
- Q: La petición pide distinguir visualmente el estado de cada presupuesto (Borrador/
  Enviado/Aceptado/Rechazado/Caducado) y resumirlos en la página de inicio, pero hoy
  el presupuesto no tiene ningún campo de estado. ¿Se añade un campo de estado nuevo
  al presupuesto, aunque implique cambio de esquema? → A: Sí, se añade un campo de
  estado nuevo, editable por el freelancer (Borrador/Enviado/Aceptado/Rechazado), con
  Caducado calculado automáticamente al pasar la fecha de validez.
- Q: Cuando el freelancer escribe los datos de un cliente a mano en un presupuesto
  (sin elegir uno guardado), ¿debe poder guardar esos datos como cliente nuevo en el
  mismo paso, o son flujos totalmente separados y solo se guarda un cliente yendo
  expresamente a la sección Clientes? → A: Guardar al vuelo — al escribir un cliente
  a mano en un presupuesto, el freelancer puede guardarlo opcionalmente como cliente
  nuevo en el directorio en el mismo paso, sin tener que ir por separado a la sección
  Clientes.
- Q: ¿El estado "Enviado" de un presupuesto lo marca siempre el freelancer a mano, o
  el sistema lo cambia automáticamente a Enviado en cuanto se descarga el PDF por
  primera vez? → A: Manual siempre — descargar el PDF no cambia el estado por sí
  solo; el freelancer marca "Enviado" cuando lo considere oportuno.
- Q: Una vez que un presupuesto está marcado como Aceptado o Rechazado, o el sistema
  lo muestra como Caducado, ¿puede el freelancer volver a cambiarlo a otro estado, o
  quedan bloqueados para siempre? → A: Siempre editable — cualquier estado se puede
  cambiar a cualquier otro en cualquier momento, incluidos Aceptado, Rechazado y
  Caducado, igual que un presupuesto nunca queda bloqueado para edición en la
  spec 001.
- Q: ¿Desde dónde debe poder cambiar el freelancer el estado de un presupuesto: solo
  desde su detalle, o también con una acción rápida directamente desde el listado?
  → A: También desde el listado — además de poder cambiarlo abriendo el
  presupuesto, el listado de presupuestos ofrece una acción rápida para cambiar el
  estado sin necesidad de abrirlo.

### Session 2026-07-31

- Q: El usuario aportó un documento de pre-especificación propio
  (`specs/pre-spec-rediseno-visual-banca-privada.md`) que fija una dirección visual
  concreta ("Banca privada": paleta de azules marinos, tipografía Inter, radio de
  esquina 6px, tarjetas con sombra) y que excluye explícitamente el PDF de esta
  iteración. ¿Se sustituye la User Story 3 (antes genérica: "tipografía consistente",
  "paleta limitada") por esta dirección concreta, y se retira la User Story 4/FR-014/
  FR-015 del alcance? → A: Sí a ambas. La User Story 3 y los FR-006 a FR-013 se
  mantienen como marco general, ampliados con los nuevos FR-029 a FR-039 que fijan
  los valores exactos de la dirección "Banca privada"; la User Story 4 y FR-014/
  FR-015 quedan retirados de esta spec (marcados como histórico) porque el PDF no
  forma parte de esta dirección visual.
- Q: Los valores concretos (colores hexadecimales, radio de esquina en píxeles,
  familia tipográfica) que resuelven ambigüedades ya señaladas en
  `checklists/visual-pdf.md` (CHK006, CHK007, CHK008, CHK030) — ¿deben incorporarse
  como requisitos funcionales nuevos (verificables sí/no) o quedar solo en el
  documento de pre-spec, fuera de la spec formal? → A: Como requisitos funcionales
  nuevos dentro de la spec (FR-029 a FR-039), citando el documento de pre-spec como
  fuente, para que sean verificables igual que el resto de FR de esta spec.

## Requirements *(mandatory)*

### Functional Requirements

**Página de inicio y navegación**

- **FR-001**: El sistema MUST mostrar una página de inicio al acceder a la raíz del
  servidor, como punto de entrada de la aplicación.
- **FR-002**: La página de inicio MUST mostrar accesos claros a las secciones de
  Presupuestos, Clientes, Catálogo y Perfil.
- **FR-003**: La página de inicio MUST mostrar un resumen de actividad que incluya,
  como mínimo, el número de presupuestos agrupados por estado.
- **FR-004**: Todas las páginas de la aplicación MUST compartir un mismo elemento de
  navegación visible que permita moverse entre Inicio, Presupuestos, Clientes,
  Catálogo y Perfil sin depender del botón atrás del navegador.
- **FR-005**: La navegación común MUST indicar en qué sección se encuentra
  actualmente el usuario.

**Rediseño visual**

- **FR-006**: El sistema MUST aplicar una tipografía consistente en toda la
  aplicación, definida en un único lugar reutilizado por todas las pantallas.
- **FR-007**: El sistema MUST aplicar una paleta de colores limitada, definida en un
  único lugar reutilizado por todas las pantallas, componentes y estados visuales.
- **FR-008**: El sistema MUST aplicar un espaciado uniforme entre elementos en todas
  las pantallas.
- **FR-009**: El sistema MUST distinguir visualmente, mediante jerarquía clara,
  títulos, tablas, formularios y totales/importes en cada pantalla.
- **FR-010**: El sistema MUST mostrar cada estado de presupuesto (Borrador, Enviado,
  Aceptado, Rechazado, Caducado) con un color o etiqueta distinguible y consistente
  en cualquier lugar donde se muestre (listados, detalle, resumen de la página de
  inicio).
- **FR-011**: El sistema MUST mantener el enfoque mobile-first ya existente,
  garantizando que toda pantalla rediseñada sea usable desde un móvil de pantalla
  estrecha.
- **FR-012**: Todo texto de cara al usuario, incluidos los de las pantallas nuevas
  (inicio, clientes, estados), MUST estar en español de España.
- **FR-013**: El rediseño visual MUST NOT alterar la lógica de negocio, los cálculos
  (base imponible, IVA, retención, total, redondeo), la numeración de presupuestos,
  ni el comportamiento existente de la API de presupuestos, perfil y catálogo
  descritos en la spec 001.

> Los valores exactos (colores, tipografía, radio, sombra, foco, ancho de
> contenido) que hacen verificables FR-006 a FR-010 y FR-013 están fijados en
> **FR-029 a FR-039**, más abajo, correspondientes a la dirección "Banca privada".

**Rediseño del PDF**

> **Retirados de esta spec (actualización 2026-07-31).** Ver nota en User Story 4:
> la dirección "Banca privada" excluye el PDF de esta iteración. Se conservan
> tachados como registro histórico.

~~**FR-014**: El documento PDF generado MUST usar la misma identidad visual
(tipografía y paleta de colores) que la aplicación web rediseñada.~~
~~**FR-015**: El rediseño del PDF MUST conservar toda la información que ya incluía
(logo si existe, datos del freelancer, datos del cliente, número de presupuesto,
fecha de emisión, fecha de validez, tabla de líneas y desglose de importes), sin
añadir ni quitar datos, solo cambiando su presentación visual.~~

**Gestión de clientes**

- **FR-016**: El sistema MUST permitir crear un cliente guardado con, como mínimo,
  nombre/razón social y tipo (empresa/autónomo o particular).
- **FR-017**: El sistema MUST permitir consultar el listado de clientes guardados y
  ver el detalle de cada uno.
- **FR-018**: El sistema MUST permitir editar los datos de un cliente guardado.
- **FR-019**: El sistema MUST permitir eliminar un cliente guardado.
- **FR-020**: Eliminar un cliente guardado MUST NOT afectar a los presupuestos ya
  creados con sus datos, ya que esos presupuestos conservan una copia independiente
  de los datos del cliente en el momento en que se usaron (mismo patrón que el
  catálogo de servicios, spec 001 FR-002).
- **FR-021**: El sistema MUST permitir, al crear o editar un presupuesto, elegir un
  cliente guardado para rellenar automáticamente su nombre/razón social y tipo, sin
  eliminar la posibilidad de escribir los datos del cliente a mano sin guardarlo
  (comportamiento heredado de la spec 001).
- **FR-022**: El sistema MUST permitir, al escribir los datos de un cliente a mano en
  un presupuesto sin elegir uno guardado, guardarlo opcionalmente como cliente nuevo
  en el directorio en ese mismo paso, sin obligar a hacerlo ni exigir ir por
  separado a la sección Clientes.

**Estado del presupuesto**

- **FR-023**: Todo presupuesto MUST tener un estado, que se inicia en Borrador al
  crearse.
- **FR-024**: El sistema MUST permitir cambiar manualmente el estado de un
  presupuesto entre Borrador, Enviado, Aceptado y Rechazado en cualquier momento,
  incluso si ya estaba en Aceptado, Rechazado o Caducado (ningún estado queda
  bloqueado para edición manual); descargar el PDF de un presupuesto MUST NOT
  cambiar su estado automáticamente.
- **FR-025**: El sistema MUST mostrar automáticamente un presupuesto como Caducado
  cuando su fecha de validez (30 días desde la emisión) ha pasado y no ha sido
  marcado como Aceptado ni como Rechazado, sin necesidad de que el freelancer lo
  marque a mano.
- **FR-026**: El sistema MUST conservar el estado Aceptado o Rechazado de un
  presupuesto aunque su fecha de validez haya pasado (no MUST pasar a Caducado).
- **FR-027**: La página de inicio MUST mostrar el número de presupuestos en cada
  estado (Borrador, Enviado, Aceptado, Rechazado, Caducado), coincidiendo con lo que
  se ve en el listado de presupuestos.
- **FR-028**: El sistema MUST permitir cambiar el estado de un presupuesto tanto
  desde su detalle como mediante una acción rápida en el listado de presupuestos,
  sin necesidad de abrirlo.

**Dirección visual concreta: "Banca privada" (actualización 2026-07-31)**

> Fuente: `specs/pre-spec-rediseno-visual-banca-privada.md`. Estos requisitos fijan
> con valores exactos y verificables lo que FR-006 a FR-010 y FR-013 dejaban a
> criterio de diseño abierto. Aplican solo a la interfaz web (ver nota de alcance en
> "Rediseño del PDF").

- **FR-029**: El sistema MUST usar exactamente la siguiente paleta como fuente única
  de verdad para toda la interfaz web: fondo general `#F7F8FA`, superficie
  (tarjetas/formularios) `#FFFFFF`, texto principal `#0B1F3A`, texto secundario
  `#5B6B84`, color primario `#2E5AAC`, primario oscuro/hover `#0B1F3A`, éxito
  `#1E7A4C`, error `#B4232C`, alerta `#9A6700`, borde `#E1E4E9`.
- **FR-030**: El sistema MUST usar la familia tipográfica Inter (pesos 400, 500 y
  600) como familia primaria en toda la interfaz web, sin depender de la fuente del
  sistema como familia principal.
- **FR-031**: El sistema MUST mostrar los importes en euros (listados, desgloses,
  totales) en peso 600 con cifras tabulares (`tabular-nums`), nunca en texto
  secundario ni en peso normal.
- **FR-032**: El sistema MUST mostrar cada badge de estado de presupuesto con fondo
  del color de estado correspondiente al 10-12% de opacidad y texto del mismo color
  al 100%, usando exclusivamente los colores de FR-029 (Borrador: texto secundario;
  Enviado: `#2E5AAC`; Aceptado: `#1E7A4C`; Rechazado: `#B4232C`; Caducado:
  `#9A6700`); MUST NOT introducir colores de estado ajenos a esta tabla.
- **FR-033**: El sistema MUST aplicar un radio de esquina uniforme de 6px a
  botones, campos de formulario y tarjetas en toda la aplicación.
- **FR-034**: El sistema MUST diferenciar las tarjetas de lista (presupuestos,
  clientes, catálogo) del fondo general mediante sombra (`box-shadow`), no
  únicamente mediante borde.
- **FR-035**: El sistema MUST distinguir visualmente, mediante más de un atributo
  (p. ej. color de fondo y elevación, no solo el color de relleno), el bloque de
  navegación/acciones primarias del bloque de datos en cada pantalla.
- **FR-036**: El sistema MUST mostrar un estado `:hover`/`:focus-visible`
  visualmente distinto del estado en reposo en todo botón, campo `select` y
  pestaña de navegación.
- **FR-037**: El sistema MUST distinguir las acciones destructivas (p. ej.
  "Eliminar") de las no destructivas mediante el color de error definido en FR-029
  y al menos un atributo adicional (posición, énfasis o icono), no solo el color.
- **FR-038**: El sistema MUST NOT dejar ningún enlace con el estilo por defecto del
  navegador (subrayado o color azul/morado de visitado); todo enlace MUST usar los
  colores de la paleta de FR-029.
- **FR-039**: El sistema MUST contener el contenido de cada vista en un ancho
  máximo consistente y centrado en resoluciones de escritorio de 1280px o más, sin
  vacíos sin estructurar junto al contenido.

### Key Entities *(include if feature involves data)*

- **Cliente**: nombre/razón social y tipo (empresa/autónomo o particular) de un
  destinatario habitual de presupuestos, guardado y reutilizable entre presupuestos.
  Eliminar un cliente no afecta a los presupuestos que ya usaron sus datos, porque
  cada presupuesto conserva su propia copia independiente.
- **Presupuesto** (ampliación de la spec 001): además de los datos ya existentes
  (número, fecha de emisión, validez, tipo de IVA, retención, cliente y líneas),
  incorpora un estado (Borrador, Enviado, Aceptado, Rechazado o Caducado) que
  determina su color/etiqueta visual y se refleja en el resumen de la página de
  inicio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde cualquier pantalla de la aplicación, un freelancer llega a
  cualquiera de las secciones (Inicio, Presupuestos, Clientes, Catálogo, Perfil) en
  un solo toque o clic sobre la navegación común, sin usar el botón atrás.
- **SC-002**: El número de presupuestos por estado mostrado en la página de inicio
  coincide exactamente con el número real de presupuestos en cada estado del
  listado, en el 100% de las comprobaciones.
- **SC-003**: Un freelancer identifica el estado de un presupuesto con solo mirar su
  color o etiqueta, sin necesidad de abrirlo, en el 100% de los presupuestos
  mostrados en un listado.
- **SC-004**: Un freelancer crea un cliente nuevo y lo usa para rellenar un
  presupuesto en menos de 1 minuto.
- **SC-005**: Al eliminar un cliente guardado, el 100% de los presupuestos ya
  emitidos con sus datos siguen mostrando la misma información que antes de la
  eliminación.
- **SC-006**: En el presupuesto de ejemplo (base 2.000,00 €, IVA 21%, retención 15%),
  el total mostrado tras el rediseño sigue coincidiendo al céntimo con 2.120,00 € en
  el 100% de las pruebas, confirmando que el rediseño no altera los cálculos.
- **SC-007**: Todas las pantallas, incluida la página de inicio y la gestión de
  clientes, se usan correctamente desde un móvil de pantalla estrecha, sin scroll
  horizontal ni elementos cortados.
- ~~**SC-008**: Un freelancer, al comparar la aplicación web y el PDF descargado de
  un mismo presupuesto, reconoce a simple vista que comparten la misma tipografía y
  paleta de colores.~~ *(Retirado 2026-07-31: el PDF queda fuera de alcance de esta
  iteración visual; ver User Story 4.)*
- **SC-009**: Un freelancer identifica el estado de un presupuesto y su importe
  total de un vistazo (en menos de 2 segundos), sin necesidad de leer ninguna
  etiqueta de texto, en el 100% de los presupuestos mostrados en un listado.
- **SC-010**: Una auditoría visual completa de las 5 pantallas existentes (inicio,
  presupuestos, clientes, catálogo, perfil) no encuentra ningún elemento con un
  estilo de navegador por defecto sin intervenir (enlaces subrayados en azul/
  morado, controles nativos sin estilar).

## Assumptions

- El estado Caducado se calcula automáticamente a partir de la fecha de validez
  (30 días desde la emisión) y no requiere que el freelancer lo marque a mano; el
  cálculo automático no sobrescribe un estado Aceptado o Rechazado ya marcado, pero
  el freelancer puede seguir cambiando el estado de cualquier presupuesto a mano en
  cualquier momento (ningún estado queda bloqueado para edición manual).
- Los presupuestos ya existentes antes de esta mejora, al no tener un estado
  guardado previamente, se consideran en Borrador por defecto la primera vez que se
  muestran tras la actualización.
- El directorio de clientes no exige que el nombre/razón social sea único; se
  permiten clientes duplicados, igual que ya ocurre con los servicios del catálogo
  de la spec 001.
- Elegir un cliente guardado al crear un presupuesto copia sus datos en ese momento
  (igual que las líneas de catálogo, spec 001): editar o eliminar el cliente después
  no cambia los presupuestos ya creados con sus datos.
- La aplicación sigue sin requerir cuentas de usuario ni contraseña (modelo de una
  instalación por freelancer, spec 001); el directorio de clientes es compartido
  dentro de esa misma instalación.
- Quedan fuera de alcance en esta versión: notificaciones automáticas al cambiar de
  estado, envío del presupuesto por email desde la propia aplicación, historial de
  cambios de estado, e importación o exportación masiva de clientes.
- Salvo la incorporación del estado del presupuesto y del directorio de clientes
  (ambos confirmados explícitamente como necesarios para esta mejora), el resto de
  la lógica de negocio, cálculos, numeración, API y esquema de datos descritos en la
  spec 001 permanecen sin cambios.
- El rediseño visual de esta iteración (dirección "Banca privada",
  `specs/pre-spec-rediseno-visual-banca-privada.md`) se limita a la interfaz web; el
  documento PDF generado con pdfmake no se modifica en esta spec y conserva su
  apariencia actual hasta que exista una spec propia para alinearlo (ver User
  Story 4, retirada).
- Los valores exactos de color, tipografía, radio de esquina y demás tokens de
  FR-029 a FR-039 proceden íntegramente del documento de pre-spec aportado por el
  usuario; ese documento queda como referencia de diseño para `/speckit-plan`, no
  solo como insumo de esta spec.
