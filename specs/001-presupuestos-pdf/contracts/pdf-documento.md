# Contrato: Documento PDF generado

**Feature**: 001-presupuestos-pdf

Este es el "contrato de salida" que el freelancer recibe: el documento PDF
descargable. Corresponde a FR-015, FR-016 y a la User Story 1 (Acceptance
Scenario 5). Se genera **en el servidor** con `pdfmake`, a través del
endpoint `GET /api/presupuestos/:id/pdf` (ver [api.md](./api.md) y
[research.md](../research.md), punto 3).

## Precondición

- El presupuesto debe tener al menos una línea. Si no tiene ninguna, el
  endpoint responde `409` con un mensaje explicando el motivo y no genera
  ningún archivo (FR-014). Esta comprobación ocurre **antes** de invocar
  `generarPdf.js`, dentro de la propia ruta de la API.

## Contenido obligatorio del PDF (FR-015)

1. Logo del freelancer si existe en `PerfilFreelancer.logo`; si no existe,
   se omite el espacio del logo y se muestra solo el nombre, sin huecos en
   blanco ni error (FR-016, Edge Cases).
2. Datos del freelancer: `nombre`, `nif`, `contacto` (si existe).
3. Datos del cliente: `clienteNombre`, `clienteTipo`.
4. Número de presupuesto (`numero`, formato `AAAA-NNN`).
5. Fecha de emisión (`fechaEmision`) y fecha de validez (`fechaEmision + 30
   días naturales`, FR-012).
6. Tabla de líneas: `descripcion`, `cantidad`, `precioUnitario` y subtotal de
   línea (`cantidad × precioUnitario`) por cada elemento de `lineas`.
7. Desglose final, usando la salida del contrato de
   [cálculo](./calculo.md): `baseImponible`, `iva` (indicando el `tipoIva`
   aplicado), `retencion` (solo si `retencion > 0`, es decir, solo cuando
   aplica), y `total`.

## Formato y localización (Principio II de la constitución)

- Todo el texto del documento está en español de España.
- Los importes se muestran en euros, con el símbolo `€` y coma como separador
  decimal (p. ej. `2.120,00 €`).
- Las fechas se muestran en formato `DD/MM/AAAA`.

## Nombre del archivo descargado

- Formato sugerido: `presupuesto-{numero}.pdf` (p. ej.
  `presupuesto-2026-001.pdf`), para que el freelancer identifique el archivo
  sin abrirlo.

## Comportamiento tras la descarga

- El presupuesto **no** queda bloqueado: puede seguir editándose y volver a
  descargarse cuantas veces haga falta (FR-013). Cada descarga refleja el
  estado actual de los datos en ese momento, no hay versión "congelada".
