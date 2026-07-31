# Quickstart: Validación de "Exportar todo (.zip)"

**Feature**: 003-exportar-presupuestos-zip

Guía de validación manual, pensada para ejecutarse **sin leer código**
(Principio IV). Cada bloque comprueba un criterio de éxito o un escenario de
aceptación de la [spec](./spec.md). Asume la aplicación ya instalada
(`npm install` + `npm run dev` en `backend/` y `frontend/`, ver quickstart de
spec 001).

```bash
cd backend && npm run dev     # http://localhost:3000
cd frontend && npm run dev    # o "npm run build" para servir los estáticos vía Express
```

## 1. Descargar una copia completa (User Story 1, SC-001, SC-002)

1. Crea 3 presupuestos con clientes distintos (al menos uno con datos
   completos y otro con una sola línea).
2. Ve al listado de presupuestos y localiza el botón **"Exportar todo
   (.zip)"**.
   **Esperado**: el botón es visible sin necesidad de hacer scroll especial.
3. Púlsalo.
   **Esperado**: se descarga un único archivo llamado
   `presupuestospro-copia-<fecha de hoy>.zip` (p. ej.
   `presupuestospro-copia-2026-07-31.zip`).
4. Descomprime el .zip con doble clic (o el gestor de archivos habitual).
   **Esperado**: contiene exactamente 3 PDF, nombrados "número - cliente"
   (p. ej. `2026-001 - Estudio García.pdf`), más un único fichero
   `datos-presupuestospro.json`.
5. Abre uno de esos PDF y compáralo, céntimo a céntimo, con el PDF que
   descargas para ese mismo presupuesto desde su pantalla de detalle
   (botón de descarga individual).
   **Esperado**: son idénticos en importes, datos y formato.
6. Abre `datos-presupuestospro.json` con un editor de texto.
   **Esperado**: se lee con claridad (no es binario), e incluye tus 3
   presupuestos, tu catálogo, tus clientes y tu perfil.
7. Con un único presupuesto guardado (borra los otros 2, o prueba en una
   instalación nueva con solo 1), repite el paso 3.
   **Esperado**: el .zip contiene ese único PDF y el fichero de datos (no
   hace falta un mínimo de presupuestos).

## 2. Aviso cuando no hay nada que exportar (User Story 2, SC-003)

1. En una instalación sin ningún presupuesto guardado (o tras borrarlos
   todos), pulsa "Exportar todo (.zip)".
   **Esperado**: aparece un aviso claro de que no hay presupuestos para
   exportar; no se descarga ningún archivo.

## 3. Nombres conflictivos y volumen alto (User Story 3, SC-004, SC-005)

1. Crea un presupuesto para un cliente con un nombre que incluya caracteres
   no válidos en nombres de archivo, por ejemplo `Diseño/Web S.L.` o
   `Estudio: García`.
2. Exporta todo y descomprime el .zip.
   **Esperado**: el .zip se genera sin errores; el PDF de ese presupuesto
   tiene un nombre de archivo válido (sin `/`, `:`, etc.) y sigue siendo
   reconocible por el número y el nombre del cliente.
3. Crea dos presupuestos para el mismo cliente (mismo `numero`… en realidad
   distinto número pero mismo nombre de cliente) de forma que, tras limpiar
   caracteres, coincidirían en nombre — por ejemplo, dos presupuestos para
   "Diseño/Web S.L." y "Diseño\\Web S.L." respectivamente (ambos limpian al
   mismo nombre base).
   **Esperado**: dentro del .zip, uno de los dos PDF lleva un sufijo
   numérico entre paréntesis al final del nombre (p. ej.
   `2026-003 - DiseñoWeb S.L. (2).pdf`), y ninguno de los dos PDF falta ni
   sobrescribe al otro.
4. Crea (o genera con un script de pruebas) 50 o más presupuestos.
5. Pulsa "Exportar todo (.zip)".
   **Esperado**: mientras dura la generación, el botón se deshabilita y
   muestra un indicador de que la exportación está en curso (p. ej. cambia
   su texto); un segundo clic durante ese tiempo no inicia una segunda
   exportación. Al finalizar, se descarga el .zip completo con los 50+ PDF
   más el fichero de datos, ordenados por número ascendente.

## Pruebas automáticas (complementarias, no sustituyen lo anterior)

```bash
cd backend
npm run test        # unitarias (sin cambios: cálculo y numeración)
npm run test:api    # incluye ahora presupuestos.test.js con casos de /exportar
```

Cubren el endpoint `GET /api/presupuestos/exportar` (caso vacío → `409`,
caso con presupuestos → `200` + cabeceras, limpieza de nombres y
resolución de colisiones — ver [contracts/api.md](./contracts/api.md)); la
descarga real desde el navegador, el indicador de progreso y la apariencia
del .zip descomprimido se confirman con los pasos manuales anteriores, tal
como exige el Principio IV.
