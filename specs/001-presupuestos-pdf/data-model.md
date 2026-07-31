# Data Model: Presupuestos en PDF para Freelancers

**Fecha**: 2026-07-30 | **Feature**: 001-presupuestos-pdf

Todas las entidades se guardan en un único fichero SQLite en el servidor de
cada instalación (ver [research.md](./research.md), puntos 1-2). No existe
concepto de "usuario" en el esquema: al ser una instalación por freelancer,
todas las filas de todas las tablas pertenecen implícitamente a ese único
freelancer.

## Tabla `perfil`

Fila única (id fijo). Corresponde a FR-001 y a la User Story 3.

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| id | INTEGER PK | sí | Siempre `1`; solo existe una fila. |
| nombre | TEXT | sí | Nombre o razón social del freelancer. |
| nif | TEXT | sí | NIF/NIE del freelancer. |
| contacto | TEXT | no | Email/teléfono/dirección, texto libre. |
| logo | BLOB | no | Imagen del logo; si es `NULL`, el PDF muestra solo el nombre (FR-016). |

**Reglas de validación**: la fila puede no existir todavía (primer uso,
Edge Cases); en ese caso los presupuestos se crean con los datos del
freelancer introducidos a mano en el propio formulario del presupuesto.

## Tabla `catalogo`

Corresponde a FR-002 y a la User Story 2.

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| id | INTEGER PK AUTOINCREMENT | sí | Identificador del servicio. |
| nombre | TEXT | sí | Descripción por defecto del servicio. |
| precio_por_defecto | REAL | sí | Precio unitario por defecto, en euros. |

**Reglas de validación**: eliminar una fila de `catalogo` no modifica ninguna
fila de `lineas_presupuesto` ya creada a partir de ella, porque la línea
copia sus propios valores en el momento de añadirse (FR-002) — no hay clave
foránea de `lineas_presupuesto` hacia `catalogo`.

## Tabla `presupuestos`

Corresponde a FR-003 a FR-014, FR-018 y a la User Story 1. Los datos del
cliente se guardan como columnas del propio presupuesto (no existe tabla de
clientes, según Clarifications de la spec).

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| id | INTEGER PK AUTOINCREMENT | sí | Identificador interno. |
| numero | TEXT (`AAAA-NNN`) UNIQUE | sí | Asignado automáticamente al crear; no editable (FR-011). |
| fecha_emision | TEXT (ISO 8601) | sí | Fecha de creación del presupuesto. |
| cliente_nombre | TEXT | sí | Nombre/razón social del cliente, escrito a mano cada vez. |
| cliente_tipo | TEXT (`empresa_autonomo` \| `particular`) | sí | Determina si puede aplicar retención (FR-007/FR-008). |
| tipo_iva | INTEGER (`21`\|`10`\|`4`\|`0`) | sí | Porcentaje de IVA aplicado a toda la base (FR-006). |
| retencion_irpf | TEXT (`ninguna`\|`15`\|`7`) | sí | Solo tiene efecto si `cliente_tipo = empresa_autonomo` (FR-007/FR-008). Se convierte a número (`15`/`7`) o se omite (`ninguna`) al construir la respuesta JSON de la API, según [contracts/calculo.md](./contracts/calculo.md). |

`fecha_validez` **no se guarda**: se calcula siempre como
`fecha_emision + 30 días naturales` (FR-012), tanto en la API como en el PDF.

**Campos calculados (no se guardan, se derivan siempre de las líneas del
presupuesto + `tipo_iva` + `retencion_irpf`, vía el contrato de
[cálculo](./contracts/calculo.md))**:
- `base_imponible` = Σ (cantidad × precio_unitario) de todas sus líneas (FR-005).
- `iva` = `base_imponible` × `tipo_iva` (FR-006).
- `retencion` = `cliente_tipo = empresa_autonomo` ? `base_imponible` ×
  `retencion_irpf` : 0 (FR-007/FR-008).
- `total` = `base_imponible` + `iva` − `retencion` (FR-009), redondeado a 2
  decimales con la regla estándar (FR-010).

**Reglas de validación**:
- No se puede generar el PDF si el presupuesto no tiene ninguna línea
  (FR-014).
- El presupuesto se puede editar y volver a descargar en cualquier momento,
  incluso después de generado el PDF; nunca queda bloqueado (FR-013).
- Eliminar un presupuesto (`DELETE`) no libera ni reutiliza su `numero`
  (FR-018) — no se reescribe `numero` de ninguna otra fila al borrar.

## Tabla `lineas_presupuesto`

Corresponde a FR-004.

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| id | INTEGER PK AUTOINCREMENT | sí | Identificador de la línea. |
| presupuesto_id | INTEGER (FK → `presupuestos.id`, `ON DELETE CASCADE`) | sí | Pertenece a un único presupuesto. |
| descripcion | TEXT | sí | Copiada del catálogo o escrita a mano. |
| cantidad | REAL | sí | Sin restricción de signo o cero (FR-004, Edge Cases). |
| precio_unitario | REAL | sí | Sin restricción de signo o cero (FR-004, Edge Cases). |

**Reglas de validación**: ninguna sobre el signo o valor de `cantidad` /
`precio_unitario` — se aceptan valores cero o negativos sin aviso, tal como
exige explícitamente la spec (Edge Cases, FR-004). `ON DELETE CASCADE`
asegura que al borrar un presupuesto se borran también sus líneas, sin dejar
filas huérfanas.

## Tabla `contadores_numeracion`

Regla transversal de numeración (FR-011, Edge Cases), no es una entidad de
negocio en sí misma.

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| anio | INTEGER PK | sí | Año natural (p. ej. `2026`). |
| ultimo_numero | INTEGER | sí | Último número correlativo asignado ese año. |

- Al crear un presupuesto: se lee (o se crea con `0`) la fila de
  `contadores_numeracion` para el año en curso, se incrementa
  `ultimo_numero` y se usa `AAAA-NNN` (con `NNN` a 3 cifras) como `numero`
  del nuevo presupuesto, dentro de la misma transacción SQL para evitar
  colisiones si se crean dos presupuestos el mismo día (Edge Cases).
- Eliminar un presupuesto no decrementa `ultimo_numero` (FR-018, Edge
  Cases): pueden quedar huecos y es un comportamiento esperado.

## Relaciones (SQL)

```text
perfil (1 fila fija)                    — sin relación en BD con presupuestos;
                                            se lee al generar el PDF.

catalogo (0..N filas) ── copia valores al crear ──> lineas_presupuesto
                                                      (sin FK, sin relación viva después)

presupuestos (1) ──< lineas_presupuesto (0..N)   [FK presupuesto_id, ON DELETE CASCADE]

contadores_numeracion (por año) — consultado/actualizado al crear un presupuesto,
                                    sin FK hacia presupuestos.
```

No hay clave foránea entre `catalogo` y `lineas_presupuesto`, ni tabla de
clientes: ambas copias son independientes una vez creadas, tal como fijan las
Clarifications de la spec.
