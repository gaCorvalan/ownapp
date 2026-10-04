# 03 · Selección de precio y confirmación

Actualización: 26 de septiembre de 2026.
Estado: flujo actual y composición A (precios en filas) elegidos;
acabado visual y detalles de interacción pendientes.
Implementación actual: [PriceScanner](../../../src/features/supermarket/ui/PriceScanner.tsx)
permite elegir precio, ajustar cantidad, consultar precios guardados y confirmar
el subtotal antes de agregar. La composición propuesta de abajo conserva el
razonamiento del diseño; sus estados de 2026-09-26 no describen el código actual.
La edición de nombre/precio se pospone en esta etapa por pedido del usuario.
Los lápices y accesos de corrección de propuestas anteriores no se consideran
aprobados. No se elimina el editor existente ni se asume OCR infalible;
se conserva Volver a encuadrar como salida de la lectura.
[Índice de pantallas](README.md).

Representación vigente: [recorrido visual 02](../visual/v2/README.md), estado 02,
aceptada como rumbo provisional. Ilustra un precio ya elegido. El
[wireflow y alternativas A/B](../wireflows/v1/README.md) quedan como antecedente;
la comparación muestra el estado inicial sin elección.

El usuario eligió explícitamente A. Esa composición pasa a ser la base del
diseño de confirmación; B queda como antecedente de la comparación. La elección
define una dirección de estructura y jerarquía, no certifica todavía su uso en
teléfono ni fija tipografía, espaciados y estados interactivos exactos.

## Rol y contexto

Permitir elegir el precio que corresponde y agregar el producto a la compra.
El usuario indicó que la forma actual de elegir precio y agregar le parece
bien en cuanto al flujo, y quiere mejorar diseño y componentes.

Esta aceptación se refiere a su percepción del flujo existente. Todavía no
hubo una compra real con la app que valide su comodidad repetida.

Se documentó con tarea propia. En el código es un estado del espacio de captura,
sin una ruta independiente ni formularios obligatorios adicionales.

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
3. Cantidad y correcciones: apoyo a esa decisión; el control de cantidad ya está
   implementado y la corrección en esta vista sigue por definir.
4. Alternativas y reintento: acciones contextuales secundarias.

La selección debe ser reconocible como elección entre opciones y no como
varios botones de acción de igual peso que «Agregar».

## Estructura propuesta

| Ubicación | Elemento | Rol | Motivo y estado |
| --- | --- | --- | --- |
| Encabezado del resultado | Nombre del producto | Identificar lo que se incorporará | Nombre reconocible requerido; tratamiento como encabezado propuesto |
| Junto al dato corregible | Acceso discreto a edición | Corregir cuando haga falta | Propuesto: evitar campos editables permanentes cuando el dato es correcto |
| Cuerpo principal | Opciones de precio seleccionables, con condición debajo | Comparar y elegir | Composición en filas elegida (A); no esconder condiciones que cambian aplicabilidad |
| En la opción elegida | Indicador de selección más borde/fondo | Hacer visible la elección | Propuesto: no depender únicamente del color |
| Cerca del subtotal | Cantidad mediante control compacto | Llevar varias unidades sin abrir el carrito | Implementado: la cantidad elegida multiplica el subtotal antes de agregar |
| Zona de acción estable | «Agregar» con posible subtotal | Confirmar lo que se suma | Confirmación separada acordada; texto con subtotal y posición final propuestos |
| Acceso secundario | Consultar precios guardados | Evaluar alternativas antes de agregar | Consulta implementada; jerarquía visual pendiente de validar |
| Acceso secundario | Volver a encuadrar | Recuperarse de una lectura incorrecta | Flujo actual aceptado; tratamiento visual por definir |

La app muestra por separado el subtotal del producto y el acumulado de la
compra. El segundo no cambia al seleccionar un precio. Falta comprobar si esa
convivencia se entiende sin sobrecargar la pantalla.

