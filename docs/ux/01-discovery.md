# Diseño de experiencia · base de trabajo

Fecha: 24 de septiembre de 2026. Estado: propuesta para probar; no describe
funcionalidades ya implementadas ni investigación de campo completada.

La estructura y las decisiones vigentes de cada pantalla están en el
[índice de pantallas](pantallas/README.md). Ese registro desarrolla este
discovery y distingue acuerdos, propuestas y puntos pendientes.

## Evidencia disponible

- Entrevista en esta conversación con quien impulsa el producto, que también
  será su primer usuario. No representa una muestra de compradores argentinos.
- Inspección del README, ROADMAP y código de captura, carrito y persistencia.
- Consulta documental de servicios comparables y guías Android.
- Todavía no hubo uso de la app en una compra real, entrevistas con otros
  compradores ni pruebas de usabilidad. Las preferencias declaradas por una
  persona no validan adopción ni comodidad de uso repetido.
- Varias soluciones surgieron de preguntas del entrevistador: se registran como
  propuestas, aunque hayan resultado atractivas al usuario.
- La revisión posterior descartó el primer boceto como referencia visual: el
  usuario lo percibió lineal, con exceso de botones y poco pensado para mobile.
  Se acordó trabajar primero estructura y wireflows, sin generar nuevo código.

## Situación inicial

La persona hace compras mensuales repartidas entre supermercados según días
de promociones bancarias. Va sola, con carrito y sin apuro. Mira el precio de
cada producto, pero no acumula mentalmente el gasto ni fija un presupuesto.
Recuerda necesidades y reconoce otras al recorrer las góndolas. Lleva el
teléfono guardado y lo consulta ocasionalmente para dudas sobre alimentos y
comidas. Usa Android, Xiaomi Mi 9T; versión de Android y configuración de
accesibilidad aún por verificar, sin inferirlas del modelo.

Al conocer un acumulado alto, quitaría productos prescindibles para llevar los
necesarios y evaluaría reemplazos más económicos. No elige siempre la marca
más barata: acepta distintas leches, pero prefiere ciertas marcas de yerba.
Carne y pollo se compran en bandejas con importe final impreso.

Hoy no compara sistemáticamente productos entre cadenas: quiere empezar a
hacerlo con precios registrados. El total y el historial propio ya justifican
el uso inicial para esta persona, incluso sin datos de otros usuarios.

## Resultados que buscamos

1. Poder revisar qué llevar antes de llegar a caja con un total inesperado.
2. Recordar qué producto convino en cada supermercado y organizar otra visita.
3. Conservar compras y consultar el gasto mensual, distinguiendo estimaciones
   de importes efectivamente pagados.

La evolución mensual de precios interesa, pero requiere comparar productos,
presentaciones y condiciones equivalentes. Un cambio en el gasto total puede
provenir de cantidades o composición de la compra: no equivale a inflación.
Un historial personal no debe presentarse como un índice general de inflación.

## Decisiones expresadas por el usuario

| Decisión | Implicación de diseño |
| --- | --- |
| Sin presupuesto fijo habitual | No pedir un límite para comenzar |
| Lista previa opcional | Poder entrar directamente a comprar |
| Necesita nombres reconocibles | Mostrar el nombre; el diseño de su corrección manual se pospuso el 26/09 |
| Precios de góndola y de envase | Admitir ambos orígenes en un mismo flujo |
| Promociones bancarias fuera del inicio | No estimar reintegros automáticos |
| Inicialmente aceptó elegir/corregir el precio; el 26/09 pospuso su editor | Conservar selección OCR sin motor de promociones; el ajuste manual complejo queda pendiente |
| Comparación desde el escaneo | Consultar alternativas sin sumar al carrito |
| Marcas aceptables según producto | Mostrar alternativas; la persona decide equivalencia |
| Pendiente de un producto elegido específicamente | Conservar marca, variante y presentación seleccionadas |
| Total del ticket opcional y editable después | Finalizar sin bloquear y completar desde historial |
| Frecuenta las mismas sucursales | Favorecer selección entre locales habituales |
| No le gusta el estilo ni la paleta actuales | Explorar otra dirección; marca/nombre aún no decididos |
| Puede probar y conseguir participantes | Preparar prueba personal y ronda con compradores reales |
| Abre la app frente al primer producto y ya eligió supermercado | Inicio rápido, sin orientar la portada a decidir dónde ir |
| Prefiere cámara protagonista y carrito resumido | Diseñar la captura alrededor del encuadre y el acumulado accesible |
| Toque o swipe del carrito deben abrir la compra completa | Pantalla de revisión propia con transición ascendente, no un bottom sheet |
| Carga manual muy secundaria | Resolver su presencia y recuperación de errores sin competir con capturar |
| El flujo actual de elegir precio y agregar le resulta adecuado | Conservar ese flujo y trabajar jerarquía y componentes |
| Quiere apartar productos sin perderlos de vista (26/09) | Excluirlos del total y reincorporarlos durante la compra para evaluar decisiones; reemplaza quitar con Deshacer fugaz |
| Apartar el producto completo es suficiente (26/09) | Afectar todas las unidades de la fila y conservar su cantidad; no diseñar apartado parcial |

