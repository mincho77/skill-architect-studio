# sura-brand-ui

Skill del sistema de diseño corporativo de **Seguros SURA** para interfaces
gráficas. Aplica la marca (colores, tipografía Sura Sans, componentes Atomic
Design, modo oscuro, accesibilidad AA) en dos modos:

- **GENERAR** — diseña una pantalla nueva desde una descripción y entrega un
  **PNG** + especificaciones de marca.
- **AUDITAR** — toma código existente (HTML/CSS/SCSS/JSX/TSX/Vue/Angular/
  Tailwind/styled-components) y lo ajusta a la marca con un reporte de cambios.

La especificación completa de comportamiento vive en [`SKILL.md`](SKILL.md).

---

## Estructura del paquete

```
sura-brand-ui/
├── SKILL.md            # Definición e instrucciones del skill (lo que lee la IA)
├── README.md           # Este archivo
├── NOTICE              # Derechos de autor y autoría
├── requirements.txt    # Dependencias Python
├── reference/          # Sistema de diseño (Atomic Design)
│   ├── generales/      # Colores, tipografía, grillas, logo, modo oscuro, redacción…
│   ├── atomos/         # Botones, radios, interruptores, inputs, íconos…
│   ├── moleculas/      # Campos, tarjetas, pestañas, modales, toast, listas…
│   └── organismos/     # Tablas, footer, menú navegador, banners
├── scripts/
│   └── render_mockup.py  # Render SVG/HTML → PNG (CLI)
└── assets/
    ├── fonts/          # Sura Sans (ttf / woff / woff2)
    ├── logo/           # Logo de marca
    ├── icons/          # Catálogo de íconos
    ├── illustrations/  # Catálogo de ilustraciones
    └── shapes/         # Formas y destacados
```

---

## Instalación

### 1. Ubicar la carpeta del skill según el harness

| Harness | Ruta de instalación |
|---|---|
| Claude Code (personal) | `~/.claude/skills/sura-brand-ui/` |
| Claude Code (proyecto) | `<repo>/.claude/skills/sura-brand-ui/` |
| Cowork (OneDrive personal) | `Documents/Cowork/skills/sura-brand-ui/` |

Copia la carpeta completa (con `assets/` y `reference/`) en la ruta elegida.

### 2. Dependencias Python

```bash
pip install -r requirements.txt
```

- `cairosvg` — render SVG → PNG (ruta canónica del skill).
- `Pillow` — redimensionado en la ruta de render HTML.

### 3. Dependencias del sistema (no se instalan con pip)

| Dependencia | Comando | Necesidad |
|---|---|---|
| fontconfig | `fc-cache` | **Obligatoria** — registra Sura Sans antes de renderizar |
| LibreOffice | `soffice` | Opcional — solo para render de mockups en HTML |
| poppler | `pdftoppm` | Opcional — solo para render de mockups en HTML |

### 4. Registrar la fuente Sura Sans (una vez por sesión)

cairosvg resuelve la fuente vía **fontconfig**, no por ruta. Antes de renderizar:

```python
import shutil, subprocess, os
dst = os.path.expanduser('~/.fonts')
os.makedirs(dst, exist_ok=True)
shutil.copy('assets/fonts/SuraSans-Variable.ttf', f'{dst}/SuraSans-Variable.ttf')
subprocess.run(['fc-cache', '-f', dst], check=True)
```

Luego, en el SVG declara `font-family="Sura Sans"` con `font-weight` 400/600/700.

---

## Uso rápido

**Render de un mockup SVG a PNG:**

```bash
python scripts/render_mockup.py --input working/mockup.svg --output output/mockup.png
```

**Render desde HTML (requiere LibreOffice + poppler):**

```bash
python scripts/render_mockup.py --input working/mockup.html \
  --output output/mockup.png --width 1440 --height 900
```

En una IA con auto-descubrimiento de skills (Claude Code, apps de Claude, Agent
SDK), basta con pedir: *"diseña la pantalla de login con la marca SURA"* o
*"audita este componente a la marca SURA"* y el skill se activa solo.

---

## Notas

- **Tipografía:** Sura Sans es la única oficial. Barlow está prohibida.
- **Color:** el valor hex manda sobre el nombre impreso; ver
  `reference/generales/colores.md`.
- **Modo oscuro:** se deriva solo con la receta de
  `reference/generales/modo-oscuro.md` (token `#00003F`, resto derivado y
  verificado AA).
- **Marca:** el skill respeta la identidad; no inventa logos ni assets nuevos.

---

© Seguros SURA. Desarrollado en la Dirección de Aceleración de Capacidades por
Alejandro Jimenez Zapata y Mauricio Otalvaro Ospina. Ver [`NOTICE`](NOTICE) para
los términos de uso.
