# Changelog

Cambios relevantes de Ownapp. Se sigue la convención de
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Inicio con acceso a empezar o continuar una única compra abierta, selección de sucursal y alta manual con supermercado y referencia libre.
- Asociación de los nuevos precios escaneados con la sucursal elegida.
- Observaciones de precio locales en SQLite y una cola de sincronización pendiente: cada precio confirmado conserva su fecha, contexto de condición y referencia publicada por litro/kilo/unidad cuando es inequívoca, sin enviar datos a un servidor.
- Detección local de un descriptor de producto a partir del texto OCR: conserva el texto de la etiqueta, normaliza contenido en mililitros/gramos/unidades cuando es posible y propone un nombre editable para la compra.
- Calculadora del supermercado con carga manual, edición de productos,
  cantidades y total estimado en pesos argentinos.
- Guardado local de la compra para recuperarla al volver a abrir la app.
- Eliminación de productos y vaciado de la compra con confirmación.
- Interfaz adaptable a pantallas móviles y de escritorio.
- Captura temporal de etiquetas con cámara, marco de encuadre, vista previa y OCR local: Vision en iOS y ML Kit en Android detectan texto sin enviar fotos a un servidor; los precios detectados siguen requiriendo confirmación.

### Changed

- La compra local pasa al formato versionado `shopping.v2`; recupera los ítems de `shopping.v1` y solicita asignar sucursal antes de continuar una compra anterior.
- Empezar otra compra requiere descartar explícitamente la abierta; las observaciones de precios ya registradas se conservan.
- La interfaz existente usa la paleta clara petróleo/lima y Lexend Deca en
  cámara, confirmación, carrito y edición, con colores y estilos de texto
  compartidos. El inicio mantiene el tema claro mientras se diseña el oscuro.
- Corregir el nombre de un producto escaneado ahora actualiza el descriptor persistido y marca su nombre como una corrección manual, sin perder el texto OCR original.
- La portada de compra ahora prioriza el escaneo de precios: muestra el total y la cámara directamente, reconoce cada captura sin una confirmación intermedia y vuelve a encuadrar después de agregar un precio; el detalle editable queda bajo demanda.
- El escáner ahora usa exclusivamente capturas de cámara y OCR local; se
  eliminaron las lecturas simuladas y sus etiquetas de demostración.
- Actualización de Expo SDK 54 a SDK 57 y de sus dependencias compatibles.

### Fixed

- Imports de navegación incompatibles con Expo Router desde SDK 56.
- Compatibilidad de los tipos de tema e íconos y de los hooks con las
  comprobaciones de la actualización a SDK 57.
