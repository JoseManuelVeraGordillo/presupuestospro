# Contrato: Identidad visual — dirección "Banca privada" (solo web)

**Feature**: 002-rediseno-ui-clientes-estado

**Actualización 2026-07-31**: Este contrato se reescribe para fijar los
valores exactos de la dirección "Banca privada"
(`specs/pre-spec-rediseno-visual-banca-privada.md`, FR-029 a FR-039). El
contrato original ("Identidad visual compartida web + PDF", FR-006 a FR-014)
cubría también el PDF; esa parte queda retirada porque el PDF está fuera de
alcance de esta iteración (ver spec, User Story 4 retirada). Este contrato ya
no fija solo "que debe existir" un vocabulario visual: fija sus valores
concretos y verificables.

## Origen único de la paleta y la tipografía (FR-006, FR-007, FR-029, FR-030)

- **Web** (única superficie de este contrato): `frontend/src/styles/base.css`,
  bloque `:root`. Ninguna vista debe usar un color, radio, sombra o tamaño de
  fuente "suelto" fuera de estas variables.
- **PDF**: fuera de alcance (ver nota de actualización arriba). `generarPdf.js`
  no se toca en esta feature.

### Paleta (FR-029)

| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#F7F8FA` | Fondo general de la app |
| `--color-superficie` | `#FFFFFF` | Tarjetas, filas de lista, formularios |
| `--color-texto` | `#0B1F3A` | Texto principal |
| `--color-texto-secundario` | `#5B6B84` | Metadatos: fechas, ayudas, badge "Borrador" |
| `--color-primario` | `#2E5AAC` | Acción primaria, tab activo, enlaces, foco, badge "Enviado" |
| `--color-primario-oscuro` | `#0B1F3A` | Hover/active de botón primario y marca |
| `--color-exito` | `#1E7A4C` | Badge "Aceptado" |
| `--color-error` | `#B4232C` | Badge "Rechazado", botón "Eliminar" |
| `--color-alerta` | `#9A6700` | Badge "Caducado" |
| `--color-borde` | `#E1E4E9` | Bordes de inputs/formulario |

### Tipografía (FR-030, FR-031)

- Familia única: `Inter` (pesos 400/500/600), auto-alojada en
  `frontend/public/fonts/` vía `@font-face` (research.md punto 10) — sin
  depender de `system-ui` como familia principal.
- Escala: marca `1.75rem/700`, título de sección `1.5rem/600`, subtítulo
  `1.15rem/600`, cuerpo `1rem/400`, pequeño `0.85rem/400-500`.
- Importes monetarios: peso 600, `font-variant-numeric: tabular-nums`,
  siempre en `--color-texto` o `--color-primario-oscuro`, nunca en
  `--color-texto-secundario` ni en peso 400.

## Colores por estado de presupuesto (FR-010, FR-032)

Fórmula única, reutilizada en el listado de presupuestos, el detalle y el
resumen de la página de inicio: fondo = color de estado al 10-12% de
opacidad sobre `--color-superficie`; texto = color de estado al 100%.

| Estado | Color base | Fondo del badge |
|---|---|---|
| Borrador | `--color-texto-secundario` (`#5B6B84`) | `#5B6B84` al 10-12% |
| Enviado | `--color-primario` (`#2E5AAC`) | `#2E5AAC` al 10-12% |
| Aceptado | `--color-exito` (`#1E7A4C`) | `#1E7A4C` al 10-12% |
| Rechazado | `--color-error` (`#B4232C`) | `#B4232C` al 10-12% |
| Caducado | `--color-alerta` (`#9A6700`) | `#9A6700` al 10-12% |

Prohibido introducir un color de estado que no derive de esta tabla (FR-032).

## Forma y espaciado (FR-033, FR-034, FR-035, FR-039)

- Radio de esquina: `6px` uniforme en botones, inputs y tarjetas (sustituye
  el `8px` anterior).
- Tarjetas de lista (`.lista-items li`): `box-shadow: 0 1px 2px
  rgba(11,31,58,0.06)` en lugar de depender solo de `--color-borde`.
- El bloque de navegación/acciones primarias se distingue del bloque de
  datos por más de un atributo (p. ej. color de fondo + elevación), no solo
  el color de relleno.
- Contenedor de cada vista: ancho máximo consistente y centrado en
  resoluciones ≥1280px, sin vacíos sin estructurar junto al contenido.

## Estados interactivos y accesibilidad (FR-036, FR-037, FR-038)

- Todo botón, `select` y pestaña de navegación tiene un estado
  `:hover`/`:focus-visible` visualmente distinto del reposo.
- Las acciones destructivas (p. ej. "Eliminar") usan `--color-error` y se
  distinguen además por al menos un atributo adicional (posición, énfasis o
  icono), no solo el color.
- Ningún enlace conserva el subrayado ni el color azul/morado por defecto
  del navegador; todos usan los tokens de esta tabla.

## Jerarquía visual (FR-009)

Cada pantalla con título + tabla/listado + formulario + total (p. ej. el
detalle de un presupuesto) debe distinguir, por peso y tamaño tipográfico
(según la escala de la sección de Tipografía):

1. Título de la pantalla (mayor peso/tamaño).
2. Encabezados de tabla / etiquetas de formulario.
3. Contenido de tabla / valores de formulario.
4. Total o importe final (destacado, igual que ya hace hoy `.desglose
   .total` en `base.css`, en `--color-primario-oscuro` con `tabular-nums`).

## Mobile-first (FR-011)

Todo componente nuevo o modificado (Inicio, Clientes, badges de estado, nav
común) se diseña primero para el ancho de pantalla móvil ya soportado por
`base.css` (`.contenido`, `.navegacion`, botones con `min-height: 44px`),
ampliando con *media queries* `min-width` igual que ya hace `base.css`,
nunca al revés.

## Idioma (FR-012)

Todo texto de las pantallas nuevas o modificadas por esta feature está en
español de España, reutilizando `formatearEuro`/`formatearFecha` de
`frontend/src/utils.js` para importes y fechas — no se introduce ningún
formato o cadena en otro idioma.

## Qué NO cambia (FR-013)

- Ningún valor numérico, cálculo, regla de redondeo, numeración ni
  comportamiento de la API existente cambia por este contrato — es
  puramente de presentación web.

## Qué queda fuera de este contrato

- El PDF (`generarPdf.js`, `pdf-documento.md` de la spec 001): conserva su
  apariencia actual. Alinear el PDF con esta identidad visual requeriría una
  spec propia (ver Assumptions de la spec 002, actualización 2026-07-31).
