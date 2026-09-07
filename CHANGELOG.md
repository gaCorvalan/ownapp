# Changelog

Cambios relevantes de Ownapp. Se sigue la convención de
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Calculadora del supermercado con carga manual, edición de productos,
  cantidades y total estimado en pesos argentinos.
- Guardado local de la compra para recuperarla al volver a abrir la app.
- Lecturas simuladas de etiquetas: precio único, promoción con dos precios
  y lectura fallida. Cada precio requiere confirmación antes de sumarse.
- Eliminación de productos y vaciado de la compra con confirmación.
- Interfaz adaptable a pantallas móviles y de escritorio.

### Changed

- Actualización de Expo SDK 54 a SDK 57 y de sus dependencias compatibles.

### Fixed

- Imports de navegación incompatibles con Expo Router desde SDK 56.
- Compatibilidad de los tipos de tema e íconos y de los hooks con las
  comprobaciones de la actualización a SDK 57.
