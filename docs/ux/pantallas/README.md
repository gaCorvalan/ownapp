# Pantallas y decisiones de experiencia

Decisiones de diseño registradas desde el 26 de septiembre de 2026.

Este índice reúne el diseño que estamos definiendo en conversación. Cada
pantalla tiene un documento propio: propósito, contexto, jerarquía, estructura,
rol de cada elemento, interacciones, decisiones y preguntas pendientes.
Documentar una decisión no significa que esté validada con compradores. Las
propuestas y preguntas conservan su contexto histórico; los enlaces de
implementación y el [README de la app](../../../README.md) muestran qué existe
hoy. Una frase fechada como «propuesto» no indica por sí sola que falte código.

## Cómo leer los documentos

- **Acordado:** decisión expresada o aceptada por el usuario en la conversación.
- **Propuesto:** recomendación de diseño que todavía debemos discutir o probar.
- **Pendiente:** aspecto sin resolver; no debe implementarse como si estuviera
  decidido.
- **Comportamiento actual:** evidencia del código, no una propuesta nueva.

Una estructura propuesta puede desarrollar una dirección acordada. El estado
se indica por elemento para no convertir todo el documento en una aprobación.
Las decisiones acordadas también necesitan validación de usabilidad.

## Índice

| Documento | Rol | Implementación principal |
| --- | --- | --- |
| [01 · Inicio](01-inicio.md) | Empezar o recuperar una compra | [HomeScreen](../../../src/features/supermarket/ui/HomeScreen.tsx) · [ruta](../../../app/index.tsx) |
| [02 · Captura](02-captura.md) | Capturar etiquetas con el acumulado accesible | [SupermarketScreen](../../../src/features/supermarket/ui/SupermarketScreen.tsx) · [LabelCamera](../../../src/features/supermarket/ui/LabelCamera.tsx) |
| [03 · Confirmación](03-confirmacion.md) | Elegir un precio y agregar el producto | [PriceScanner](../../../src/features/supermarket/ui/PriceScanner.tsx) · [usePriceScanner](../../../src/features/supermarket/application/usePriceScanner.ts) |
| [04 · Compra actual](04-compra-actual.md) | Revisar y modificar la compra completa | [SupermarketScreen](../../../src/features/supermarket/ui/SupermarketScreen.tsx) · [ShoppingList](../../../src/features/supermarket/ui/ShoppingList.tsx) |
| [05 · Finalización](05-finalizacion.md) | Guardar la compra y lo que no se llevó | [FinishScreen](../../../src/features/supermarket/ui/FinishScreen.tsx) · [detalle](../../../app/history/[id].tsx) |
| [06 · Selección de sucursal](06-seleccion-sucursal.md) | Elegir dónde se compra antes de capturar | [HomeScreen](../../../src/features/supermarket/ui/HomeScreen.tsx) · [storeStorage](../../../src/features/supermarket/infrastructure/storeStorage.ts) |

Confirmación se documenta por separado porque tiene una tarea y jerarquía
propias. En la implementación actual es un estado dentro de la pantalla de
compra. Los enlaces orientan hacia el código, sin convertir las propuestas de
diseño en requisitos técnicos.

## Recorrido de referencia

Inicio → Empezar compra → panel de sucursales → elegir → Captura → Confirmación → Captura.

Desde Captura, tocar o deslizar hacia arriba el resumen del carrito abre Compra
actual a pantalla completa. Volver recupera el contexto de captura. La selección
de sucursal antes de la cámara está acordada para nuevas compras, con alta manual
simple en esta versión. La composición está propuesta, no validada. El catálogo compartido
queda para el futuro.

