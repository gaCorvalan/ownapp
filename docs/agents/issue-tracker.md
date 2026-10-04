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
- Cerrar: `gh issue close <numero> --comment "..."`.

Para cuerpos de varias líneas, escribí el texto en un archivo temporal
y pasalo mediante `--body-file`.

Cuando una skill indique publicar en el tracker, creá un issue.
Cuando indique consultar el ticket relevante, leé el issue y sus comentarios.

## Pull requests as a triage surface

**PRs as a request surface: no.**
