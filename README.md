# Ownapp · Calculadora del súper

Primera entrega de una app de herramientas personales, hecha con Expo SDK 57, React Native y TypeScript. La interfaz usa «a mano» como nombre provisional.

La dirección del producto y las fases pendientes se detallan en
[ROADMAP.md](ROADMAP.md).

La propuesta de experiencia y sus hipótesis están en
[Diseño UX](docs/ux/01-discovery.md), con un
[plan de validación](docs/ux/02-validation-plan.md). Registran decisiones y
propuestas fechadas; el [índice de pantallas](docs/ux/pantallas/README.md)
enlaza además la implementación vigente.
La estructura y el rol de cada elemento se documentan por pantalla.
El [sistema de marca elegido para implementar](docs/ux/visual/sistema-de-marca.md)
define Lexend Deca, petróleo y lima a partir de la
[dirección visual vigente](docs/ux/visual/v2/README.md). La interfaz actual ya
usa esa paleta y tipografía en tema claro; la composición y el recorrido de las
láminas se implementan de forma incremental: inicio, selección de sucursal y
revisión reversible, cierre con ticket opcional, historial local, consulta de
precios y pendientes por sucursal ya están disponibles.

## Ejecutar

```sh
pnpm install
pnpm web
```

Para mobile, compilá la app nativa: el OCR usa un módulo que no funciona en
Expo Go. `pnpm android` y `pnpm ios` requieren el entorno nativo de cada
plataforma. La captura solicita permiso de cámara y no requiere backend.

### Instalar en un teléfono Android

Con Android Studio y el SDK configurados, activá la depuración USB, conectá el
teléfono y ejecutá:

```sh
pnpm exec expo run:android --device
```

Expo compila e instala una versión de desarrollo y arranca Metro. Mantené la
computadora accesible desde el teléfono mientras la uses. Para salir a comprar
sin Metro, compilá e instalá una versión autónoma:

```sh
pnpm exec expo run:android --device --variant release
```

