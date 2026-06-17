# Tablas (Tables) — organismo

Fuente: `Tablas.pdf` (varias páginas). Verificado contra imágenes renderizadas y
muestreo de píxeles. **Tipografía: Sura Sans. No aparece Barlow.**

## 1. Qué es

Es un componente que muestra un **registro de conjuntos de datos en filas y
columnas**. Las tablas son una manera eficiente de mostrar datos; su propósito es
**ayudar al usuario a navegar a un dato específico** para completar una tarea.
Combinan diferentes tipos de elementos (enlaces, botones, selectores, etc.) y
ofrecen acciones de clasificación, ordenado, filtrado, acciones masivas y más.

## 2. Anatomía

1. **Cabecera.**
2. **Lista de filas.**
3. **Paginador.**
4. **Columnas.**
5. **Filtros.**
6. **Selector de columnas.**
7. **Buscador.**
8. **Menú de opciones ocultas** (`⋮`).
9. **Casillas de verificación.**
10. **Ícono de acciones** (pueden cambiarse dependiendo de lo que se requiera).
11. **Celda titular de columna.**
12. **Celda de contenido.**
13. **Ícono ordenar columna.**

## 3. Construcción (medidas)

### Celda
| Elemento | Medida |
|---|---|
| Altura de celda | **48 px** |
| Ancho **mínimo** de celda | **180 px** |
| Padding **vertical** (arriba/abajo) | **8 px** |
| Paddings **horizontales** | **4 / 4 / 8 / 8 / 12 px** |

### Tipos de celdas
- **Avatar y título.**
- **Texto** (lineal).
- **Título + ícono.**
- **Avatar + título + ícono.**
- **Texto + Estatus** (badge/etiqueta).

### Iconos de acción
Descargar (`↓`), opciones (`⋮`), eliminar (papelera). Pueden cambiarse según la
acción requerida.

### Cabecera escritorio
| Elemento | Medida |
|---|---|
| Altura de cabecera | **65 px** |
| Título | a la izquierda |
| Controles (derecha) | **Filtros** (dropdown) · **Columnas** (dropdown) · **Buscador** (mediano) · **Menú** `⋮` |
| Separación entre dropdowns | **24 px** |

### Cabecera mobile
- **Título**; **Buscador** mediano (**187 px**); **Filtros** y **Columnas**
  (dropdowns) **apilados** debajo.

### Espaciados de grilla
| Elemento | Medida |
|---|---|
| Altura de cabecera de grilla | **64 px** |
| Altura de fila | **56 px** |
| Márgenes / separación (gutter) | **24 px** |
| Ancho de columnas | **Auto** |

- Casillas de verificación a la **izquierda**; cada columna lleva **ícono de
  ordenar** (`↓`); última columna para **acciones** (papelera).

## 4. Variantes

- **Scroll horizontal:** se usa cuando la cantidad de datos no se puede visualizar
  según la resolución de la pantalla del usuario.
- **Fila fijada:** la primera fila (titulares de columna) queda **fija** en la parte
  superior al hacer scroll, con **sombra** por debajo; mantiene visibilidad de las
  opciones.
- **Columna fijada:** la primera columna queda **fija** al hacer scroll horizontal.

## 5. Colores

| Rol | Hex |
|---|---|
| Título / texto de enlaces / íconos | Azul Vivo SURA `#2D6DF6` · Azul SURA `#0033A0` |
| Casilla de verificación marcada | `#2D6DF6` (muestreo `(45,109,246)`) |
| Fila **seleccionada** (tinte) | gris claro `#E4E8E9` (muestreo `(228,232,233)`) |
| Fondo de la tabla | Blanco `#FFFFFF` |
| Badge *Estatus* (texto) | azul (hereda de Etiqueta) |

> Las bandas azul/teal verticales que aparecen en las láminas son **guías de
> especificación** (gutters), no color de diseño.

## 6. Uso