La [lámina de entrada](../visual/v2/README.md#inicio-sucursal-y-cámara) propone la
composición de Inicio y del panel, incluyendo primer uso y compra abierta.
Compras anteriores es el acceso secundario priorizado; Pendientes tiene un
acceso secundario en Inicio y su utilidad cotidiana sigue por validar.

Con una compra abierta, Inicio muestra sucursal, total y Continuar compra. La
sesión mantiene la pantalla activa al volver de otra app. Para empezar otra,
la app ofrece finalizar o descartar la anterior; el descarte pide confirmación.
Ese recorrido aún requiere pruebas en Android.

Compra actual → Finalización → detalle de la compra guardada. Si se estaba
empezando otra compra, vuelve a la selección de sucursal.
Al cerrar se conservan incluidos y «No llevaste» por separado; sólo los primeros
suman al total estimado. El ticket no es requisito de cierre.

## Áreas que necesitan revisión de diseño

| Área | Implementación actual | Qué falta comprobar o decidir |
| --- | --- | --- |
| Supermercado/sucursal | Selección y alta manual | Presentación y validaciones en teléfono |
| Comparación | Consulta de precios guardados desde confirmación | Jerarquía y comprensión de precios históricos |
| Pendientes | Listado por sucursal, alta y retiro | Utilidad durante la siguiente visita |
| Historial | Compras, detalle, ticket posterior y resumen mensual | Navegación y comprensión de importes estimados |

Estas áreas ya tienen código; un documento de diseño adicional sólo se abrirá
cuando haya decisiones de experiencia que registrar.

## Método de mantenimiento

1. Registrar cada decisión en el documento correspondiente con un identificador
   estable, fecha, estado y motivo. Referenciar otras pantallas mediante enlaces.
2. Mantener estructura e interacciones alineadas con la decisión vigente. Si una
   decisión cambia, anotar qué reemplazó y por qué, sin acumular versiones
   contradictorias del diseño.
3. Distinguir lo acordado por el usuario de propuestas del asistente y de
   resultados observados en pruebas. Citar la formulación relevante cuando
   ayude a entender el origen de una decisión.
4. Definir para cada propuesta qué se debería observar en una prueba. No
   registrar «validado» sin evidencia de esa comprobación.
5. Tomar paleta y escala tipográfica del
   [sistema de marca](../visual/sistema-de-marca.md). Los componentes y su
   comportamiento específico siguen sujetos a diseño y pruebas; elegir un
   patrón no obliga a incorporar una dependencia.
6. Entregar las próximas exploraciones visuales en **PNG**, con una lámina por
   recorrido y otra de alternativas sólo cuando haya una decisión que comparar.
   No duplicar SVG/PNG ni exportar cada pantalla por separado. Esta preferencia
   de formato fue expresada por el usuario; los documentos por pantalla se
   mantienen porque tienen una función distinta: explicar y registrar decisiones.

## Qué define un wireframe

El wireframe sí es diseño: define organización espacial, jerarquía, agrupaciones,
controles y recorridos. Cuando el usuario elige una composición, esa estructura
se conserva como base para desarrollarla, salvo un cambio justificado por nueva
evidencia o una decisión posterior.

El acabado visual concreta colores, tipografía, espaciado, iconografía y estados
de los componentes. El comportamiento detallado concreta gestos, animaciones,
teclado, errores, textos largos y accesibilidad. Un dibujo estático puede definir
parte de esos aspectos, pero no demuestra que funcionen en un dispositivo.
No presentar estas etapas como si hubiera que empezar el diseño de nuevo.

## Relación con el trabajo anterior

- [Discovery](../01-discovery.md): necesidades y alcance del producto.
- [Plan de validación](../02-validation-plan.md): investigación y pruebas.
- El primer HTML fue descartado y retirado. Su aprendizaje permanece: el
  usuario lo percibió como un formulario lineal, poco pensado para mobile.

El [recorrido visual 02 · Lexend Deca](../visual/v2/README.md) es la referencia vigente:
desarrolla A con superficies tonales, petróleo y lima. Después de esa
exploración se eligió una [base de marca](../visual/sistema-de-marca.md) para
implementarla y probarla. Los componentes y el acabado en dispositivo aún
requieren revisión.
Es una lámina estática, no un prototipo navegable ni una implementación. El
[Wireflow 01 · Compra activa](../wireflows/v1/README.md) presenta cuatro estados
del recorrido y la comparación de confirmación; **A ya fue elegida**. Se
conservan únicamente sus dos láminas PNG y su explicación como antecedente.

## Continuación de diseño registrada el 26/09

Los puntos 1, 2 y 4 se implementaron después de formular esta secuencia. Se
conserva para explicar el orden de las decisiones, no como lista de trabajo
pendiente.

1. Completar la compra cotidiana: apartar productos sin que desaparezcan,
   reincorporarlos al total, lectura fallida y cierre con ticket opcional.
   La edición de nombre/precio se pospuso el 26/09. Definir superficies y
   retornos antes de pulir más decoración.
2. Conectar principio y fin: Inicio sin historial, retomar compra, selección
   de sucursal y recuperación posterior del ticket. No exigir un dashboard ni
   una navegación de pestañas sin una función clara.
3. Prototipar y probar ese recorrido en el teléfono y con compradores. Las
   pruebas de cámara/OCR real corresponden a la app, no a una simulación visual.
4. Desarrollar comparación y pendientes para otra sucursal como segundo recorrido,
   con fecha, presentación y condición del precio visibles; probarlo después.

Mantener una lámina por recorrido y un documento por pantalla; ajustar la
dirección visual con feedback concreto y separar gusto de facilidad de uso.
