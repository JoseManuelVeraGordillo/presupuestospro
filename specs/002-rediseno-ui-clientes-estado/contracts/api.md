# Contrato: API HTTP (ampliación sobre spec 001)

**Feature**: 002-rediseno-ui-clientes-estado

Amplía [el contrato de API de spec 001](../../001-presupuestos-pdf/contracts/api.md).
Todos los endpoints de `perfil`, `catalogo` y `presupuestos` ya descritos ahí
**se mantienen exactamente igual** (FR-013): mismas rutas, mismo cuerpo,
mismos códigos de error. Aquí solo se documentan las rutas **nuevas** y el
único campo **añadido** a la forma de un `Presupuesto`.

## Clientes (nuevo)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/clientes` | Lista todos los clientes guardados (FR-017). |
| `GET` | `/api/clientes/:id` | Devuelve el detalle de un cliente guardado (FR-017). |
| `POST` | `/api/clientes` | Crea un cliente (`nombre`, `tipo`) (FR-016). |
| `PUT` | `/api/clientes/:id` | Edita un cliente existente (FR-018). |
| `DELETE` | `/api/clientes/:id` | Elimina un cliente; no afecta a presupuestos ya creados con sus datos (FR-020). |

### Forma de un `Cliente` en las respuestas JSON

```json
{
  "id": 3,
  "nombre": "Cliente Ejemplo S.L.",
  "tipo": "empresa_autonomo"
}
```

`tipo` acepta los mismos dos valores que `clienteTipo` en `presupuestos`:
`empresa_autonomo` | `particular`.

## Cambio rápido de estado (nuevo)

| Método | Ruta | Descripción |
|---|---|---|
| `PATCH` | `/api/presupuestos/:id/estado` | Cambia solo el estado de un presupuesto, sin tocar el resto de sus datos (FR-024, FR-028). |

Cuerpo de la petición:

```json
{ "estado": "enviado" }
```

`estado` debe ser uno de `borrador` | `enviado` | `aceptado` | `rechazado`
(nunca `caducado`: ese valor se calcula, no se asigna — ver
[data-model.md](../data-model.md)). Responde `200` con el presupuesto
completo actualizado (misma forma que `GET /api/presupuestos/:id`), o `404`
si el `id` no existe, o `400` si `estado` no es uno de los cuatro valores
válidos.

## Campo añadido a `Presupuesto` (GET /api/presupuestos, GET /api/presupuestos/:id)

Se añade `estado` (el **estado efectivo**, ver
[data-model.md](../data-model.md)) tanto en el resumen del listado como en
el detalle completo:

```jsonc
{
  "id": 12,
  "numero": "2026-001",
  // ...resto de campos igual que en spec 001...
  "estado": "enviado" // "borrador" | "enviado" | "aceptado" | "rechazado" | "caducado"
}
```

`POST` y `PUT` de `presupuestos` **no** aceptan `estado` en el cuerpo (se
inicia siempre en `borrador` al crear, y solo cambia a través de `PATCH
/api/presupuestos/:id/estado`, igual que `numero` y `fechaValidez` ya eran
campos de solo lectura calculados/asignados por el servidor en spec 001).

## Errores (ampliación)

Mismas reglas que spec 001, más:

- `400` en `PATCH /api/presupuestos/:id/estado` si `estado` no es uno de los
  cuatro valores guardables.
- `400` en `POST`/`PUT /api/clientes` si falta `nombre` o si `tipo` no es
  uno de los dos valores permitidos.
- `404` al pedir/editar/borrar un `id` de cliente que no existe.

## Fuera de alcance de este contrato

No se añade ningún endpoint de agregación (p. ej. "resumen por estado"): el
resumen de la página de inicio se calcula en el frontend a partir de `GET
/api/presupuestos` (research.md, punto 4).
