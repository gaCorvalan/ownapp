# Ownapp · Calculadora del súper

Primera entrega de una app de herramientas personales, hecha con Expo SDK 57, React Native y TypeScript. La interfaz usa «a mano» como nombre provisional.

La dirección del producto y las fases pendientes se detallan en
[ROADMAP.md](ROADMAP.md).

La propuesta de experiencia y sus hipótesis están en
[Diseño UX](docs/ux/01-discovery.md), con un
[plan de validación](docs/ux/02-validation-plan.md). Son documentos de diseño;
no describen funcionalidades ya implementadas.
La estructura, el rol de cada elemento y las decisiones vigentes se documentan
por separado en el [índice de pantallas](docs/ux/pantallas/README.md).
El [sistema de marca elegido para implementar](docs/ux/visual/sistema-de-marca.md)
define Lexend Deca, petróleo y lima a partir de la
[dirección visual vigente](docs/ux/visual/v2/README.md). La interfaz actual ya
usa esa paleta y tipografía en tema claro; la composición y el recorrido de las
láminas todavía no están implementados.

## Ejecutar

```sh
pnpm install
pnpm web
```

Para mobile: `pnpm start` y abrir el proyecto en un cliente de Expo compatible con SDK 57. También están disponibles `pnpm android` y `pnpm ios` si tenés el entorno nativo configurado. La captura de etiquetas solicita permiso de cámara y no requiere backend.

## Qué podés probar

- Agregar un precio manualmente con nombre opcional y cantidad.
- Editar nombre, precio y cantidad; sumar/restar unidades y eliminar productos.
- Vaciar la compra con confirmación.
- Recuperar la compra después de cerrar y volver a abrir la app.
- Escanear una etiqueta como acción principal y leer su texto localmente en el teléfono para detectar precios y un nombre de producto sugerido.
- Elegir explícitamente entre precio regular y precio condicionado a una tarjeta.
- Resolver una lectura fallida con carga manual.

Los importes se ingresan en pesos argentinos: `3450`, `3450,50` o `3.450,50`. La coma separa los centavos. Cada ítem admite entre 1 y 99 unidades y un precio de hasta $ 1.000.000; cada compra admite 100 ítems. El total es una estimación, sin descuentos ni cálculo por peso.

## Separación de responsabilidades

```text
app/index.tsx                         Ruta de entrada
src/features/supermarket/
  ui/                                 Pantalla, lista, total, escáner y formulario
  application/useShoppingSession.ts   Estado de compra y coordinación del guardado
  application/usePriceScanner.ts      Lectura, elección y confirmación de candidatos
  domain/shopping.ts                  Ítems, acciones, validación y totales
  domain/price.ts                     Conversión de importes y candidatos de precio
  domain/product.ts                   Descriptor inicial y normalización de productos OCR
  domain/priceObservation.ts          Precio elegido, condiciones y referencia por unidad
  infrastructure/shoppingStorage.ts  AsyncStorage, formato versionado y escrituras ordenadas
  infrastructure/priceObservationStorage.ts SQLite local y cola de sincronización
  infrastructure/localTextRecognizer.ts Adaptador OCR local (Vision/ML Kit)
```

El estado de la compra se administra con `useReducer`; los totales se derivan de los ítems y los importes se almacenan en centavos enteros. El dominio no depende de React ni de APIs del teléfono. Los componentes muestran datos y emiten acciones; los hooks coordinan el flujo. La portada mantiene el total y la cámara a la vista; el detalle de productos se abre bajo demanda para que la tarea repetida de capturar precios no requiera desplazarse.

AsyncStorage guarda una única compra bajo `ownapp.supermarket.shopping.v1`, local a cada instalación o navegador/origen. No hay sincronización ni cuentas. La pantalla espera a recuperar los datos antes de habilitar la compra. Si falla la lectura o el guardado, muestra un mensaje y permite reintentar. Las escrituras se serializan para no sobrescribir una compra reciente con una anterior.

Cada precio confirmado desde una etiqueta también se registra en SQLite local como una observación independiente de la compra: conserva producto, importe, condición detectada, precio por medida publicado cuando es inequívoco y fecha de captura. Al mismo tiempo se agrega a una cola local pendiente de sincronización; esta versión no tiene backend ni envía datos fuera del dispositivo. Vaciar la compra no elimina esas observaciones.

## Flujo del escáner

```text
Foto o simulación → bloques de texto → candidatos → elección/confirmación → ítem de compra
```

La foto capturada se entrega al OCR local: Vision en iOS y ML Kit en Android. El reconocimiento se hace en el dispositivo; la foto no se envía a un servidor y queda temporalmente mientras la pantalla está abierta. El OCR devuelve bloques de texto con sus coordenadas. `extractPriceCandidates` reconoce importes con símbolo `$` y descarta bloques que indican precios de referencia por kilo/litro. Conserva el contexto de cada candidato. Con varios candidatos no selecciona ninguno automáticamente. La confirmación se consume una sola vez para impedir duplicados por doble toque.

Estas reglas son deliberadamente limitadas: el OCR extrae texto, pero no es un intérprete fiable de cualquier etiqueta real. El reducer, la lista, el formulario y el cálculo del total se reutilizan.

El OCR requiere una development build o una compilación de producción instalada en un teléfono; no funciona dentro de Expo Go ni en la versión web. A partir del texto reconocido, la app conserva localmente un descriptor inicial (texto de etiqueta, categoría y contenido cuando los detecta) y propone un nombre legible. Es una sugerencia: puede corregirse desde el detalle de compra y no reemplaza una base de productos o código de barras.

## Verificación

Requiere Node 22.6 o superior para ejecutar las pruebas de TypeScript sin un runner adicional.

```sh
pnpm typecheck
pnpm lint
pnpm test
```

Las pruebas cubren importes argentinos, centavos, entradas inválidas, precios por kilo, promociones, cálculos, edición, cantidades e identidad de productos.

Recorrido manual sugerido:

1. Cargar `Leche`, precio `1500,50`, cantidad `2`: total $ 3.001,00.
2. Incrementar a 3 unidades: total $ 4.501,50.
3. Editar precio a `1600`: total $ 4.800,00.
4. Recargar y verificar que se mantiene la compra.
5. En un teléfono físico con una development build, permitir la cámara, capturar una etiqueta nítida, tocar «Leer etiqueta», elegir el precio detectado y confirmarlo. Al enviar la app al fondo, la vista previa se libera; al volver, puede abrirse de nuevo.
6. Probar una lectura sin precio: ofrece reintento y carga manual.
7. Cancelar el vaciado, luego confirmarlo y recargar: la compra queda vacía.

También conviene verificar teclado, áreas seguras, tamaño de texto y persistencia en un teléfono físico antes de la siguiente entrega.
