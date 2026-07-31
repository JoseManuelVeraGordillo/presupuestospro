# Contrato: Cálculo del presupuesto

**Feature**: 001-presupuestos-pdf

El módulo `backend/src/services/calculo.js` tiene un contrato interno
estable del que dependen las rutas de la API (ver [api.md](./api.md)), la
generación del PDF y las pruebas unitarias. Se ejecuta **únicamente en el
servidor**: es la única fuente de verdad del cálculo, de modo que la API, la
pantalla de presupuesto y el PDF descargado siempre muestren exactamente los
mismos importes. Cualquier tarea de implementación debe respetar esta firma y
estas reglas.

## Función: `calcularPresupuesto(lineas, tipoIva, clienteTipo, retencionIrpf)`

**Entrada**:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `lineas` | `{ cantidad: number, precioUnitario: number }[]` | Líneas del presupuesto (FR-004). Puede ser `[]`. |
| `tipoIva` | `21 \| 10 \| 4 \| 0` | Porcentaje de IVA elegido para todo el presupuesto (FR-006). |
| `clienteTipo` | `"empresa_autonomo" \| "particular"` | Determina si la retención puede aplicarse (FR-007/FR-008). |
| `retencionIrpf` | `"ninguna" \| 15 \| 7` | Porcentaje de retención elegido (FR-007). |

**Salida**:

```text
{
  baseImponible: number,  // suma de cantidad × precioUnitario (FR-005)
  iva: number,             // baseImponible × tipoIva / 100 (FR-006)
  retencion: number,       // 0 si clienteTipo = "particular"; si no, baseImponible × retencionIrpf / 100 (FR-007/FR-008)
  total: number            // baseImponible + iva - retencion (FR-009)
}
```

## Reglas obligatorias (verificables con pruebas unitarias)

1. **Redondeo**: los cuatro valores de salida se redondean a 2 decimales con
   la regla estándar (la tercera cifra decimal a partir de 5 redondea hacia
   arriba) — FR-010. Ejemplo de la spec: 2,345 € → 2,35 €.
2. **Retención condicionada al cliente**: si `clienteTipo = "particular"`,
   `retencion` es siempre `0`, **incluso si** `retencionIrpf` viene distinto de
   `"ninguna"` (FR-008, Edge Cases: "retención marcada por error").
3. **Sin restricciones de signo**: `cantidad` y `precioUnitario` pueden ser
   cero o negativos; la función los incluye en la suma sin lanzar error ni
   advertencia (FR-004, Edge Cases).
4. **Presupuesto vacío**: con `lineas = []`, la función devuelve
   `baseImponible = iva = retencion = total = 0`; la prohibición de generar el
   PDF en ese caso (FR-014) es responsabilidad de `generarPdf.js`, no de este
   cálculo.
5. **Recalculo total**: la función es pura (mismo input → mismo output) y se
   invoca de nuevo ante cualquier cambio de líneas, `tipoIva`, `clienteTipo` o
   `retencionIrpf`, de forma que la interfaz muestre el total actualizado sin
   pasos manuales adicionales (SC-003).

## Caso de referencia (usado como test de aceptación, SC-002)

```text
lineas = [{cantidad: 1, precioUnitario: 1500.00}, {cantidad: 1, precioUnitario: 500.00}]
tipoIva = 21
clienteTipo = "empresa_autonomo"
retencionIrpf = 15

→ baseImponible = 2000.00
→ iva            =  420.00
→ retencion      = -300.00   (mostrada como retención, resta del total)
→ total          = 2120.00
```