## Propuestas pendientes de validación

- Organización y navegación hacia Pendientes e Historial. La barra de tres
  destinos del primer boceto no fue aprobada como estructura definitiva.
- Total compacto siempre disponible en el flujo activo; último ítem agregado
  visible y correcciones cercanas a la captura.
- La edición de nombre/precio se pospone por pedido del usuario (26/09), sin
  eliminar el editor existente. Cantidad sigue propuesta. La lectura OCR puede
  fallar; comprobar si reencuadrar alcanza. Falta decidir qué hacer con un nombre ausente;
  no está aprobado exigirlo como un nuevo paso obligatorio.
- Alternativas bajo demanda. Identificar primero el mismo producto; mostrar
  otros como posibles alternativas, no equivalencias garantizadas por OCR.
- Mostrar precio histórico, fecha, sucursal y condición. Usar «Registrado el…»
  y evitar afirmar «hoy más barato» con una observación de otra fecha.
- Definir el control para apartar/reincorporar y su posición. Está acordado
  afectar toda la cantidad del producto, de forma reversible y sin desaparecer.
  No destruye la observación; el destino de los apartados al finalizar sigue pendiente.
- Elegir sucursal una vez por compra. Permitir completarla más tarde si falta;
  no presentar ubicación desconocida como precio de toda una cadena.
- Guardar observación confirmada incluso al decidir no comprar; especificar
  ese comportamiento en el producto y verificar correcciones posteriores.

## Datos con distinto significado

| Concepto | Uso | No implica |
| --- | --- | --- |
| Observación | Precio visto, fecha, lugar, origen y condiciones | Que se compró ni que sigue vigente |
| Carrito | Productos elegidos y editables | Gasto pagado |
| Pendiente | Intención de comprar un producto en otro local | Stock ni reserva del precio |
| Compra finalizada | Ítems y total calculado conservados | Ticket confirmado |
| Total del ticket | Importe pagado ingresado por la persona | Precio pagado conocido para cada ítem ni reintegro futuro |

Si ticket y cálculo difieren, conservar ambos y mostrar la diferencia sin
repartirla artificialmente entre productos. En el gasto mensual indicar qué
compras usan ticket y cuáles estimación; evitar contar ambos totales a la vez.

## Alcance propuesto por incrementos

Esto complementa el ROADMAP técnico, sin reemplazarlo ni aprobar sus cambios.

### A · Validar una compra completa

Captura, recuperación ante errores, cantidad, total, revisión del carrito,
apartar/reincorporar, contexto de sucursal, cierre y recuperación de la compra.
El diseño del editor de nombre/precio se pospuso el 26/09; no confundir esa
prioridad de diseño con una garantía de OCR infalible o la eliminación de
funciones existentes. El acceso manual ante fallos sigue por resolver.
Total del ticket opcional en el cierre y después. Probar el flujo existente
como referencia antes de implementar todas estas mejoras.

### B · Usar el historial para decidir

