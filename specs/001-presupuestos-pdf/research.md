# Research: Presupuestos en PDF para Freelancers

**Fecha**: 2026-07-30 | **Feature**: 001-presupuestos-pdf

Punto de partida de esta revisión: el usuario ha pedido explícitamente
**Node.js + Express + SQLite**, con el objetivo de negocio de que un mismo
freelancer pueda acceder a sus datos desde varios dispositivos (móvil y
ordenador), manteniendo el resto de restricciones ya fijadas: sin cuentas de
usuario, sin base de datos en la nube, una instalación por freelancer (sin
multi-tenant).

## 1. Arquitectura general: ¿por qué ahora sí un backend?

- **Decision**: Servidor Node.js + Express con estado, una instalación por
  freelancer.
- **Rationale (negocio)**: El acceso multi-dispositivo del mismo freelancer
  es incompatible con guardar los datos solo en el navegador de cada
  dispositivo (cada uno vería datos distintos). Un servidor con una base de
  datos persistente es la forma más directa de que "el mismo presupuesto" se
  vea igual en el móvil y en el ordenador. Esto es una desviación consciente
  del Principio I (Simplicidad), aceptada porque resuelve un requisito que la
  opción más simple no puede cumplir (ver plan.md, Complexity Tracking).
- **Alternatives considered**:
  - Mantener el navegador como único almacén y sincronizar manualmente
    (exportar/importar un archivo): rechazado por el usuario — quiere acceso
    directo desde varios dispositivos, no un paso manual de por medio.
  - Backend "serverless" con base de datos gestionada en la nube (Firebase,
    Supabase, etc.): rechazado — contradice la restricción explícita de "sin
    base de datos en la nube" para esta versión.

## 2. Base de datos: SQLite

- **Decision**: SQLite como fichero único en el disco del servidor, accedido
  con `better-sqlite3` (API síncrona).
- **Rationale (negocio)**: SQLite no es un servicio en la nube ni añade un
  proceso de base de datos aparte que administrar (a diferencia de
  PostgreSQL/MySQL, que exigirían levantar y mantener un servidor de base de
  datos independiente) — es solo un archivo. Para un único freelancer con un
  volumen de datos bajo, es la opción con menos piezas móviles que sigue
  cumpliendo "no BD en la nube". `better-sqlite3` se eligió frente a otras
  librerías de SQLite para Node por su API síncrona, que simplifica el código
  del backend (sin callbacks ni promesas anidadas) sin coste real de
  rendimiento a este volumen.
- **Alternatives considered**:
  - PostgreSQL/MySQL (aunque autoalojados): rechazados — exigen un servicio de
    base de datos adicional que gestionar (usuario, contraseña, proceso,
    copias de seguridad propias), complejidad no justificada para un solo
    freelancer por instalación.
  - `sqlite3` (API basada en callbacks): rechazada frente a `better-sqlite3`
    por añadir complejidad de manejo asíncrono sin beneficio real en este
    caso de uso (un solo proceso, baja concurrencia).

## 3. Generación del PDF

- **Decision**: Generación del PDF en el servidor (Node), con `pdfmake`,
  servido como descarga desde un endpoint de la API.
- **Rationale (negocio)**: Al existir ya un backend, generar el PDF ahí evita
  duplicar la lógica de cálculo entre cliente y servidor (una sola fuente de
  verdad para "cuánto suma este presupuesto"), y sigue produciendo un
  documento con texto real y nítido, no una captura de pantalla.
- **Alternatives considered**:
  - Generar el PDF en el navegador (como en la versión anterior de este
    plan): rechazado ahora — obligaría a mantener la lógica de cálculo
    duplicada en cliente y servidor, con riesgo de que se desincronicen.
  - `html2canvas` + `jsPDF`: rechazado por la misma razón que en la versión
    anterior (peor calidad de texto).

## 4. Frontend

- **Decision**: JavaScript vanilla (sin React/Vue/Angular) que llama a la API
  vía `fetch`; Vite solo como build/desarrollo del frontend, servido después
  como archivos estáticos por el propio Express.
