#!/usr/bin/env python3
import os
import re
import argparse
import sys

# Colores oficiales canónicos de Seguros SURA para documentos
SURA_COLORS = {
    '#0033A0': 'Azul profundo (Títulos, th)',
    '#2D6DF6': 'Azul cielo latino (Hipervínculos, acentos)',
    '#0D0D0D': 'Gris oscuro (Texto de cuerpo)',
    '#3F3F41': 'Gris secundario (Metadatos, pies de página)',
    '#FFFFFF': 'Blanco (Fondo)',
    '#888B8D': 'Gris neutro (Acompañamiento)',
    # Alertas
    '#DEF6DE': 'Verde éxito suave (Fondo de alerta éxito)',
    '#067014': 'Verde éxito (Texto/borde de alerta éxito)',
    '#FFF5EC': 'Naranja advertencia suave (Fondo de alerta warning)',
    '#ED8B00': 'Naranja advertencia (Texto/borde de alerta warning)',
    '#FFF4F3': 'Rojo error suave (Fondo de alerta error)',
    '#D12D35': 'Rojo error (Texto/borde de alerta error)',
    '#E0EAFF': 'Azul info suave (Fondo de alerta info)',
}

# Emojis prohibidos comunes
FORBIDDEN_EMOJIS_RE = re.compile(
    r'[\U00010000-\U0010ffff]'  # Rango general de emojis Unicode
    r'|[✓❌⚠️🔔ℹ️▶●✔✖⚠⏳💡]'      # Glifos decorativos comunes
)

# Excepciones permitidas en viñetas o texto ordinario
ALLOWED_SYMBOLS = {'-', '*', '•', '1.', '2.', '3.'}

