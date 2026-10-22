# Issue tracker: GitHub

Las tareas y especificaciones viven en GitHub Issues. Usá `gh` desde
el repositorio; el CLI determina el destino mediante el remote de Git.

## Operaciones

- Crear: `gh issue create --title "..." --body-file <archivo>`.
- Consultar con comentarios: `gh issue view <numero> --comments`.
- Listar: `gh issue list --state open --json number,title,body,labels`.
- Comentar: `gh issue comment <numero> --body-file <archivo>`.
- Agregar etiquetas: `gh issue edit <numero> --add-label "..."`.
- Quitar etiquetas: `gh issue edit <numero> --remove-label "..."`.
- Hacer un issue sub-issue de un padre: `gh issue create --parent <padre> ...`,
  o después `gh issue edit <padre> --add-sub-issue <hijo>` (`gh` 2.94+).
  En `gh` anterior: `gh api --method POST repos/<owner>/<repo>/issues/<padre>/sub_issues -F sub_issue_id=<id-de-base-del-hijo>`
  (id de base, el mismo que en **Blocking**). Si los sub-issues no están
  habilitados, poné `Part of #<padre>` al inicio del cuerpo del hijo.
- Cerrar: `gh issue close <numero> --comment "..."`.

Para cuerpos de varias líneas, escribí el texto en un archivo temporal
y pasalo mediante `--body-file`.

Cuando una skill indique publicar en el tracker, creá un issue.
Cuando indique consultar el ticket relevante, leé el issue y sus comentarios.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Wayfinding operations

Las usa `/wayfinder`. El **mapa** es un issue y los tickets son issues hijos.

- **Map**: un issue con etiqueta `wayfinder:map` y cuerpo Notes / Decisions-so-far / Fog.
  `gh issue create --label wayfinder:map`.
- **Child ticket**: un issue enlazado al mapa como sub-issue (ver la operación
  de sub-issue). Si los sub-issues no están habilitados, agregá el hijo a una
  task list en el cuerpo del mapa y poné `Part of #<mapa>` al inicio del hijo.
  Etiquetas: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
  Al reclamarlo, se asigna a quien conduce la sesión.
- **Blocking**: dependencias nativas de GitHub. Agregá una arista con
  `gh api --method POST repos/<owner>/<repo>/issues/<hijo>/dependencies/blocked_by -F issue_id=<id-de-base-del-bloqueante>`,
  donde `<id-de-base-del-bloqueante>` es el id numérico de base
  (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, no el `#numero` ni el
  `node_id`). GitHub informa `issue_dependencies_summary.blocked_by` (solo
  bloqueantes abiertos). Si las dependencias no están disponibles, usá una
  línea `Blocked by: #<n>, #<n>` al inicio del cuerpo del hijo. Un ticket
  queda libre cuando todos sus bloqueantes están cerrados.
- **Frontier query**: listá los hijos abiertos del mapa (`gh issue list --state open`,
  acotado a los sub-issues o a la task list), descartá los que tengan un
  bloqueante abierto (`issue_dependencies_summary.blocked_by > 0`, o un issue
  abierto en la línea `Blocked by`) o un asignado; gana el primero en el orden
  del mapa.
- **Claim**: `gh issue edit <n> --add-assignee @me`, la primera escritura de la sesión.
- **Resolve**: `gh issue comment <n> --body "<respuesta>"`, después
  `gh issue close <n>`, y agregá un puntero de contexto (gist + enlace) a
  Decisions-so-far del mapa.
