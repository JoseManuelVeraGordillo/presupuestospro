# Quickstart: Validación de Presupuestos en PDF para Freelancers

**Feature**: 001-presupuestos-pdf

Guía de validación manual, pensada para poder ejecutarse **sin leer código**
(Principio IV de la constitución). Cada bloque comprueba un criterio de éxito
o un escenario de aceptación de la [spec](./spec.md).

## Preparación (una sola vez)

```bash
cd backend
npm install
npm run dev        # arranca Express en http://localhost:3000, crea data/presupuestospro.db si no existe
```

En otra terminal, compila el frontend (o dejarlo en modo watch durante el
desarrollo):

```bash
cd frontend
npm install
npm run dev        # o "npm run build" para generar los estáticos que sirve Express
```

Abre `http://localhost:3000` en el navegador (es Express quien sirve tanto la
API como el frontend). Para comprobar el móvil, abre la misma URL desde el
navegador del teléfono, sustituyendo `localhost` por la IP del ordenador en la
misma red Wi-Fi (p. ej. `http://192.168.1.20:3000`), o usa el modo de
emulación de dispositivo móvil de las herramientas de desarrollador del
navegador.

Para probar la versión que se publicaría online:

```bash
cd frontend && npm run build
cd ../backend && npm start
```

## 1. Primer uso, sin perfil ni catálogo (Edge Cases)

1. Abre la aplicación por primera vez (sin haber configurado nada).
2. Crea un presupuesto nuevo introduciendo a mano los datos del cliente y del
   freelancer.
3. **Esperado**: se puede crear y descargar el presupuesto igualmente, sin
   necesidad de perfil ni catálogo previos.

## 2. Presupuesto completo en PDF — caso base (User Story 1, SC-001, SC-002)

1. Crea un presupuesto nuevo.
2. Añade dos líneas escritas a mano: `1.500,00 €` y `500,00 €` (cantidad 1
   cada una).
3. Selecciona IVA `21%`.
4. Marca el cliente como `empresa/autónomo` y activa retención `15%`.
5. **Esperado** en el desglose mostrado en pantalla:
   - Base imponible: `2.000,00 €`
   - IVA: `420,00 €`
   - Retención: `−300,00 €`
   - Total: `2.120,00 €`
6. Descarga el PDF y comprueba que el archivo descargado muestra el mismo
   desglose, más: número de presupuesto, fecha de emisión, fecha de validez
   (30 días después) y los datos del cliente y del freelancer.
7. Repite todo el proceso desde cero al menos una vez más y confirma que el
   total vuelve a cuadrar exactamente en `2.120,00 €` (SC-002: debe cumplirse
   el 100% de las veces).
8. Cronometra el tiempo desde que abres la aplicación hasta que tienes el PDF
   descargado: debe ser **menos de 5 minutos** (SC-001).

## 3. Recalculo automático (Acceptance Scenarios 2-3, SC-003)

Con el mismo presupuesto del paso anterior:

1. Cambia la retención de `15%` a `7%`.
   **Esperado**: el total pasa a `2.280,00 €` sin ninguna acción manual
   adicional.
2. Cambia el tipo de cliente a `particular`.
   **Esperado**: la retención desaparece del desglose y el total sube a
   `2.420,00 €`.

## 4. Presupuesto sin líneas (Acceptance Scenario 4, FR-014)

1. Crea un presupuesto nuevo y no añadas ninguna línea.
2. Intenta descargar el PDF.
3. **Esperado**: la aplicación avisa del motivo y no se descarga ningún
   archivo.

## 5. Catálogo de servicios (User Story 2)

1. Crea 2-3 servicios en el catálogo, cada uno con nombre y precio.
2. Abre un presupuesto nuevo y añade una línea desde el catálogo.
   **Esperado**: aparece con la descripción y precio guardados, y se puede
   editar antes de generar el PDF.
3. Edita el precio por defecto de un servicio del catálogo.
   **Esperado**: los presupuestos ya creados con ese servicio no cambian; un
   presupuesto nuevo sí usa el precio actualizado.

## 6. Perfil de marca (User Story 3)

1. Configura el perfil (nombre, NIF, contacto y logo) una sola vez.
2. Cierra la aplicación (cierra la pestaña/navegador) y vuelve a abrirla.
   **Esperado**: un presupuesto nuevo ya trae esos datos rellenos sin volver a
   escribirlos (SC-005).
3. Borra el logo del perfil y genera un PDF.
   **Esperado**: el documento se genera igual, mostrando solo el nombre del
   freelancer, sin huecos en blanco ni error (FR-016).

## 7. Numeración correlativa (Edge Cases, SC-004)

1. Crea dos presupuestos el mismo día.
   **Esperado**: cada uno recibe un número correlativo distinto (p. ej.
   `2026-001` y `2026-002`), sin colisión.
2. Elimina uno de los dos presupuestos y crea uno nuevo.
   **Esperado**: el número eliminado no se reutiliza; puede quedar un hueco en
   la numeración de ese año, y eso es correcto (no es un error).

## 8. Persistencia entre sesiones (SC-005)

1. Con perfil, catálogo y varios presupuestos ya creados, para el proceso del
   servidor (`Ctrl+C` en la terminal de `backend`) y vuelve a arrancarlo
   (`npm run dev` / `npm start`).
2. Abre la aplicación de nuevo.
   **Esperado**: perfil, catálogo y presupuestos siguen ahí exactamente igual
   que se dejaron — los datos viven en `backend/data/presupuestospro.db`, no
   en el navegador ni en memoria.

## 8bis. Acceso desde varios dispositivos (nuevo requisito de esta versión)

1. Con el servidor arrancado y accesible en red (ver "Preparación"), crea un
   presupuesto desde el ordenador.
2. Abre la misma URL desde el móvil (misma instalación/servidor).
   **Esperado**: el presupuesto creado en el ordenador aparece también en el
   móvil, sin ningún paso de sincronización manual — ambos dispositivos leen
   la misma base de datos del servidor.
3. Edita ese presupuesto desde el móvil.
   **Esperado**: el cambio se ve también desde el ordenador al recargar.

## 9. Edición tras generar el PDF (FR-013)

1. Genera el PDF de un presupuesto ya existente.
2. Edita una línea de ese mismo presupuesto (cambia cantidad o precio).
3. Vuelve a descargar el PDF.
   **Esperado**: se puede editar y volver a descargar sin restricción; el
   nuevo PDF refleja el cambio.

## 10. Uso en móvil

1. Repite los pasos 2 y 4 (caso base y aviso de presupuesto vacío) desde un
   navegador móvil (teléfono real o emulación de pantalla pequeña).
   **Esperado**: los formularios se leen y se rellenan cómodamente, los
   botones son fáciles de pulsar con el dedo, y la descarga del PDF funciona
   igual que en escritorio.

## Pruebas automáticas (complementarias, no sustituyen lo anterior)

```bash
cd backend
npm run test        # unitarias: cálculo y numeración (Vitest)
npm run test:api    # ligeras: endpoints de la API (supertest)
```

Cubren la lógica de cálculo, numeración (ver
[contracts/calculo.md](./contracts/calculo.md)) y la forma de las respuestas
de la API (ver [contracts/api.md](./contracts/api.md)); el resto de criterios
se confirman con los pasos manuales anteriores, tal como exige el Principio
IV de la constitución.
