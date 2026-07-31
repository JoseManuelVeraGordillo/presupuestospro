<!--
Sync Impact Report
==================
Version change: [template unratified] → 1.0.0
Rationale: Initial ratification — first concrete constitution for PresupuestosPro,
filling all placeholders with 5 project-specific principles (MINOR/MAJOR both apply
to a first release; per template convention initial adoption is versioned 1.0.0).

Modified principles: N/A (first version — no prior named principles to rename)

Added sections:
- I. Simplicidad Ante Todo
- II. Idioma y Mercado (Español de España, Euro)
- III. Cero Alcance Fantasma
- IV. Verificable por una Persona No Técnica
- V. Respeto por los Datos del Usuario
- Restricciones de Producto (Versión 1)
- Flujo de Trabajo de Desarrollo
- Governance

Removed sections: none (template placeholders only)

Templates requiring updates:
- ✅ .specify/templates/plan-template.md — "Constitution Check" gate already reads
  generically from this file ("[Gates determined based on constitution file]");
  no edit needed, gate content is derived at plan time from the 5 principles below.
- ✅ .specify/templates/spec-template.md — generic, no agent- or principle-specific
  references to update.
- ✅ .specify/templates/tasks-template.md — generic, no agent- or principle-specific
  references to update.
- ✅ .claude/skills/speckit-constitution/SKILL.md — no stale agent-specific naming found.

Follow-up TODOs: none.
-->

# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad Ante Todo

Ante dos soluciones que resuelvan el mismo problema, se elige siempre la más simple.
Este proyecto está en Versión 1: no se anticipa complejidad para necesidades futuras
hipotéticas. No se añaden capas, patrones o configuraciones "por si acaso" — se
construye lo que la spec pide, de la forma más directa posible.

**Rationale**: La complejidad anticipada es la fuente más común de retraso y deuda
técnica en un producto que aún no ha validado su mercado. Mantenerlo simple permite
iterar rápido y corregir rumbo sin coste de reescritura.

### II. Idioma y Mercado (Español de España, Euro)

Todo el producto — interfaz, textos, mensajes de error, documentación de cara al
usuario y presupuestos generados en PDF — se entrega en español de España. La moneda
de toda la aplicación es el Euro (€); no se contemplan otras monedas ni formatos de
importe distintos a los usados en España (p. ej. separador decimal con coma).

**Rationale**: El mercado objetivo son freelancers en España. Soportar múltiples
idiomas o monedas en Versión 1 sería complejidad no solicitada por el mercado real.

### III. Cero Alcance Fantasma

No se implementa ninguna funcionalidad que no esté escrita en la spec vigente. Si
durante el desarrollo surge una idea nueva, una mejora o un "ya que estamos", se
propone como una futura spec o tarea — nunca se construye directamente sin pasar por
el proceso de especificación.

**Rationale**: El alcance fantasma (funcionalidad no pedida) infla el trabajo, oculta
riesgos de diseño no revisados y rompe la trazabilidad entre spec y producto.

### IV. Verificable por una Persona No Técnica

Cada criterio de éxito de una spec debe poder comprobarse usando la aplicación —
haciendo clic, rellenando formularios, descargando el PDF — sin necesidad de leer
código, logs técnicos ni consultar a un desarrollador.

**Rationale**: Si un criterio de éxito no se puede verificar de forma manual y
observable, no es un criterio de éxito útil para el negocio; es una implementación
de detalle disfrazada de requisito.

### V. Respeto por los Datos del Usuario

Solo se solicitan al usuario (freelancer) y a sus clientes los datos estrictamente
imprescindibles para generar un presupuesto (p. ej. nombre, datos fiscales básicos,
conceptos y precios). Nunca se introducen claves, contraseñas ni secretos directamente
en el código fuente; deben vivir fuera del repositorio (variables de entorno o
gestor de secretos).

**Rationale**: Un producto de gestión financiera para autónomos maneja datos
sensibles (fiscales y de clientes); pedir de más o filtrar secretos son riesgos de
confianza y de seguridad que no son aceptables ni siquiera en una Versión 1.

## Restricciones de Producto (Versión 1)

- El producto es una herramienta web para que freelancers generen presupuestos en
  formato PDF.
- Todo texto de cara al usuario está en español de España; todo importe se expresa
  en euros (€).
- Cualquier funcionalidad fuera de "generar presupuestos en PDF para freelancers"
  requiere una nueva spec explícita antes de construirse (véase Principio III).

## Flujo de Trabajo de Desarrollo

- Cada spec y cada plan deben poder justificar sus decisiones frente a los 5
  principios anteriores antes de pasar a tareas de implementación.
- Toda funcionalidad nueva no contemplada en la spec activa se registra como
  propuesta separada (nueva spec), no se implementa "de paso".
- Antes de dar una funcionalidad por terminada, se valida manualmente en la propia
  aplicación (sin leer código) que cumple los criterios de éxito de la spec.
- Cualquier secreto, clave o credencial necesaria para el proyecto se documenta como
  variable de entorno, nunca se comitea en el repositorio.

## Governance

Esta constitución prevalece sobre cualquier otra convención o preferencia de
implementación dentro del proyecto. En caso de conflicto entre una spec, un plan o
una tarea y esta constitución, la constitución tiene prioridad y el artefacto en
conflicto debe corregirse.

**Procedimiento de enmienda**: Cualquier cambio a esta constitución se propone
explícitamente (no se infiere de una conversación sobre otra tarea), se redacta en
este mismo archivo y se versiona según semver:
- MAJOR: eliminación o redefinición incompatible de un principio existente.
- MINOR: adición de un nuevo principio o sección, o ampliación material de una guía.
- PATCH: aclaraciones de redacción sin cambio de sentido.

**Cumplimiento**: Cada `/speckit-plan` debe incluir una comprobación explícita
("Constitution Check") frente a los 5 principios. Cualquier desviación debe quedar
justificada en la sección "Complexity Tracking" del plan correspondiente.

**Version**: 1.0.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-07-29
