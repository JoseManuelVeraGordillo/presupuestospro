# Contrato: Identidad visual compartida (web + PDF)

**Feature**: 002-rediseno-ui-clientes-estado

Este contrato fija el "vocabulario visual" único que deben compartir la
aplicación web y el PDF generado, para que ningún componente (vista nueva o
existente) invente sus propios colores, tipografía o espaciados por su
cuenta. Corresponde a FR-006 a FR-014 y a las User Stories 3 y 4.

## Origen único de la paleta y la tipografía (FR-006, FR-007)

- **Web**: `frontend/src/styles/base.css`, bloque `:root`. Ya existe hoy
  (`--color-primario`, `--color-texto`, `--color-fondo`, `--color-borde`,
  `--color-error`, `--color-exito`, `--radio`, `--espacio`) y se amplía con
  los tokens que falten (p. ej. escala tipográfica, escala de espaciado,
  colores de estado). Ninguna vista debe usar un color o tamaño de fuente
  "suelto" fuera de estas variables.
- **PDF**: `backend/src/services/generarPdf.js` define una constante
  `PALETA_MARCA` con los mismos valores hexadecimales que `:root` en
  `base.css`, documentada en el código como "debe mantenerse sincronizada a
  mano con `frontend/src/styles/base.css`" (research.md, punto 6, por no
  compartir build entre los dos paquetes).

## Colores por estado de presupuesto (FR-010)

Un único mapeo de estado → color/etiqueta, reutilizado en el listado de
presupuestos, en el detalle y en el resumen de la página de inicio (web), y
consistente con el mismo lenguaje de color en el PDF donde se muestre el
estado:

| Estado | Uso visual |
|---|---|
| Borrador | Color neutro/discreto (aún no enviado) |
| Enviado | Color informativo (en curso) |
| Aceptado | Color de éxito (`--color-exito`) |
| Rechazado | Color de error (`--color-error`) |
| Caducado | Color de aviso, distinto de "Rechazado" (expira por tiempo, no por decisión del cliente) |

La asignación exacta de valores hexadecimales se resuelve en implementación
dentro de los tokens de `base.css`; este contrato solo fija que **debe
existir un color distinto y consistente por estado**, definido una sola vez.

## Jerarquía visual (FR-009)

Cada pantalla con título + tabla/listado + formulario + total (p. ej. el
detalle de un presupuesto) debe distinguir, por peso y tamaño tipográfico:

1. Título de la pantalla (mayor peso/tamaño).
2. Encabezados de tabla / etiquetas de formulario.
3. Contenido de tabla / valores de formulario.
4. Total o importe final (destacado, igual que ya hace hoy `.desglose
   .total` en `base.css`).

El PDF replica el mismo orden de énfasis (ver
[pdf-documento.md](../../001-presupuestos-pdf/contracts/pdf-documento.md),
que sigue vigente en cuanto a contenido; este contrato solo añade la
identidad visual, no cambia qué datos incluye el PDF — FR-015).

## Mobile-first (FR-011)

Todo componente nuevo (Inicio, Clientes, badges de estado, nav común) se
diseña primero para el ancho de pantalla móvil ya soportado por `base.css`
(`.contenido`, `.navegacion`, `botones` con `min-height: 44px`), ampliando
con *media queries* `min-width` igual que ya hace `base.css`, nunca al
revés.

## Idioma (FR-012)

Todo texto de las pantallas nuevas o modificadas por esta feature está en
español de España, reutilizando `formatearEuro`/`formatearFecha` de
`frontend/src/utils.js` para importes y fechas — no se introduce ningún
formato o cadena en otro idioma.

## Qué NO cambia (FR-013, FR-015)

- Ningún valor numérico, cálculo, regla de redondeo, numeración ni
  comportamiento de la API existente cambia por este contrato — es
  puramente de presentación.
- El PDF conserva exactamente el mismo contenido informativo que en spec 001
  (ver [pdf-documento.md](../../001-presupuestos-pdf/contracts/pdf-documento.md)):
  este contrato solo redefine su apariencia (colores, tipografía,
  jerarquía), no qué datos muestra.