- Espaciado entre **título y primer filtro**: **mínimo 24 px** cuando el título es
  largo; de lo contrario es automático. **No** usar títulos demasiado largos para
  mantener el espacio entre inputs.
- Manejar **textos cortos** en las celdas; los textos largos se **truncan con puntos
  suspensivos** (`…`).
- Usar casillas de verificación para **acciones masivas**; ícono de ordenar por
  columna para clasificar.
- En móvil, apilar Buscador + Filtros + Columnas; activar **scroll horizontal** y
  **fila/columna fijada** según el volumen de datos.

## 7. Tokens CSS

```css
:root {
  /* Celda */
  --table-cell-h: 48px;
  --table-cell-min-w: 180px;
  --table-cell-pad-y: 8px;          /* arriba/abajo */
  /* paddings horizontales: 4 / 4 / 8 / 8 / 12 px */

  /* Cabecera */
  --table-header-h: 65px;           /* cabecera del componente */
  --table-controls-gap: 24px;       /* entre dropdowns */
  --table-search-mobile-w: 187px;

  /* Grilla */
  --table-grid-header-h: 64px;
  --table-row-h: 56px;
  --table-grid-gutter: 24px;

  /* Colores */
  --table-link: #2D6DF6;            /* título / enlaces / íconos */
  --table-link-deep: #0033A0;
  --table-checkbox: #2D6DF6;        /* casilla marcada */
  --table-row-selected: #E4E8E9;    /* fila seleccionada (gris claro) */
  --table-bg: #FFFFFF;

  --font-table: 'Sura Sans', 'Helvetica Neue', Arial, sans-serif;
}
```

## 8. Reglas operativas para el skill

- Tabla = cabecera (título + Filtros/Columnas/Buscador + menú `⋮`) + grilla de filas
  con casillas de verificación a la izquierda, columnas ordenables (`↓`) y acciones
  a la derecha + paginador (ver `paginador.md`).
- Medidas: celda alto **48 px**, ancho mín **180 px**, padding vertical 8, horizontal
  4/4/8/8/12. Cabecera del componente **65 px**; grilla: cabecera **64 px**, fila
  **56 px**, gutter **24 px**.
- **5 tipos de celda**: avatar+título, texto, título+ícono, avatar+título+ícono,
  texto+estatus. Iconos de acción intercambiables (descargar/opciones/eliminar).
- Colores: enlaces/título/íconos azul `#2D6DF6`/`#0033A0`; casilla marcada `#2D6DF6`;
  fila seleccionada gris `#E4E8E9`; fondo blanco. Las bandas verticales de las
  láminas son guías, **no** color.
- Reglas: espaciado título↔primer filtro **≥24 px**; textos cortos, truncado con
  `…`. Variantes: scroll horizontal, fila fijada (con sombra), columna fijada.
- **Construir la tabla con su estructura real, no aproximarla con un grid de chips
  a mano.** Filas a la altura de grilla (**56 px**), celdas **48 px**/mín **180 px**
  con su tipo (uno de los 5: avatar+título, texto, título+ícono, avatar+título+
  ícono, texto+estatus). La columna de **estatus usa el tag de estado relleno**
  (`etiqueta.md` §6), no un punto de color. Selección de fila = tinte `#E4E8E9`
  (no cebra azul ni relleno de marca); casillas a la izquierda; ícono de ordenar
  (`↓`) por columna; acciones a la derecha. Cabecera de grilla **64 px**.
- Tipografía Sura Sans; **nunca Barlow**.

## 9. Pendiente

- [ ] Confirmar el hex exacto del badge *Estatus* y de la fila seleccionada contra
      la paleta oficial (`#E4E8E9` por muestreo).
- [ ] Confirmar el redondeo de la tabla/celdas y el grosor de la línea divisoria
      entre filas (no impreso en px).
- [ ] Confirmar el color de zebra/alternancia de filas (si existe) y el hover de
      fila — no muestreado claramente por las guías de spec superpuestas.
