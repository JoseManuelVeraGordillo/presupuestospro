# Feature Specification: Presupuestos en PDF para Freelancers

**Feature Branch**: `001-presupuestos-pdf`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "PresupuestosPro es una herramienta para que un freelancer español cree presupuestos profesionales con su marca y los descargue en PDF para enviárselos a sus clientes, sin pelearse con Excel ni con plantillas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generar un presupuesto completo en PDF (Priority: P1) 🎯 MVP

Como freelancer, quiero crear un presupuesto indicando mis datos, los del cliente y
las líneas del encargo, ver cómo se calculan solos la base, el IVA, la retención de
IRPF (cuando toque) y el total, y descargarlo en PDF, para poder enviárselo a mi
cliente con buena imagen y sin errores de cálculo.

**Why this priority**: Es el "son las once de la noche y hay que mandar el
presupuesto mañana" — el valor central del producto. Sin esto no hay producto.

**Independent Test**: Puede probarse por completo introduciendo a mano los datos del
freelancer y del cliente (sin perfil ni catálogo guardados previamente), añadiendo
líneas, y comprobando que el PDF descargado muestra el desglose correcto.

**Acceptance Scenarios**:

1. **Given** un presupuesto con dos líneas (1.500,00 € y 500,00 €), IVA 21% y
   retención de IRPF del 15% para un cliente empresa/autónomo, **When** reviso el
   desglose, **Then** veo Base 2.000,00 €, IVA 420,00 €, Retención −300,00 € y Total
   2.120,00 €.
2. **Given** el mismo presupuesto, **When** cambio la retención a 7%, **Then** el
   total pasa a 2.280,00 € automáticamente.
3. **Given** el mismo presupuesto, **When** marco el cliente como particular,
   **Then** la retención desaparece del cálculo y el total sube a 2.420,00 €.
4. **Given** un presupuesto sin ninguna línea, **When** intento descargar el PDF,
   **Then** el sistema me avisa y no genera el archivo.
5. **Given** un presupuesto con líneas y datos completos, **When** descargo el PDF,
   **Then** obtengo un archivo con número, fecha de emisión, validez de 30 días y el
   desglose completo de importes.

---

### User Story 2 - Reutilizar un catálogo de servicios (Priority: P2)

Como freelancer, quiero mantener un catálogo de mis servicios habituales con un
precio por defecto cada uno, para añadirlos a un presupuesto con un clic en lugar de
escribirlos a mano cada vez.

**Why this priority**: Ahorra tiempo en el día a día, pero no es imprescindible para
emitir un primer presupuesto (US1 ya lo permite escribiendo las líneas a mano).

**Independent Test**: Puede probarse creando dos o tres servicios en el catálogo,
abriendo un presupuesto nuevo, añadiendo una línea desde el catálogo y comprobando
que se rellena con el nombre y precio guardados.

**Acceptance Scenarios**:

1. **Given** un servicio guardado en el catálogo con nombre y precio, **When** lo
   añado a un presupuesto nuevo, **Then** la línea aparece con esa descripción y
   precio, editable antes de generar el PDF.
2. **Given** un catálogo con servicios guardados, **When** edito el precio por
   defecto de uno, **Then** los presupuestos ya generados no cambian, pero los
   nuevos usan el precio actualizado.

---

### User Story 3 - Guardar el perfil de marca una sola vez (Priority: P3)

Como freelancer, quiero configurar mi nombre, NIF, datos de contacto y logo una sola
vez, para que todos mis presupuestos futuros los usen automáticamente sin tener que
volver a introducirlos.

**Why this priority**: Mejora la imagen y ahorra repetición, pero un presupuesto
válido puede emitirse sin perfil guardado (introduciendo los datos a mano en US1).

**Independent Test**: Puede probarse configurando el perfil una vez, cerrando y
reabriendo la aplicación, y comprobando que un presupuesto nuevo ya trae esos datos
sin volver a escribirlos.

**Acceptance Scenarios**:

1. **Given** un perfil guardado con nombre, NIF, contacto y logo, **When** creo un
   presupuesto nuevo, **Then** esos datos aparecen ya rellenos.
2. **Given** un perfil sin logo configurado, **When** genero un PDF, **Then** el
   documento se genera igualmente mostrando el nombre del freelancer en lugar del
   logo.

---

### Edge Cases

- Presupuesto sin ninguna línea: el sistema avisa al freelancer y no genera el PDF.
- Línea escrita a mano, fuera del catálogo: permitida sin restricciones.
- Línea con cantidad o precio unitario en cero o negativo: se acepta sin bloqueo ni
  aviso de error; el cálculo la incluye normalmente (p. ej. como ajuste manual).
