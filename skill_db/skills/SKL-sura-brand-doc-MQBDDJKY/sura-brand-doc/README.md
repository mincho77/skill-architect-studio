# sura-brand-doc

Skill del sistema de diseño corporativo de **Seguros SURA** para la generación y auditoría de **documentos escritos, informes técnicos y propuestas**. Aplica los lineamientos de la marca SURA (colores corporativos, tipografía Sura Sans, portadas estándar, cabeceras/pies de página, tablas limpias y jerarquía estructurada) en dos modos:

- **GENERAR** — crea un informe o plantilla de documento nuevo en Markdown, HTML de impresión o pautas para Word/DOCX respetando la marca.
- **AUDITAR** — toma un informe existente y lo ajusta a la marca con un reporte de cambios detallado.

La especificación completa de comportamiento vive en [`SKILL.md`](SKILL.md).

---

## Estructura del paquete

```
sura-brand-doc/
├── SKILL.md            # Definición e instrucciones del skill (lo que lee la IA)
├── README.md           # Este archivo
├── NOTICE              # Derechos de autor y autoría
├── requirements.txt    # Dependencias Python
├── reference/          # Pautas del sistema de documentos
│   ├── generales/      # Colores, tipografía, logo, redacción…
│   └── documento.md    # Estructura del documento (portada, tablas, alertas, márgenes)
├── scripts/
│   └── validate_document.py  # Script de validación de marca y formato en Python
└── assets/
    ├── fonts/          # Sura Sans (ttf / woff / woff2)
    ├── logo/           # Logos oficiales SURA (azul / blanco)
    └── icons/          # Catálogo de íconos corporativos (para callouts y listas)
```

---

## Instalación

1. Copia la carpeta `sura-brand-doc/` en el directorio de skills de tu agente de desarrollo.
2. Instala las dependencias del script de validación si es necesario:
   ```bash
   pip install -r requirements.txt
   ```

---

## Uso rápido

### Validación automática de un documento (HTML o Markdown)

```bash
python scripts/validate_document.py --input report.html
```

El script analizará si el documento cumple con:
- Presencia de la tipografía Sura Sans.
- No contiene emojis o íconos no autorizados.
- Utiliza la paleta cromática canónica de SURA.
- Contiene márgenes y tablas de acuerdo al manual de marca.

---

© Seguros SURA. Desarrollado en la Dirección de Aceleración de Capacidades. Ver [`NOTICE`](NOTICE) para los términos de uso corporativos.
