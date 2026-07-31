# CLAUDE.md

PresupuestosPro es una app web para que un freelancer cree presupuestos con su marca (perfil + catálogo + clientes), les asigne un estado y los descargue en PDF con IVA/IRPF calculados.

## Stack y decisiones vigentes
- Backend: Node.js ≥22.5 + Express, `node:sqlite` (`DatabaseSync`) nativo — **no** `better-sqlite3` (se descartó por exigir compilación nativa). Un único fichero SQLite (`backend/data/presupuestospro.db`), sin ORM, SQL directo, capas `db/` → `models/` → `services/` → `routes/`.
- Frontend: JavaScript vanilla (sin framework), router hash propio (`frontend/src/main.js`), `fetch` contra la API, Vite solo como build/dev tool. Tokens CSS en `:root` (`frontend/src/styles/base.css`).
- PDF: `pdfmake`, generado en servidor.
- Un único proceso Express sirve API + estáticos. Sin cuentas de usuario ni multi-tenant (una instalación por freelancer). Config sensible (ruta BD, puerto) por variables de entorno, nunca en código.
- Todo texto de cara al usuario en español de España; importes en euros con coma decimal (`formatearEuro`).

## Arrancar y probar en local
```bash
cd backend && npm install && npm run dev     # Express en http://localhost:3000, crea la BD si no existe
cd frontend && npm install && npm run dev     # o "npm run build" para servir estáticos vía Express
```
Tests: `cd backend && npm test` (Vitest, unit) y `npm run test:api` (Supertest, endpoints). No hay tests de frontend; la validación de UI es manual, guiada por `quickstart.md` de cada spec en `specs/`.

## Convenciones
- Un patrón por entidad (modelo + rutas + vista), replicado igual para nuevas entidades (ver `clientes` como plantilla).
- Sin frameworks ni librerías nuevas salvo decisión explícita del usuario y justificada en el `plan.md` de la spec correspondiente.
- Cambios de alcance solo si están en una spec de `specs/`; nada de funcionalidad no pedida ("Cero Alcance Fantasma").
- Toda desviación de la constitución se documenta en la sección "Complexity Tracking" del `plan.md` de la spec.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md.
## Spec-kit

* Antes de ejecutar el flujo de `/speckit.specify`, SIEMPRE ejecuta primero el hook `before_specify` (skill `speckit-git-feature`) para crear la rama de la feature, y espera su resultado antes de crear la spec.
* Tras completar `/speckit.specify`, verifica con `git branch --show-current` que estamos en la rama `NNN-nombre-feature` y no en `master`. Si no es así, avísame antes de continuar.