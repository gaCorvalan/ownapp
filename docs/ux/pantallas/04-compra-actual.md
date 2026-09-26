# 04 · Compra actual

Actualización: 26 de septiembre de 2026.
Estado: pantalla completa, acceso y exclusión reversible del total acordados;
control y composición interna propuestos.
[Índice de pantallas](README.md).

Representación vigente: [dirección visual 01](../visual/v1/README.md), estado 04,
aceptada como rumbo provisional. El [wireflow](../wireflows/v1/README.md) queda
como antecedente. La compra de ejemplo tiene cuatro productos: no demuestra
aún una lista mensual larga.
La lámina precede a la decisión de apartar productos: su papelera no representa
la interacción vigente. La edición de nombre/precio se pospuso el 26/09.

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
| Asociado a cada producto | Cantidad | Ajustar cuántas unidades se llevan | Control propuesto; edición de nombre/precio pospuesta, sin modificar el código existente |
| Acción por producto | Incluir / apartar del total | Probar el importe al dejar productos y reincorporarlos | Comportamiento acordado; control y texto final propuestos |
| En el producto apartado | Estado «Apartado · No suma» y reincorporación | Mantenerlo visible y permitir cambiar de opinión sin límite fugaz | Visibilidad y reversibilidad acordadas; presentación propuesta |
| Área de cierre por definir | Finalizar compra | Conservar el resultado de la visita | Función acordada en discovery; ubicación y composición del cierre pendientes |

El total debe calcularse desde los ítems incluidos y actualizarse al apartar,
reincorporar o ajustar cantidades. El subtotal de una fila debe ser distinguible de su precio por unidad.
No usar sólo una cifra para identificar el producto.

## Estados e interacciones

### Compra con productos

Propuesta: nombres legibles y datos agrupados por producto. Falta decidir orden
de la lista —último agregado primero, orden de captura u otro— y cuánto mostrar
sin desplegar. No se aprobó una clasificación de productos obligatoria.

### Apartar y reincorporar un producto

**Acordado el 26/09:** el usuario quiere «que quede ahí pero no sume a la cuenta»
para evaluar cuánto pagaría al sacar algunos productos y poder volver a incluirlos.
No es borrar y ofrecer un Deshacer temporal: el producto permanece visible y
puede reincorporarse durante la compra sin volver a escanearlo.

Propuesta de interacción:

- Sustituir la papelera por un control de inclusión explícito, por ejemplo una
  casilla marcada para «Lo llevo». Control y etiqueta todavía por confirmar.
- Al apartar, conservar la fila en su posición, nombre, precio y cantidad;
  mostrar «Apartado · No suma». No moverla automáticamente a una sección oculta.
- Diferenciar el estado con texto y marcador, no sólo color. Suavizar el fondo,
  pero mantener legibles los datos y disponible el control de reincorporación;
  no darle aspecto de función deshabilitada.
- Actualizar el total al alternar. El precio permanece como referencia y no
  se reemplaza por cero. No sumar el subtotal apartado ni borrar su observación.
- Proponer recuentos separados, por ejemplo «3 productos incluidos · 1 apartado»,
  para no confundir todos los productos visibles con los que se están llevando.

Ejemplo para una unidad de arroz de $1.450: $24.350 → apartar → $22.900 →
reincorporar → $24.350. No es necesario mostrar dos totales competidores.

**Acordado:** apartar afecta al producto completo, con todas sus unidades.
No se divide una fila entre unidades incluidas y apartadas. Se conserva la
cantidad para reincorporarlo; ajustar cantidad es una acción distinta.

Pendiente: definir persistencia al reabrir y destino de los
apartados al finalizar. No convertirlos automáticamente en pendientes para
otra sucursal ni contabilizarlos como compra realizada.

### Compra vacía

Propuesta: total cero, explicación breve y regreso directo a capturar. Resolver
si puede finalizarse una compra vacía o si simplemente se sale conservando su
contexto. No inventar un registro pagado vacío automáticamente.
Una compra con todos los productos apartados tiene total cero, pero no está
vacía: conservar las filas y permitir reincorporarlas. Su cierre queda pendiente.

### Edición

La edición de nombre y precio se pospone por pedido del usuario del 26/09.
Esto limita la exploración actual; no autoriza eliminar el editor implementado
ni garantiza que el OCR siempre acierte. La cantidad sigue como control
propuesto y separado de apartar: no se diseñará apartado parcial de unidades.

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
| COM-05 | 2026-09-24 | Reemplazado por COM-11 | La propuesta de quitar con Deshacer temporal se sustituye por apartar sin desaparecer de la lista |
| COM-06 | 2026-09-24 | Acordado | Ticket opcional al finalizar y completable después; no bloquear el cierre por ese dato |
| COM-07 | 2026-09-24 | Propuesto | Wireflow 01: último agregado primero, total arriba y cierre abajo; la lista ocupa el cuerpo desplazable |
| COM-08 | 2026-09-24 | Parcialmente reemplazado | Cantidad compacta sigue propuesta; edición pospuesta por COM-13 y retiro sustituido por COM-11 |
| COM-11 | 2026-09-26 | Acordado | Apartar del total sin quitar de la vista; reincorporar para comparar decisiones durante la compra, sin depender de un aviso temporal |
| COM-12 | 2026-09-26 | Propuesto | Casilla de inclusión, fila en la misma posición y texto «Apartado · No suma»; conservar datos y legibilidad |
| COM-13 | 2026-09-26 | Acordado para esta etapa | Posponer diseño de edición de nombre/precio; no cambia el editor existente ni elimina recuperación ante errores |
| COM-14 | 2026-09-26 | Acordado | Apartar el producto completo, con todas sus unidades; conservar cantidad para reincorporarlo, sin dividir la fila en estados parciales |

## Desarrollo visual 01 · propuesto

La [lámina con Lexend Deca](../visual/v1/README.md) propone total sobre una
superficie clara con tinte, filas blancas por producto y cierre petróleo
separado abajo. Cantidad y subtotal quedan en la misma fila; nombre y precio
unitario arriba. Sus iconos de edición y papelera quedaron desactualizados
por COM-11 y COM-13. La próxima revisión representará inclusión reversible,
con área táctil amplia; todavía no se generó esa nueva lámina.

El último producto aparece primero con tinte suave; no es una clasificación
por necesidad ni por ahorro. El orden y el resaltado siguen siendo propuestas.
La composición no agrega un estado parcial del carrito ni altera el acuerdo
de abrir a pantalla completa y volver a captura con Atrás.

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| COM-09 | 2026-09-24 | Propuesto | Superficie tonal para total, filas claras y cierre oscuro; separar orientación, revisión y finalización |
| COM-10 | 2026-09-24 | Propuesto | Tinte suave en el último agregado para localizarlo; probar su utilidad sin confundirlo con selección o ahorro |

## Qué falta resolver y comprobar

- Orden de productos y densidad de la lista para una compra mensual.
- Ubicación del total y finalizar con teclado, texto ampliado y lista larga.
- Control de inclusión, comprensión de «Apartado» y lectura del total actualizado.
- Conservación del estado de inclusión al reabrir y destino de apartados al cerrar.
- Reincorporación sin salto de posición y diferencia entre cero incluidos y lista vacía.
- Que el desplazamiento de la lista no cierre accidentalmente la pantalla.
- Que volver, finalizar y vaciar se interpreten como acciones distintas.
- Pausa de cámara durante revisión y recuperación al volver, a verificar en teléfono.
