# Logotipo — Guía de Estilo de Documentos SURA

Fuente: Manual de uso del logotipo de Seguros SURA.

El logotipo corporativo de Seguros SURA es el activo de identidad más importante y debe colocarse de forma precisa en todos los informes, reportes y propuestas.

---

## 1. Variantes de Logotipo Disponibles

El skill incluye cuatro variantes oficiales en la carpeta `assets/logo/`:

1. **Logotipo Completo Azul** (`logo-sura-full-azul.svg`):
   - El logotipo oficial compuesto por el símbolo (el cóndor estilizado) y la palabra SURA en azul.
   - **Uso**: Fondos blancos o claros. Es la variante principal para la portada de los documentos.
2. **Logotipo Completo Blanco** (`logo-sura-full-blanco.svg`):
   - **Uso**: Exclusivamente sobre fondos oscuros (como una portada institucional en Azul oscuro `#00003F`).
3. **Símbolo Azul** (`logo-sura-symbol-azul.svg`):
   - Únicamente el cóndor estilizado.
   - **Uso**: Ideal para el encabezado de las páginas interiores en documentos densos o reportes multipágina, ahorrando espacio vertical.
4. **Símbolo Blanco** (`logo-sura-symbol-blanco.svg`):
   - **Uso**: Para encabezados o marcas de agua en páginas interiores de tema oscuro.

---

## 2. Reglas de Colocación y Alineación

### En la Portada
- **Ubicación**: Esquina superior izquierda (`top: 30px; left: 30px;` en maquetación HTML).
- **Variante**: Logotipo Completo Azul (`logo-sura-full-azul.svg`).
- **Tamaño**: Altura fija de **40 px** (el ancho se escala proporcionalmente).

### En las Páginas Interiores (Encabezados)
- **Ubicación**: Esquina superior derecha del encabezado de página.
- **Variante**: Símbolo Azul (`logo-sura-symbol-azul.svg`) o Logotipo Completo Azul en tamaño reducido.
- **Tamaño**: Altura fija de **24 px**.
- **Alineación**: Alineado con el margen derecho del texto del cuerpo.

---

## 3. Área de Respeto (Márgenes de Seguridad)

Para garantizar la visibilidad del logotipo, se debe mantener un espacio libre a su alrededor igual al **50% de la altura del propio logo**.
- Para la portada (alto 40 px): Espacio libre mínimo de **20 px** en todas las direcciones.
- Para el encabezado (alto 24 px): Espacio libre mínimo de **12 px** en todas las direcciones.

Ningún texto, línea divisoria, número o elemento gráfico puede invadir esta área de respeto.

---

## 4. Restricciones de Uso (Guardrails)

- **Prohibido alterar colores**: No cambies los colores del SVG ni apliques filtros de color (como `hue-rotate` o `invert`).
- **Prohibida la distorsión**: El redimensionamiento debe mantener siempre la relación de aspecto original (siempre usa `height` fijo y `width: auto` en CSS/HTML).
- **Fondo de Contraste**: Nunca coloques el logotipo completo azul sobre un fondo con contraste insuficiente (ej. fondos grises intermedios o amarillos oscuros).
