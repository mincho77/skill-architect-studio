# Tipografía — Guía de Estilo de Documentos SURA

Fuente: Manual de marca de Seguros SURA, sección de tipografía corporativa.

La tipografía oficial de Seguros SURA es **Sura Sans**. Su aplicación en documentos (PDF, informes impresos, reportes técnicos, actas) debe seguir una jerarquía limpia para facilitar la lectura de textos largos.

---

## 1. Familia Tipográfica y Fallbacks

- **Familia principal**: `Sura Sans`
- **Declaración CSS**: `font-family: 'Sura Sans', 'Helvetica Neue', Arial, sans-serif;`
- **Fuentes prohibidas**: Barlow (prohibición estricta), Arial, Calibri, Times New Roman, Calibri o cualquier fuente comercial no autorizada como tipografía principal.

---

## 2. Escala Tipográfica de Documentos (Base 16px)

| Estilo Documental | Equivalencia CSS | Peso | Tamaño | Altura de Línea (line-height) | Uso en Informes |
|---|---|---|---|---|---|
| **Título de Portada** | `h1.cover` | Negrita (700) | 32 px / 2.0 rem | 38 px | Título principal en la portada. |
| **Subtítulo de Portada** | `.subtitle.cover` | Regular (400) | 18 px / 1.125 rem | 24 px | Datos de autoría, área y fecha. |
| **Título Principal** | `h1` | Negrita (700) | 24 px / 1.5 rem | 28 px | Título de secciones principales. |
| **Título Secundario** | `h2` | Negrita (700) | 18 px / 1.125 rem | 22 px | Subtítulos de segundo nivel. |
| **Título Terciario** | `h3` | Seminegrita (600) | 16 px / 1.0 rem | 20 px | Subtítulos de tercer nivel. |
| **Cuerpo de Texto** | `p`, `li` | Regular (400) | 15 px / 0.9375 rem | 1.5 (22 px) | Párrafos generales y listas del texto. |
| **Énfasis de Cuerpo** | `strong`, `b` | Seminegrita (600) | 15 px / 0.9375 rem | 1.5 (22 px) | Resaltado en línea de conceptos clave. |
| **Tablas y Datos** | `th`, `td` | Regular (400) / Seminegrita (600) | 13 px / 0.8125 rem | 1.4 (18 px) | Celdas y encabezados de tablas. |
| **Metadato y Pie** | `.footer`, `.caption` | Regular (400) | 12 px / 0.75 rem | 1.3 (16 px) | Pies de página, números de página, notas al pie. |

---

## 3. Reglas de Formato e Interlineado

1. **Alineación de Texto**: El cuerpo de texto principal en documentos debe alinearse **a la izquierda** o **justificado con cuidado** (evitando grandes huecos entre palabras). Para HTML de impresión, se recomienda alineación izquierda (`text-align: left;`) para mayor legibilidad en pantallas y papel.
2. **Espaciado entre Párrafos**: Utiliza un margen inferior en los párrafos de aproximadamente `12px` a `16px` para separar visualmente las ideas. Evita el uso de sangrías al inicio de los párrafos.
3. **Control de Viudas y Huérfanas**: En CSS de impresión, evita que queden líneas sueltas al principio o final de las páginas usando:
   ```css
   p, li {
     orphans: 3;
     widows: 3;
   }
   ```
4. **Instalación de la Fuente**: Para la compilación automatizada a PDF (ej. usando herramientas basadas en Chromium o WeasyPrint), se debe registrar la fuente `assets/fonts/SuraSans-Variable.ttf` en el sistema.
