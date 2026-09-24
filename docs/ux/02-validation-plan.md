# Plan de validación · primera ronda

Estado al 24/09/2026: preparado, sin participantes evaluados ni resultados.

Actualización de enfoque: el primer boceto `compra-concepto.html` fue descartado
como referencia visual y estructural por el usuario. Las tareas siguientes
siguen siendo un guion propuesto, pero se ejecutarán sobre un futuro wireflow o
prototipo basado en las [decisiones por pantalla](pantallas/README.md). No usar
el boceto anterior como representación del diseño vigente.

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
| Revisar | Decidiste no llevar el arroz que estaba en tu compra | Encuentra carrito, entiende cambio en total |
| Recuperar | Cambiaste de opinión y querés volver a llevarlo | Descubre cómo deshacer |
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

## Preparación verificada el 24/09/2026

- `pnpm typecheck` y `pnpm lint`: correctos; corresponden al proyecto existente.
- `pnpm test`: 12 pruebas correctas. No prueban el boceto ni validan UX.
- JavaScript del boceto: sintaxis comprobada con Node; lectura estática del
  fragmento realizada. No se ejecutó una prueba de interacción en navegador.
- Se generó una envoltura de previsualización local del boceto; no es un bundle
  Expo. No se generaron bundles de la aplicación.
- Revisión visual web: pendiente; el control de navegador informó que no hay
  un navegador disponible en esta sesión.
- Teléfono físico, OCR, contraste renderizado, foco y prueba con participantes:
  pendientes. No se presentan resultados de usabilidad todavía.
