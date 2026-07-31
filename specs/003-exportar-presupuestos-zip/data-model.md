# Data Model: Exportar todos los presupuestos en un .zip

Esta feature **no añade ninguna tabla ni columna nueva** al esquema SQLite
(`backend/src/db/migraciones.js` no cambia): es una operación de solo
lectura sobre los datos que ya existen (`presupuestos`, `lineas_presupuesto`,
`clientes`, `catalogo`, `perfil`). Lo único nuevo es la **forma en memoria**
del .zip generado y de su fichero de datos interno, que se describen aquí.

## Entidad: Copia de seguridad (.zip de exportación)

No persistida; se construye bajo demanda en cada petición a
`GET /api/presupuestos/exportar` y se descarta tras enviarse. Estructura de
su contenido:

| Ruta dentro del .zip | Contenido | Origen |
|---|---|---|
| `<numero> - <cliente limpio>.pdf` (uno por presupuesto, con sufijo ` (n)` en caso de colisión) | El mismo PDF que genera `generarPdf(presupuesto)` para la descarga individual | `services/generarPdf.js` (sin cambios) |
| `datos-presupuestospro.json` | Ver "Entidad: Archivo de datos" abajo | Nuevo, construido por el servicio de exportación |

**Nombre del fichero .zip**: `presupuestospro-copia-<AAAA-MM-DD>.zip`, con la
fecha del día de la exportación (misma función `fechaHoyIso()` que ya usa
`models/presupuestos.js`).

**Orden de las entradas PDF**: por `numero` de presupuesto ascendente
(FR-013). Como `numero` tiene el formato `AAAA-NNN` con relleno de ceros
(`siguienteNumero()` en `services/numeracion.js`), el orden lexicográfico de
la cadena coincide con el orden cronológico/numérico real.

## Entidad: Archivo de datos (`datos-presupuestospro.json`)

Único fichero de texto plano estructurado (JSON) dentro del .zip, pensado
para una futura restauración (fuera de alcance de esta spec). Forma:

```jsonc
{
  "generadoEn": "2026-07-31T10:23:00.000Z",   // ISO 8601, instante de la exportación
  "perfil": {                                  // igual que GET /api/perfil (o null si no existe)
    "nombre": "...",
    "nif": "...",
    "contacto": "...",
    "logo": "data:image/png;base64,..."        // o null si no hay logo
  },
  "catalogo": [                                 // igual que GET /api/catalogo
    { "id": 1, "nombre": "...", "precioPorDefecto": 45 }
  ],
  "clientes": [                                 // igual que GET /api/clientes
    { "id": 1, "nombre": "...", "tipo": "empresa_autonomo" }
  ],
  "presupuestos": [                              // igual que GET /api/presupuestos/:id (forma "completa"), uno por cada presupuesto incluido en el .zip
    {
      "id": 12,
      "numero": "2026-005",
      "fechaEmision": "2026-07-10",
      "fechaValidez": "2026-08-09",
      "clienteNombre": "Estudio García",
      "clienteTipo": "empresa_autonomo",
      "tipoIva": 21,
      "retencionIrpf": "ninguna",
      "lineas": [
        { "id": 30, "descripcion": "...", "cantidad": 2, "precioUnitario": 100 }
      ],
      "baseImponible": 200,
      "iva": 42,
      "retencion": 0,
      "total": 242,
      "estado": "enviado"
    }
  ]
}
```

Notas:
- `presupuestos` **solo** incluye los presupuestos cuyo PDF se generó sin
  error; los omitidos (FR-002) no aparecen ni en el .zip ni en este JSON,
  para que el fichero de datos sea siempre coherente con los PDF presentes.
- `presupuestos[].estado` es el estado **efectivo** (el mismo que ya calcula
  `estadoEfectivo()` — incluye `caducado` cuando aplica), no el valor bruto
  almacenado en la columna `estado`.
- No hay relación por clave entre `presupuestos[].clienteNombre` y la lista
  `clientes`: en el esquema actual (spec 002) un presupuesto guarda el
  nombre/tipo de cliente como copia de texto en el momento de creación, no
  como referencia a la tabla `clientes`. El archivo de datos refleja esa
  misma falta de relación (dos secciones independientes), sin inventar un
  cruce que no existe en el modelo real.

## Estructura en memoria durante la generación (no persistida)

Usada internamente por el nuevo `services/exportarZip.js`:

- `nombresUsados: Set<string>` — nombres de fichero PDF ya asignados en la
  exportación en curso, para resolver colisiones (FR-009).
- `omitidos: string[]` — números de presupuesto (`numero`) cuyo PDF falló al
  generarse; se usan solo para construir la cabecera de respuesta
  `X-Presupuestos-Omitidos` (ver `research.md` punto 3), nunca se persisten.