Consulta de precios, comparación desde la captura y pendientes por sucursal,
con productos concretos y procedencia visible. Requiere reglas de identidad de
producto: el descriptor OCR actual no asegura coincidencia entre escaneos.

### C · Evolución posterior

Contribuciones de otros usuarios, sincronización consentida, automatización de
promociones bancarias y análisis de tendencias con metodología explícita.
Las consultas a IA sobre comidas son contexto de uso, no una función acordada.

## Promociones manuales: detalle a resolver

Elegir un precio detectado no resuelve todas las ofertas. Para 2×1 o segunda
unidad con descuento, explorar un ajuste del importe del grupo de unidades,
con cantidad visible. No exigir dividir mentalmente ni introducir fracciones
de centavo. Conservar la condición y distinguir precio regular, importe
ajustado y precio comparable; no publicar un ajuste personal como precio
regular de una unidad. La mecánica exacta requiere un prototipo específico.

## Referencias consultadas

Consulta documental del 24/09/2026; no se probaron estas apps ni se verificó su
desempeño real. Sus páginas comerciales no prueban resultados para nuestro
público. No se trasladan porcentajes publicitarios de ahorro a esta app.

| Fuente | Evidencia publicada | Aplicación al diseño (inferencia) |
| --- | --- | --- |
| [Listonic: total](https://listonic.com/features/total-cost) | Total de lista y memoria de precios | Mostrar el acumulado con su detalle; sumar no es una diferenciación suficiente |
| [Bring: funciones](https://www.getbring.com/en/features) | Listas, organización y planificación compartida | Los pendientes deben recuperar una intención concreta de compra |
| [Precios Claros](https://www.preciosclaros.gob.ar/) | Precios por punto de venta, comparación y condiciones | Sucursal, fecha y condiciones son contexto relevante |
| [Android: accesibilidad](https://developer.android.com/guide/topics/ui/accessibility/apps) | Objetivos táctiles de al menos 48 dp y criterios de contraste | Acciones cómodas, tipografía adaptable y verificación con TalkBack |
| [NN/g: tareas de prueba](https://www.nngroup.com/articles/task-scenarios-usability-testing/) | Escenarios realistas sin indicar el control a usar | Observar decisiones y errores sin enseñar el recorrido durante la prueba |

## Dirección visual para explorar

La exploración inicial usó superficies neutras con acento azul o ciruela.
El usuario consideró desacertado el concepto de interfaz y pidió trabajar los
roles, la jerarquía y las estrategias mobile antes del tratamiento visual.
Esa exploración fue descartada. La
[dirección visual vigente](visual/v1/README.md) desarrolla la composición A
con Lexend Deca, petróleo, lima y superficies tonales. El usuario aceptó
continuar por este camino provisionalmente, pero aclaró que aún no lo convence
del todo: no hay aprobación definitiva del acabado ni validación de usabilidad.
Mantener «a mano» provisionalmente; el rechazo del estilo no se interpreta como
una solicitud de cambiar el nombre.

- Evitar tarjetas anidadas y párrafos de ayuda repetidos durante cada captura.
- Mantener nombres, importes y acciones con contraste suficiente, también en
  modo oscuro y texto ampliado. El color nunca expresa por sí solo un estado.
- Controles de al menos 48 dp en Android; respetar navegación del sistema,
  teclado, áreas seguras y foco accesible. No diseñar a partir de píxeles físicos
  del Xiaomi ni dar por validada compatibilidad por su nombre comercial.
- Mostrar el total completo en ARS; no abreviar una cifra necesaria para decidir.
- La comparación es secundaria a agregar; no abrir alternativas automáticamente
  en cada captura. Mostrar su disponibilidad sin prometer precios actuales.
- No pedir cuentas, ubicación automática ni preferencias por categoría para la
  primera prueba. Sin dependencias nuevas para explorar la propuesta.

El HTML de la exploración descartada se retiró durante la limpieza. Se conserva
su aprendizaje —evitar una experiencia lineal de formulario—, no un segundo
prototipo que pueda confundirse con el diseño vigente. La base de decisiones
son los documentos por pantalla y la lámina visual enlazada arriba.
