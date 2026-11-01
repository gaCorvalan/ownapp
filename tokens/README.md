# Tokens de color para Figma

Prueba de concepto para llevar los colores de la app a variables de Figma. La app no cambia de tema: sigue usando la paleta clara de `constants/brand.ts`. Arcilla y Noche son experimentales y viven solo en estos archivos.

## Diagnóstico

La app es Expo SDK 57 con React Native. No usa Tailwind ni variables CSS. Los colores están en `constants/brand.ts` y la pantalla los consume directo, sobre todo desde `src/features/supermarket/ui`. No hay un segundo tema implementado. El sistema de marca deja el tema oscuro para más adelante.

`colors.ink` se usa a la vez como texto principal y como superficie oscura. `colors.selectionBorder` se usa como borde de selección y como divisor de esa superficie. En Figma esos roles son tokens distintos. En el modo Actual resuelven al mismo valor, así que la pantalla no cambia. En Arcilla y Noche pueden separarse.

No encontré un archivo de Figma enlazado en el repositorio, en los issues ni en el correo. Estos archivos están listos para importar. Todavía no están aplicados a un diseño.

## Estructura

Una colección, `Color`, con tres modos: **Actual**, **Arcilla** y **Noche**.

Professional admite hasta 10 modos por colección. Con una sola colección de varios modos, la paleta se cambia con un solo selector. Actual tiene que quedar en la columna de la izquierda: ese es el modo predeterminado.

| Grupo | Qué guarda | Ejemplo |
| --- | --- | --- |
| `primitivo/*` | Valores crudos. No se aplican a las capas. | `primitivo/ink` |
| `surface/*`, `text/*`, `action/*`, `border/*` | Tokens de uso. Apuntan a un primitivo con un alias. | `surface/canvas` → `{primitivo.canvas}` |
| `state/pressed`, `state/disabled` | Opacidad de `ActionButton`: 0,75 y 0,45. Igual en los tres modos. | |

`surface/scrim` no tiene un color propio: es `primitivo/ink` al 80 % de opacidad. En Actual eso es `colors.cameraScrim` (`#073F40CC`).

Los alias van siempre de un token de uso a un primitivo. No hay referencias circulares. Los JSON de los tres modos tienen los mismos nombres, tipos y alias; solo cambian los valores crudos.

## Mapeo

Nombre de Figma y referencia en el código. En Actual el valor es el de esa referencia.

| Variable de Figma | Código | Uso |
| --- | --- | --- |
| `surface/canvas` | `colors.canvas` | Fondo de pantalla |
| `surface/default` | `colors.surface` | Filas, campos y tarjetas |
| `surface/tonal` | `colors.surfaceTonal` | Superficie tonal |
| `surface/selection` | `colors.selection` | Fondo de opción elegida |
| `surface/inverse` | `colors.ink` | Bloque de marca y filtro elegido |
| `surface/danger` | `colors.dangerSurface` | Fondo de error |
| `surface/scrim` | `colors.cameraScrim` | Velo de la cámara, derivado |
| `text/primary` | `colors.ink` | Texto e íconos principales |
| `text/secondary` | `colors.textSecondary` | Texto de contexto |
| `text/inverse` | `colors.onInk` | Texto sobre `surface/inverse` |
| `text/inverse-secondary` | `colors.onInkSecondary` | Apoyo sobre `surface/inverse` |
| `text/danger` | `colors.danger` | Error, con o sin fondo propio |
| `text/on-primary` | `colors.ink` | Texto de la acción principal |
| `text/on-secondary` | `colors.ink` | Texto de la acción secundaria |
| `text/on-danger` | `colors.danger` | Texto de la acción destructiva |
| `action/primary` | `colors.accent` | Fondo de la acción principal |
| `action/secondary` | `colors.surfaceTonal` | Fondo de la acción secundaria |
| `action/danger` | `colors.dangerSurface` | Fondo de la acción destructiva |
| `border/default` | `colors.border` | Divisor decorativo |
| `border/selection` | `colors.selectionBorder` | Borde de selección y marca del nombre |
| `border/inverse` | `colors.selectionBorder` | Divisor dentro de `surface/inverse` |
| `state/pressed` | `0.75` en `ActionButton` | Opacidad al presionar |
| `state/disabled` | `0.45` en `ActionButton` | Opacidad deshabilitada |

`text/primary`, `text/on-primary`, `text/on-secondary` y `surface/inverse` comparten `#073F40` solo en Actual. Arcilla y Noche les dan valores distintos. Lo mismo pasa con `border/inverse` y `border/selection`: en Actual los dos son `#66844F`; en Arcilla el divisor inverso es `#E4C4A4` para que se distinga sobre el bloque oscuro.

