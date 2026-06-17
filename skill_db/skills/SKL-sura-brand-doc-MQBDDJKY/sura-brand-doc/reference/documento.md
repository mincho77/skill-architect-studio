# Estructura y Maquetación de Documentos Corporativos SURA

Esta guía describe detalladamente los componentes estructurales que constituyen un informe o documento formal de Seguros SURA, garantizando un acabado premium y profesional.

---

## 1. Geometría y Configuración de Página

Para documentos impresos o exportados a PDF, la configuración de página debe seguir las siguientes dimensiones físicas (definidas mediante CSS de impresión):

- **Tamaño de Papel**: Carta (`Letter`, 215.9 mm × 279.4 mm) o A4 (210 mm × 297 mm).
- **Márgenes**: **2.54 cm** (1 pulgada) en los cuatro bordes de forma predeterminada.
  - *Excepción*: Si el documento se va a encuadernar físicamente, el margen izquierdo debe ser de **3.0 cm** y los demás de 2.0 cm.
- **Evitar Desbordes**: Todo el contenido debe fluir dentro de la caja de impresión. Ningún texto o tabla puede sobresalir horizontalmente.

```css
@page {
  size: letter;
  margin: 2.54cm;
}
```

---

## 2. La Portada Corporativa (Cover Page)

Todos los informes de más de 3 páginas deben incluir una portada limpia y de alta calidad visual.

### Elementos de la Portada:
1. **Cabecera**: Logotipo Completo Azul (`logo-sura-full-azul.svg`) con altura de 40 px alineado a la izquierda.
2. **Cuerpo Central**:
   - **Título Principal**: Sura Negrita (700), tamaño 32 px, color Azul profundo (`#0033A0`). Espaciado superior generoso (~80 px).
   - **Subtítulo / Bajada**: Sura Regular (400), tamaño 18 px, color Gris (`#888B8D`).
3. **Pie de Portada**:
   - Bloque de metadatos alineado a la izquierda (Autor, Área/Dirección, Fecha de creación).
   - Una **franja decorativa inferior** de 4 px de grosor en color Azul cielo latino (`#2D6DF6`) o Amarillo sol (`#E3E829`) para dar el toque de marca.

---

## 3. Encabezados y Pies de Página (Páginas Interiores)

- **Encabezado (Header)**:
  - Texto a la izquierda: Nombre del informe o sección actual (Sura Regular, 12 px, color `#888B8D`).
  - Logo a la derecha: Símbolo Azul (`logo-sura-symbol-azul.svg`) con altura de 20 px.
  - Una línea divisoria inferior de 1 px de grosor en `#E7E7E7`.
- **Pie de Página (Footer)**:
  - Texto a la izquierda: "Seguros SURA — Confidencial".
  - Texto a la derecha: Número de página en formato **"Página X de Y"** (dinámico en CSS de impresión o motor PDF).
  - Una línea divisoria superior de 1 px de grosor en `#E7E7E7`.

---

## 4. Estilos de Títulos y Cuerpo (Jerarquía)

Para estructurar los capítulos y subsecciones de un reporte:

- **H1 (Título de Sección)**:
  - Sura Negrita (700), tamaño 24 px, color Azul profundo (`#0033A0`).
  - Margen superior: 24 px. Margen inferior: 12 px.
  - *Detalle de marca*: Se puede agregar una línea de acento inferior (subrayado decorativo) de 3 px de grosor en color Amarillo sol (`#E3E829`) con ancho del 15% del título.
- **H2 (Subsección)**:
  - Sura Negrita (700), tamaño 18 px, color Azul cielo latino (`#2D6DF6`) o Azul profundo (`#0033A0`).
  - Margen superior: 18 px. Margen inferior: 8 px.
- **H3 (Detalle)**:
  - Sura Seminegrita (600), tamaño 16 px, color Negro (`#0D0D0D`).
- **Párrafos (`p`)**:
  - Sura Regular (400), tamaño 15 px, color Negro (`#0D0D0D`), interlineado 1.5, margen inferior 12 px.

---

## 5. Tablas de Datos Corporativos

Las tablas en informes técnicos deben ser limpias, de alto contraste y legibilidad.

- **Estructura**:
  - `border-collapse: collapse; width: 100%;`
  - Relleno de celda (`padding`): **10 px (vertical) y 12 px (horizontal)**.
  - Bordes: Línea horizontal de `1px solid #E7E7E7` en cada fila. Sin bordes verticales.
- **Encabezado (`th`)**:
  - Fondo Azul profundo (`#0033A0`).
  - Texto Blanco (`#FFFFFF`), Sura Seminegrita (600), tamaño 13 px.
  - Alineación: Izquierda para texto, derecha para valores numéricos.
- **Filas (`tr`)**:
  - Fondo predeterminado: Blanco (`#FFFFFF`).
  - **Fila Cebra (Opcional)**: En tablas muy anchas, se permite alternar con un fondo gris extremadamente claro (`#F8F8F8`) en filas impares. **Prohibido usar tonos celestes o azules para las filas cebra**.

---

## 6. Cajas de Notas y Alertas (Callouts)

Se utilizan para destacar información especial (consejos, advertencias, errores o éxitos).

- **Estructura Común**:
  - Relleno interno (`padding`): 16 px.
  - Borde izquierdo sólido: 4 px de grosor. Sin bordes en los otros tres lados.
  - Redondeado: `border-radius: 0 8px 8px 0;` (el borde izquierdo queda recto con la barra).
- **Tipos de Cajas**:
  1. **Nota / Información**:
     - Fondo: `#E0EAFF` (Azul info suave). Borde izquierdo: `#0033A0` (Azul profundo).
     - Ícono: `info.svg`. Título: "Nota" o "Información" en `#0033A0`.
  2. **Consejo / Éxito**:
     - Fondo: `#DEF6DE` (Verde éxito suave). Borde izquierdo: `#067014` (Verde éxito).
     - Ícono: `check-circulo.svg`. Título: "Recomendación" o "Hecho" en `#067014`.
  3. **Advertencia**:
     - Fondo: `#FFF5EC` (Naranja advertencia suave). Borde izquierdo: `#ED8B00` (Naranja).
     - Ícono: `exclamacion.svg`. Título: "Atención" o "Advertencia" en `#ED8B00`.
  4. **Error / Restricción**:
     - Fondo: `#FFF4F3` (Rojo error suave). Borde izquierdo: `#D12D35` (Rojo error).
     - Ícono: `equis-circulo.svg`. Título: "Importante" o "Error" en `#D12D35`.

---

## 7. Saltos de Página y Control de Flujo

Para asegurar que el documento se divida lógicamente al exportar a PDF, se deben usar selectores de salto de página antes de cada sección H1 o apéndice importante.

```css
h1 {
  page-break-before: always;
  break-before: page;
}
/* Evitar saltos de página a mitad de una tabla o caja de alerta */
table, blockquote, .callout {
  page-break-inside: avoid;
  break-inside: avoid;
}
```
