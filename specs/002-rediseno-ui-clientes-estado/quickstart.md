# Quickstart: Validación de Inicio, Rediseño Visual, Clientes y Estados

**Feature**: 002-rediseno-ui-clientes-estado

Guía de validación manual, pensada para ejecutarse **sin leer código**
(Principio IV). Cada bloque comprueba un criterio de éxito o un escenario de
aceptación de la [spec](./spec.md). Asume la aplicación ya instalada según
el [quickstart de spec 001](../001-presupuestos-pdf/quickstart.md)
(`npm install` + `npm run dev` en `backend/` y `frontend/`).

```bash
cd backend && npm run dev     # http://localhost:3000
cd frontend && npm run dev    # o "npm run build" para servir los estáticos vía Express
```

## 1. Página de inicio y navegación común (User Story 1, SC-001)

1. Abre `http://localhost:3000` directamente (raíz del servidor, sin ningún
   hash en la URL).
   **Esperado**: aparece la página de inicio, con accesos claros a
   Presupuestos, Clientes, Catálogo y Perfil, y un resumen con el número de
   presupuestos por estado.
2. Desde cualquier sección (p. ej. Catálogo), busca la navegación común
   visible en la pantalla y ve a Clientes sin usar el botón atrás del
   navegador.
   **Esperado**: llegas a Clientes en un solo toque/clic; el nav sigue
   visible e indica en qué sección estás ahora.
3. Repite el cambio de sección varias veces (Presupuestos → Perfil →
   Inicio) sin usar nunca el botón atrás.
   **Esperado**: siempre puedes moverte usando solo el nav común.

## 2. Estado del presupuesto (User Story 2, SC-002, SC-003)

1. Crea un presupuesto nuevo.
   **Esperado**: aparece en estado **Borrador** por defecto.
2. Desde el listado de presupuestos, usa la acción rápida de la fila para
   cambiarlo a **Enviado**, sin abrir el presupuesto.
   **Esperado**: el listado muestra el nuevo estado con un color/etiqueta
   distinguible, sin recargar la página.
3. Abre el presupuesto y cámbialo a **Aceptado** desde el detalle.
   **Esperado**: el cambio se refleja también en el listado.
4. Crea un segundo presupuesto y no lo marques como Aceptado ni Rechazado.
   Cambia la fecha del sistema (o edita manualmente `fecha_emision` en la
   base de datos de pruebas) para simular que han pasado más de 30 días.
   **Esperado**: al recargar, ese presupuesto aparece como **Caducado** sin
   que lo hayas marcado a mano.
5. Marca ese mismo presupuesto Caducado como **Rechazado**.
   **Esperado**: se permite sin restricción (ningún estado bloquea la
   edición manual); pasa a mostrarse como Rechazado.
6. Ve a la página de inicio.
   **Esperado**: el número de presupuestos por estado coincide exactamente
   con lo que ves en el listado (Borrador/Enviado/Aceptado/Rechazado/
   Caducado).
7. Descarga el PDF de un presupuesto en Borrador.
   **Esperado**: el estado sigue siendo Borrador después de la descarga (no
   cambia automáticamente a Enviado).

## 3. Diseño visual "Banca privada" (User Story 3, SC-006, SC-007, SC-009, SC-010)

1. Recorre Inicio, Presupuestos, Clientes, Catálogo y Perfil, e inspecciona
   con las herramientas de desarrollador (o a simple vista) el color de
   fondo, el texto y los enlaces.
   **Esperado**: fondo `#F7F8FA`, texto principal `#0B1F3A`, ningún enlace
   con el subrayado o el azul/morado por defecto del navegador (FR-029,
   FR-038, SC-010).
2. Comprueba la fuente aplicada a cualquier texto (inspector del navegador).
   **Esperado**: `Inter`, no la fuente del sistema (FR-030).
