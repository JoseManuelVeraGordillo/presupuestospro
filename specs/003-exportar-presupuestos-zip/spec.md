# Feature Specification: Exportar todos los presupuestos en un .zip

**Feature Branch**: `003-exportar-presupuestos-zip`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "Exportar todos mis presupuestos en un .zip — que el freelancer pueda llevarse TODOS sus presupuestos de una sola vez, en un único archivo comprimido .zip, como copia de seguridad y para archivarlos donde quiera. Un botón 'Exportar todo (.zip)' visible en la lista de presupuestos descarga un único .zip con un PDF por cada presupuesto existente (idéntico al que ya genera la app) y un único archivo de datos con toda la información (presupuestos, catálogo, clientes y perfil, logo incluido) pensado para restaurar la aplicación en el futuro. Nombre del zip: presupuestospro-copia-AAAA-MM-DD.zip. Nombre de cada PDF: número + cliente. La exportación es solo lectura. Sin presupuestos, el botón avisa sin descargar zip vacío. Nombres de cliente con caracteres conflictivos se limpian para no romper el zip. Con 50+ presupuestos puede tardar pero debe verse que está trabajando. Fuera de alcance: importar la copia, exportar a Excel/CSV, copias automáticas/programadas, enviar por email o subir a la nube."

## Clarifications

### Session 2026-07-31

- Q: Cuando dos presupuestos, tras limpiar caracteres conflictivos del nombre de
  cliente, generan el mismo nombre de PDF, ¿cómo debe diferenciarlos el sistema para
  evitar que uno sobrescriba al otro? (FR-009) → A: Sufijo numérico entre paréntesis
  al final del nombre (por ejemplo, "2026-001 - Estudio García (2).pdf").
- Q: Si al generar el PDF de uno de los presupuestos ocurre un error a mitad del
  proceso de exportación, ¿qué debe pasar con el resto de la exportación? → A: Se
  omite el presupuesto fallido, se continúa con el resto y, al finalizar, se avisa al
  freelancer de qué presupuesto(s) no se pudieron incluir.
- Q: Mientras la exportación está en curso, ¿qué debe pasar si el freelancer pulsa el
  botón "Exportar todo (.zip)" otra vez antes de que termine la primera descarga? →
  A: El botón se deshabilita mientras dura la exportación; un segundo clic no inicia
  una nueva exportación.
- Q: ¿En qué orden deben aparecer los PDF dentro del .zip generado? → A: Por número
  de presupuesto, en orden ascendente.
- Q: Si la exportación tarda demasiado, ¿debe existir un límite de tiempo a partir
  del cual el sistema muestre un error en vez de dejar el indicador de progreso
  girando indefinidamente? → A: No, sin límite de tiempo explícito; el indicador se
  muestra hasta que la exportación termina, sea cual sea su duración.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descargar una copia completa de todos los presupuestos (Priority: P1) 🎯 MVP

Como freelancer, quiero pulsar un único botón "Exportar todo (.zip)" desde la lista
de presupuestos y descargar un solo archivo .zip con el PDF de cada presupuesto que
tengo guardado, para quedarme con una copia de seguridad completa que pueda archivar
donde quiera sin depender de que mi ordenador o navegador sigan intactos.

**Why this priority**: Es el objetivo completo de la funcionalidad tal y como se ha
pedido: sin esta descarga no hay copia de seguridad ni valor entregado. Es, en sí
mismo, el MVP de esta spec.

**Independent Test**: Puede probarse creando 3 presupuestos con datos distintos,
pulsando "Exportar todo (.zip)" desde la lista de presupuestos y comprobando que se
descarga un único archivo `presupuestospro-copia-AAAA-MM-DD.zip` (con la fecha del
día) que, al descomprimirlo, contiene exactamente 3 PDF nombrados "número - cliente"
más un archivo de datos.

**Acceptance Scenarios**:

1. **Given** el freelancer tiene 3 presupuestos guardados, **When** pulsa "Exportar
   todo (.zip)" en la lista de presupuestos, **Then** se descarga un único archivo
   `presupuestospro-copia-AAAA-MM-DD.zip`, con AAAA-MM-DD igual a la fecha del día en
   que se realiza la exportación.
2. **Given** el .zip descargado, **When** el freelancer lo descomprime con doble
   clic, **Then** ve un PDF por cada presupuesto existente, nombrado "número -
   cliente" (por ejemplo, "2026-001 - Estudio García.pdf"), y un único archivo de
   datos adicional.
3. **Given** uno de esos PDF, **When** el freelancer lo abre y lo compara con el PDF
   que la app genera para ese mismo presupuesto al descargarlo individualmente,
   **Then** son idénticos, céntimo a céntimo, en todos sus importes y datos.
4. **Given** el freelancer tiene un único presupuesto guardado, **When** exporta
   todo, **Then** el .zip contiene ese único PDF y el archivo de datos (la
   funcionalidad no exige un mínimo de presupuestos para funcionar).

---

### User Story 2 - Recibir un aviso claro cuando no hay nada que exportar (Priority: P2)

