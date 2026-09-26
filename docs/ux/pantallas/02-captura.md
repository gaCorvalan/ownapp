# 02 · Captura de etiquetas

Actualización: 24 de septiembre de 2026.
Estado: dirección y acceso a la compra acordados; composición fina propuesta.
[Índice de pantallas](README.md).

Representación vigente: [dirección visual 01](../visual/v1/README.md), estados
01 y 03. [Wireflow previo](../wireflows/v1/README.md) como antecedente.
El rumbo visual es provisional; los detalles dibujados siguen siendo propuestas.

## Rol y contexto

Capturar una etiqueta de góndola o envase para obtener un producto y sus precios
candidatos. El usuario abre la app frente al producto y expresó que le seduce
una cámara protagonista, con el carrito resumido en la base.

Capturar inicia una lectura, no una compra automática. Elegir precio y agregar
ocurre en [Confirmación](03-confirmacion.md). El total visible representa
únicamente productos ya agregados.

## Jerarquía

1. Encuadre y acción de captura: tarea dominante.
2. Total estimado y acceso al carrito: referencia constante de la compra.
3. Sucursal y salida: contexto y navegación.
4. Recuperación de errores: aparece cuando hace falta; la carga manual no
   compite con el flujo habitual.

## Estructura propuesta

| Ubicación | Elemento | Rol | Motivo y estado |
| --- | --- | --- | --- |
| Franja superior compacta | Volver y sucursal actual | Ubicar la captura dentro de la compra | Propuesto: dar contexto sin dedicar gran espacio a una cabecera |
| Área central dominante | Cámara con guía de encuadre | Apuntar a la etiqueta | Cámara protagonista acordada; geometría de la guía pendiente |
| Debajo del encuadre, antes del carrito | Disparador | Capturar de manera explícita | Propuesto: posición estable, separada de la zona de arrastre del carrito |
| Base | Resumen del carrito con total estimado, cantidad y señal de apertura | Saber cuánto se lleva y acceder a revisión | Acordado: resumen accesible; detalles visuales y distinción productos/unidades pendientes |
| Resumen, tras agregar | Confirmación breve del último agregado | Saber que la acción se completó | Propuesto: nombre y cantidad, sin abrir automáticamente la compra |

Propuesta: ubicar el acumulado en el resumen del carrito, sin un segundo bloque
grande repitiéndolo arriba. La superficie detrás del texto debe mantener su
legibilidad independientemente de la imagen de cámara.

No se definió una barra de pestañas debajo del resumen. Debemos evaluar el
espacio disponible, los gestos Android y el tamaño de texto antes de añadirla.

## Apertura de la compra

**Acordado:** tocar el resumen o deslizarlo hacia arriba abre
[Compra actual](04-compra-actual.md) a pantalla completa, con transición
ascendente. Se reemplazó la idea inicial de revisar el carrito en un bottom
sheet. No hay un estado intermedio del carrito aprobado.

El gesto tiene alternativa mediante toque y una indicación visible de apertura.
La manija por sí sola no debe ser la única pista. Al volver se recupera la
captura. La animación debe tener alternativa con movimiento reducido; su
duración y tratamiento visual todavía no se definieron.

## Estados e interacciones

| Estado | Comportamiento | Situación de diseño |
| --- | --- | --- |
| Cámara lista | Encuadrar y capturar; carrito resumido accesible | Dirección acordada |
| Capturando/leyendo | Indicar progreso y evitar capturas duplicadas | Comportamiento a conservar; presentación pendiente |
| Lectura con candidatos | Pasar a confirmación sin agregar automáticamente | Flujo actual aceptado |
| Lectura parcial | Conservar lo útil y facilitar corregir lo que falta | Propuesto; no se decidió qué datos bloquearían el avance |
| Lectura fallida | Reintentar; alternativa secundaria para ingresar datos | Propuesto como recuperación, no como acción principal |
| Cámara denegada o no disponible | Explicar cómo recuperarla y cómo continuar | Pendiente: resolver la salida accesible antes de retirar entradas manuales |
| Regreso desde otra app | Recuperar la compra y reanudar la captura cuando corresponda | Propuesto; verificar pausa/reanudación en teléfono |

## Carga manual

El usuario pidió que sea «MUY secundaria», quizá un ícono pequeño o que no
aparezca. Su intención acordada es priorizar la captura y usar lo manual sobre
todo para corregir.

**Propuesta aún por confirmar:** no mostrar un acceso manual permanente en la
cámara lista; ofrecerlo al fallar la lectura o no poder usar la cámara. No está
acordado eliminar toda forma de ingreso manual del producto.

Si finalmente se elige un ícono discreto, su área táctil y etiqueta accesible
deberán permitir usarlo con comodidad. Discreción visual no significa un objetivo
táctil pequeño. La afirmación de que nadie querrá ingresar datos manualmente se
trata como una hipótesis pendiente de pruebas.

## Registro de decisiones

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| CAP-01 | 2026-09-24 | Acordado | Cámara protagonista: el usuario llega frente a la primera etiqueta y prefiere este foco |
| CAP-02 | 2026-09-24 | Acordado | Carrito resumido accesible durante captura: permite consultar acumulado sin abandonar el encuadre |
| CAP-03 | 2026-09-24 | Acordado | Toque o swipe ascendente abren compra completa; reemplaza el bottom sheet inicialmente explorado |
| CAP-04 | 2026-09-24 | Acordado | La carga manual debe tener muy baja prioridad visual; no competir con capturar |
| CAP-05 | 2026-09-24 | Propuesto | Recuperar ingreso manual ante errores, sin acceso permanente en el estado normal |
| CAP-06 | 2026-09-24 | Propuesto | Total en el resumen y feedback del último agregado, para verificar el efecto de cada captura |
| CAP-07 | 2026-09-24 | Propuesto | Wireflow 01: feedback encima del disparador, con espacio reservado para no mover la acción entre capturas |

## Desarrollo visual 01 · propuesto

La [lámina con Lexend Deca](../visual/v1/README.md) mantiene la estructura:
cámara dominante, cabecera compacta, disparador y resumen inferior. Propone
petróleo para el resumen, lima para el disparador y la apertura de compra,
y un aviso claro del agregado por encima del disparador, sin moverlo.

El importe y «Ver compra» permanecen explícitos; color y elevación agrupan la
información sin reemplazar las indicaciones. La góndola ilustrada no es una foto
ni un tratamiento a aplicar a la cámara. No se agregan pestañas globales aquí;
la navegación de Inicio sigue pendiente. Lexend Deca se prueba por pedido del
usuario; el conjunto se acepta como rumbo provisional, no como acabado cerrado.

| ID | Fecha | Estado | Decisión y fundamento |
| --- | --- | --- | --- |
| CAP-08 | 2026-09-24 | Propuesto | Resumen petróleo con total claro y acento lima en apertura; separarlo visualmente de la cámara y conservar acceso por toque o swipe |
| CAP-09 | 2026-09-24 | Propuesto | Capturar con acento lima y feedback claro en posición estable; la decoración no cambia el ciclo de captura |

## Qué falta resolver y comprobar

- Tamaño del resumen y área útil de encuadre con texto ampliado y navegación Android.
- Separación entre gesto del carrito, disparador y navegación del sistema.
- Comprensión del toque y del swipe como dos accesos al mismo destino.
- Disponibilidad del carrito mientras se lee una captura y al ocurrir un error.
- Recuperación manual, permisos y errores sin callejones sin salida.
- Latencia, legibilidad, uso repetido y reanudación reales en Xiaomi Mi 9T.
