# Feature Specification: Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto

**Feature Branch**: `002-rediseno-ui-clientes-estado`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 001) con cambios, alterar la funcionalidad, permíteme crear clientes, guardar clientes, ver clientes y borrar clientes. Primero: añadir una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos en español de España. La lógica de negocio, los cálculos, la API y el esquema de datos no deben cambiar en absoluto."

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

### User Story 3 - Trabajar con un diseño visual profesional y coherente (Priority: P1)

Como freelancer, quiero que toda la aplicación tenga un aspecto profesional y
sobrio, con tipografía, colores y espaciados coherentes entre pantallas, para
transmitir una imagen de confianza a mí mismo y a mis clientes mientras trabajo,
igual que espero transmitirla en el PDF que les envío.

**Why this priority**: Es el segundo cambio explícitamente pedido y el motivo
principal de esta mejora; sin él, la página de inicio y los estados de presupuesto
seguirían conviviendo con una apariencia inconsistente en el resto de pantallas.

**Independent Test**: Puede probarse recorriendo todas las pantallas existentes
(inicio, presupuestos, clientes, catálogo, perfil) y comprobando que comparten la
misma tipografía, la misma paleta de colores, el mismo espaciado y la misma forma de
distinguir títulos, tablas, formularios y totales; y comprobando que la aplicación
sigue siendo usable desde una pantalla de móvil estrecha.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la aplicación, **When** el freelancer la compara
   con otra pantalla, **Then** ambas usan la misma tipografía y la misma paleta de
   colores limitada.
2. **Given** una pantalla con un título, una tabla, un formulario y un total (p. ej.
   el detalle de un presupuesto), **When** el freelancer la mira, **Then** puede
   distinguir claramente cada elemento por su jerarquía visual (el total resalta
   sobre las líneas, el título resalta sobre el contenido, etc.).
3. **Given** presupuestos en distintos estados, **When** el freelancer los ve en un
   listado, **Then** cada estado (Borrador, Enviado, Aceptado, Rechazado, Caducado)
   tiene un color o etiqueta distinguible y consistente en toda la aplicación.
4. **Given** la aplicación abierta en un móvil de pantalla estrecha, **When** el
   freelancer recorre cualquier pantalla, **Then** el contenido se ve y se usa
   correctamente, sin scroll horizontal ni elementos cortados.
5. **Given** un presupuesto con base imponible, IVA, retención y total, **When** el
   freelancer lo consulta antes y después del rediseño, **Then** las cifras
   mostradas son exactamente las mismas (el rediseño no cambia ningún cálculo).

---

### User Story 4 - Recibir presupuestos en PDF con la misma imagen profesional (Priority: P2)

Como freelancer, quiero que el PDF que descargo y envío a mis clientes tenga el
mismo aspecto profesional y sobrio que la aplicación, para que la imagen que reciben
mis clientes sea coherente con la que yo mismo veo al trabajar.

**Why this priority**: Extiende el rediseño (User Story 3) al documento final que
llega al cliente; aporta valor una vez que la identidad visual de la aplicación ya
está definida, pero puede probarse de forma independiente descargando un PDF.

**Independent Test**: Puede probarse generando el PDF de un presupuesto con datos de
ejemplo y comprobando visualmente que usa la misma tipografía y paleta de colores
que la aplicación, manteniendo toda la información que ya incluía.

**Acceptance Scenarios**:

1. **Given** un presupuesto con datos completos, **When** el freelancer descarga su
   PDF, **Then** el documento usa la misma tipografía y paleta de colores que la
   aplicación web.
2. **Given** el PDF descargado, **When** el freelancer lo compara con la versión
   anterior al rediseño, **Then** contiene exactamente la misma información (logo,
   datos del freelancer, datos del cliente, número, fechas, líneas y desglose de
   importes), solo con una presentación distinta.

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

**Rediseño del PDF**

- **FR-014**: El documento PDF generado MUST usar la misma identidad visual
  (tipografía y paleta de colores) que la aplicación web rediseñada.
- **FR-015**: El rediseño del PDF MUST conservar toda la información que ya incluía
  (logo si existe, datos del freelancer, datos del cliente, número de presupuesto,
  fecha de emisión, fecha de validez, tabla de líneas y desglose de importes), sin
  añadir ni quitar datos, solo cambiando su presentación visual.

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
- **SC-008**: Un freelancer, al comparar la aplicación web y el PDF descargado de un
  mismo presupuesto, reconoce a simple vista que comparten la misma tipografía y
  paleta de colores.

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