Como freelancer, quiero que si todavía no tengo ningún presupuesto guardado, el botón
"Exportar todo (.zip)" me avise de que no hay nada que exportar en vez de
descargarme un archivo vacío o inútil, para no confundirme pensando que algo ha
fallado.

**Why this priority**: Es un caso límite explícito y frecuente (freelancer recién
empezado, o app recién instalada) que, de no cubrirse, generaría confusión o un
archivo .zip vacío sin valor. No es el flujo principal, pero es necesario para que
el botón sea fiable desde el primer uso.

**Independent Test**: Puede probarse con una instalación sin presupuestos, pulsando
"Exportar todo (.zip)" y comprobando que aparece un aviso claro y que no se inicia
ninguna descarga de archivo.

**Acceptance Scenarios**:

1. **Given** el freelancer no tiene ningún presupuesto guardado, **When** pulsa
   "Exportar todo (.zip)", **Then** ve un mensaje que le indica que no hay
   presupuestos para exportar y no se descarga ningún archivo.

---

### User Story 3 - Exportar de forma fiable con nombres de cliente conflictivos o volúmenes grandes (Priority: P3)

Como freelancer, quiero que la exportación funcione igual de bien tanto si el nombre
de mis clientes tiene caracteres especiales como si tengo muchísimos presupuestos
acumulados, para poder confiar en el botón "Exportar todo" pase lo que pase con mis
datos.

**Why this priority**: Cubre casos límite de robustez (caracteres conflictivos en
nombres de archivo, volumen alto de presupuestos) que no son el camino feliz pero sí
son necesarios para que la copia de seguridad no falle justo en el momento en que más
se necesita.

**Independent Test**: Puede probarse creando un cliente con un nombre que incluya
caracteres conflictivos para nombres de archivo (por ejemplo, "Diseño/Web S.L.") y
comprobando que el .zip se genera igualmente y contiene un PDF con un nombre de
archivo válido y reconocible; y por separado, creando 50 o más presupuestos y
comprobando que la exportación se completa mostrando en todo momento que está
trabajando.

**Acceptance Scenarios**:

1. **Given** un presupuesto asociado a un cliente cuyo nombre contiene caracteres no
   válidos para nombres de archivo (por ejemplo "/"), **When** se exporta todo,
   **Then** el .zip se genera sin errores y el PDF de ese presupuesto tiene un nombre
   de archivo válido, sin esos caracteres conflictivos, y sigue siendo reconocible
   por el número y el nombre del cliente.
2. **Given** el freelancer tiene 50 o más presupuestos guardados, **When** pulsa
   "Exportar todo (.zip)", **Then** ve un indicador de que la exportación está en
   curso mientras dura el proceso, y al finalizar recibe el .zip completo con todos
   los presupuestos.

---

### Edge Cases

- Sin presupuestos guardados: aviso claro, sin descarga de ningún archivo (cubierto
  en User Story 2).
- Nombre de cliente con caracteres conflictivos para nombres de archivo ("/", "\",
  ":", etc.): el nombre del PDF se limpia mantenimiento la legibilidad (número +
  cliente) sin romper el .zip (cubierto en User Story 3).
- Dos o más presupuestos que, tras limpiar caracteres conflictivos, generarían el
  mismo nombre de archivo: el sistema añade un sufijo numérico entre paréntesis al
  final del nombre (por ejemplo, "2026-001 - Estudio García (2).pdf") para evitar que
  un PDF sobrescriba a otro dentro del .zip.
- Fallo al generar el PDF de un presupuesto concreto durante la exportación (por
  ejemplo, datos corruptos en ese presupuesto): el sistema omite ese presupuesto,
  continúa con el resto y, al finalizar, avisa al freelancer de qué presupuesto(s) no
  se pudieron incluir en el .zip.
- Volumen alto de presupuestos (50+): la exportación puede tardar más, pero el
  freelancer debe ver en todo momento que la aplicación sigue trabajando, sin límite
  máximo de presupuestos exportables.
- Presupuestos en cualquier estado (Borrador, Enviado, Aceptado, Rechazado,
  Caducado): todos se incluyen en la exportación sin excepción, generando el mismo
  PDF que ya genera la app para ese presupuesto en su estado actual.
- El freelancer aún no ha completado su perfil (por ejemplo, sin logo cargado): la
  exportación se realiza igualmente, incluyendo el perfil con los datos que existan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un botón "Exportar todo (.zip)" en un lugar
  visible de la lista de presupuestos.
- **FR-002**: Al pulsar el botón, el sistema DEBE generar y descargar un único
  archivo .zip que contenga un PDF por cada presupuesto existente, sea cual sea su
  estado. Si la generación del PDF de un presupuesto concreto falla, el sistema DEBE
  omitir ese presupuesto, continuar con el resto y, al finalizar, avisar al
  freelancer de qué presupuesto(s) no se pudieron incluir.
- **FR-003**: Cada PDF dentro del .zip DEBE ser exactamente el mismo documento
  (mismos importes, datos y formato) que la aplicación genera al descargar ese
  presupuesto de forma individual.