- Cliente particular con la retención de IRPF marcada por error: la retención no se
  aplica; manda siempre el tipo de cliente.
- Importe cuyo tercer decimal obliga a redondear (p. ej. base de 2,345 €): se
  redondea a 2 decimales con la regla estándar (2,35 €).
- Freelancer sin logo configurado: el PDF se genera solo con el nombre, sin espacio
  en blanco ni error.
- Dos presupuestos creados el mismo día: cada uno recibe el siguiente número
  correlativo sin colisión.
- Presupuesto eliminado: su número no se reutiliza; puede quedar un hueco en la
  numeración correlativa de ese año, y esto no se considera un error.
- Cambio de año natural: el contador de numeración se reinicia a 001 el 1 de enero.
- Primer uso de la aplicación, sin perfil ni catálogo configurados: el freelancer
  puede crear igualmente un presupuesto introduciendo los datos a mano.

## Clarifications

### Session 2026-07-30

- Q: ¿Se puede eliminar un presupuesto ya creado, y si es así, qué pasa con su número correlativo? → A: Se puede eliminar y deja hueco (el número no se reutiliza; la numeración puede tener huecos).
- Q: ¿Los datos del cliente (nombre/razón social, tipo) se guardan como un directorio reutilizable, o se escriben a mano en cada presupuesto? → A: Solo a mano cada vez; no existe directorio ni catálogo de clientes.
- Q: Una vez descargado el PDF de un presupuesto, ¿se puede seguir editando ese presupuesto y volver a descargarlo? → A: Sí, sin restricción; no queda bloqueado tras generar el PDF.
- Q: ¿El sistema debe impedir guardar una línea de presupuesto con cantidad o precio unitario en cero o negativo? → A: No, se permite cualquier valor numérico, incluyendo cero o negativo.
- Q: Si el freelancer elimina un servicio del catálogo, ¿qué pasa con los presupuestos ya creados que usaron ese servicio? → A: No les afecta; la línea ya copiada es independiente del servicio de catálogo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir guardar y editar el perfil del freelancer
  (nombre, NIF, datos de contacto y logo), conservado entre sesiones de uso.
- **FR-002**: El sistema MUST permitir crear, editar y eliminar servicios de un
  catálogo reutilizable, cada uno con nombre y precio por defecto; eliminar un
  servicio del catálogo no afecta a las líneas de presupuestos ya creadas a partir
  de él, ya que esas líneas conservan una copia independiente de la descripción y
  el precio en el momento en que se añadieron.
- **FR-003**: El sistema MUST permitir crear un presupuesto indicando los datos del
  cliente y su tipo: empresa/autónomo o particular.
- **FR-004**: El sistema MUST permitir añadir líneas al presupuesto desde el
  catálogo o escritas a mano, cada una con descripción, cantidad y precio unitario,
  sin imponer restricciones sobre el signo o el valor cero de la cantidad o el
  precio unitario.
- **FR-005**: El sistema MUST calcular automáticamente la base imponible como la
  suma de (cantidad × precio unitario) de todas las líneas del presupuesto.
- **FR-006**: El sistema MUST permitir elegir el tipo de IVA aplicable a cada
  presupuesto entre 21% (general), 10%, 4% o 0% (exento), y calcular el IVA como
  base imponible × tipo elegido.
- **FR-007**: El sistema MUST permitir activar opcionalmente una retención de IRPF
  del 15% o del 7% sobre la base imponible, únicamente cuando el cliente es de tipo
  empresa/autónomo.
- **FR-008**: El sistema MUST NOT aplicar retención de IRPF cuando el cliente es de
  tipo particular, incluso si la opción estuviera activada.
- **FR-009**: El sistema MUST calcular el total del presupuesto como: base imponible
  + IVA − retención de IRPF (si aplica).
- **FR-010**: El sistema MUST redondear todos los importes calculados a 2 decimales
  usando la regla de redondeo estándar (la tercera cifra decimal a partir de 5
  redondea hacia arriba).
- **FR-011**: El sistema MUST numerar cada presupuesto automáticamente con el
  formato AAAA-NNN (p. ej. 2026-001), de forma correlativa y reiniciando el contador
  cada año natural; este número no puede editarse manualmente.
- **FR-012**: El sistema MUST registrar la fecha de emisión de cada presupuesto y
  mostrar una validez de 30 días naturales desde esa fecha.
- **FR-013**: El sistema MUST permitir editar o eliminar cualquier línea de un
  presupuesto en cualquier momento, incluso después de haber generado y descargado
  su PDF, permitiendo volver a generarlo con los cambios (el presupuesto nunca
  queda bloqueado para edición).
