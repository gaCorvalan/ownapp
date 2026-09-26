# Plan de validación · primera ronda

Estado al 24/09/2026: preparado, sin participantes evaluados ni resultados.

Material vigente: [dirección visual 01 · Lexend Deca](visual/v1/README.md),
aceptada como rumbo provisional, y [decisiones por pantalla](pantallas/README.md).
El [wireflow](wireflows/v1/README.md) queda como antecedente de estructura; A fue
elegida. El HTML descartado se retiró y no debe usarse para pruebas.

Las láminas son estáticas: permiten conversar sobre jerarquía y recorridos,
pero no medir duración de tareas ni validar gestos o reconocimiento. Las
alternativas A/B no fueron un experimento A/B de uso real. El guion siguiente
requiere un futuro prototipo navegable; probar sólo las tareas que represente,
sin presentar comparación, inclusión reversible o cierre como interacciones ya disponibles.

## Preguntas prioritarias

1. ¿Registrar varios productos aporta suficiente valor para sostener el hábito?
2. ¿La persona sabe qué acaba de agregar y puede corregirlo sin perder el hilo?
3. ¿Distingue precios observados antes, total estimado y total pagado?
4. ¿Puede guardar una alternativa concreta para otra sucursal y recuperarla?
5. ¿Puede finalizar y completar después el total del ticket sin ayuda?

## Participantes y secuencia

- Primera pasada con la persona impulsora en su Xiaomi Mi 9T. Registrar Android,
  tamaño de texto y método de navegación. Comprobar primero que la build con
  OCR se instala y funciona; no asumir que Expo Go ejecuta ese módulo.
- Primera ronda cualitativa propuesta: 4–5 compradores habituales del hogar,
  según disponibilidad. Incluir personas que suman y personas que no; registrar
  diferencias de experiencia digital y uso de uno o varios supermercados.
- No inferir porcentajes poblacionales a partir de este grupo. Corregir los
  problemas observados y probar nuevamente los recorridos afectados.
- La persona usuaria coordina invitaciones; no se enviarán mensajes a terceros
  sin instrucciones explícitas. Participar y grabar son decisiones separadas;
  solicitar consentimiento antes de observar o grabar, y evitar datos bancarios.

## Entrevista breve (10–15 minutos)

Preguntar por hechos recientes, sin presentar primero las soluciones:

1. Contame tu última compra: dónde, con quién, cómo decidiste qué llevar.
2. ¿Cuándo supiste cuánto ibas gastando? ¿Qué hiciste con esa información?
3. Contame la última vez que quitaste o reemplazaste un producto.
4. ¿Cómo decidiste el supermercado? ¿Qué comparaste realmente?
5. ¿Usaste el teléfono o una calculadora? ¿En qué momento y qué te costó?

No preguntar sólo «¿usarías esta app?» ni interpretar entusiasmo como adopción.

## Prueba del concepto (20–30 minutos)

Usar precios y locales ficticios en el futuro prototipo. No sugerir botones ni
corregir al participante durante una tarea salvo que solicite ayuda o se bloquee.
El facilitador registra esa intervención.

| Tarea | Situación a plantear | Qué observar |
| --- | --- | --- |
| Cargar | Querés llevar dos unidades de esta leche al precio regular | Precio, cantidad, confianza sobre si se agregó |
| Revisar | Querés saber cuánto pagarías sin llevar el arroz, sin perderlo de vista | Encuentra carrito, aparta el producto y entiende que su precio visible ya no suma |
| Recuperar | Después de revisar otros productos, cambiás de opinión y querés llevar el arroz | Lo reincorpora sin escanear ni depender de un aviso temporal; total y cantidad coherentes |
| Apartar varias unidades | Llevabas dos leches; querés calcular el total sin llevar ninguna y luego volver a incluir ambas | Se aparta toda la fila y se recupera la cantidad 2; no se interpreta como restar sólo una unidad |
| Comparar | Querés evaluar llevar la leche hoy o comprar otra en tu próximo supermercado | Abre alternativas y lee fecha/condición/presentación |
| Pendiente | Elegís la alternativa concreta para otra visita | No la confunde con un producto del carrito actual |
| Cerrar | Terminaste de pagar, pero no tenés el ticket a mano | Finaliza sin importe obligatorio |
| Completar | Ya en casa, encontrás el ticket | Recupera compra y registra total sin alterar los ítems |