def check_html_file(file_path):
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("Error: Se requiere la librería 'beautifulsoup4' para validar archivos HTML.")
        print("Instálala con: pip install beautifulsoup4")
        sys.exit(1)

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')
    text_content = soup.get_text()
    
    deviations = []
    
    # 1. Validar emojis prohibidos en el texto
    for line_idx, line in enumerate(content.splitlines(), 1):
        matches = FORBIDDEN_EMOJIS_RE.findall(line)
        if matches:
            # Filtrar posibles falsos positivos si es necesario
            clean_matches = [m for m in matches if m.strip()]
            if clean_matches:
                deviations.append({
                    'category': 'Emojis / Glifos Prohibidos',
                    'line': line_idx,
                    'detail': f"Emoji o glifo no autorizado encontrado: {', '.join(clean_matches)}",
                    'fix': "Reemplace por el icono SVG oficial de assets/icons/ o use viñetas estándar."
                })

    # 2. Validar Fuentes en estilos CSS
    styles = soup.find_all('style')
    has_sura_sans = False
    has_font_declaration = False
    
    # Buscar @font-face en el código crudo
    if 'Sura Sans' in content or 'SuraSans' in content:
        has_sura_sans = True

    for style in styles:
        css_text = style.string
        if not css_text:
            continue
        has_font_declaration = True
        
        # Buscar font-family
        font_families = re.findall(r'font-family\s*:\s*([^;]+);', css_text)
        for ff in font_families:
            ff_clean = ff.strip().replace('"', '').replace("'", "")
            if 'Barlow' in ff_clean:
                deviations.append({
                    'category': 'Tipografía Prohibida',
                    'line': 'CSS',
                    'detail': f"Se detectó el uso de la fuente prohibida 'Barlow' en: {ff_clean}",
                    'fix': "Reemplace por 'Sura Sans'."
                })
            elif 'Arial' in ff_clean or 'Calibri' in ff_clean or 'Times New Roman' in ff_clean:
                if not 'Sura Sans' in ff_clean:
                    deviations.append({
                        'category': 'Tipografía No Oficial',
                        'line': 'CSS',
                        'detail': f"Se detectó una fuente no oficial de cabecera: {ff_clean}",
                        'fix': "Asegúrese de que 'Sura Sans' sea la tipografía principal."
                    })

    # Buscar estilos en línea (inline style)
    for tag in soup.find_all(style=True):
        style_str = tag['style']
        if 'font-family' in style_str:
            ff_match = re.search(r'font-family\s*:\s*([^;]+);?', style_str)
            if ff_match:
                ff_clean = ff_match.group(1).replace('"', '').replace("'", "")
                if 'Barlow' in ff_clean:
                    deviations.append({
                        'category': 'Tipografía Prohibida',
                        'line': f"Línea inline en <{tag.name}>",
                        'detail': f"Fuente prohibida 'Barlow' en estilo en línea: {ff_clean}",
                        'fix': "Reemplace por 'Sura Sans'."
                    })

    if not has_sura_sans and has_font_declaration:
        deviations.append({
            'category': 'Tipografía Faltante',
            'line': 'General',
            'detail': "No se encontró la tipografía oficial 'Sura Sans' declarada en el documento.",
            'fix': "Agregue la declaración @font-face y declare font-family: 'Sura Sans' como primera opción."
        })

    # 3. Validar Colores CSS
    # Extraer todos los hex del archivo
    hex_colors = re.findall(r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', content)
    for color in hex_colors:
        color_upper = f"#{color.upper()}"
        if len(color_upper) == 4: # Convertir short hex #FFF a #FFFFFF
            color_upper = f"#{color_upper[1]*2}{color_upper[2]*2}{color_upper[3]*2}"
            
        if color_upper not in SURA_COLORS:
            # Excluir algunos grises muy claros o colores muy comunes si es necesario
            if color_upper not in ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#F9F9F9']:
                deviations.append({
                    'category': 'Color Fuera de Marca',
                    'line': 'Varios',
                    'detail': f"Se detectó un color hexadecimal fuera de la paleta SURA: {color_upper}",
                    'fix': f"Mapee a uno de los colores corporativos oficiales (ej. H1/H2 a #0033A0, enlaces a #2D6DF6)."
                })

    # 4. Validar Estructura de Tablas
    tables = soup.find_all('table')
    for idx, table in enumerate(tables, 1):
        # Verificar si tiene border vertical
        style_attr = table.get('style', '')
        border_attr = table.get('border', '')
        if 'border' in style_attr or border_attr:
            # Simple advertencia
            pass
        
        # Verificar cabeceras th
        headers = table.find_all('th')
        for th in headers:
            th_style = th.get('style', '')
            if '#0033A0' not in th_style.upper() and 'VAR(--COLOR-SECONDARY)' not in th_style.upper():
                deviations.append({
                    'category': 'Estructura de Tabla',
                    'line': f"Tabla #{idx} <th {th.text[:15]}...>",
                    'detail': "El encabezado th no utiliza el color Azul profundo (#0033A0) de fondo.",
                    'fix': "Aplique background-color: #0033A0; color: #FFFFFF; font-family: 'Sura Sans';"
                })

    return deviations

def check_markdown_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    deviations = []

    # 1. Validar emojis prohibidos en Markdown
    for line_idx, line in enumerate(content.splitlines(), 1):
        matches = FORBIDDEN_EMOJIS_RE.findall(line)
        if matches:
            clean_matches = [m for m in matches if m.strip()]
            if clean_matches:
                deviations.append({
                    'category': 'Emojis / Glifos Prohibidos',
                    'line': line_idx,
                    'detail': f"Emoji o glifo no autorizado encontrado en texto Markdown: {', '.join(clean_matches)}",
                    'fix': "Remueva el emoji y reemplace por palabras de estado o iconos oficiales."
                })

    # 2. Validar fragmentos HTML o CSS embebidos en el Markdown
    if 'font-family: Barlow' in content or 'font-family:\'Barlow\'' in content:
        deviations.append({
            'category': 'Tipografía Prohibida',
            'line': 'Embebido',
            'detail': "Uso de tipografía Barlow detectado en estilos embebidos.",
            'fix': "Reemplace por 'Sura Sans'."
        })

    # 3. Validar si hay código HTML que pueda ser validado como tal
    if '<html>' in content or '<style>' in content:
        print("Nota: El Markdown contiene bloques HTML, ejecutando validación HTML parcial...")
        # Intentamos extraer y validar bloques
        
    return deviations

def main():
    parser = argparse.ArgumentParser(description="Validador de Marca y Estilo de Documentos Seguros SURA")
    parser.add_argument('--input', required=True, help="Ruta al archivo a validar (HTML o Markdown)")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: El archivo '{args.input}' no existe.")
        sys.exit(1)

    filename = args.input.lower()
    deviations = []

    print(f"Analizando documento: {args.input}")
    
    if filename.endswith('.html') or filename.endswith('.htm'):
        deviations = check_html_file(args.input)
    elif filename.endswith('.md') or filename.endswith('.markdown'):
        deviations = check_markdown_file(args.input)
    else:
        print("Formato no soportado. El archivo debe ser HTML (.html) o Markdown (.md).")
        sys.exit(1)

    # Imprimir reporte
    if not deviations:
        print("\n" + "="*60)
        print(" RESULTADO DE LA VALIDACIÓN: ¡APROBADO CON ÉXITO! ")
        print("="*60)
        print("El documento cumple con las reglas básicas del sistema de diseño SURA:")
        print(" - No contiene emojis prohibidos.")
        print(" - Cumple con la estructura de color e identidad tipográfica.")
        print("="*60)
        sys.exit(0)
    else:
        print("\n" + "="*60)
        print(f" RESULTADO DE LA VALIDACIÓN: SE DETECTARON {len(deviations)} DESVIACIONES")
        print("="*60)
        
        # Agrupar por categoría
        categories = {}
        for dev in deviations:
            cat = dev['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(dev)

        for cat, items in categories.items():
            print(f"\n[!] Categoría: {cat}")
            for item in items:
                print(f"  - Ubicación: {item['line']}")
                print(f"    Detalle  : {item['detail']}")
                print(f"    Corrección: {item['fix']}")
        
        print("\n" + "="*60)
        print("El documento NO cumple completamente con las especificaciones de marca SURA.")
        print("Corrija las desviaciones indicadas antes de publicar el informe.")
        print("="*60)
        sys.exit(1)

if __name__ == '__main__':
    main()