- **FR-014**: El sistema MUST impedir generar el PDF de un presupuesto que no tenga
  ninguna línea, avisando al freelancer del motivo.
- **FR-015**: El sistema MUST generar un documento PDF descargable que incluya:
  logo (si existe), datos del freelancer, datos del cliente, número de presupuesto,
  fecha de emisión, fecha de validez, la tabla de líneas y el desglose de base
  imponible, IVA, retención (si aplica) y total.
- **FR-016**: El sistema MUST generar el PDF mostrando solo el nombre del freelancer
  cuando no se haya configurado ningún logo, sin errores ni huecos vacíos.
- **FR-017**: El sistema MUST conservar el perfil, el catálogo y los presupuestos
  del freelancer entre sesiones de uso, sin requerir cuenta de usuario ni contraseña.
- **FR-018**: El sistema MUST permitir eliminar un presupuesto existente; su número
  de presupuesto no se reutiliza nunca, aunque esto deje un hueco en la numeración
  correlativa de ese año natural.

### Key Entities *(include if feature involves data)*

- **Perfil del freelancer**: nombre, NIF, datos de contacto y logo del profesional
  que emite los presupuestos. Es único por instalación de la aplicación.
- **Cliente**: nombre/razón social y tipo (empresa/autónomo o particular) del
  destinatario de un presupuesto concreto; determina si puede aplicarse retención.
  No es una entidad guardada ni reutilizable: sus datos se introducen a mano en cada
  presupuesto y no existe un directorio de clientes.
- **Servicio de catálogo**: nombre y precio por defecto de un servicio habitual del
  freelancer, reutilizable al crear líneas de presupuesto.
- **Presupuesto**: documento con número, fecha de emisión, validez, tipo de IVA
  elegido, retención de IRPF (si aplica), datos del cliente y su lista de líneas.
- **Línea de presupuesto**: descripción, cantidad y precio unitario de un concepto
  dentro de un presupuesto, proveniente del catálogo o escrita a mano.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer puede crear y descargar un presupuesto completo en menos
  de 5 minutos desde que abre la aplicación.
- **SC-002**: En el presupuesto de ejemplo (base 2.000,00 €, IVA 21%, retención 15%),
  el total mostrado coincide al céntimo con 2.120,00 € en el 100% de las pruebas.
- **SC-003**: Al cambiar el tipo de cliente o el porcentaje de retención, el total
  se recalcula automáticamente sin ninguna acción manual adicional de cálculo.
- **SC-004**: El 100% de los presupuestos emitidos en un mismo año natural reciben
  un número correlativo único y nunca duplicado; pueden existir huecos si se ha
  eliminado algún presupuesto, y esto es un comportamiento esperado, no un error.
- **SC-005**: Tras cerrar y volver a abrir la aplicación, el 100% de los perfiles,
  catálogos y presupuestos guardados previamente siguen disponibles y sin cambios.

## Assumptions

- El tipo de IVA se elige una sola vez por presupuesto completo (no línea por
  línea), ya que la descripción original no distingue impuestos por concepto.
- El redondeo de todos los importes usa la regla estándar a 2 decimales (mitad
  hacia arriba), no redondeo bancario ni truncamiento.
- La numeración de presupuestos es siempre automática; no existe forma de editarla
  manualmente en esta versión.
- Cuando no hay logo configurado, el PDF se genera igualmente mostrando solo el
  nombre del freelancer, sin bloquear la descarga.
- La aplicación no requiere cuentas de usuario ni contraseña. Cada freelancer
  utiliza su propia instalación del servicio (una instalación = un
  freelancer); los datos (perfil, catálogo, presupuestos) se guardan en esa
  instalación y son accesibles desde cualquier dispositivo que acceda a ella
  (p. ej. el freelancer puede usar la misma instalación desde su móvil y su
  ordenador). No existe en esta versión (v0) un mecanismo para que distintos
  freelancers compartan una misma instalación de forma aislada entre sí (no
  hay cuentas ni identificadores por usuario).
- Quedan fuera de alcance en esta versión: facturación electrónica y VeriFactu,
  multidivisa (solo euros), envío del PDF por email desde la propia aplicación, y
  descuentos por línea o globales.
- El perfil del freelancer (nombre, NIF, contacto, logo) no se copia dentro de
  cada presupuesto: el PDF siempre usa los datos de perfil vigentes en el
  momento de generarlo. Si el freelancer edita su perfil después de crear un
  presupuesto, el PDF descargado posteriormente para ese presupuesto reflejará
  los datos nuevos, a diferencia de las líneas del catálogo (FR-002), que sí
  quedan fijadas en el momento de añadirlas.
