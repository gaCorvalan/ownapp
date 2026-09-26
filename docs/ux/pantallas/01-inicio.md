# 01 · Inicio

Actualización: 26 de septiembre de 2026.
Estado: propósito y recorrido de nueva compra acordados; estructura detallada propuesta.
[Índice de pantallas](README.md).

## Rol y contexto

Dar acceso rápido a empezar una compra, o recuperar una que quedó abierta.
El usuario explicó: «si abro la app es porque ya decidí a qué súper voy a ir» y
se imagina abriéndola frente al primer producto. Por eso, el inicio debe facilitar
la entrada a la tarea con poca preparación.

No se definió como una herramienta para decidir a qué comercio ir. El gasto
mensual y el historial son necesidades del producto, pero todavía no se demostró
que deban ocupar la primera pantalla.

## Jerarquía

1. **Principal, acordado:** acceso rápido a empezar una compra.
2. **Principal cuando corresponda, propuesto:** recuperar una compra abierta.
3. **Contexto, propuesto:** explicar brevemente el valor en el primer uso.
4. **Secundario, pendiente:** accesos a pendientes e historial y su ubicación.

La presencia de datos después de varias compras no implica agregar gráficos
al inicio. Cada bloque deberá justificar una tarea concreta del usuario.

## Estructura propuesta

| Ubicación | Elemento | Rol | Motivo y estado |
| --- | --- | --- | --- |
| Superior | Identificación discreta de la app | Reconocer el producto | Propuesto: orienta sin competir con empezar la compra; «a mano» sigue siendo provisional |
| Central, primer uso | Promesa breve y explicación de la captura | Entender qué se puede hacer | Propuesto: una frase, por ejemplo «Sabé cuánto llevás antes de llegar a caja»; texto final pendiente |
| Central, compra abierta | Sucursal, total estimado y resumen breve | Reconocer qué se va a retomar | Propuesto: sustituye la explicación inicial por contexto útil |
| Inferior, respetando el área del sistema | Acción principal «Empezar compra» o «Continuar compra» | Entrar a la tarea | Acceso rápido acordado; ubicación inferior propuesta, a comprobar con distintas formas de sostener el teléfono |
| Por definir | Acceso a pendientes e historial | Consultar decisiones y compras anteriores | Pendiente: no se aprobó una barra de navegación global |

No hay alturas ni proporciones aprobadas. El texto ampliado debe poder desplazar
contenido sin ocultar la acción. No se agregan ilustraciones o tarjetas para
llenar espacio: su utilidad se evaluará en el wireframe.

## Estados e interacciones

### Primer uso, sin compra

Mostrar el propósito y la acción de inicio. No requerir presupuesto o lista
previa, según lo acordado en discovery. **Acordado:** Empezar compra → panel
de sucursales → elegir una → abrir cámara. La elección ocurre antes de la
primera captura. Cómo incorporar el primer local y qué hacer si no se encuentra
sigue pendiente; no convertir esa preparación en un formulario largo.

### Usuario habitual, sin compra abierta

Mantener el acceso principal en un lugar consistente. **Acordado:** ofrecer el
[panel de sucursales](06-seleccion-sucursal.md) al tocar Empezar compra; elegir
una abre la cámara, sin otro botón de continuar. Aún no se decide si se muestran pendientes en el inicio
o después de elegir el local; no asumir que su función es decidir el comercio.

### Compra abierta

Propuesta: priorizar «Continuar compra» con su contexto. No confundir continuar
con crear una nueva o vaciar la existente. Falta definir cómo se iniciaría otra
compra si todavía hay una abierta.

### Regreso desde otra app

El usuario consulta a la IA durante el recorrido. Propuesta transversal:
recuperar la tarea en curso sin obligarlo a pasar por el inicio en cada regreso.
Precisar el comportamiento ante cierre completo y reapertura en el wireflow.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| INI-01 | 2026-09-24 | Acordado | El inicio da acceso rápido a empezar: es la expectativa explícita del usuario |
| INI-02 | 2026-09-24 | Acordado | No orientar su función principal a elegir supermercado: esa decisión ya está tomada al abrir |
| INI-03 | 2026-09-24 | Propuesto | Adaptar contenido a primer uso, uso habitual y compra abierta, conservando la estructura |
| INI-04 | 2026-09-24 | Propuesto | Dar prioridad a continuar cuando existe una compra, para evitar duplicación y pérdida de contexto |
| INI-05 | 2026-09-24 | Parcialmente resuelto | Selección de sucursal resuelta por INI-06; destinos secundarios y navegación global siguen pendientes |
| INI-06 | 2026-09-26 | Acordado | Empezar compra abre un panel de sucursales; tocar una abre la cámara. No se elige el local después del primer escaneo como recorrido normal |

## Qué falta resolver y comprobar

- Cuánto contexto pedir antes de la primera captura y qué hacer si falta sucursal.
- Si continuar requiere pasar por este inicio o se recupera directamente la
  pantalla activa según la forma de reabrir la app.
- Si se entiende qué compra se continúa y cómo salir conservándola.
- Si un usuario nuevo identifica el primer paso sin explicación del facilitador.
- Si existen datos secundarios útiles en esta pantalla una vez haya historial.
