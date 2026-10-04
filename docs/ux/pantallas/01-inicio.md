# 01 · Inicio

Actualización: 26 de septiembre de 2026.
Estado: propósito, nueva compra y distinción al retomar acordados;
estructura detallada propuesta.
Implementación actual: [HomeScreen](../../../src/features/supermarket/ui/HomeScreen.tsx)
incluye historial, recuperación de compra, selección de sucursal y resolución
explícita de una compra abierta. Las propuestas siguientes registran el diseño
del 26/09; el código enlazado describe el comportamiento actual.
[Índice de pantallas](README.md).

Representación: [Inicio → sucursal → cámara](../visual/v2/README.md#inicio-sucursal-y-cámara).
Una lámina con recorrido habitual y variantes de primer uso, alta y compra abierta.

## Rol y contexto

Dar acceso rápido a empezar una compra, o recuperar una que quedó abierta.
El usuario explicó: «si abro la app es porque ya decidí a qué súper voy a ir» y
se imagina abriéndola frente al primer producto. Por eso, el inicio debe facilitar
la entrada a la tarea con poca preparación.

No se definió como una herramienta para decidir a qué comercio ir. El usuario
prioriza consultar compras anteriores como tarea secundaria del inicio. La
utilidad cotidiana de Pendientes aún le genera dudas: no darle protagonismo
en esta etapa. Esto no elimina esa necesidad futura ni aprueba un dashboard
de gasto mensual; historial y gráficos no son la misma decisión.

## Jerarquía

1. **Principal, acordado:** acceso rápido a empezar una compra.
2. **Principal cuando corresponda, acordado:** ofrecer continuar una compra abierta al iniciar desde cero.
3. **Contexto, propuesto:** explicar brevemente el valor en el primer uso.
4. **Secundario, acordado:** compras anteriores por encima de Pendientes; presentación propuesta.

La presencia de datos después de varias compras no implica agregar gráficos
al inicio. Cada bloque deberá justificar una tarea concreta del usuario.

## Estructura propuesta

| Ubicación | Elemento | Rol | Motivo y estado |
| --- | --- | --- | --- |
| Superior | Identificación discreta de la app | Reconocer el producto | Propuesto: orienta sin competir con empezar la compra; «a mano» sigue siendo provisional |
| Central, primer uso | Promesa breve y explicación de la captura | Entender qué se puede hacer | Propuesto: una frase, por ejemplo «Sabé cuánto llevás antes de llegar a caja»; texto final pendiente |
| Central, compra abierta | Card con sucursal, total estimado y Continuar compra | Reconocer qué se va a retomar al abrir desde cero | Acordado: mostrar contexto antes de continuar; posición y acabado propuestos |
| Inferior, respetando el área del sistema | Acción principal «Empezar compra» o «Continuar compra» | Entrar a la tarea | Acceso rápido acordado; ubicación inferior propuesta, a comprobar con distintas formas de sostener el teléfono |
| Debajo del bloque principal | Compras anteriores: última compra y Ver todas | Consultar una visita reciente o acceder al historial | Prioridad acordada; preview y ubicación propuestos, sin pestañas globales nuevas |

No hay alturas ni proporciones aprobadas. El texto ampliado debe poder desplazar
contenido sin ocultar la acción. No se agregan ilustraciones o tarjetas para
llenar espacio: su utilidad se evaluará en el wireframe.

## Estados e interacciones

### Primer uso, sin compra

Mostrar el propósito y la acción de inicio. No requerir presupuesto o lista
previa, según lo acordado en discovery. **Acordado:** Empezar compra → panel
de sucursales → elegir una → abrir cámara. La elección ocurre antes de la
primera captura. Para esta versión, se podrá agregar el primer local manualmente
desde el panel con supermercado y referencia libre acordados. No convertir esa
preparación en un formulario largo ni exigir un catálogo remoto.

### Usuario habitual, sin compra abierta

Mantener el acceso principal en un lugar consistente. **Acordado:** ofrecer el
[panel de sucursales](06-seleccion-sucursal.md) al tocar Empezar compra; elegir
una abre la cámara, sin otro botón de continuar. **Acordado:** priorizar compras
anteriores como acceso secundario; Pendientes tiene un enlace de menor peso.

Propuesta en la lámina: una tarjeta de la última compra con sucursal, fecha,
cantidad de productos incluidos y un importe con origen explícito. Mostrar
«Total del ticket» sólo si fue informado; en caso contrario, «Total estimado».
No sumar apartados al recuento de productos llevados ni mezclar importes de
distinta procedencia. La tarjeta abre el detalle implementado y «Ver todas» el
historial de compras; su uso en teléfono aún requiere validación.

### Compra abierta

**Acordado:** al abrir la app desde cero con una compra sin finalizar, mostrar
el inicio con una card de sucursal, total estimado y «Continuar compra». No
entrar automáticamente a esa compra. Continuar retoma la existente, sin elegir
otra vez la sucursal ni crear una nueva. La pantalla exacta que se recupera
después de un cierre completo sigue por precisar.

**Acordado para esta versión:** una sola compra abierta. Para empezar otra,
ofrecer una forma sencilla de resolver la anterior antes de elegir la nueva
sucursal. No cerrarla, descartarla ni marcarla como pagada automáticamente.

Propuesta: mantener Continuar como acción principal y «Empezar otra compra»
como secundaria. Al tocar esta última, mostrar el contexto de la anterior y
ofrecer «Finalizar anterior», «Descartar compra» y una salida para volver.
Finalizar reutiliza el cierre con ticket opcional; sólo tras guardarlo
correctamente se continúa al panel de sucursales de la nueva compra. No
crear la nueva mientras falle el guardado de la anterior.

Descartar es distinto de apartar un producto y no se presenta como compra
realizada. La app solicita confirmación y conserva las observaciones de precios;
cancelar el diálogo deja la compra abierta. Los textos y controles de la lámina
son propuestas históricas cuya usabilidad aún debe comprobarse.

### Regreso desde otra app

**Acordado:** al volver de otra app durante la sesión, recuperar directamente
la pantalla activa, sin pasar por Inicio ni repetir la selección de sucursal.
Esto contempla la consulta a la IA durante la compra. No forzar el regreso a
cámara si la persona estaba revisando el carrito o confirmando un producto.

La distinción describe experiencia deseada, no una garantía de restauración
implementada: probar suspensión, cierre y pérdida del proceso por Android.
Conservar incluidos, apartados y cantidades; precisar recuperación de lecturas
o borradores no confirmados sin repetir un agregado.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| INI-01 | 2026-09-24 | Acordado | El inicio da acceso rápido a empezar: es la expectativa explícita del usuario |
| INI-02 | 2026-09-24 | Acordado | No orientar su función principal a elegir supermercado: esa decisión ya está tomada al abrir |
| INI-03 | 2026-09-24 | Propuesto | Adaptar contenido a primer uso, uso habitual y compra abierta, conservando la estructura |
| INI-04 | 2026-09-24 | Resuelto por INI-07 | La prioridad de continuar se concreta para apertura desde cero; el retorno desde otra app se resuelve por INI-08 |
| INI-05 | 2026-09-24 | Parcialmente resuelto | Selección de sucursal resuelta por INI-06; destinos secundarios y navegación global siguen pendientes |
| INI-06 | 2026-09-26 | Acordado | Empezar compra abre un panel de sucursales; tocar una abre la cámara. No se elige el local después del primer escaneo como recorrido normal |
| INI-07 | 2026-09-26 | Acordado | Al abrir desde cero con una compra pendiente de finalizar, mostrar Inicio con card de sucursal, total y Continuar compra, sin entrada automática |
| INI-08 | 2026-09-26 | Acordado | Al volver de otra app en la sesión, recuperar la pantalla activa directamente, sin pasar por Inicio |
| INI-09 | 2026-09-26 | Acordado para primera versión | Mantener una sola compra abierta y resolverla explícitamente antes de empezar otra, con una salida sencilla para continuar el nuevo inicio |
| INI-10 | 2026-09-26 | Propuesto | Empezar otra permite finalizar o descartar la anterior y volver sin cambios; al finalizar correctamente, avanzar al selector de sucursal de la nueva |
| INI-11 | 2026-09-26 | Acordado para esta etapa | Priorizar compras anteriores como acceso secundario; el usuario quiere evaluar la utilidad cotidiana de Pendientes antes de darle espacio |
| INI-12 | 2026-09-26 | Propuesto | Inicio con un bloque principal y acción inferior estable; última compra y Ver todas como consulta secundaria, sin dashboard mensual ni pestañas globales |

## Composición de la lámina · propuesta

- Cabecera discreta con «a mano» y texto breve. No incorporar avatar, cuenta o
  ubicación automática sin una tarea que los justifique.
- Bloque petróleo: explica el propósito al principio, introduce la nueva compra
  en uso habitual o identifica la compra abierta. Mantiene la región estable
  entre estados; el texto es información, no un segundo botón de inicio.
- Acción lima inferior: «Empezar compra» o «Continuar compra». La posición es
  propuesta para acceso con pulgar; no está validada en teléfono ni con texto grande.
- Consulta secundaria: última compra y Ver todas. En el primer uso, reemplazar
  ese bloque por una explicación breve del historial, sin tarjetas ficticias,
  importes en cero ni gráficos vacíos.
- Con compra abierta, «Empezar otra compra» es secundario y lleva a la resolución
  de la anterior. La lámina no dibuja el diálogo ni define el descarte pendiente.
- No proponer barra flotante global sólo por la referencia estética; el inicio
  y el acceso al historial bastan para esta exploración.

Si una persona tiene su primera compra abierta pero ninguna finalizada, combinar
la card de compra en curso con el estado sin historial, sin inventar una compra
anterior. La variante dibujada con compra abierta sí usa un historial ficticio.

## Qué falta resolver y comprobar

- Cuánto contexto pedir antes de la primera captura y qué hacer si falta sucursal.
- Presentación de la resolución de compra anterior; confirmación y datos conservados al descartar.
- Restauración de pantalla y borradores tras cierre o pérdida de proceso; distinguirlo del retorno desde otra app.
- Si se entiende qué compra se continúa y cómo salir conservándola.
- Si un usuario nuevo identifica el primer paso sin explicación del facilitador.
- Utilidad y densidad de la última compra; comprensión del origen de su importe y acceso al historial.