3. Abre el listado de presupuestos con presupuestos en distintos estados.
   **Esperado**: cada badge tiene el fondo tenue y el texto saturado del
   color de su estado (Borrador gris, Enviado azul `#2E5AAC`, Aceptado verde
   `#1E7A4C`, Rechazado rojo `#B4232C`, Caducado ámbar `#9A6700`), y el
   importe de cada presupuesto se distingue en negrita con cifras alineadas
   (FR-031, FR-032, SC-009: identificas estado e importe en menos de 2
   segundos).
4. Compara el radio de esquina y el fondo de una tarjeta de la lista de
   presupuestos con el de un botón.
   **Esperado**: mismo radio (6px) en ambos; la tarjeta se distingue del
   fondo general por una sombra sutil, no solo por un borde (FR-033,
   FR-034).
5. Compara visualmente el bloque "+ Nuevo presupuesto" / "Exportar todo
   (.zip)" con el listado de presupuestos debajo.
   **Esperado**: se distinguen por más de un atributo (no solo el color de
   relleno) (FR-035).
6. Pasa el cursor (o el foco con Tab) por un botón, un `select` y una
   pestaña de navegación.
   **Esperado**: cada uno cambia de aspecto de forma visible respecto al
   reposo (FR-036).
7. Localiza el botón "Eliminar" de un presupuesto o cliente.
   **Esperado**: usa el color de error y se distingue de los botones no
   destructivos por algo más que el color (FR-037).
8. Abre cualquier pantalla en una ventana de escritorio ancha (≥1280px).
   **Esperado**: el contenido queda centrado en un ancho máximo consistente,
   sin un hueco sin estructurar a la derecha (FR-039).
9. Abre el detalle de un presupuesto con líneas y total.
   **Esperado**: el título, la tabla de líneas, el formulario y el total se
   distinguen claramente por jerarquía visual (el total resalta más que las
   líneas, en negrita con cifras tabulares).
10. Con el presupuesto del paso 9 (base 2.000,00 €, IVA 21%, retención 15%),
    confirma que el total sigue siendo exactamente `2.120,00 €` tras el
    rediseño (SC-006: el rediseño no cambia cálculos).
11. Abre la aplicación desde un móvil real o con el emulador de pantalla
    estrecha del navegador, y repite el paso 1.
    **Esperado**: ninguna pantalla tiene scroll horizontal ni elementos
    cortados; los botones siguen siendo fáciles de pulsar con el dedo.

## 4. PDF con la misma imagen profesional (User Story 4)

> **Retirado (actualización 2026-07-31).** El PDF queda fuera de alcance de
> la dirección "Banca privada": conserva su apariencia actual, no se valida
> aquí. Ver spec, User Story 4 (retirada) y Assumptions.

## 5. Directorio de clientes (User Story 5, SC-004, SC-005)

1. Ve a Clientes y crea un cliente nuevo con nombre y tipo.
   **Esperado**: aparece en el listado de clientes.
2. Edita ese cliente (cambia el nombre).
   **Esperado**: el listado refleja el cambio.
3. Crea un presupuesto nuevo y elige ese cliente desde un selector en lugar
   de escribirlo a mano.
   **Esperado**: el nombre y el tipo se rellenan automáticamente; en menos
   de 1 minuto tienes el presupuesto listo con esos datos (SC-004).
4. En otro presupuesto, escribe los datos de un cliente a mano y usa la
   opción de guardarlo como cliente nuevo en el mismo paso.
   **Esperado**: el cliente aparece después en el listado de Clientes sin
   haber ido a esa sección por separado.
5. Vuelve a Clientes y elimina el primer cliente creado.
   **Esperado**: desaparece del listado de clientes, pero el presupuesto que
   ya lo usaba sigue mostrando el mismo nombre y tipo que tenía (SC-005).

## Pruebas automáticas (complementarias, no sustituyen lo anterior)

```bash
cd backend
npm run test        # unitarias (sin cambios: cálculo y numeración)
npm run test:api    # incluye ahora clientes.test.js y los casos de estado en presupuestos.test.js
```

Cubren el CRUD de clientes y las transiciones de estado (ver
[contracts/api.md](./contracts/api.md)); la navegación, el rediseño visual y
el comportamiento mobile-first se confirman con los pasos manuales
anteriores, tal como exige el Principio IV.
