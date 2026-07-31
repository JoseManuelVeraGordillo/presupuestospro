# Data Model: Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto

**Fecha**: 2026-07-30 | **Feature**: 002-rediseno-ui-clientes-estado

Amplía el modelo de datos de [spec 001](../001-presupuestos-pdf/data-model.md)
con una tabla nueva (`clientes`) y una columna nueva en `presupuestos`
(`estado`). Ninguna otra tabla (`perfil`, `catalogo`, `lineas_presupuesto`,
`contadores_numeracion`) cambia (FR-013). Ver decisiones 1, 2 y 5 de
[research.md](./research.md) para el razonamiento detrás de cada elección.

## Tabla `clientes` (nueva)

Corresponde a FR-016 a FR-022 y a la User Story 5.

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| id | INTEGER PK AUTOINCREMENT | sí | Identificador del cliente guardado. |
| nombre | TEXT | sí | Nombre o razón social del cliente. |
| tipo | TEXT (`empresa_autonomo` \| `particular`) | sí | Mismo dominio que `presupuestos.cliente_tipo`. |

**Reglas de validación**:
- No hay restricción de unicidad sobre `nombre`: se permiten clientes
  duplicados (Assumptions de la spec, mismo criterio que `catalogo`).
- Eliminar una fila de `clientes` (`DELETE`) no modifica ninguna fila de
  `presupuestos` ya creada con esos datos, porque el presupuesto copia
  `clienteNombre`/`clienteTipo` en el momento de crearse o editarse — **no
  existe clave foránea** entre `presupuestos` y `clientes` (FR-020,
  research.md punto 5).

## Tabla `presupuestos` (ampliada)

Se añade una columna respecto al esquema de spec 001; el resto de columnas
(`numero`, `fecha_emision`, `cliente_nombre`, `cliente_tipo`, `tipo_iva`,
`retencion_irpf`) no cambian.

| Columna | Tipo SQLite | Obligatorio | Notas |
|---|---|---|---|
| estado | TEXT (`borrador`\|`enviado`\|`aceptado`\|`rechazado`) | sí | `DEFAULT 'borrador'`. Añadida con `ALTER TABLE` de forma idempotente (research.md punto 1). Nunca almacena `caducado`. |

**Estado efectivo (no persistido, calculado siempre en lectura)**:

El campo `estado` que devuelve la API (y que consume el frontend) es un
**estado efectivo**, no necesariamente igual al valor guardado en columna:

```text
si estado_guardado ∈ {aceptado, rechazado}:
    estado_efectivo = estado_guardado
si no, si hoy > fecha_validez (fecha_emision + 30 días):
    estado_efectivo = "caducado"
si no:
    estado_efectivo = estado_guardado   # borrador | enviado
```

Corresponde a FR-023 a FR-027 y a la User Story 2. Ver research.md punto 2
para el razonamiento (nada de *jobs* en segundo plano).

**Reglas de validación**:
- Al crear un presupuesto, `estado` se inicia en `borrador` (FR-023).
- El estado se puede cambiar manualmente a cualquiera de los cuatro valores
  guardables (`borrador`/`enviado`/`aceptado`/`rechazado`) en cualquier
  momento, incluso si el estado efectivo actual es `caducado`,
  `aceptado` o `rechazado` — ningún estado bloquea la edición manual
  (FR-024, Clarifications).
- Descargar el PDF de un presupuesto **no** cambia su `estado` (FR-024).
- El cálculo de `caducado` nunca sobrescribe la columna `estado` cuando su
  valor guardado es `aceptado` o `rechazado` (FR-025).

## Relaciones (SQL)

```text
clientes (0..N filas) ── copia valores al elegir/guardar ──> presupuestos
                                                    (cliente_nombre, cliente_tipo;
                                                     sin FK, sin relación viva después)

presupuestos (1) ──< lineas_presupuesto (0..N)   [FK presupuesto_id, ON DELETE CASCADE] — sin cambios (spec 001)
```

No hay clave foránea entre `clientes` y `presupuestos`: igual que con
`catalogo` y `lineas_presupuesto` en spec 001, la copia es independiente una
vez creado o editado el presupuesto.

## Resumen de actividad (página de inicio)

No es una entidad ni una tabla: es una agregación calculada en el frontend a
partir de `GET /api/presupuestos` (que ya incluye `estado` por elemento),
contando cuántos presupuestos hay en cada uno de los cinco valores posibles
de `estado` efectivo (`borrador`, `enviado`, `aceptado`, `rechazado`,
`caducado`). Ver research.md punto 4.