Un prototipo sin cámara real no permite juzgar legibilidad de etiquetas, latencia OCR, calidad de
identificación ni recuperación nativa después de cambiar de app.

## Prueba física del flujo existente

Hacer primero un ensayo breve y luego una compra real si el dispositivo funciona
correctamente. Incluir etiqueta simple, varios precios, bandeja con importe final,
producto repetido, nombre incompleto y lectura fallida. Registrar la entrada
manual como parte del recorrido, no excluirla del tiempo medido.

Probar sin conexión, denegación de cámara, teclado, texto ampliado, TalkBack,
cambio a otra app y regreso. Comprobar restauración de la compra tras cerrar la
app. Tomar notas sin interferir con el recorrido ni registrar terceros.

Medir por producto desde iniciar la captura hasta poder continuar: duración,
reintentos, correcciones de nombre/precio y abandonos. Separar espera técnica de
tiempo de decisión. Registrar qué productos quedaron fuera del acumulado.

Comparar el total con el ticket cuando la persona quiera compartirlo. Clasificar
diferencias: omisión, cantidad, precio, promoción, peso, u origen desconocido.
No ajustar datos retroactivamente para presentar una coincidencia artificial.

## Registro de resultados

| Participante | Dispositivo/build | Tarea | Sin ayuda / con ayuda / no completó | Tiempo | Error o duda observado | Cita | Severidad | Cambio propuesto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pendiente | — | — | — | — | — | — | — | — |

Severidad: crítica (pérdida de compra o total engañoso), alta (bloquea tarea o
requiere ayuda), media (reintento/esfuerzo), baja (detalle sin afectar resultado).
Separar conducta observada, comentario textual e interpretación del equipo.

## Criterios para decidir el siguiente incremento

- Resolver los errores críticos antes de ampliar el alcance.
- Si no se entiende qué se agregó o cuánto se acumula, revisar confirmación y
  feedback antes de añadir comparaciones más complejas.
- Si nombres o capturas requieren correcciones constantes, mejorar el flujo
  manual/OCR antes de prometer uso mensual completo.
- Si se interpreta un precio histórico como vigente, corregir la presentación
  y volver a probar esa tarea.
- Usar la primera prueba como línea de base; no inventar un tiempo objetivo de
  captura sin observar el dispositivo y el contexto.
- Preguntar después qué fue útil o molesto y si se usó de nuevo en otra visita.
  La intención declarada y el uso repetido se registran por separado.

## Evidencia que no debe confundirse

Una comprobación automática verifica lógica. Un bundle verifica compilación.
Una revisión web comprueba el boceto en navegador. Una prueba en teléfono
verifica parte del comportamiento nativo. Una compra observada aporta evidencia
de uso en contexto. Ninguna de esas comprobaciones reemplaza a las demás.

## Estado de verificación

- Las revisiones de las láminas y los pares de contraste calculados están en
  [dirección visual 01](visual/v1/README.md#qué-se-comprobó-y-qué-no). No validan
  interacción, cámara real ni accesibilidad completa.
- Como antecedente del 24/09/2026 se registraron `pnpm typecheck`, `pnpm lint` y
  12 pruebas correctas del proyecto. No se repitieron por los cambios de diseño
  y limpieza documental; no certifican el estado de una futura implementación.
- No hay bundle ni revisión web de la nueva UI. Teléfono físico, OCR en contexto,
  foco, TalkBack y pruebas con participantes siguen pendientes.