## Estados y salidas

- **Varios precios:** esperar elección; explicar la condición de cada uno con
  el contexto disponible. No asumir que el menor es aplicable.
- **Un precio:** preselección y confirmación separada, como ahora.
- **Nombre o precio incorrecto:** el editor inicialmente propuesto se pospone
  el 26/09. En esta etapa se conserva reencuadrar;
  la suficiencia de esa salida deberá probarse con errores reales.
- **Nombre ausente:** requisito de nombre reconocible acordado, pero el momento
  y la obligatoriedad de completarlo todavía deben resolverse. No convertir la
  propuesta anterior de bloquear el agregado en una decisión aprobada.
- **Confirmando:** evitar duplicados y conservar el resultado hasta conocer
  si el agregado se completó.
- **Agregado:** volver a [Captura](02-captura.md), actualizar el carrito y dar
  feedback. No abrir automáticamente la compra completa.
- **Consultar alternativas:** la consulta abre Precios guardados sin agregar.
  Al volver, se conserva la elección pendiente; el recorrido requiere validación
  en teléfono.
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
| CON-04 | 2026-09-24 | Acordado | Filas seleccionables para candidatos y una acción de agregado claramente dominante, como parte de la composición A elegida |
| CON-05 | 2026-09-24 | Propuesto | Cantidad compacta y subtotal cerca de agregar; comprobar que no complican el caso de una unidad |
| CON-06 | 2026-09-24 | Propuesto | Mantener la foto fuera de la composición base; reemplaza la sugerencia previa de foto permanente |
| CON-07 | 2026-09-24 | Acordado | El usuario elige A: «me decanto por la opción A». Reemplaza la comparación abierta entre filas y opciones lado a lado; B queda como antecedente |
| CON-08 | 2026-09-24 | Propuesto | Wireflow 01: conservar cabecera y resumen; el centro cambia de encuadre a resultado y Agregar queda en una zona estable |
| CON-12 | 2026-09-26 | Acordado para esta etapa | Posponer edición manual de precio y nombre; los accesos de CON-03 quedan diferidos, no aprobados para la siguiente exploración |

## Desarrollo visual 01 · propuesto

La [lámina con Lexend Deca](../visual/v1/README.md) conserva A. Nombre y precio
ganan peso tipográfico; las condiciones se leen debajo del importe. La opción
elegida combina marca, borde y superficie clara con tinte: no se reconoce sólo
por color. Muestra una selección ya realizada, no un cambio al comportamiento
inicial con varios candidatos.

Agregar usa lima y contiene el subtotal, mientras el resumen petróleo conserva
el acumulado previo. Precios guardados y Reencuadrar comparten una fila secundaria
con zonas separadas. El resultado sustituye el centro de cámara sin foto
permanente; esta representación no decide aún la implementación de navegación.
El lápiz del producto no resuelve todavía dónde corregir un importe leído.

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| CON-09 | 2026-09-24 | Propuesto | Diferenciar selección mediante fondo, borde y marca; mantener condiciones legibles en vez de tratar cada precio como un botón de acción |
| CON-10 | 2026-09-24 | Propuesto | Agregar lima con subtotal y resumen petróleo con acumulado; comprobar que se distinguen sin competir excesivamente |
| CON-11 | 2026-09-24 | Propuesto | Agrupar consulta de precios y reencuadre en una fila secundaria, separada de la acción principal y del resumen |

## Qué falta resolver y comprobar

- Superficie del resultado y transición desde cámara, sin apilar paneles.
- Edición de nombre/precio en esta vista y representación de promociones manuales;
  comprobar la comprensión del control de cantidad existente.
- Si el carrito puede abrirse desde este estado y cómo se conserva la selección.
- Que elegir y agregar se entiendan como acciones distintas, con uno o varios precios.
- Que total de compra y subtotal del agregado no se confundan.
- Que las condiciones de precios sean legibles con texto grande y nombres largos.