Consultá la [guía de compilación local de Expo](https://docs.expo.dev/guides/local-app-development/)
antes de cambiar de variante en un teléfono que ya contiene compras.

**Datos al actualizar:** compras y sucursales se guardan con AsyncStorage;
precios observados, en SQLite; pendientes, con AsyncStorage. Todo queda en el
almacenamiento local de esta instalación, sin cuenta, sincronización ni copia
exportable. Los cambios de JavaScript servidos por Metro no borran esos datos.
Android conserva los datos al instalar una actualización aceptada de la misma
app: deben coincidir el identificador (`com.anonymous.ownapp`) y la firma, y el
código de versión no debe retroceder. Si la firma cambia, Android no la trata
como actualización. **No desinstales la app para cambiar de compilación si
querés conservar tus compras:** desinstalarla o borrar sus datos elimina el
almacenamiento local. Ver [requisitos de actualización](https://developer.android.com/google/play/app-updates)
y [almacenamiento específico de la app](https://developer.android.com/training/data-storage/app-specific).

## Qué podés probar

- Empezar una compra desde Inicio, agregar una sucursal manualmente y volver a elegirla en visitas posteriores.
- Continuar una compra abierta desde Inicio, o descartarla explícitamente para empezar otra.
- Recuperar una compra de la versión anterior sin perder sus productos, asignándole una sucursal al continuar.
- Finalizar una compra con al menos un producto incluido, conservando los apartados como «No llevaste» y el total del ticket sólo si se informa.
- Consultar compras anteriores y completar o corregir el total del ticket después.
- Consultar precios observados por producto y sucursal, con fecha, condición y precio por medida cuando existe información suficiente.
- Desde una confirmación, buscar precios guardados y volver sin perder la elección actual.
- Guardar un producto observado como pendiente para otra sucursal, y quitarlo después sin afectar el carrito.
- Agregar un precio manualmente con nombre opcional y cantidad; el precio también queda registrado como observación local.
- Editar nombre, precio y cantidad; sumar/restar unidades, apartar productos del total y reincorporarlos.
- Vaciar la compra con confirmación, eliminando tanto incluidos como apartados.
- Recuperar la compra después de cerrar y volver a abrir la app.
- Escanear una etiqueta como acción principal y leer su texto localmente en el teléfono para detectar precios y un nombre de producto sugerido.
- Elegir explícitamente entre precio regular y precio condicionado a una tarjeta, ajustar la cantidad y confirmar el subtotal antes de sumar.
- Resolver una lectura fallida con carga manual.

Los importes se ingresan en pesos argentinos: `3450`, `3450,50` o `3.450,50`. La coma separa los centavos. Cada ítem admite entre 1 y 99 unidades y un precio de hasta $ 1.000.000; cada compra admite 100 ítems. El total es una estimación, sin descuentos ni cálculo por peso.

## Separación de responsabilidades

```text
app/index.tsx                         Inicio
app/purchase.tsx                      Ruta de compra
app/finish.tsx                        Cierre de compra
app/history/                          Lista y detalle de compras guardadas
app/prices.tsx                        Historial local de precios y comparación contextual
app/pending.tsx                       Pendientes por sucursal
src/features/supermarket/
  ui/                                 Inicio, compra, lista, escáner y formularios
  application/useShoppingSession.tsx  Estado compartido y coordinación del guardado
  application/usePriceScanner.ts      Lectura, elección y confirmación de candidatos
  domain/shopping.ts                  Ítems, acciones, validación y totales
  domain/price.ts                     Conversión de importes y candidatos de precio
  domain/product.ts                   Descriptor inicial y normalización de productos OCR
  domain/priceObservation.ts          Precio elegido, condiciones y referencia por unidad
  domain/priceComparison.ts           Búsqueda y precio comparable conservador
  domain/pending.ts                   Intenciones de compra por sucursal
  domain/purchaseSession.ts           Sesión activa, compras guardadas y migraciones
  domain/store.ts                     Sucursal manual
  infrastructure/shoppingStorage.ts  AsyncStorage, formato versionado y escrituras ordenadas
  infrastructure/storeStorage.ts     Sucursales guardadas localmente
  infrastructure/priceObservationStorage.ts SQLite local y cola de sincronización
  infrastructure/pendingStorage.ts   Pendientes locales en AsyncStorage
  infrastructure/localTextRecognizer.ts Adaptador OCR local (Vision/ML Kit)
```

El estado de la compra se comparte entre Inicio y la pantalla de captura; las acciones de ítems pasan por un reducer puro. Los totales se derivan sólo de los ítems incluidos y los importes se almacenan en centavos enteros. Apartar conserva el ítem completo, su cantidad y su precio para reincorporarlo sin volver a escanear. El dominio no depende de React ni de APIs del teléfono. La cámara ocupa el área principal y el resumen del carrito permanece en la base; tocarlo o deslizarlo hacia arriba abre la revisión a pantalla completa.

AsyncStorage guarda la compra abierta y las finalizadas juntas bajo `ownapp.supermarket.shopping.v3`, y las sucursales manuales bajo `ownapp.supermarket.stores.v1`, local a cada instalación o navegador/origen. Los formatos `shopping.v2` y `shopping.v1` se recuperan sin perder ítems; las compras `v1` piden sucursal al continuar. El cierre se escribe en una sola operación para no vaciar la compra antes de guardar su historial. No hay sincronización ni cuentas. Inicio espera la lectura antes de habilitar la compra. Si falla la lectura o el guardado, muestra un mensaje y permite reintentar. Las escrituras se serializan para no sobrescribir un cambio reciente con uno anterior.

El estimado de una compra finalizada se sigue calculando desde sus ítems incluidos. El importe del ticket, cuando se informa, se guarda por separado y puede agregarse después sin alterar los precios de los productos. Una compra vacía o con todos los productos apartados no puede finalizarse por ahora; se conserva abierta para revisarla o descartarla explícitamente.

Cada precio confirmado desde una etiqueta o ingresado manualmente también se registra en SQLite local como una observación independiente de la compra: conserva producto cuando se conoce, importe, sucursal elegida, condición detectada, precio por medida publicado cuando es inequívoco y fecha de captura. Las observaciones anteriores conservan su sucursal desconocida. Al mismo tiempo se agrega a una cola local pendiente de sincronización; esta versión no tiene backend ni envía datos fuera del dispositivo. Vaciar o descartar la compra no elimina esas observaciones.

«Precios guardados» permite buscar y filtrar esas observaciones por sucursal. Desde una confirmación se abre con una búsqueda sugerida por categoría o nombre; al volver, la elección sin agregar sigue disponible. Un precio por litro/kilo/unidad se muestra como publicado si estaba en la etiqueta, o calculado con enteros a partir del contenido neto leído. Es una referencia histórica, no una oferta vigente ni una equivalencia de productos garantizada por OCR. Los pendientes guardan un producto concreto y una sucursal de destino; no suman al carrito ni reservan el precio observado. Si sólo hay una sucursal, puede agregarse otra al crear el pendiente.

El historial de compras muestra un resumen por mes. Cada compra aporta una sola cifra: el ticket informado o, si falta, el total estimado. Se indica cuántos importes de cada origen componen el mes; no se presenta como inflación ni como gasto confirmado cuando faltan tickets.

## Flujo del escáner

```text
Foto → bloques de texto → candidatos → elección/confirmación → ítem de compra
```

La foto capturada se entrega al OCR local: Vision en iOS y ML Kit en Android. El reconocimiento se hace en el dispositivo; la foto no se envía a un servidor y queda temporalmente mientras la pantalla está abierta. El OCR devuelve bloques de texto con sus coordenadas. `extractPriceCandidates` reconoce importes con símbolo `$` y descarta bloques que indican precios de referencia por kilo/litro. Conserva el contexto de cada candidato. Con varios candidatos no selecciona ninguno automáticamente; con uno, lo preselecciona, pero todavía requiere tocar Agregar. La cantidad elegida multiplica el subtotal mostrado sin alterar el carrito hasta confirmar. La confirmación se consume una sola vez para impedir duplicados por doble toque.

Estas reglas son deliberadamente limitadas: el OCR extrae texto, pero no es un intérprete fiable de cualquier etiqueta real. El reducer, la lista, el formulario y el cálculo del total se reutilizan.

El OCR requiere una development build o una compilación de producción instalada en un teléfono; no funciona dentro de Expo Go ni en la versión web. A partir del texto reconocido, la app conserva localmente un descriptor inicial (texto de etiqueta, categoría y contenido cuando los detecta) y propone un nombre legible. Es una sugerencia: puede corregirse desde el detalle de compra y no reemplaza una base de productos o código de barras.

## Verificación

Requiere Node 22.6 o superior para ejecutar las pruebas de TypeScript sin un runner adicional.

```sh
pnpm typecheck
pnpm lint
pnpm test
```

GitHub Actions ejecuta esos tres comandos en cada pull request y en cada push a `main`.

Las pruebas cubren importes argentinos, centavos, entradas inválidas, precios por kilo, promociones, cálculos, edición, cantidades, identidad de productos, migraciones, exclusión reversible del total, cierre con ticket opcional, precios comparables y resúmenes mensuales.

Recorrido manual sugerido:

1. Desde Inicio, tocar «Empezar compra», cancelar el panel y comprobar que no se creó una compra.
2. Agregar supermercado y referencia; comprobar que abre la cámara con la sucursal indicada.
3. Cargar `Leche`, precio `1500,50`, cantidad `2`: total $ 3.001,00. Incrementar a 3 unidades y editar el precio a `1600`: total $ 4.800,00.
4. Volver a Inicio, continuar la compra y luego cerrar y reabrir la app: se conserva el total y se ofrece continuar, sin entrar automáticamente.
5. En un teléfono físico con una development build, permitir la cámara, capturar una etiqueta nítida, elegir el precio detectado, ajustar la cantidad y confirmar. Antes de Agregar, el total del resumen no debe cambiar; después debe sumar el subtotal y volver a cámara. Al enviar la app al fondo, la vista previa se libera; al volver, puede abrirse de nuevo.
6. Probar una lectura sin precio: ofrece reintento y carga manual.
7. En «Ver compra», apartar un producto con varias unidades: la fila y su cantidad siguen visibles, pero el total y el recuento de incluidos bajan. Reincorporarlo y comprobar que recupera el subtotal original. Volver a capturar y reabrir la compra; el estado debe persistir al reiniciar la app.
8. Abrir «Finalizar compra», dejar el ticket vacío y guardar: el detalle conserva incluidos y «No llevaste»; Inicio muestra la última compra con «Total estimado». Completar después el ticket desde el detalle y comprobar que muestra «Total del ticket» sin cambiar el estimado.
9. Probar un ticket inválido y un cierre con todos los productos apartados: no se guarda ni desaparece la compra. Volver con Atrás desde el cierre y comprobar que el borrador del ticket sigue escrito.
10. Tocar «Empezar otra compra», cancelar el descarte y comprobar que sigue intacta. Elegir finalizar la anterior o confirmar el descarte; después se puede elegir una sucursal nueva.
11. Registrar un precio manual con nombre, abrir «Precios guardados» y comprobar fecha, sucursal y origen manual; vaciar el carrito y verificar que la observación sigue allí.
12. Desde una confirmación OCR, abrir «Consultar precios guardados», filtrar por sucursal y volver: la selección pendiente debe seguir intacta y el total no debe haber cambiado.
13. Guardar un producto observado para otra sucursal (agregándola si hace falta), consultar «Pendientes» y quitarlo. Su precio debe figurar como observado en una fecha, sin sumarse a la compra.

También conviene verificar teclado, áreas seguras, tamaño de texto y persistencia en un teléfono físico antes de la siguiente entrega.