- **FR-004**: El sistema DEBE nombrar el archivo .zip como
  "presupuestospro-copia-AAAA-MM-DD.zip", usando la fecha del día en que se realiza
  la exportación.
- **FR-005**: El sistema DEBE nombrar cada PDF dentro del .zip como "número -
  cliente" (por ejemplo, "2026-001 - Estudio García.pdf").
- **FR-006**: El sistema DEBE incluir dentro del .zip un único archivo de datos, en
  formato legible como texto plano estructurado, con toda la información de
  presupuestos, catálogo de servicios, clientes y perfil del freelancer (incluido el
  logo), pensado para poder restaurar la aplicación en el futuro.
- **FR-007**: La exportación NO DEBE modificar ningún dato existente: es una
  operación exclusivamente de lectura y, tras completarse, el estado de la
  aplicación permanece exactamente igual que antes de exportar.
- **FR-008**: El sistema DEBE limpiar los caracteres no válidos para nombres de
  archivo (como "/", "\" o ":") en el nombre del cliente al construir el nombre de
  cada PDF, de forma que el .zip se genere siempre sin errores.
- **FR-009**: El sistema DEBE evitar colisiones de nombre entre PDF dentro del
  mismo .zip (por ejemplo, si la limpieza de caracteres produce el mismo nombre para
  dos presupuestos distintos), añadiendo un sufijo numérico entre paréntesis al final
  del nombre (por ejemplo, "2026-001 - Estudio García (2).pdf") de forma que ningún
  PDF sobrescriba a otro.
- **FR-010**: Cuando no exista ningún presupuesto guardado, el sistema DEBE mostrar
  un aviso claro de que no hay nada que exportar y NO DEBE iniciar ninguna descarga.
- **FR-011**: El sistema DEBE funcionar correctamente con cualquier volumen de
  presupuestos existentes, desde 1 hasta 200 o más, sin imponer un límite máximo ni
  un límite de tiempo explícito: el indicador de progreso (FR-012) se mantiene
  visible durante toda la duración real del proceso, sea cual sea.
- **FR-012**: Mientras dura la generación del .zip, el sistema DEBE mostrar al
  freelancer un indicador de que la exportación está en curso y DEBE deshabilitar el
  botón "Exportar todo (.zip)" durante ese tiempo, de forma que un segundo clic no
  inicie una nueva exportación en paralelo.
- **FR-013**: El sistema DEBE ordenar los PDF dentro del .zip por número de
  presupuesto, en orden ascendente.

### Key Entities

- **Copia de seguridad (.zip de exportación)**: Archivo comprimido generado bajo
  demanda que agrupa, en un momento dado, todos los PDF de presupuestos existentes
  más un único archivo de datos. No se almacena en el sistema: se genera y se
  entrega en el momento de la descarga.
- **Archivo de datos**: Documento único, incluido dentro del .zip, con la
  información completa de presupuestos, catálogo de servicios, clientes y perfil del
  freelancer (logo incluido), pensada para permitir restaurar la aplicación en el
  futuro (la restauración en sí queda fuera de alcance de esta spec).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con 3 presupuestos creados, el freelancer obtiene un único .zip que,
  al descomprimirlo, contiene exactamente 3 PDF con nombre "número - cliente" y un
  archivo de datos, en el 100% de los intentos.
- **SC-002**: El 100% de los PDF contenidos en el .zip son idénticos, céntimo a
  céntimo, a los que la aplicación genera al descargar cada presupuesto de forma
  individual.
- **SC-003**: Con 0 presupuestos guardados, el freelancer ve un aviso claro y no se
  descarga ningún archivo, en el 100% de los intentos.
- **SC-004**: Con 50 o más presupuestos, la exportación se completa con éxito y el
  freelancer ve en todo momento un indicador de que el proceso está en curso, sin
  que la aplicación parezca congelada o sin respuesta.
- **SC-005**: Ningún nombre de cliente, por conflictivos que sean sus caracteres,
  provoca que la exportación falle o que el .zip resulte corrupto o incompleto.

## Assumptions

- El "archivo de datos" incluido en el .zip se genera en un formato de texto
  estructurado y legible (a concretar en la fase de planificación técnica), no en un
  formato binario opaco, para que sirva de copia de seguridad razonada y no solo de
  volcado interno.
- Se incluyen absolutamente todos los presupuestos existentes en la exportación,
  cualquiera que sea su estado (Borrador, Enviado, Aceptado, Rechazado, Caducado),
  reutilizando la misma generación de PDF que ya usa la aplicación para cada uno.
- No existe un límite máximo de presupuestos ni de tamaño de .zip que bloquee la
  exportación; con volúmenes grandes (50+) se acepta que el proceso tarde más,
  siempre que se muestre que está en curso.
- La importación o restauración de esta copia de seguridad no forma parte de esta
  spec y se abordará en una spec independiente.
- El logo del perfil, si existe, se incluye en el archivo de datos o como fichero
  adicional dentro del mismo .zip; la decisión concreta de cómo representarlo se
  toma en la fase de planificación técnica (`plan.md`).
