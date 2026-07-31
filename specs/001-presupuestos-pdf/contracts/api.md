# Contrato: API HTTP (Express)

**Feature**: 001-presupuestos-pdf

Contrato del backend expuesto por `backend/src/app.js`. Es una API pensada
para un único freelancer por instalación (sin autenticación, ver
[research.md](../research.md) punto 7) y consumida por el frontend servido
por el mismo proceso. Todas las respuestas usan JSON salvo el endpoint de
PDF, que devuelve el fichero binario.

## Perfil

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/perfil` | Devuelve el perfil guardado, o `null` si no se ha configurado todavía (FR-017, Edge Cases: primer uso). |
| `PUT` | `/api/perfil` | Crea o actualiza el perfil (`nombre`, `nif`, `contacto`, `logo`). |

## Catálogo

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/catalogo` | Lista todos los servicios del catálogo. |
| `POST` | `/api/catalogo` | Crea un servicio (`nombre`, `precioPorDefecto`). |
| `PUT` | `/api/catalogo/:id` | Edita un servicio existente; no afecta a líneas de presupuestos ya creadas (FR-002). |
| `DELETE` | `/api/catalogo/:id` | Elimina un servicio del catálogo; no afecta a líneas ya copiadas (FR-002). |

## Presupuestos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/presupuestos` | Lista los presupuestos (resumen: número, fecha, cliente, total). |
| `GET` | `/api/presupuestos/:id` | Devuelve un presupuesto completo con sus líneas y su desglose calculado (ver [calculo.md](./calculo.md)). |
| `POST` | `/api/presupuestos` | Crea un presupuesto nuevo. Asigna `numero` automáticamente (FR-011); el cuerpo no puede incluirlo. |
| `PUT` | `/api/presupuestos/:id` | Edita cliente, tipo de IVA, retención y/o líneas de un presupuesto existente, en cualquier momento (FR-013). |
| `DELETE` | `/api/presupuestos/:id` | Elimina un presupuesto; su `numero` nunca se reutiliza (FR-018). |
| `GET` | `/api/presupuestos/:id/pdf` | Genera y descarga el PDF (`Content-Type: application/pdf`, `Content-Disposition: attachment`). Devuelve error `409` con un mensaje si el presupuesto no tiene líneas (FR-014). |

### Forma de un `Presupuesto` en las respuestas JSON

```json
{
  "id": 12,
  "numero": "2026-001",
  "fechaEmision": "2026-07-30",
  "fechaValidez": "2026-08-29",
  "clienteNombre": "Cliente Ejemplo S.L.",
  "clienteTipo": "empresa_autonomo",
  "tipoIva": 21,
  "retencionIrpf": 15,
  "lineas": [
    { "id": 1, "descripcion": "Diseño de logo", "cantidad": 1, "precioUnitario": 1500.00 },
    { "id": 2, "descripcion": "Sesión de consultoría", "cantidad": 1, "precioUnitario": 500.00 }
  ],
  "baseImponible": 2000.00,
  "iva": 420.00,
  "retencion": 300.00,
  "total": 2120.00
}
```

`fechaValidez` y los cuatro campos de desglose (`baseImponible`, `iva`,
`retencion`, `total`) son siempre calculados por el servidor a partir de
`fechaEmision` y de las líneas — nunca se aceptan como entrada en `POST`/`PUT`
(evita que cliente y servidor calculen cosas distintas).

## Errores

Todas las rutas devuelven errores como:

```json
{ "error": "Descripción en español del problema" }
```

Casos obligatorios:
- `409` al pedir el PDF de un presupuesto sin líneas (FR-014), con el mensaje
  que se muestra al freelancer.
- `404` al pedir/editar/borrar un `id` de presupuesto, catálogo o perfil que
  no existe.
- `400` ante datos claramente inválidos en el cuerpo (p. ej. `clienteTipo`
  fuera de los dos valores permitidos, `tipoIva` fuera de los cuatro
  permitidos) — nunca por el signo o valor de `cantidad`/`precioUnitario`,
  que se aceptan sin restricción (FR-004).

## Fuera de alcance de este contrato

No hay ningún endpoint de autenticación, sesión o gestión de usuarios: la API
asume que quien puede llamarla es el freelancer dueño de la instalación (ver
riesgo documentado en research.md, punto 7).
