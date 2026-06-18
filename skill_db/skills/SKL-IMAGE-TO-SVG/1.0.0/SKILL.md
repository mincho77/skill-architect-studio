---
name: "Image To SVG"
description: "Convierte una imagen raster (PNG, JPG, WEBP) a SVG vectorial usando análisis visual y trazado de contornos."
version: "1.0.0"
category: "design"
tags: ["image", "svg", "vectorize", "convert", "raster"]
---

## Descripción

Recibe una imagen en formato raster (PNG, JPG, WEBP) y la convierte a SVG vectorial.
El proceso analiza la imagen, detecta contornos, regiones de color y texto, y genera
un SVG limpio y escalable.

## Inputs

- image: File | Imagen de entrada en formato PNG, JPG o WEBP (requerido)
- mode: String | Modo de vectorización: "auto" | "trace" | "outline" (opcional, default: auto)
- simplify: Number | Nivel de simplificación de curvas 0-100 (opcional, default: 50)

## Outputs

- svg: String | Código SVG vectorial resultante
- width: Number | Ancho original de la imagen en píxeles
- height: Number | Alto original de la imagen en píxeles
- size_bytes: Number | Tamaño del SVG generado en bytes

## Comportamiento

1. Recibe el archivo de imagen como input
2. Detecta el formato y valida que sea PNG, JPG o WEBP
3. Analiza contornos y regiones usando el modo seleccionado
4. Genera el SVG con paths optimizados
5. Retorna el SVG como string junto a metadatos de la imagen original

## Modos

- **auto**: Detecta automáticamente el mejor modo según el contenido de la imagen
- **trace**: Trazado completo de colores y gradientes (más detallado, SVG más grande)
- **outline**: Solo contornos en blanco y negro (más limpio, SVG más pequeño)

## Referencia

Ver `reference/` para documentación de algoritmos de vectorización.

## Scripts

Ver `scripts/` para implementación del skill.
