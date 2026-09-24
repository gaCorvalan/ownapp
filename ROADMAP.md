# Roadmap · a mano

Este documento registra la dirección del producto y los próximos incrementos.
No reemplaza al `CHANGELOG.md`, que sólo describe cambios ya realizados.

## Principios

- El scanner y el total de compra son el flujo principal.
- La app funciona sin conexión y guarda primero en el dispositivo.
- Los importes se representan en centavos enteros; los totales provienen de
  los ítems de la compra.
- Una observación de precio no es lo mismo que un ítem del carrito: el carrito
  es temporal y editable; la observación representa un precio visto en una
  fecha y condición determinadas.
- El OCR propone datos, pero no sustituye la confirmación de la persona.

## Estado actual · MVP de campo

- Cámara y scanner disponibles en la portada.
- OCR local de etiquetas y confirmación explícita del precio.
- Nombre de producto sugerido a partir del texto OCR, editable desde la compra.
- Compra local persistida, cantidades, edición y total estimado.
- Observaciones de precio persistidas en SQLite local al confirmar un escaneo.
- Cola local de sincronización (`pending`), sin backend ni envío de datos.

### Límites actuales

- No hay selección de supermercado o sucursal.
- No existe pantalla de historial para consultar las observaciones guardadas.
- El precio por litro/kilo se conserva si fue publicado en la etiqueta; todavía
  no se calcula un comparable cuando falta.
- Las promociones complejas no modifican automáticamente el total.
- La carga manual todavía no genera una observación de precio.
- Las observaciones viven sólo en el dispositivo: desinstalar la app o borrar
  sus datos las elimina.

## Fase 1 · Contexto e historial local

Objetivo: volver útiles los precios recolectados en el dispositivo.

1. Selección manual de supermercado al iniciar una compra.
   - Asociar supermercado y, más adelante, sucursal a cada observación.
   - No intentar deducir el comercio por OCR en esta etapa.
2. Historial local de observaciones.
   - Mostrar producto, precio, condición, fecha, supermercado y estado de
     sincronización.
   - Mantener el historial aunque se vacíe el carrito.
3. Registrar cargas manuales como observaciones con origen `manual`.

Criterio de salida: una persona puede recuperar y revisar los precios que vio
en sus compras anteriores, filtrados por supermercado.

## Fase 2 · Comparación de precios

Objetivo: hacer comparables presentaciones distintas sin alterar el precio de
venta real.

- Distinguir precio por unidad, peso y volumen.
- Conservar precio por litro/kilo/unidad cuando esté publicado en la etiqueta.
- Calcular un comparable sólo cuando el contenido neto sea fiable.
- Representar cálculos con enteros o razones, sin redondeo flotante.
- Modelar promociones y precios con tarjeta como condiciones de una oferta;
  no aplicar mecánicas como 2×1 automáticamente al total sin datos suficientes.

Criterio de salida: la app puede explicar si un precio es regular, condicionado
o promocional, y comparar de forma fiable productos equivalentes.

## Fase 3 · Validación en supermercado

Objetivo: comprobar que el MVP local permite completar una compra real y que
los datos capturados tienen el contexto necesario para evolucionar.

- Probar una compra mediana en un teléfono físico con development build.
- Comparar el total estimado con el ticket antes de descuentos bancarios.
- Registrar etiquetas ilegibles, nombres incorrectos, precios ambiguos y casos
  de productos por peso.
- Verificar que las observaciones SQLite sobreviven al cierre de la app y al
  vaciado del carrito.

Criterio de salida: se puede completar una compra sin abandonar el flujo de
scanner, y las diferencias frente al ticket son explicables.

## Fase 4 · Sincronización y base compartida

Objetivo: convertir observaciones locales consentidas en datos útiles para toda
la comunidad.

- Pedir consentimiento explícito antes de enviar precios o texto OCR.
- Incorporar identidad de usuario o instalación anónima según la decisión de
  privacidad.
- Enviar la outbox de forma idempotente y con reintentos.
- Crear una API de ingestión que acepte observaciones crudas y correcciones
  manuales.
- Normalizar en el backend supermercados, sucursales, productos, variantes,
  presentaciones y ofertas.
- Mantener las observaciones crudas separadas de las identidades canónicas:
  una lectura OCR no debe declarar por sí sola un producto global definitivo.

La outbox local ya existe para facilitar esta fase, pero no se construirá un
backend antes de validar el modelo local con compras reales.

Criterio de salida: los precios pueden sincronizarse con seguridad y el
backend puede agrupar observaciones equivalentes sin perder su procedencia.

## Decisiones abiertas

- Alcance geográfico y primer conjunto de supermercados.
- Si se solicitará cuenta, o se usará una identidad anónima por instalación.
- Política de retención, exportación y borrado de datos locales/sincronizados.
- Cuándo incorporar escaneo de código de barras para mejorar la identificación
  de productos.
- Qué evidencia, además del texto OCR, se permitirá enviar al backend.
