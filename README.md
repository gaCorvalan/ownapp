# Ownapp · Calculadora del súper

Primera entrega de una app de herramientas personales, hecha con Expo SDK 54, React Native y TypeScript. La interfaz usa «a mano» como nombre provisional.

## Ejecutar

```sh
pnpm install
pnpm web
```

Para mobile: `pnpm start` y abrir el proyecto en un cliente de Expo compatible con SDK 54. También están disponibles `pnpm android` y `pnpm ios` si tenés el entorno nativo configurado. Esta entrega no solicita permisos de cámara ni requiere backend.

## Qué podés probar

- Agregar un precio manualmente con nombre opcional y cantidad.
- Editar nombre, precio y cantidad; sumar/restar unidades y eliminar productos.
- Vaciar la compra con confirmación.
- Recuperar la compra después de cerrar y volver a abrir la app.
- Simular una lectura y confirmar el precio antes de sumarlo.
- Elegir explícitamente entre precio regular y precio condicionado a una tarjeta.
- Resolver una lectura fallida con carga manual.

La demo entrega bloques de texto inventados: **no analiza la imagen de la etiqueta dibujada ni abre la cámara**. Los productos de ejemplo que confirmes se guardan en la misma compra que los manuales. Se pueden eliminar desde la lista.

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
  infrastructure/mockTextRecognizer.ts  Tres respuestas de ejemplo
```

El estado de la compra se administra con `useReducer`; los totales se derivan de los ítems y los importes se almacenan en centavos enteros. El dominio no depende de React ni de APIs del teléfono. Los componentes muestran datos y emiten acciones; los hooks coordinan el flujo.

AsyncStorage guarda una única compra bajo `ownapp.supermarket.shopping.v1`, local a cada instalación o navegador/origen. No hay sincronización ni cuentas. La pantalla espera a recuperar los datos antes de habilitar la compra. Si falla la lectura o el guardado, muestra un mensaje y permite reintentar. Las escrituras se serializan para no sobrescribir una compra reciente con una anterior.

## Flujo del escáner

```text
Simular lectura → bloques de texto → candidatos → elección/confirmación → ítem de compra
```

`extractPriceCandidates` reconoce importes con símbolo `$` y descarta bloques que indican precios de referencia por kilo/litro. Conserva el contexto de cada candidato. Con varios candidatos no selecciona ninguno automáticamente. La confirmación se consume una sola vez para impedir duplicados por doble toque.

Estas reglas son deliberadamente limitadas a los ejemplos: no representan todavía un intérprete fiable de etiquetas reales. La próxima entrega debe conectar capturas reales a un adaptador de OCR y ampliar los bloques con sus coordenadas. El reducer, la lista, el formulario y el cálculo del total se reutilizan.

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
5. Simular precio único: el total no cambia hasta confirmar; agrega $ 3.450,00.
6. Probar promoción: exige elegir entre $ 5.800,00 y $ 4.640,00.
7. Probar sin lectura: ofrece reintento y carga manual.
8. Cancelar el vaciado, luego confirmarlo y recargar: la compra queda vacía.

También conviene verificar teclado, áreas seguras, tamaño de texto y persistencia en un teléfono físico antes de la siguiente entrega.
