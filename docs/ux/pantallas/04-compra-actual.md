# 04 · Compra actual

Actualización: 24 de septiembre de 2026.
Estado: pantalla completa y acceso acordados; composición interna propuesta.
[Índice de pantallas](README.md).

## Rol y contexto

Revisar lo que se está llevando, comprender el total y corregir la compra antes
de pagar. Si el acumulado parece alto, el usuario quitaría algo prescindible para
dar lugar a lo necesario y también evaluaría alternativas más baratas.

Es una tarea que puede requerir recorrer muchos productos. Se decidió dedicarle
la pantalla completa, sin limitar la revisión a una card expandida o un panel
parcial sobre la cámara.

## Entrada y salida

**Acordado:** tocar o deslizar hacia arriba el resumen en
[Captura](02-captura.md) abre esta pantalla con animación ascendente. Ambas
interacciones deben conducir a la misma compra y al mismo estado de pantalla.
La animación expresa continuidad con el resumen; no convierte el destino en un
bottom sheet ni define una biblioteca técnica.

La conversación aceptó una forma visible de volver y el comportamiento de Atrás
de Android. Volver debe recuperar el contexto de captura y conservar cambios.
No se decidió que arrastrar hacia abajo cierre esta pantalla: es un gesto que
podría competir con desplazarse por una lista larga.

## Jerarquía

1. Total y productos actuales: entender qué se está llevando.
2. Cantidades, importes y correcciones: actuar sobre el gasto.
3. Volver a capturar: continuar la compra con facilidad.
4. Finalizar: acción de cierre deliberada, distinta de volver o vaciar.

## Estructura propuesta

| Ubicación | Elemento | Rol | Motivo y estado |
| --- | --- | --- | --- |
| Superior | Volver, título «Tu compra» y sucursal | Orientarse y regresar | Propuesto: navegación visible y contexto suficiente |
| Resumen estable | Total estimado y cantidades claramente rotuladas | Ver el efecto de los cambios | Propuesto: mantener accesible al recorrer la lista; tamaño final pendiente |
| Cuerpo principal desplazable | Lista de productos con nombre, cantidad, precio y subtotal | Reconocer y revisar lo que se lleva | Datos necesarios acordados; orden y densidad de filas pendientes |
| Asociado a cada producto | Edición de datos y cantidad | Corregir sin perder la referencia del producto | Propuesto: tratamiento específico a definir; no repetir todos los botones en cada fila sin evaluar densidad |
| Acción por producto | Quitar / «No lo llevo» | Excluirlo de lo que se va a pagar | Necesidad acordada; gesto, control y texto final pendientes |
| Feedback cercano a la acción | Posibilidad de deshacer | Recuperar un retiro accidental | Propuesto: evitar una confirmación bloqueante en cada retiro |
| Área de cierre por definir | Finalizar compra | Conservar el resultado de la visita | Función acordada en discovery; ubicación y composición del cierre pendientes |

El total debe calcularse desde los ítems actuales y actualizarse al editar o
quitar. El subtotal de una fila debe ser distinguible de su precio por unidad.
No usar sólo una cifra para identificar el producto.

## Estados e interacciones

### Compra con productos

Propuesta: nombres legibles y datos agrupados por producto. Falta decidir orden
de la lista —último agregado primero, orden de captura u otro— y cuánto mostrar
sin desplegar. No se aprobó una clasificación de productos obligatoria.

### Retiro de un producto

Quitar excluye el producto del acumulado de esta compra. No debería borrar el
precio observado, que tiene otro uso. La mecánica de deshacer sigue propuesta.
No contabilizar lo retirado como gasto pagado.

### Compra vacía

Propuesta: total cero, explicación breve y regreso directo a capturar. Resolver
si puede finalizarse una compra vacía o si simplemente se sale conservando su
contexto. No inventar un registro pagado vacío automáticamente.

### Edición

Permitir corregir cantidades, nombre e importe. La forma exacta —edición dentro
de la lista o vista dedicada— sigue pendiente. Considerar teclado, retorno y
persistencia de cambios antes de seleccionar el patrón.

### Finalización

El usuario aceptó ingresar el total del ticket, siempre opcional y también
después de llegar a casa. Finalizar y vaciar tienen significados distintos.
El cierre deberá conservar los ítems, el total calculado y el contexto de la
compra; su pantalla o estado se documentará al diseñarlo.

Si luego se ingresa un ticket diferente del cálculo, conservar ambos importes.
No repartir la diferencia entre los precios de los productos. Los reintegros
bancarios automáticos quedan fuera de la primera versión.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| COM-01 | 2026-09-24 | Acordado | Revisar la compra en pantalla completa: propuesta explícita del usuario tras evaluar un bottom sheet |
| COM-02 | 2026-09-24 | Acordado | Entrada por toque o swipe con animación hacia arriba: continuidad con el resumen de captura |
| COM-03 | 2026-09-24 | Acordado | Acceso visible para volver y compatibilidad con Atrás; el gesto no es el único mecanismo |
| COM-04 | 2026-09-24 | Propuesto | Lista con total accesible y acciones ligadas al producto, para evaluar qué retirar |
| COM-05 | 2026-09-24 | Propuesto | Quitar con posibilidad de deshacer, conservando la observación de precio |
| COM-06 | 2026-09-24 | Acordado | Ticket opcional al finalizar y completable después; no bloquear el cierre por ese dato |

## Qué falta resolver y comprobar

- Orden de productos y densidad de la lista para una compra mensual.
- Ubicación del total y finalizar con teclado, texto ampliado y lista larga.
- Tratamiento de editar, quitar y deshacer sin una colección de botones iguales.
- Preservación de posición al volver de editar un producto.
- Que el desplazamiento de la lista no cierre accidentalmente la pantalla.
- Que volver, finalizar y vaciar se interpreten como acciones distintas.
- Pausa de cámara durante revisión y recuperación al volver, a verificar en teléfono.
