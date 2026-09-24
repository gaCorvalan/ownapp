# Pantallas y decisiones de experiencia

Actualización: 24 de septiembre de 2026.

Este índice reúne el diseño que estamos definiendo en conversación. Cada
pantalla tiene un documento propio: propósito, contexto, jerarquía, estructura,
rol de cada elemento, interacciones, decisiones y preguntas pendientes.
Documentar una decisión no significa que ya esté implementada ni validada con
compradores. El código vigente y el README de la aplicación describen el estado
implementado.

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

| Documento | Rol | Grado de definición |
| --- | --- | --- |
| [01 · Inicio](01-inicio.md) | Empezar o recuperar una compra | Propósito acordado; composición y estados propuestos |
| [02 · Captura](02-captura.md) | Capturar etiquetas con el acumulado accesible | Cámara protagonista y acceso al carrito acordados; detalles propuestos |
| [03 · Confirmación](03-confirmacion.md) | Elegir un precio y agregar el producto | Flujo actual aceptado; tratamiento visual en diseño |
| [04 · Compra actual](04-compra-actual.md) | Revisar y modificar la compra completa | Pantalla completa y apertura ascendente acordadas; organización en diseño |

Confirmación se documenta por separado porque tiene una tarea y jerarquía
propias. Todavía no se decidió si será una pantalla independiente o un estado
del espacio de captura. Estos documentos no prescriben rutas ni componentes
técnicos.

## Recorrido de referencia

Inicio → contexto de supermercado/sucursal → Captura → Confirmación → Captura.

Desde Captura, tocar o deslizar hacia arriba el resumen del carrito abre Compra
actual a pantalla completa. Volver recupera el contexto de captura. El lugar
exacto de la elección de sucursal sigue pendiente: no se aprobó una pantalla
adicional obligatoria antes de capturar.

## Áreas que aún no tienen composición definida

| Área | Necesidad ya identificada | Qué falta decidir |
| --- | --- | --- |
| Supermercado/sucursal | Asociar los precios a los locales habituales | Momento de elección, presentación y datos faltantes |
| Comparación | Consultar alternativas desde el escaneo | Superficie, jerarquía y retorno a confirmación |
| Pendientes | Guardar el producto específico elegido para otro supermercado | Listado por local y uso durante la visita siguiente |
| Finalización | Conservar la compra y permitir ticket opcional | Composición del cierre y confirmación del guardado |
| Historial | Recuperar compras y completar el ticket después | Navegación entre compras, precios y resumen mensual |

Se creará un documento por pantalla cuando trabajemos su estructura. No se
presupone que cada área vaya a necesitar una pantalla independiente.

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
5. Mantener abiertos tamaños, paleta y componentes específicos hasta diseñarlos.
   Elegir un patrón no obliga a incorporar una dependencia.

## Relación con el trabajo anterior

- [Discovery](../01-discovery.md): necesidades y alcance del producto.
- [Plan de validación](../02-validation-plan.md): investigación y pruebas.
- `../compra-concepto.html`: exploración anterior, **descartada como referencia
  visual y de estructura**. El usuario señaló que parecía un formulario lineal
  y no una experiencia pensada para mobile. Se conserva como antecedente, no
  como diseño a implementar ni prototipo vigente para pruebas.

No hay paleta ni estilo de componentes aprobados. El siguiente entregable
visual será un wireflow de estas pantallas, basado en sus decisiones.
