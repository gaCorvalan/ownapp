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
láminas se implementa de forma incremental: inicio y selección de sucursal ya
están disponibles; cierre e historial siguen pendientes.

## Ejecutar

```sh
pnpm install
pnpm web
```

Para mobile: `pnpm start` y abrir el proyecto en un cliente de Expo compatible con SDK 57. También están disponibles `pnpm android` y `pnpm ios` si tenés el entorno nativo configurado. La captura de etiquetas solicita permiso de cámara y no requiere backend.

## Qué podés probar

- Empezar una compra desde Inicio, agregar una sucursal manualmente y volver a elegirla en visitas posteriores.
- Continuar una compra abierta desde Inicio, o descartarla explícitamente para empezar otra.
- Recuperar una compra de la versión anterior sin perder sus productos, asignándole una sucursal al continuar.
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
app/index.tsx                         Inicio
app/purchase.tsx                      Ruta de compra
src/features/supermarket/
  ui/                                 Inicio, compra, lista, escáner y formularios
  application/useShoppingSession.tsx  Estado compartido y coordinación del guardado
  application/usePriceScanner.ts      Lectura, elección y confirmación de candidatos
  domain/shopping.ts                  Ítems, acciones, validación y totales
  domain/price.ts                     Conversión de importes y candidatos de precio
  domain/product.ts                   Descriptor inicial y normalización de productos OCR
  domain/priceObservation.ts          Precio elegido, condiciones y referencia por unidad
  domain/purchaseSession.ts           Sesión activa y migración de compra anterior
  domain/store.ts                     Sucursal manual
  infrastructure/shoppingStorage.ts  AsyncStorage, formato versionado y escrituras ordenadas
  infrastructure/storeStorage.ts     Sucursales guardadas localmente
  infrastructure/priceObservationStorage.ts SQLite local y cola de sincronización
  infrastructure/localTextRecognizer.ts Adaptador OCR local (Vision/ML Kit)
```

El estado de la compra se comparte entre Inicio y la pantalla de captura; las acciones de ítems pasan por un reducer puro. Los totales se derivan de los ítems y los importes se almacenan en centavos enteros. El dominio no depende de React ni de APIs del teléfono. La pantalla de compra mantiene el total y la cámara a la vista; el detalle de productos se abre bajo demanda.

AsyncStorage guarda una sola compra abierta bajo `ownapp.supermarket.shopping.v2` y las sucursales manuales en `ownapp.supermarket.stores.v1`, local a cada instalación o navegador/origen. Las compras previas guardadas en `shopping.v1` se recuperan con sus ítems intactos y piden sucursal al continuar. No hay sincronización ni cuentas. Inicio espera la lectura antes de habilitar la compra. Si falla la lectura o el guardado, muestra un mensaje y permite reintentar. Las escrituras de compra se serializan para no sobrescribir un cambio reciente con uno anterior.

Cada precio confirmado desde una etiqueta también se registra en SQLite local como una observación independiente de la compra: conserva producto, importe, sucursal elegida, condición detectada, precio por medida publicado cuando es inequívoco y fecha de captura. Las observaciones anteriores conservan su sucursal desconocida. Al mismo tiempo se agrega a una cola local pendiente de sincronización; esta versión no tiene backend ni envía datos fuera del dispositivo. Vaciar o descartar la compra no elimina esas observaciones.

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

Las pruebas cubren importes argentinos, centavos, entradas inválidas, precios por kilo, promociones, cálculos, edición, cantidades, identidad de productos y migración de compra anterior.

Recorrido manual sugerido:

1. Desde Inicio, tocar «Empezar compra», cancelar el panel y comprobar que no se creó una compra.
2. Agregar supermercado y referencia; comprobar que abre la cámara con la sucursal indicada.
3. Cargar `Leche`, precio `1500,50`, cantidad `2`: total $ 3.001,00. Incrementar a 3 unidades y editar el precio a `1600`: total $ 4.800,00.
4. Volver a Inicio, continuar la compra y luego cerrar y reabrir la app: se conserva el total y se ofrece continuar, sin entrar automáticamente.
5. En un teléfono físico con una development build, permitir la cámara, capturar una etiqueta nítida, tocar «Leer etiqueta», elegir el precio detectado y confirmarlo. Al enviar la app al fondo, la vista previa se libera; al volver, puede abrirse de nuevo.
6. Probar una lectura sin precio: ofrece reintento y carga manual.
7. Tocar «Empezar otra compra», cancelar el descarte y comprobar que sigue intacta. Confirmar el descarte y comprobar que se puede elegir una sucursal nueva.

También conviene verificar teclado, áreas seguras, tamaño de texto y persistencia en un teléfono físico antes de la siguiente entrega.
