# Modo AUDITAR — Ajustar Documentos Existentes a la Marca SURA

Este documento detalla el flujo de trabajo para evaluar y corregir un informe, reporte, propuesta o especificación técnica **ya redactado** (en Markdown, HTML, o DOCX) para asegurar que cumple de forma rigurosa con los lineamientos de Seguros SURA.

El objetivo de la auditoría es ajustar los aspectos formales, estilísticos y de maquetación **sin alterar el contenido lógico, los datos o la intención del texto**.

---

## 1. Flujo de Auditoría (Orden Fijo)

1. **Recibir el documento**: Lee el archivo Markdown, HTML o texto del informe.
2. **Inventariar estructuras**: Identifica qué partes componen el documento (¿Tiene portada? ¿Índice? ¿Tablas? ¿Cajas de notas?).
3. **Inventariar desviaciones**: Contrasta cada sección contra las especificaciones del manual (`reference/`). Registra:
   - Fuentes tipográficas ajenas (Arial, Calibri, Barlow, Times New Roman).
   - Emojis o caracteres Unicode decorativos.
   - Colores fuera de la paleta corporativa (cabeceras rojas, cebra azul en tablas, etc.).
   - Estructura incorrecta de tablas o cajas de notas.
   - Ausencia de márgenes estándar, encabezados, pies de página o número de página.
4. **Mapear**: Define a qué token o estructura canónica de SURA corresponde cada desviación.
5. **Corregir**: Realiza ediciones precisas (vía CSS, HTML o Markdown) para alinear los estilos sin modificar el contenido redactado.
6. **Reportar**: Genera el reporte de cambios en el chat utilizando la estructura de la sección 4.

---

## 2. Tabla de Mapeo de Desviaciones Típicas

| Elemento Original | Acción Correctiva | Reemplazo Canónico SURA |
|---|---|---|
| Fuentes: Arial, Calibri, Barlow, Georgia | Reemplazar familia tipográfica | `'Sura Sans', 'Helvetica Neue', Arial, sans-serif` |
| Títulos en negro genérico o gris | Asignar color corporativo | Azul profundo (`#0033A0`) para H1 y H2 |
| Enlaces en azul brillante genérico (`#0000ff`) | Tokenizar enlace | Azul cielo latino (`#2D6DF6`) |
| Emojis (`✓`, `❌`, `⚠️`, `ℹ️`, `🔔`) | **Eliminar / Reemplazar** | SVG correspondiente de `assets/icons/` o viñeta estándar |
| Tablas con fondo azul/celeste cebra | Limpiar fondo de filas | Fondo blanco con fila cebra opcional en `#F8F8F8` |
| Cabecera de tabla en color genérico | Cambiar estilo de encabezado | Fondo `#0033A0`, texto blanco y Sura Seminegrita |
| Cajas de alerta con colores saturados | Suavizar paleta | Fondo suave (ej. `#FFF4F3` para error) y borde izquierdo sólido (`#D12D35`) |

---

## 3. Auditoría por Estructura Documental

- **Portada**: Si el informe supera las 3 páginas, debe crearse una portada limpia que contenga el logotipo `logo-sura-full-azul.svg` (alto 40 px), título grande en `#0033A0`, y metadatos de autoría y fecha.
- **Tablas**: Comprobar que no tengan bordes verticales. Cada fila debe separarse únicamente con una línea horizontal delgada en `#E7E7E7`.
- **Listas y viñetas**: Asegurar que las listas mantengan viñetas consistentes. Se prohíben emojis o números de colores no oficiales como viñetas.
- **Cajas de Notas y Alertas**: Verificar que todas las llamadas de atención utilicen la estructura de borde izquierdo grueso (4 px) y fondos suaves correspondientes a su estado, con sus respectivos títulos e íconos.

---

## 4. Formato del Reporte de Cambios

Al entregar un documento auditado y corregido, presenta la siguiente tabla de resumen de auditoría:

```markdown
## Reporte de Auditoría de Marca — [Nombre del Documento]

### Resumen de Cumplimiento Estructural
| Estructura | Spec Consultada | Estado | Notas |
|---|---|---|---|
| Portada | reference/documento.md | [OK / Corregido / N/A] | Detalle de lo ajustado |
| Tablas | reference/documento.md | [OK / Corregido / N/A] | Eliminación de bordes verticales y redefinición de cabeceras |
| Cajas de Alerta | reference/documento.md | [OK / Corregido / N/A] | Mapeo a los 4 tipos estándar de Sura |
| Fuentes | reference/generales/tipografia.md | Corregido | Reemplazo de Barlow por Sura Sans |

### Cambios Aplicados
| # | Ubicación | Antes | Después | Por qué |
|---|---|---|---|---|
| 1 | CSS / Estilos | font-family: Barlow; | font-family: 'Sura Sans', ... | Barlow está prohibida. Sura Sans es la oficial. |
| 2 | Tabla 1 | th { background: #4caf50; } | th { background: #0033A0; ... } | Encabezados de tabla deben ser Azul profundo. |
| 3 | Sección 2 | ⚠️ Nota Importante | [Icono info.svg] Nota Importante | Se prohíben emojis Unicode; se implementó caja callout. |

### Decisiones Pendientes (Si aplica)
- [Descripción de elementos no resueltos por falta de datos o diseño]
```
