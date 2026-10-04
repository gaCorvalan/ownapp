# Reglas de trabajo

- Priorizá soluciones simples, componentes reutilizables y buena maquetación.
  Evitá abstracciones o dependencias que la tarea no necesite.
- Respetá la separación existente entre rutas, UI, coordinación, dominio e
  infraestructura. Mantené la lógica de negocio independiente de React y de
  las APIs del dispositivo; aislá el reconocimiento de texto y el almacenamiento.
- Representá los importes en centavos enteros y calculá los totales a partir
  de los ítems de la compra.
- Usá pnpm y las herramientas configuradas en el repositorio. Consultá
  `package.json` para las versiones y los scripts vigentes.
- Para cambios de código, ejecutá `pnpm typecheck`, `pnpm lint` y las pruebas
  pertinentes (`pnpm test` para la lógica de compra). No repitas pruebas de
  código por cambios exclusivamente documentales.
- Preferí soluciones existentes con respaldo verificable. Consultá las skills
  instaladas cuando correspondan a la tarea; no dupliques sus instrucciones aquí.
- Consultá el [README](README.md) para entender el funcionamiento y la arquitectura
  cuando la tarea lo requiera. Actualizalo si cambia lo que documenta.
- Registrá cambios relevantes de funcionalidad y compatibilidad en
  [CHANGELOG.md](CHANGELOG.md), bajo `Unreleased` y en la categoría correspondiente.
  No lo uses como diario de sesiones ni como lista de tareas pendientes.
- Cuando se soliciten commits, usá Conventional Commits y agrupá los cambios
  por responsabilidad.
- Al terminar, informá qué cambió, qué verificaste y qué queda pendiente.
  Distinguí las pruebas automáticas, la generación de bundles, la comprobación
  visual en web y la ejecución en un teléfono físico.

## Agent skills

### Issue tracker

Las tareas y especificaciones se registran en GitHub Issues.
Para crear, consultar o actualizar issues, leé `docs/agents/issue-tracker.md`.

### Triage labels

Usamos las cinco etiquetas predeterminadas de triage.
Antes de clasificar issues, leé `docs/agents/triage-labels.md`.

### Domain docs

El dominio usa un layout single-context.
Antes de explorar el dominio, leé `docs/agents/domain.md`.
