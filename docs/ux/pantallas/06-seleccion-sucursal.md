# 06 · Selección de sucursal

Actualización: 26 de septiembre de 2026.
Estado: recorrido, alta manual con supermercado y referencia libre acordados;
composición y validaciones pendientes.
Implementación actual: [HomeScreen](../../../src/features/supermarket/ui/HomeScreen.tsx)
ofrece selección, alta manual y persistencia local; la composición de la lámina
registra la propuesta del 26/09 y aún requiere validación en teléfono.
[Índice de pantallas](README.md).

Representación: [Inicio → sucursal → cámara](../visual/v2/README.md#inicio-sucursal-y-cámara).
La forma de panel inferior y su composición son propuestas, no un cambio al
carrito a pantalla completa.

## Rol y contexto

Identificar dónde transcurre una nueva compra antes de capturar el primer
producto. La persona ya eligió el supermercado en la vida real: este panel no
recomienda dónde ir ni compara locales; asocia la compra a su sucursal.

Se documenta como superficie con tarea propia. En el código se presenta como
modal dentro de Inicio; la lámina no fija sus detalles técnicos.

## Recorrido acordado

Inicio → Empezar compra → panel de sucursales → tocar una → cámara.

La selección lleva a captura sin otro paso obligatorio de confirmación. El
permiso de cámara, si falta, es un estado a diseñar, no una garantía de que la
cámara se abrirá correctamente. Retomar una compra existente se define aparte:
este recorrido corresponde a empezar una nueva. En esta versión sólo habrá
una compra abierta: si existe una anterior, resolverla explícitamente antes
de mostrar la selección para otra compra, según [Inicio](01-inicio.md).

## Estructura por definir

| Elemento | Rol | Estado |
| --- | --- | --- |
| Locales habituales | Reconocer y elegir rápidamente el lugar de compra | Dirección acordada; orden y presentación pendientes |
| Supermercado y referencia libre de sucursal | Distinguir locales de la misma cadena | Campos acordados; no se exige dirección exacta ni se presume identidad compartida |
| Agregar sucursal | Resolver primer uso u otro local aún no guardado | Alta manual simple acordada; composición propuesta |
| Salida sin selección | Volver al inicio sin crear una compra por error | Propuesto; gesto y control pendientes |

## Primer uso y alta simple

**Acordado:** en la primera versión se podrá agregar la sucursal manualmente.
El catálogo de supermercados y sucursales queda como dirección futura. El
usuario mencionó Google Maps u otra fuente como posibilidad para ese futuro;
no se eligió proveedor ni se autorizó integrar, extraer o importar datos ahora.

**Campos acordados:** Supermercado y Referencia de la sucursal como texto simple.
El usuario acepta una referencia libre, por ejemplo «Del barrio», sin exigir
dirección exacta. El código exige ambos campos y limita supermercado a 40
caracteres y referencia a 60; el tratamiento de duplicados aún debe revisarse.
No inferir ubicación física a partir del alias.

Propuesta de composición, pendiente de confirmar:

- Sin locales guardados, proponer el alta directamente dentro del panel con
  contexto «Agregá tu primera sucursal», sin una lista vacía ni otro toque previo.
- Con locales guardados, mostrar la lista y un acceso secundario «Agregar sucursal».
- Mostrar los campos acordados juntos, con ejemplos «Día» y «Del barrio», sin
  depender de un catálogo remoto.
- Proponer «Guardar y empezar» para conservar el local, seleccionarlo y llegar
  a la cámara, sin volver a elegir la sucursal recién agregada.
- No pedir por defecto ubicación, mapa, teléfono ni horarios para esta alta.
  Si se cancela, volver al panel sin crear un local incompleto ni una compra.

El local agregado queda disponible para futuras visitas. Su alias no demuestra
identidad compartida entre usuarios: una futura vinculación al catálogo debe
resolver esa equivalencia sin asumir que nombres similares son la misma sucursal.
El alta y la persistencia local ya están implementadas. La edición de locales y
el tratamiento de duplicados requieren definición posterior; esta propuesta de
composición no modifica el almacenamiento de la app.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| SUC-01 | 2026-09-26 | Acordado | Mostrar el panel después de Empezar compra y antes de la cámara; el usuario confirmó explícitamente la secuencia |
| SUC-02 | 2026-09-26 | Acordado | Tocar una sucursal abre la cámara, sin confirmación adicional del local |
| SUC-03 | 2026-09-26 | Acordado para primera versión | Permitir agregar supermercados/sucursales de forma simple y manual, sin depender de un catálogo |
| SUC-04 | 2026-09-26 | Dirección futura | Contar con un catálogo; fuente y mecanismo de obtención se evaluarán después, sin integración con mapas acordada |
| SUC-05 | 2026-09-26 | Parcialmente resuelto | Campos acordados en SUC-06; «Guardar y empezar» y composición siguen propuestos |
| SUC-06 | 2026-09-26 | Acordado | Supermercado y referencia libre del local; no exigir dirección exacta en esta versión |

## Próximas definiciones

- Validaciones del alta manual y presentación de supermercado/referencia en la lista.
- Orden de habituales y acceso a otro local; información mínima de cada fila.
- Comprobar en teléfono cancelación, permiso de cámara y persistencia; resolver
  el tratamiento de duplicados del alta manual.
- Corrección de una sucursal elegida por error.

Retomar no repite la selección: ver [Inicio](01-inicio.md) para la distinción
acordada entre apertura desde cero y regreso desde otra app.

## Composición de la lámina · propuesta

- Panel inferior sobre Inicio atenuado, con título, contexto y cierre visible.
  Seleccionar cierra el panel y abre la cámara; no apilar otro panel de confirmación.
- Filas amplias con supermercado prominente y referencia debajo. Las iniciales
  decorativas no son logos oficiales ni identifican por sí solas una sucursal.
- Proponer ordenar por uso reciente, sin destacar una fila como si ya estuviera
  elegida ni asumir ubicación. La cámara usa la sucursal efectivamente tocada.
- «Agregar sucursal» tiene menor peso que la lista. El formulario sustituye el
  contenido del panel; no se apila otro sheet encima.
- Alta con los dos campos acordados, etiquetas persistentes y «Guardar y empezar».
  La lámina representa texto ingresado, sin foco ni teclado. Propuesta: con el
  teclado, expandir el panel y permitir desplazamiento, conservando la acción
  accesible; comprobarlo antes de cerrar tamaños.
- En primer uso, proponer que el panel se abra directamente en el alta con
  contexto «Agregá tu primera sucursal», sin exigir tocar Agregar en una lista
  vacía. Es una simplificación propuesta, no una nueva decisión acordada.

Una cruz o Atrás regresan al estado anterior sin guardar ni iniciar una compra
silenciosamente. El aviso ante un borrador modificado, los duplicados y los
fallos de guardado requieren definición; no representar éxito si el alta falla.
La nueva compra empieza en cero, no hereda el total de la última visita.
