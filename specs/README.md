# Estado del producto — PresupuestosPro

Registro de todas las specs de PresupuestosPro y su estado de implementación.
Se actualiza al cerrar cada feature (ver flujo "cerrar la feature" en `CLAUDE.md`).

| # | Nombre | Qué aporta | Estado | Rama |
|---|--------|------------|--------|------|
| [001](001-presupuestos-pdf/spec.md) | Presupuestos en PDF para Freelancers | Núcleo del producto: perfil de marca, catálogo de servicios, creación de presupuestos con cálculo de base/IVA/IRPF, numeración correlativa AAAA-NNN y descarga en PDF. | Implementada. Incluida en la foto inicial del repositorio (commit `21389fc`), previa a la adopción de spec-kit en este proyecto, por lo que no tiene rama de feature registrada. **Modificada por la spec [002](002-rediseno-ui-clientes-estado/spec.md)**: añade campo de estado al presupuesto y sustituye la introducción manual de cliente por un directorio reutilizable, sin alterar cálculos, IVA/IRPF ni numeración. | — (pre spec-kit) |
| [002](002-rediseno-ui-clientes-estado/spec.md) | Página de Inicio, Rediseño Visual, Clientes y Estados de Presupuesto | Página de inicio con navegación común, rediseño visual de app y PDF, directorio de clientes (CRUD) y estado de presupuesto (Borrador/Enviado/Aceptado/Rechazado/Caducado). | Implementada. Incluida en la foto inicial del repositorio (commit `21389fc`), previa a la adopción de spec-kit, sin rama de feature registrada. **Modifica la spec [001](001-presupuestos-pdf/spec.md)**: amplía su esquema de datos (nueva entidad Cliente, nuevo campo `estado` en Presupuesto) y su UI/plantilla PDF; la lógica de cálculo, IVA/IRPF y numeración de la 001 quedan intactas. | — (pre spec-kit) |
| [003](003-exportar-presupuestos-zip/spec.md) | Exportar todos los presupuestos en un .zip | Botón "Exportar todo (.zip)" en la lista de presupuestos: descarga un .zip con un PDF por presupuesto (reutilizando la generación de la spec 001) y un archivo de datos de respaldo (presupuestos, catálogo, clientes y perfil). Operación de solo lectura. | Implementada y fusionada en `master` (merge commit `556941b`). No modifica el comportamiento de las specs 001/002: solo reutiliza su generación de PDF y sus estados de presupuesto para incluir todos los presupuestos existentes en la exportación. | `003-exportar-presupuestos-zip` (fusionada y eliminada tras el cierre) |

## Notas

- Las specs 001 y 002 se desarrollaron antes de introducir spec-kit en el proyecto (ver `10e6e12 Añade CLAUDE.md con memoria técnica del proyecto`); su código ya estaba integrado en `master` en la foto inicial y por eso no tienen rama ni merge commit propios.
- A partir de la spec 003, toda feature nueva sigue el flujo spec-kit completo: rama `NNN-nombre-feature` → spec → plan → tasks → implementación → cierre con merge `--no-ff` a `master` (regla documentada en `CLAUDE.md`).
- Las reglas de producto que rigen todas las specs viven en [.specify/memory/constitution.md](../.specify/memory/constitution.md).

## Fuera de alcance acumulado (la lista de "Todavía no")
- Cuentas de usuario y datos en la nube (decidido en 001)
- Importar la copia de seguridad / restaurar datos (decidido en 003)
- Modo oscuro (idea del Módulo 5 - esperando su momento y su spec)