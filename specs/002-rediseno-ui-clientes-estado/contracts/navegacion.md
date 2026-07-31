# Contrato: Rutas de frontend y navegación común

**Feature**: 002-rediseno-ui-clientes-estado

Contrato de la interfaz que ve el freelancer: qué rutas existen dentro de la
SPA y cómo se navega entre ellas. Corresponde a FR-001 a FR-005 y a la User
Story 1. Gestionado por el router hash-based de `frontend/src/main.js`.

## Rutas registradas

| Ruta (hash) | Vista | Notas |
|---|---|---|
| `#/inicio` | `renderVistaInicio` (nuevo) | Accesos a las 4 secciones + resumen de presupuestos por estado (FR-002, FR-003). |
| `#/presupuestos` | `renderVistaListadoPresupuestos` | Sin cambios de ruta; se amplía su contenido (badge de estado, FR-010). |
| `#/presupuesto/:id` \| `#/presupuesto/nuevo` | `renderVistaPresupuesto` | Sin cambios de ruta; se amplía su contenido (selector de estado, selector de cliente guardado). |
| `#/clientes` | `renderVistaClientes` (nuevo) | Listar, crear, editar, eliminar clientes guardados (FR-016 a FR-019). |
| `#/catalogo` | `renderVistaCatalogo` | Sin cambios. |
| `#/perfil` | `renderVistaPerfil` | Sin cambios. |

**Ruta por defecto**: cuando `window.location.hash` está vacío (incluida la
primera carga en la raíz del servidor, `/`), el router muestra `#/inicio` en
lugar de `#/presupuestos` (antes de esta feature) — así "acceder a la raíz
del servidor" (FR-001) siempre entra por la página de inicio.

## Navegación común (FR-004, FR-005)

- El `<nav class="navegacion">` de `frontend/index.html` es **estático**,
  vive fuera del contenedor `#app` que gestiona el router, y por tanto
  **persiste sin recargarse** entre navegaciones (ya ocurre así hoy). Se
  amplía con enlaces a "Inicio" y "Clientes", quedando cinco enlaces en
  total: Inicio, Presupuestos, Clientes, Catálogo, Perfil.
- Tras cada navegación (`hashchange` y carga inicial), `main.js` marca con
  una clase (p. ej. `.activo`) el enlace del nav cuya ruta coincide con la
  actual, y la retira de los demás — es la forma en que el freelancer
  identifica en qué sección está (FR-005).
- Ningún flujo depende del botón atrás del navegador: todas las
  transiciones entre secciones están disponibles como enlace directo en el
  nav común, visible en cualquier pantalla.

## Resumen de actividad de `#/inicio` (FR-003)

`renderVistaInicio` llama a `listarPresupuestos()` (ya existente en
`api.js`, ahora con `estado` en cada elemento) y agrega en el propio
frontend cuántos presupuestos hay por cada uno de los cinco valores de
estado efectivo. No depende de ningún endpoint nuevo (research.md, punto 4).

## Qué NO cambia

Las rutas y el comportamiento de `#/presupuestos`, `#/presupuesto/:id`,
`#/catalogo` y `#/perfil` como *puntos de entrada* no cambian — solo se
amplía su contenido interno (formularios, listados) según el resto de
contratos de esta feature.
