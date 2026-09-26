# 05 · Finalizar y conservar la compra

Actualización: 26 de septiembre de 2026.
Estado: ticket opcional y conservación de «No llevaste» acordados;
composición, textos y transición posterior propuestos.
[Índice de pantallas](README.md).

Representación: [recorrido visual 02](../visual/v2/README.md), estado 04.
Es un diseño estático, no una función implementada ni validada con participantes.

## Rol y contexto

Cerrar la visita y conservar tanto lo que se llevó como lo que se agregó pero
se decidió dejar. El usuario considera valiosa esa información. Evitar exigir
el ticket o revisar obligatoriamente cada producto para guardar.

No interpretar la decisión como prueba de un motivo: no sabemos si se dejó un
producto por precio, preferencia, duplicación o cualquier otra razón. Tampoco
significa intención de comprarlo en otra visita ni ahorro demostrado.

## Entrada y salida

Propuesta: «Finalizar compra» desde [Compra actual](04-compra-actual.md) abre
un cierre a pantalla completa. Atrás vuelve a la revisión y conserva incluidos,
apartados y el borrador del ticket, sin finalizar. Abrir el cierre no guarda
todavía una compra finalizada ni confirma que se pagó el total estimado.

«Guardar compra» confirma el cierre. Propuesta: después de guardar correctamente,
mostrar el detalle de esa compra con una confirmación breve. Ese destino y su
composición aún no se diseñaron; no agregar otro botón de confirmación obligatorio.

## Estructura propuesta

| Zona | Elemento | Rol y motivo | Estado |
| --- | --- | --- | --- |
| Superior | Atrás, «Finalizar compra» y sucursal | Orientar y permitir volver a revisar sin perder el carrito | Propuesto |
| Resumen | Total estimado y recuento de productos/unidades incluidos | Identificar qué suma sin obligar a leer toda la lista de nuevo | Propuesto; exclusión de apartados acordada |
| Centro | «¿Cuánto pagaste?», campo de total del ticket y aclaración de opcionalidad | Ofrecer el importe real sin convertirlo en requisito | Opcionalidad acordada; composición propuesta |
| Sección secundaria | «No llevaste», cantidad de productos y su detalle | Hacer explícito que también se conservarán, fuera del gasto | Conservación acordada; presentación propuesta |
| Inferior | «Guardar compra» | Acción principal separada de navegar o editar | Propuesto |

Mantener la paleta y Lexend Deca provisionales del recorrido. Los apartados
usan superficie neutra, con nombre, cantidad y precio legibles; no rojo de error,
tachado ilegible ni indicación de ahorro. En cierre son información de lectura;
para cambiar qué se lleva, volver al carrito con Atrás.

El ejemplo muestra un apartado. Con muchos, proponer un resumen expandible
«No llevaste · N», inicialmente compacto, sin esconder el hecho de que existen.
Al consultar su contenido, usar desplazamiento sin desplazar Guardar fuera del
alcance. Ese comportamiento requiere prototipo y prueba con texto ampliado.

## Datos que se conservan

- **Incluidos:** producto, cantidad e importe de referencia; su suma forma el
  total estimado de esta compra.
- **No llevaste:** los productos apartados completos, con nombre, cantidad e
  importe registrado. No suman al total ni se cuentan como productos comprados.
- **Total del ticket:** opcional y separado del estimado; puede completarse
  después. No precargar el campo con el estimado como si fuera un pago confirmado.
- **Contexto:** fecha y supermercado/sucursal de la compra, cuando estén
  disponibles. No inventar datos faltantes.

No convertir los apartados automáticamente en Pendientes ni borrar su observación
de precio. En el futuro detalle de la compra, «No llevaste» debe seguir separado
de lo comprado; la navegación general del historial aún está pendiente.

Ejemplo: leche (2 × $2.350) + pollo ($12.800) + yerba ($5.400) = **$22.900**.
El arroz apartado ($1.450, una unidad) queda en «No llevaste», fuera de ese total.
Si se registra un ticket de $22.500, conservar ambos importes y su diferencia;
no alterar precios de productos ni presentar los $400 como ahorro identificado.

## Estados y recuperación propuestos

- **Sin ticket:** permitir guardar. La compra conserva total estimado, sin
  afirmar que es el importe pagado.
- **Ticket válido:** conservar el importe informado por separado. El teclado
  numérico aparece sólo al tocar el campo, no al abrir el cierre.
- **Ticket inválido:** explicar el problema junto al campo; permitir corregirlo
  o borrarlo para guardar sin ticket. No descartar silenciosamente lo escrito.
- **Guardando:** bloquear duplicados y mostrar progreso; no vaciar la compra
  ni anunciar éxito antes de confirmar que se guardó.
- **Error de guardado:** conservar toda la información y permitir reintentar.
- **Sin apartados:** omitir la sección «No llevaste»; no ocupar espacio con una
  tarjeta vacía.
- **Todos apartados o compra vacía:** cierre todavía pendiente. No crear un
  gasto cero automáticamente ni perder los productos visibles.

El tratamiento exacto de teclado, Atrás, persistencia del borrador y recuperación
al cerrar la app se deberá verificar en Android. Este documento no define aún
una implementación ni una biblioteca de componentes.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| FIN-01 | 2026-09-24 | Acordado | Ticket opcional y completable después; referencia a COM-06 |
| FIN-02 | 2026-09-26 | Acordado | Conservar en la compra lo agregado pero no llevado, separado como «No llevaste»; el usuario considera valioso ese registro |
| FIN-03 | 2026-09-26 | Propuesto | Cierre breve a pantalla completa, resumen, ticket opcional, «No llevaste» y Guardar; sin revisión obligatoria producto por producto |
| FIN-04 | 2026-09-26 | Propuesto | Mostrar detalle y confirmación tras guardar; no abandonar la compra ante fallos ni duplicarla por doble toque |

## Qué falta comprobar

- Que se distinga Guardar de ingresar el importe pagado y de volver al carrito.
- Que «No llevaste» no se interprete como gasto, ahorro ni lista para otra visita.
- Visibilidad de Guardar y mensajes con teclado, texto ampliado y muchos apartados.
- Cierre sin incluidos, recuperación tras interrupciones y destino posterior.
- Acceso posterior para completar el ticket, dentro del diseño de historial.
