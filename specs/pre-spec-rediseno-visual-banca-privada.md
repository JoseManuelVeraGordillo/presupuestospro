# Pre-especificación: Rediseño visual — dirección "Banca privada"

> Documento de entrada para `/speckit.specify`. No es un `spec.md` de spec-kit: sirve para fijar la decisión de producto y los tokens concretos antes de abrir la rama de feature (recordatorio: `/speckit.specify` debe ejecutar antes el hook `before_specify` / skill `speckit-git-feature`, según `CLAUDE.md`).

## Objetivo

Sustituir el aspecto visual actual de PresupuestosPro (bordes grises uniformes, enlaces con subrayado por defecto del navegador, badges de estado sin relación tonal, jerarquía tipográfica plana) por una dirección visual coherente de tipo "banca privada / dashboard financiero serio", de modo que un presupuesto o una pantalla de gestión transmitan la misma solvencia que un extracto bancario o una factura de una gestoría, no la de un prototipo sin estilar.

Este rediseño afecta **solo a la interfaz web** (`frontend/src/styles/base.css` y los componentes que consumen sus tokens). No incluye la plantilla PDF de los presupuestos (`pdfmake`); ver "Fuera de alcance".

## Usuarios

- **El freelancer (usuario único de la app):** trabaja a diario en las vistas de Presupuestos, Clientes, Catálogo y Perfil; necesita escanear listas de presupuestos por estado con rapidez (densidad de información, no solo estética).
- **El cliente del freelancer (usuario indirecto, no usa la app):** no interactúa con esta interfaz, pero la percepción de solvencia de esta UI es la misma vara con la que el freelancer decide si "da la talla" para representarle frente a sus propios clientes. Es el destinatario implícito del tono "banca privada", aunque no la vea.

## Dirección visual elegida (decisión de producto: dirección 1)

**"Banca privada" — sobriedad que inspira confianza.**

- Referencias: Mercury (mercury.com) y el dashboard de Stripe — superficies neutras muy claras, un único azul marino de acento, ausencia total de color decorativo, tipografía técnica sin serifas.
- Sensación buscada: "esta persona factura como una empresa seria; puedo confiar en el importe sin dudar."
- Se descartan explícitamente las otras dos direcciones evaluadas (referencia interna, no requieren spec): "Estudio creativo" (cálido/serif, Basecamp/Linear) y "Directo y amigable" (color vivo/rounded, Cash App/Monzo).

## Reglas de diseño (tokens)

Sustituyen/extienden los tokens actuales de `:root` en `base.css`. Se listan como valores concretos verificables, no como directrices abiertas.

**Color**
| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#F7F8FA` | Fondo general de la app (ya no blanco puro) |
| `--color-superficie` | `#FFFFFF` | Tarjetas, filas de lista, formularios (crea contraste de capa sobre el fondo) |
| `--color-texto` | `#0B1F3A` | Texto principal (azul marino casi negro, no gris neutro ni negro puro) |
| `--color-texto-secundario` | `#5B6B84` | Metadatos: fechas, ayudas, texto auxiliar |
| `--color-primario` | `#2E5AAC` | Acción primaria, tab activo, enlaces, foco |
| `--color-primario-oscuro` | `#0B1F3A` | Hover/active de botón primario y marca |
| `--color-exito` | `#1E7A4C` | Estado "Aceptado" |
| `--color-error` | `#B4232C` | Estado "Rechazado", botón "Eliminar" |
| `--color-alerta` | `#9A6700` | Estado "Caducado" |
| `--color-borde` | `#E1E4E9` | Bordes de tarjetas/inputs (más claro que el actual `#d0d5dd`) |

Badges de estado: fondo = color de estado al 10–12% de opacidad sobre `--color-superficie`, texto = color de estado al 100%. Se elimina cualquier badge cuyo color no derive de esta fórmula (prohibido añadir colores sueltos por estado).

**Tipografía**
- Familia única: `Inter` (con fallback `system-ui, sans-serif` solo si Inter no carga), sustituyendo el actual `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` como familia *primaria*.
- Pesos permitidos: 400 (texto), 500 (énfasis medio: nombres de cliente, metadatos destacados), 600 (títulos, importes, marca).
- Escala (sustituye la actual): marca `1.75rem/700`, título de sección `1.5rem/600`, subtítulo `1.15rem/600`, cuerpo `1rem/400`, pequeño `0.85rem/400-500`.
- Importes monetarios: `font-variant-numeric: tabular-nums`, peso 600, siempre en `--color-texto` o `--color-primario-oscuro` (nunca en gris).

