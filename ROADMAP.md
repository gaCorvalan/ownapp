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

## Estado actual · MVP local para validar en campo

- Inicio, selección manual de sucursal y una compra abierta recuperable.
- Cámara dominante durante la compra y resumen del carrito accesible por toque o deslizamiento.
- OCR local de etiquetas y confirmación explícita del precio.
- Consulta local de observaciones desde la confirmación, con búsqueda y filtro por sucursal.
- Nombre de producto sugerido a partir del texto OCR, editable desde la compra.
- Compra local persistida, cantidades, inclusión reversible, cierre con ticket opcional e historial de compras.
- Observaciones de precio persistidas en SQLite al confirmar un escaneo o una carga manual.
- Pendientes de productos concretos por sucursal, independientes del carrito.
- Resumen mensual que distingue importes de ticket de estimaciones.
- Cola local de sincronización (`pending`), sin backend ni envío de datos.

### Límites actuales

- Las coincidencias de productos se sugieren por texto/categoría; el OCR no
  verifica identidad ni equivalencia entre presentaciones.
- El comparable calculado a partir de contenido neto leído requiere comprobación
  humana; no se usa para declarar automáticamente qué oferta conviene.
- Las promociones complejas no modifican automáticamente el total.
- Las observaciones viven sólo en el dispositivo: desinstalar la app o borrar
  sus datos las elimina.
- La navegación, cámara, OCR y accesibilidad de los nuevos recorridos aún
  requieren comprobación en un teléfono físico y con compradores.

## Fase 1 · Contexto e historial local · implementada en código

Objetivo: volver útiles los precios recolectados en el dispositivo.

1. Selección manual de supermercado y sucursal al iniciar una compra.
   - Asociar la sucursal elegida a cada nueva observación.
   - No intentar deducir el comercio por OCR en esta etapa.
2. Historial local de observaciones.
   - Mostrar producto, precio, condición, fecha, sucursal y que el dato sigue
     sólo en el dispositivo.
   - Mantener el historial aunque se vacíe el carrito.
3. Registrar cargas manuales como observaciones con origen `manual`.

Criterio de salida funcional: se pueden recuperar y revisar los precios vistos,
filtrados por sucursal, incluso después de vaciar o finalizar una compra.
Falta comprobarlo en Android con datos reales.

## Fase 2 · Comparación de precios · base local implementada

Objetivo: hacer comparables presentaciones distintas sin alterar el precio de
venta real.

- Distinguir precio por unidad, peso y volumen.
- Conservar precio por litro/kilo/unidad cuando esté publicado en la etiqueta.
- Calcular un comparable sólo cuando el contenido neto sea fiable.
- Representar cálculos con enteros o razones, sin redondeo flotante.
- Modelar promociones y precios con tarjeta como condiciones de una oferta;
  no aplicar mecánicas como 2×1 automáticamente al total sin datos suficientes.

La app muestra condición, fecha, local, precio por medida publicado y un
comparable calculado con enteros si el contenido neto fue leído. La consulta
desde el escaneo conserva la elección al volver. Todavía no se declara que dos
productos sean equivalentes ni se ordenan ofertas como si fueran precios
vigentes. Alcanzar ese criterio de fiabilidad requiere probar etiquetas reales
y resolver identidad de producto y presentaciones.

## Fase 3 · Validación en supermercado · primera prueba hecha

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

Gabriel la probó en un supermercado Día con un teléfono físico. La lectura de
etiquetas Día fallaba: 4250 se leía como 4250000, o el precio no se detectaba,
y tuvo que cargar varios a mano. Este cambio corrige esa lectura. Falta
confirmar el arreglo en el teléfono. Quedan otras mejoras que todavía no
detalló.

## Fase 4 · Sincronización y base compartida · posterior a la validación

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
