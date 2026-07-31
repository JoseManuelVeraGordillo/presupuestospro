# Contrato: API HTTP (ampliación sobre spec 001 y spec 002)

**Feature**: 003-exportar-presupuestos-zip

Amplía el contrato de API de
[spec 001](../../001-presupuestos-pdf/contracts/api.md) y
[spec 002](../../002-rediseno-ui-clientes-estado/contracts/api.md). Todos los
endpoints ya existentes (`perfil`, `catalogo`, `clientes`, `presupuestos`)
**se mantienen exactamente igual**: mismas rutas, mismo cuerpo, mismos
códigos de error. Aquí solo se documenta el único endpoint **nuevo**.

## Exportar todo (nuevo)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/presupuestos/exportar` | Genera y devuelve un .zip con un PDF por cada presupuesto existente más el fichero de datos (FR-002). Operación de solo lectura (FR-007). |

Esta ruta se registra **antes** de `GET /api/presupuestos/:id/pdf` y
`GET /api/presupuestos/:id` en `presupuestos.routes.js`, para que `exportar`
nunca se interprete como un valor de `:id`.

### Respuesta de éxito (hay al menos 1 presupuesto)

`200 OK`, cuerpo binario (el .zip), con cabeceras:

```
Content-Type: application/zip
Content-Disposition: attachment; filename="presupuestospro-copia-2026-07-31.zip"
```

Contenido del .zip: ver [data-model.md](../data-model.md). Orden de los PDF:
por `numero` ascendente (FR-013).

### Cabecera opcional: presupuestos omitidos por error (FR-002)

Si al generar el PDF de uno o más presupuestos concretos ocurre un error, esos
presupuestos se omiten (no aparecen en el .zip ni en el fichero de datos) y
la respuesta de éxito (sigue siendo `200`, el .zip se entrega igualmente)
incluye además:

```
X-Presupuestos-Omitidos: 2026-005,2026-007
```

Lista de `numero` de los presupuestos omitidos, separados por comas. Ausente
por completo si no se omitió ninguno. El frontend debe leer esta cabecera
tras completar la descarga y mostrar un aviso con esos números (research.md,
punto 3).

### Sin presupuestos que exportar (FR-010)

`409 Conflict`:

```json
{ "error": "No hay presupuestos guardados para exportar." }
```

No se genera ningún .zip ni se envía ningún cuerpo binario en este caso.

### Errores

- `409` si no hay ningún presupuesto guardado (ver arriba). No hay otros
  códigos de error específicos de este endpoint: un fallo al generar el PDF
  de un presupuesto concreto **no** hace fallar la petición completa (se
  omite ese presupuesto, ver arriba); solo un error inesperado al construir
  el propio .zip (p. ej. fallo de la librería de compresión) devolvería
  `500`, igual que cualquier otro error no controlado de la aplicación.

## Fuera de alcance de este contrato

No se añade ningún endpoint para importar o restaurar la copia generada (la
restauración queda fuera de alcance de esta spec, ver Assumptions de
spec.md).