**Forma y espaciado**
- Radio de esquina: `6px` (sustituye el `8px` actual) en botones, inputs, tarjetas — más angular que "redondeado amigable", coherente con la referencia bancaria.
- Bordes: 1px `--color-borde` solo en superficies de formulario/inputs; las tarjetas de lista (`.lista-items li`) pasan de borde a `--color-superficie` + `box-shadow: 0 1px 2px rgba(11,31,58,0.06)` para crear jerarquía de capas sin depender solo del borde.
- Espaciado: se mantiene la escala existente (`--espacio-xs/sm/md/lg/xl`), pero se prohíbe que dos bloques de distinta función (navegación vs. datos vs. acciones) compartan idéntico padding+borde+radio sin ninguna otra señal que los diferencie.
- Ancho de contenido: contenedor centrado con `max-width` explícito y consistente en todas las vistas (hoy varía de facto según vista); no debe quedar contenido "flotando" pegado a la izquierda con vacío sin estructurar a la derecha.

## Criterios de aceptación verificables (sí/no)

1. ¿Ningún enlace de la interfaz muestra el subrayado o el color azul/morado por defecto del navegador (todos usan los tokens de color y `text-decoration: none` o subrayado intencional)? Sí/No.
2. ¿Todo el texto de la aplicación usa la familia `Inter` cargada explícitamente (no `system-ui` como familia primaria)? Sí/No.
3. ¿Los importes en euros (listas de presupuestos, desglose, totales) usan peso 600 y `tabular-nums`? Sí/No.
4. ¿Los 5 badges de estado (Borrador/Enviado/Aceptado/Rechazado/Caducado) siguen la fórmula fondo-10%/texto-100% del mismo color, sin colores ajenos a la tabla de tokens? Sí/No.
5. ¿El radio de esquina aplicado a botones, inputs y tarjetas es `6px` de forma uniforme en toda la app? Sí/No.
6. ¿Las tarjetas de lista (presupuestos, clientes, catálogo) usan sombra (`box-shadow`) en lugar de solo borde para diferenciarse del fondo `--color-fondo`? Sí/No.
7. ¿El bloque de navegación/acciones primarias (p. ej. "+ Nuevo presupuesto") es visualmente distinguible del bloque de datos (lista de presupuestos) por más de un atributo (no solo el color de relleno)? Sí/No.
8. ¿Todos los botones y controles interactivos (botones, `select`, tabs) tienen un estado `:hover`/`:focus-visible` visible y distinto del estado reposo, usando los tokens de color definidos? Sí/No.
9. ¿El botón "Eliminar"/acciones destructivas usa `--color-error` y se distingue tipográfica o posicionalmente (no solo por color) de las acciones no destructivas? Sí/No.
10. ¿El contenido de cada vista está contenido en un ancho máximo consistente y centrado, sin vacíos sin estructurar a la derecha en resoluciones de escritorio estándar (≥1280px)? Sí/No.

## Fuera de alcance

- Rediseño de la plantilla PDF generada con `pdfmake` (fuente de los presupuestos descargados). Se mantiene tal cual; si se desea alinear su identidad visual con esta dirección, requiere una spec propia.
- Cualquier cambio de color/tipografía específico de dark mode (ya registrado como "Todavía no" en `specs/README.md`, pendiente de su propia spec).
- Cambios de arquitectura de información, nuevas vistas, nuevos campos de datos o nueva funcionalidad: esta feature es exclusivamente visual (tokens CSS y su aplicación), sin alterar rutas, modelos ni lógica de negocio.
- Ilustraciones, iconografía custom o imágenes de marca: la dirección "banca privada" se apoya en tipografía, color y espaciado, no en elementos gráficos adicionales.
- Animaciones o microinteracciones más allá de los estados `:hover`/`:focus` ya exigidos en los criterios de aceptación.

## Referencias

- Mercury — mercury.com (dashboard bancario, referencia de paleta y jerarquía)
- Stripe Dashboard — dashboard.stripe.com (referencia de tipografía técnica y densidad de datos)
- Tokens actuales de partida: `frontend/src/styles/base.css` (líneas 1–38), que esta feature sustituye/extiende.
