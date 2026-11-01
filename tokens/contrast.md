# Contraste de las tres paletas

Criterio WCAG 2.2 AA: 4,5:1 para texto normal y 3:1 para bordes de controles y objetos gráficos. El texto inactivo no tiene exigencia de contraste. Los bordes decorativos se registran y no se usan como único indicador de estado.

Los valores de Actual salen de `constants/brand.ts`. Arcilla y Noche son experimentales.

## Actual

| Par | Ratio | Criterio | Resultado |
| --- | ---: | --- | --- |
| text/primary sobre surface/canvas | 10,85:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/default | 11,71:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/tonal | 9,87:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/selection | 10,62:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/canvas | 5,54:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/default | 5,98:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/tonal | 5,04:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/selection | 5,42:1 | requerido 4,50:1 | Cumple |
| text/inverse sobre surface/inverse | 11,71:1 | requerido 4,50:1 | Cumple |
| text/inverse-secondary sobre surface/inverse | 9,34:1 | requerido 4,50:1 | Cumple |
| text/on-primary sobre action/primary | 9,21:1 | requerido 4,50:1 | Cumple |
| text/on-secondary sobre action/secondary | 9,87:1 | requerido 4,50:1 | Cumple |
| text/on-danger sobre action/danger | 5,85:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/danger | 5,85:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/canvas | 5,98:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/default | 6,45:1 | requerido 4,50:1 | Cumple |
| border/selection sobre surface/selection | 3,83:1 | requerido 3,00:1 | Cumple |
| border/selection sobre surface/canvas | 3,91:1 | requerido 3,00:1 | Cumple |
| border/inverse sobre surface/inverse | 2,77:1 | requerido 3,00:1 | No cumple |
| border/default sobre surface/default | 1,51:1 | decorativo 3,00:1 | No cumple; es decorativo |
| border/default sobre surface/canvas | 1,40:1 | decorativo 3,00:1 | No cumple; es decorativo |
| state/pressed de la acción principal sobre surface/canvas | 4,70:1 | transitorio 4,50:1 | Cumple |
| state/disabled de la acción principal sobre surface/canvas | 2,28:1 | inactivo 4,50:1 | Sin exigencia (control inactivo) |

## Arcilla

| Par | Ratio | Criterio | Resultado |
| --- | ---: | --- | --- |
| text/primary sobre surface/canvas | 12,12:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/default | 13,42:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/tonal | 10,62:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/selection | 11,66:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/canvas | 6,69:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/default | 7,41:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/tonal | 5,87:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/selection | 6,44:1 | requerido 4,50:1 | Cumple |
| text/inverse sobre surface/inverse | 13,04:1 | requerido 4,50:1 | Cumple |
| text/inverse-secondary sobre surface/inverse | 10,32:1 | requerido 4,50:1 | Cumple |
| text/on-primary sobre action/primary | 9,43:1 | requerido 4,50:1 | Cumple |
| text/on-secondary sobre action/secondary | 10,62:1 | requerido 4,50:1 | Cumple |
| text/on-danger sobre action/danger | 6,89:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/danger | 6,89:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/canvas | 6,95:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/default | 7,69:1 | requerido 4,50:1 | Cumple |
| border/selection sobre surface/selection | 5,26:1 | requerido 3,00:1 | Cumple |
| border/selection sobre surface/canvas | 5,46:1 | requerido 3,00:1 | Cumple |
| border/inverse sobre surface/inverse | 8,33:1 | requerido 3,00:1 | Cumple |
| border/default sobre surface/default | 1,44:1 | decorativo 3,00:1 | No cumple; es decorativo |
| border/default sobre surface/canvas | 1,30:1 | decorativo 3,00:1 | No cumple; es decorativo |
| state/pressed de la acción principal sobre surface/canvas | 4,77:1 | transitorio 4,50:1 | Cumple |
| state/disabled de la acción principal sobre surface/canvas | 2,28:1 | inactivo 4,50:1 | Sin exigencia (control inactivo) |

## Noche

| Par | Ratio | Criterio | Resultado |
| --- | ---: | --- | --- |
| text/primary sobre surface/canvas | 16,66:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/default | 13,62:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/tonal | 10,27:1 | requerido 4,50:1 | Cumple |
| text/primary sobre surface/selection | 11,57:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/canvas | 11,81:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/default | 9,66:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/tonal | 7,28:1 | requerido 4,50:1 | Cumple |
| text/secondary sobre surface/selection | 8,20:1 | requerido 4,50:1 | Cumple |
| text/inverse sobre surface/inverse | 11,09:1 | requerido 4,50:1 | Cumple |
| text/inverse-secondary sobre surface/inverse | 8,97:1 | requerido 4,50:1 | Cumple |
| text/on-primary sobre action/primary | 12,46:1 | requerido 4,50:1 | Cumple |
| text/on-secondary sobre action/secondary | 10,27:1 | requerido 4,50:1 | Cumple |
| text/on-danger sobre action/danger | 8,41:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/danger | 8,41:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/canvas | 10,60:1 | requerido 4,50:1 | Cumple |
| text/danger sobre surface/default | 8,67:1 | requerido 4,50:1 | Cumple |
| border/selection sobre surface/selection | 6,92:1 | requerido 3,00:1 | Cumple |
| border/selection sobre surface/canvas | 9,96:1 | requerido 3,00:1 | Cumple |
| border/inverse sobre surface/inverse | 6,47:1 | requerido 3,00:1 | Cumple |
| border/default sobre surface/default | 1,74:1 | decorativo 3,00:1 | No cumple; es decorativo |
| border/default sobre surface/canvas | 2,13:1 | decorativo 3,00:1 | No cumple; es decorativo |
| state/pressed de la acción principal sobre surface/canvas | 7,59:1 | transitorio 4,50:1 | Cumple |
| state/disabled de la acción principal sobre surface/canvas | 3,57:1 | inactivo 4,50:1 | Sin exigencia (control inactivo) |

No hay color de foco ni de éxito en la interfaz actual. El velo de la cámara sigue dependiendo de lo que se vea detrás; el sólido no garantiza ese contraste.
