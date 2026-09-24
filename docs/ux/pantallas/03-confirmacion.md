# 03 · Selección de precio y confirmación

Actualización: 24 de septiembre de 2026.
Estado: flujo actual aceptado; jerarquía y componentes visuales propuestos.
[Índice de pantallas](README.md).

## Rol y contexto

Permitir elegir el precio que corresponde y agregar el producto a la compra.
El usuario indicó que la forma actual de elegir precio y agregar le parece
bien en cuanto al flujo, y quiere mejorar diseño y componentes.

Esta aceptación se refiere a su percepción del flujo existente. Todavía no
hubo una compra real con la app que valide su comodidad repetida.

Se documenta como pantalla de diseño con tarea propia, sin decidir todavía si
será un estado de captura o un destino separado. No se aprobó una nueva cadena
de formularios obligatorios.

## Flujo que se conserva

Comportamiento observado en `PriceScanner.tsx` y `usePriceScanner.ts`:

1. Mostrar el producto sugerido si se reconoció y los candidatos de precio.
2. Si hay varios candidatos, ninguno se selecciona automáticamente. La persona
   elige uno; seleccionar no agrega el producto.
3. Si hay un único candidato, está preseleccionado y todavía requiere agregar.
4. «Agregar a la compra» confirma la elección explícitamente.
5. Tras un agregado exitoso, volver al encuadre para continuar.
6. Permitir volver a encuadrar si la lectura no sirve.

La protección ante doble toque debe conservarse. Un error al agregar no debe
presentarse como éxito ni provocar la pérdida silenciosa del resultado.

## Jerarquía

1. Producto reconocible y precio aplicable: información para decidir.
2. Agregar: acción principal que compromete la incorporación al carrito.
3. Correcciones y cantidad: apoyo a esa decisión; detalle de interacción pendiente.
4. Alternativas y reintento: acciones contextuales secundarias.

La selección debe ser reconocible como elección entre opciones y no como
varios botones de acción de igual peso que «Agregar».

## Estructura propuesta

| Ubicación | Elemento | Rol | Motivo y estado |
| --- | --- | --- | --- |
| Encabezado del resultado | Nombre del producto | Identificar lo que se incorporará | Nombre reconocible requerido; tratamiento como encabezado propuesto |
| Junto al dato corregible | Acceso discreto a edición | Corregir cuando haga falta | Propuesto: evitar campos editables permanentes cuando el dato es correcto |
| Cuerpo principal | Opciones de precio seleccionables, con condición debajo | Comparar y elegir | Flujo acordado; diseño de filas propuesto; no esconder condiciones que cambian aplicabilidad |
| En la opción elegida | Indicador de selección más borde/fondo | Hacer visible la elección | Propuesto: no depender únicamente del color |
| Cerca del subtotal | Cantidad mediante control compacto | Llevar varias unidades sin abrir el carrito | Propuesto; el escaneo actual agrega una unidad |
| Zona de acción estable | «Agregar» con posible subtotal | Confirmar lo que se suma | Confirmación separada acordada; texto con subtotal y posición final propuestos |
| Acceso secundario | Consultar precios guardados | Evaluar alternativas antes de agregar | Necesidad acordada en discovery; ubicación y pantalla de comparación pendientes |
| Acceso secundario | Volver a encuadrar | Recuperarse de una lectura incorrecta | Flujo actual aceptado; tratamiento visual por definir |

Propuesta: mantener distinguibles el subtotal del producto que se va a agregar
y el acumulado de la compra ya confirmada. El segundo no cambia al seleccionar
un precio. Todavía hay que decidir cómo conviven con el resumen del carrito sin
sobrecargar la pantalla.

## Estados y salidas

- **Varios precios:** esperar elección; explicar la condición de cada uno con
  el contexto disponible. No asumir que el menor es aplicable.
- **Un precio:** preselección y confirmación separada, como ahora.
- **Nombre o precio incorrecto:** facilitar corrección. No exigir volver a
  capturar todo cuando se puede conservar información útil.
- **Nombre ausente:** requisito de nombre reconocible acordado, pero el momento
  y la obligatoriedad de completarlo todavía deben resolverse. No convertir la
  propuesta anterior de bloquear el agregado en una decisión aprobada.
- **Confirmando:** evitar duplicados y conservar el resultado hasta conocer
  si el agregado se completó.
- **Agregado:** volver a [Captura](02-captura.md), actualizar el carrito y dar
  feedback. No abrir automáticamente la compra completa.
- **Consultar alternativas:** no agregar por consultar. Volver conservando
  elección y datos; el destino y manejo del regreso todavía se diseñarán.
- **Reintentar:** abandonar la lectura y volver al encuadre sin cambiar el total.

## Promociones y foto

La primera versión no automatiza promociones bancarias. El usuario acepta
elegir o corregir el importe manualmente. La selección de candidatos no resuelve
por sí sola 2×1 u otras promociones por cantidad: el ajuste del importe del
grupo sigue pendiente, según [discovery](../01-discovery.md).

La propuesta de mostrar permanentemente la foto de la etiqueta se retiró de
la composición base: no se identificó una necesidad suficiente para asignarle
espacio en cada confirmación. Un acceso opcional para revisar la captura puede
explorarse si las pruebas muestran utilidad. No hay foto permanente aprobada.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| CON-01 | 2026-09-24 | Acordado | Conservar elegir precio y agregar: el usuario considera adecuado el flujo actual |
| CON-02 | 2026-09-24 | Acordado | Rediseñar presentación y componentes sin añadir pasos obligatorios al flujo aceptado |
| CON-03 | 2026-09-24 | Propuesto | Presentar el nombre como información y abrir edición a demanda, reduciendo apariencia de formulario |
| CON-04 | 2026-09-24 | Propuesto | Filas seleccionables para candidatos y una acción de agregado claramente dominante |
| CON-05 | 2026-09-24 | Propuesto | Cantidad compacta y subtotal cerca de agregar; comprobar que no complican el caso de una unidad |
| CON-06 | 2026-09-24 | Propuesto | Mantener la foto fuera de la composición base; reemplaza la sugerencia previa de foto permanente |

## Qué falta resolver y comprobar

- Superficie del resultado y transición desde cámara, sin apilar paneles.
- Edición de nombre/precio, cantidad y representación de promociones manuales.
- Si el carrito puede abrirse desde este estado y cómo se conserva la selección.
- Que elegir y agregar se entiendan como acciones distintas, con uno o varios precios.
- Que total de compra y subtotal del agregado no se confundan.
- Que las condiciones de precios sean legibles con texto grande y nombres largos.
