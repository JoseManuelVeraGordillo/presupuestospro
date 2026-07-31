---
name: "speckit-git-feature"
description: "Crea o cambia a la rama git de una feature (NNN-nombre-feature) antes de generar su spec. Se ejecuta como hook before_specify de /speckit-specify, según CLAUDE.md."
argument-hint: "La misma descripción de la feature que se pasó a /speckit-specify"
compatibility: "Requiere estructura de proyecto spec-kit con .specify/ y un repositorio git"
metadata:
  author: "presupuestospro"
  source: ".specify/extensions.yml#hooks.before_specify"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

Este comando se invoca normalmente de forma automática, como hook
`before_specify` de `/speckit-specify` (ver `.specify/extensions.yml`), con
la misma descripción de feature que el usuario escribió tras
`/speckit-specify`. También puede invocarse a mano si hace falta recrear o
corregir la rama de una feature.

## Qué hace

Determina el nombre de rama `NNN-nombre-feature` que le correspondería a
esta feature (reutilizando exactamente la misma lógica de numeración y
normalización de nombre que ya usa `create-new-feature.ps1`, para que la
rama y el directorio `specs/NNN-nombre-feature/` que creará después
`/speckit-specify` coincidan) y crea o cambia a esa rama en git.

## Pasos

1. **Calcular el nombre de rama sin crear nada todavía** (modo `-DryRun`, no
   toca el sistema de ficheros ni `.specify/feature.json`):

   ```powershell
   .specify/scripts/powershell/create-new-feature.ps1 -DryRun -Json "<descripción de la feature>"
   ```

   (Ejecútalo desde la raíz del repositorio, con el mismo intérprete
   PowerShell que ya usan el resto de skills speckit-* de este proyecto —
   no depende de tener `pwsh` en el PATH.)

   Si el usuario proporcionó explícitamente `GIT_BRANCH_NAME`, pásalo como
   `-ShortName "<GIT_BRANCH_NAME>"` para que el script use ese valor exacto
   como sufijo de rama en lugar de derivarlo de la descripción.

   El resultado JSON trae `BRANCH_NAME` y `FEATURE_NUM`. Guarda ambos
   valores: los necesitarás para responder a `/speckit-specify` y son los
   mismos que usará después al crear `specs/<BRANCH_NAME>/`.

2. **Comprobar el estado actual del repositorio**:

   ```bash
   git status
   git branch --show-current
   ```

   Si hay cambios sin commitear que no son tuyos de esta sesión, no los
   descartes: `git checkout -b` no toca el árbol de trabajo, así que es
   seguro seguir aunque haya cambios pendientes.

3. **Si ya estás en una rama cuyo nombre es exactamente `BRANCH_NAME`**, no
   hagas nada más: la rama ya existe y está activa. Informa de ello y
   termina.

4. **Si `BRANCH_NAME` ya existe como rama local pero no es la rama activa**
   (por ejemplo, se reintenta `/speckit-specify` tras un fallo previo),
   cambia a ella en vez de intentar crearla de nuevo:

   ```bash
   git checkout <BRANCH_NAME>
   ```

5. **En cualquier otro caso**, créala y cámbiate a ella desde el commit
   actual (normalmente `main`):

   ```bash
   git checkout -b <BRANCH_NAME>
   ```

6. **Verifica el resultado**:

   ```bash
   git branch --show-current
   ```

   Debe coincidir exactamente con `BRANCH_NAME`. Si no coincide, o el
   comando `git checkout` falla (por ejemplo, por un conflicto de nombre con
   una rama remota divergente), detente y comunica el error con claridad en
   vez de continuar — `/speckit-specify` no debe crear la spec en la rama
   equivocada.

## Salida

Termina emitiendo el mismo JSON que devolvió el paso 1 (o el estado ya
verificado si la rama ya existía), para que el flujo de `/speckit-specify`
que te invocó pueda leer `BRANCH_NAME` y `FEATURE_NUM`:

```json
{"BRANCH_NAME": "003-exportar-presupuestos-zip", "FEATURE_NUM": "003"}
```

## Notas

- Esta skill **nunca** crea el directorio `specs/<feature>/` ni el
  `spec.md`: eso lo hace siempre `/speckit-specify` en su propio flujo
  (usando la misma numeración, ya calculada aquí, así que no debería haber
  discrepancia). Esta skill solo gestiona la rama git.
- No se usa `git checkout -b` con `--force` ni ninguna operación
  destructiva; si algo impide crear o cambiar de rama con seguridad, se
  informa y se detiene en vez de forzar.
