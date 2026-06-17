# Colores — Guía de Estilo de Documentos SURA

Fuente: Manual de marca de Seguros SURA, sección de colores digitales y accesibilidad.

El uso del color en documentos escritos e informes técnicos debe priorizar la **legibilidad, la sobriedad y el contraste**.

---

## 1. Colores Principales del Documento

| Nombre | HEX | Uso en Documentos |
|---|---|---|
| **Azul profundo** | `#0033A0` | Títulos principales (H1, H2, H3), encabezados de tabla, bordes destacados de cajas. |
| **Azul cielo latino** | `#2D6DF6` | Vínculos hipertexto, acentos secundarios, íconos de viñeta. |
| **Gris de texto** | `#0D0D0D` | Color predeterminado para cuerpo de texto y párrafos generales. |
| **Gris secundario** | `#3F3F41` | Subtítulos pequeños, metadatos, autoría, pies de página. |
| **Blanco** | `#FFFFFF` | Fondo principal de las páginas del documento. |

---

## 2. Paleta para Cajas de Alerta y Resaltado (Callouts)

Estas combinaciones tienen fondos muy suaves y texto/bordes saturados para asegurar un contraste óptimo.

| Tipo de Alerta | Color de Texto y Borde | Color de Fondo (Suave) |
|---|---|---|
| **Éxito (Success)** | `#067014` | `#DEF6DE` |
| **Advertencia (Warning)** | `#ED8B00` | `#FFF5EC` |
| **Error / Peligro (Danger)** | `#D12D35` | `#FFF4F3` |
| **Información / Nota (Info)** | `#0033A0` | `#E0EAFF` |

> ⚠️ **Restricción**: Estos colores son exclusivos para cajas de notas, alertas o resaltados de estado. No se deben utilizar como colores de fondo de página completa ni para el texto ordinario del documento.

---

## 3. Reglas de Proporción Cromática en Documentos (60/30/10)

Para mantener la seriedad de los informes de SURA, el color se aplica con la siguiente proporción visual:
- **90%** del documento debe ser en **Blanco (fondo) y Negro/Gris oscuro (texto)**.
- **8%** en **Azul profundo y Azul cielo** para títulos, cabeceras de tablas y llamadas a la acción.
- **2%** en **Amarillo sol o colores de alerta** para notas, advertencias o destacados muy específicos.

---

## 4. Accesibilidad y Contraste (WCAG 2.1)

Todos los textos de los informes deben cumplir con la relación de contraste **AA** de WCAG 2.1:
- **Cuerpo de texto**: Contraste mínimo de **4.5:1** contra el fondo.
- **Textos grandes (títulos)**: Contraste mínimo de **3:1** contra el fondo.

### Combinaciones seguras en SURA (Pasan AA):
- Texto `#0033A0` (Azul profundo) sobre fondo blanco `#FFFFFF` (10.6:1).
- Texto `#0D0D0D` (Negro) sobre fondo blanco `#FFFFFF` (21:1).
- Texto `#067014` (Verde éxito) sobre fondo `#DEF6DE` (6.2:1).
- Texto `#D12D35` (Rojo error) sobre fondo `#FFF4F3` (5.1:1).
- Texto `#0033A0` (Azul info) sobre fondo `#E0EAFF` (8.8:1).