No hay tokens de foco ni de éxito porque la interfaz no los define. Otras opacidades locales (fila 0,7, ícono 0,6/0,3, captura 0,55) quedan fuera de esta prueba.

## Paletas

- **Actual.** Petróleo y lima, la paleta de la app.
- **Arcilla.** Experimental. Papel cálido, texto marrón y acción dorada.
- **Noche.** Experimental. Fondos oscuros, texto claro y acción lima. El bloque de marca sigue siendo `#073F40`.

## Contraste

El detalle está en [contrast.md](contrast.md). Criterio: WCAG 2.2 AA, 4,5:1 para texto normal y 3:1 para controles gráficos.

No cumplen:

- `border/default` sobre blanco o canvas, en las tres paletas. Es el contorno decorativo que el sistema de marca ya midió en 1,51:1 sobre blanco.
- `border/inverse` sobre `surface/inverse` en Actual: 2,77:1. Es el divisor del bloque de marca y usa `colors.selectionBorder`. No lo cambié para no alterar la paleta actual.
- La acción principal deshabilitada, al 45 % sobre el canvas, queda por debajo de 4,5:1 en las tres paletas. WCAG no exige contraste a un control inactivo.

El velo sobre la cámara real no queda garantizado: depende de la imagen de fondo.

## Actualizar los valores

Los colores de Actual se leen de `constants/brand.ts`. El velo se calcula ahí mismo. Para regenerar los JSON:

```sh
pnpm tokens:build
```

Eso vuelve a escribir `tokens/figma/*.tokens.json` y `tokens/contrast.md`. No crea variables por su cuenta.

### Importar en Figma

La API REST de variables es de Enterprise. En Professional el camino es la importación nativa de JSON DTCG.

Primera vez:

1. Abrí el archivo de diseño.
2. Variables → creá la colección `Color`.
3. Arrastrá a esa vista, en este orden, `actual.tokens.json`, `arcilla.tokens.json` y `noche.tokens.json`. Figma crea un modo por archivo e ignora un token repetido si dos nombres normalizados coinciden.
4. Renombrá los modos a Actual, Arcilla y Noche si Figma no usó el nombre del archivo.
5. Arrastrá Actual a la columna izquierda. Esa columna es el modo predeterminado.

Para actualizar sin duplicar:

1. Regenerá los JSON.
2. En la colección `Color`, clic derecho sobre el modo y elegí **Import mode**.
3. Elegí el JSON de ese modo. Figma actualiza las variables que coinciden en nombre y tipo.

Repetilo para los tres modos. No importes de nuevo con el arrastre de una colección nueva: eso crearía otra colección.

La importación no oculta los primitivos ni escribe la sintaxis de código. Después de importar, a los `primitivo/*` les corresponde alcance vacío. A los demás, el alcance de su función: superficies y acciones en relleno de marco y forma, textos también en relleno de texto y forma (los íconos son formas), bordes en trazo y opacidades en opacidad. La sintaxis WEB de cada token de uso es la referencia de la tabla, por ejemplo `colors.canvas`, no una variable CSS: la app no tiene.

## Cambiar de paleta

Cuando las capas usen estas variables:

1. Seleccioná el marco de la pantalla.
2. En Apariencia, **Apply variable mode**.
3. En la colección Color, elegí Actual, Arcilla o Noche.

Los hijos tienen que quedar en Auto. Un modo explícito en un hijo pisa el del marco. Si el modo muestra un ícono de conflicto, la capa está usando una versión vieja de la variable: publicá la colección y aceptá la actualización.

## Qué falta para verlo en el diseño

Hace falta el archivo de Figma existente. Sobre una copia o una sección marcada como POC hay que vincular rellenos, trazos y textos a estas variables, dejar los hijos en Auto y armar tres instancias del mismo componente de pantalla, una por modo. El diseño original no se toca.

## Fuentes

- [Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables), Figma Learn. Modos, herencia en Auto, importación y actualización DTCG.
- [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features). Professional: 10 modos por colección. La API REST de variables es Enterprise.
- [What's new from Schema 2025](https://help.figma.com/hc/en-us/articles/35794667554839-What-s-new-from-Schema-2025). El límite de Professional pasó a 10 modos.
- [WCAG 2.2, contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). 4,5:1 para texto normal; el control inactivo está exceptuado.
- [WCAG 2.2, contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). 3:1 para componentes de interfaz y objetos gráficos.
