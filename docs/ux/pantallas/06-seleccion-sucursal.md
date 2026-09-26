# 06 · Selección de sucursal

Actualización: 26 de septiembre de 2026.
Estado: entrada, selección y salida acordadas; composición y primer uso pendientes.
[Índice de pantallas](README.md).

## Rol y contexto

Identificar dónde transcurre una nueva compra antes de capturar el primer
producto. La persona ya eligió el supermercado en la vida real: este panel no
recomienda dónde ir ni compara locales; asocia la compra a su sucursal.

Se documenta como superficie con tarea propia, sin decidir una ruta técnica.
El término «panel» todavía no fija altura, gesto de cierre ni biblioteca.

## Recorrido acordado

Inicio → Empezar compra → panel de sucursales → tocar una → cámara.

La selección lleva a captura sin otro paso obligatorio de confirmación. El
permiso de cámara, si falta, es un estado a diseñar, no una garantía de que la
cámara se abrirá correctamente. Retomar una compra existente se define aparte:
este recorrido corresponde a empezar una nueva.

## Estructura por definir

| Elemento | Rol | Estado |
| --- | --- | --- |
| Locales habituales | Reconocer y elegir rápidamente el lugar de compra | Dirección acordada; orden y presentación pendientes |
| Cadena y referencia de sucursal | Distinguir locales de la misma cadena | Propuesto; decidir dirección, barrio o alias sin confundir identificación |
| Otro local | Resolver una sucursal aún no habitual | Entrada secundaria propuesta; catálogo, búsqueda o alta pendientes |
| Salida sin selección | Volver al inicio sin crear una compra por error | Propuesto; gesto y control pendientes |

No presumir un catálogo de sucursales, geolocalización ni datos precargados que
no se hayan definido. Un alias personal no identifica por sí solo un local
compartido entre usuarios. Primer uso, local no encontrado y falta de conexión
requieren una salida antes de cerrar la composición.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| SUC-01 | 2026-09-26 | Acordado | Mostrar el panel después de Empezar compra y antes de la cámara; el usuario confirmó explícitamente la secuencia |
| SUC-02 | 2026-09-26 | Acordado | Tocar una sucursal abre la cámara, sin confirmación adicional del local |

## Próximas definiciones

- Cómo se obtiene o registra una sucursal en el primer uso y cómo se reconoce después.
- Orden de habituales y acceso a otro local; información mínima de cada fila.
- Cancelación, permiso de cámara y local no encontrado.
- Diferencia entre empezar y retomar; corrección de una sucursal elegida por error.

La lámina de Inicio → sucursal → cámara se generará después de resolver esas
decisiones principales, reutilizando la cámara del recorrido de compra.
