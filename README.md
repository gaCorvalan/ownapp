# Ownapp · Calculadora del súper

Primera entrega de una app de herramientas personales, hecha con Expo SDK 57, React Native y TypeScript. La interfaz usa «a mano» como nombre provisional.

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
- Escanear una etiqueta como acción principal y leer su texto localmente en el teléfono para detectar precios.
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
  infrastructure/shoppingStorage.ts  AsyncStorage, formato versionado y escrituras ordenadas
  infrastructure/localTextRecognizer.ts Adaptador OCR local (Vision/ML Kit)
```

El estado de la compra se administra con `useReducer`; los totales se derivan de los ítems y los importes se almacenan en centavos enteros. El dominio no depende de React ni de APIs del teléfono. Los componentes muestran datos y emiten acciones; los hooks coordinan el flujo. La portada mantiene el total y la cámara a la vista; el detalle de productos se abre bajo demanda para que la tarea repetida de capturar precios no requiera desplazarse.

AsyncStorage guarda una única compra bajo `ownapp.supermarket.shopping.v1`, local a cada instalación o navegador/origen. No hay sincronización ni cuentas. La pantalla espera a recuperar los datos antes de habilitar la compra. Si falla la lectura o el guardado, muestra un mensaje y permite reintentar. Las escrituras se serializan para no sobrescribir una compra reciente con una anterior.

## Flujo del escáner

```text
Foto o simulación → bloques de texto → candidatos → elección/confirmación → ítem de compra
```

La foto capturada se entrega al OCR local: Vision en iOS y ML Kit en Android. El reconocimiento se hace en el dispositivo; la foto no se envía a un servidor y queda temporalmente mientras la pantalla está abierta. El OCR devuelve bloques de texto con sus coordenadas. `extractPriceCandidates` reconoce importes con símbolo `$` y descarta bloques que indican precios de referencia por kilo/litro. Conserva el contexto de cada candidato. Con varios candidatos no selecciona ninguno automáticamente. La confirmación se consume una sola vez para impedir duplicados por doble toque.

Estas reglas son deliberadamente limitadas: el OCR extrae texto, pero no es un intérprete fiable de cualquier etiqueta real. El reducer, la lista, el formulario y el cálculo del total se reutilizan.

El OCR requiere una development build o una compilación de producción instalada en un teléfono; no funciona dentro de Expo Go ni en la versión web.

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
