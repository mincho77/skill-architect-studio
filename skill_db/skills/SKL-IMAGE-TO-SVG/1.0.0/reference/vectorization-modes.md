# Modos de Vectorización

## auto
Analiza el contenido de la imagen y elige el modo más adecuado.
- Logos, íconos → trace
- Fotografías → outline

## trace
Trazado completo con colores. Usa potrace en modo color con múltiples capas.
Genera SVGs más grandes pero más fieles al original.

## outline
Solo contornos. Convierte la imagen a escala de grises y traza los bordes.
SVG más limpio, ideal para siluetas e íconos.

## Referencias
- potrace: http://potrace.sourceforge.net/
- svgo: https://github.com/svg/svgo
- sharp: https://sharp.pixelplumbing.com/