- **Rationale (negocio)**: El número de pantallas sigue siendo pequeño
  (perfil, catálogo, presupuesto); un framework grande añadiría peso de
  descarga (relevante en móvil) sin necesidad, y añadir backend ya es
  suficiente complejidad nueva para esta versión — no conviene sumarle otra
  más en el frontend.
- **Alternatives considered**:
  - React/Vue: rechazado por el mismo motivo que antes — peso y complejidad
    no justificados por el alcance actual.

## 5. Diseño para móvil

- **Decision**: CSS mobile-first hecho a medida (sin librería de componentes
  pesada).
- **Rationale (negocio)**: Sigue vigente la instrucción de que la app
  funcione bien en el móvil; con acceso multi-dispositivo esto es aún más
  relevante, ya que el freelancer usará el móvil como uno de sus puntos de
  acceso habituales.
- **Alternatives considered**: sin cambios respecto a la versión anterior de
  esta investigación.

## 6. Publicación y hosting

- **Decision**: Desplegar un único proceso Node.js (Express) con **disco
  persistente** para el fichero SQLite, en un hosting que soporte procesos
  Node de larga duración (p. ej. una VPS pequeña, o una plataforma tipo
  Render/Fly.io/Railway configurada con un volumen persistente).
- **Rationale (negocio)**: A diferencia del sitio 100% estático de la
  versión anterior (que se podía publicar como archivos sueltos), un backend
  con estado necesita que el proceso esté siempre encendido y que el fichero
  de base de datos **no se borre** entre despliegues. Esto es más lento de
  poner en marcha que un sitio estático, pero sigue siendo una única pieza de
  infraestructura (un servicio, no varios).
- **Riesgo importante a comunicar**: algunas plataformas "serverless" o de
  contenedores efímeros **borran el disco local en cada despliegue**. Si se
  elige una de estas sin configurar un volumen persistente, se perderían
  todos los datos del freelancer en el siguiente despliegue. Este punto debe
  verificarse explícitamente al elegir el hosting final (tarea de
  implementación/despliegue, no de este plan).
- **Alternatives considered**:
  - Hosting estático (Netlify/Vercel/GitHub Pages tal cual): descartado para
    esta versión — no ejecutan procesos Node persistentes, incompatible con
    tener un backend con estado.

## 7. Seguridad y acceso (riesgo, no una decisión de diseño)

- **Observación**: sin cuentas de usuario ni contraseña, cualquiera que
  conozca la URL de la instalación puede leer y modificar los datos del
  freelancer (perfil, presupuestos, catálogo). Esto no ocurría con el
  almacenamiento solo en el navegador, donde el acceso físico al dispositivo
  era la única barrera.
- **Decisión para esta versión**: no se añade ningún mecanismo de protección
  (ni login ni código de acceso), porque no está pedido en la spec vigente
  (Principio III, Cero Alcance Fantasma). Se documenta como riesgo aceptado
  por el usuario al elegir esta arquitectura, y como candidato a una futura
  spec si se quiere mitigar (p. ej. un código de acceso simple, sin llegar a
  ser un sistema de cuentas).

## 8. Estrategia de pruebas

- **Decision**: Vitest para la lógica de cálculo y numeración; `supertest`
  para pruebas ligeras de los endpoints HTTP; verificación manual guiada
  (quickstart.md) para el resto de criterios de éxito, incluido el acceso
  multi-dispositivo.
- **Rationale (negocio)**: El cálculo sigue siendo la parte más crítica y
  objetiva (SC-002); los endpoints se prueban de forma ligera para asegurar
  que la API responde lo que promete el contrato (ver contracts/api.md); el
  resto se confirma a mano, tal como exige el Principio IV.
- **Alternatives considered**: sin cambios respecto a la versión anterior.

## Resumen de decisiones (Technical Context)

Todas las incógnitas de la sección "Technical Context" del plan quedan
resueltas; no quedan puntos con "NEEDS CLARIFICATION". La única desviación
respecto a la constitución (introducir un servidor con estado) queda
registrada y justificada en el "Constitution Check" y en "Complexity
Tracking" de plan.md.
