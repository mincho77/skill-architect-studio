#!/bin/bash

# ============================================================================
# Skill Studio: Integration Script for Items 2 & 3
# Integra Python Runner Real + File Output Manager automáticamente
# ============================================================================

set -e  # Exit on error

PROJECT_ROOT="/Users/cmotalvaro/Code/Skills/skill-architect-studio"
TEMP_DIR="/tmp/skill_studio_integration"
SOURCE_DIR="/mnt/user-data/outputs"

# Colors para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES HELPER
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

check_file_exists() {
    if [ ! -f "$1" ]; then
        log_error "Archivo no encontrado: $1"
        return 1
    fi
    return 0
}

check_dir_exists() {
    if [ ! -d "$1" ]; then
        log_error "Directorio no encontrado: $1"
        return 1
    fi
    return 0
}

# ============================================================================
# VALIDACIONES PREVIAS
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     SKILL STUDIO: Integration Script (Items 2 & 3)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

log_info "Validando precondiciones..."

# 1. Verificar proyecto local
if ! check_dir_exists "$PROJECT_ROOT"; then
    log_error "Proyecto no encontrado en: $PROJECT_ROOT"
    log_info "Actualiza la ruta en el script y vuelve a intentar."
    exit 1
fi
log_success "Proyecto encontrado: $PROJECT_ROOT"

# 2. Verificar estructura de carpetas
if ! check_dir_exists "$PROJECT_ROOT/src/app"; then
    log_error "No se encontró /src/app - ¿es un proyecto Next.js moderno?"
    exit 1
fi
log_success "Estructura Next.js detectada"

# 3. Verificar Python
if ! command -v python3 &> /dev/null; then
    log_error "Python3 no encontrado en el PATH"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
log_success "Python detectado: $PYTHON_VERSION"

# 4. Verificar que existen los archivos a copiar
log_info "Verificando archivos fuente en $SOURCE_DIR..."

REQUIRED_FILES=(
    "python_runner.py"
    "api_execute_endpoint.ts"
    "example_handler.py"
    "FileOutputManager.ts"
    "api_outputs_routes.ts"
    "OutputPanel.tsx"
    "skill_chart_generator_handler.py"
    "skill_chart_generator_skill.json"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if ! check_file_exists "$SOURCE_DIR/$file"; then
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        log_success "✓ $file"
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    log_error "$MISSING_FILES archivo(s) faltante(s)"
    exit 1
fi

echo ""

# ============================================================================
# ITEM 2: PYTHON RUNNER REAL
# ============================================================================

echo -e "\n${BLUE}─────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}ITEM 2: Python Runner Real${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}\n"

# Crear directorio lib si no existe
mkdir -p "$PROJECT_ROOT/lib"

# Copiar python_runner.py
log_info "Copiando python_runner.py..."
cp "$SOURCE_DIR/python_runner.py" "$PROJECT_ROOT/lib/"
log_success "✓ python_runner.py → lib/"

# Copiar example_handler.py a templates
mkdir -p "$PROJECT_ROOT/public/templates"
log_info "Copiando example_handler.py..."
cp "$SOURCE_DIR/example_handler.py" "$PROJECT_ROOT/public/templates/"
log_success "✓ example_handler.py → public/templates/"

# Copiar API endpoint (reemplaza el anterior)
mkdir -p "$PROJECT_ROOT/src/app/api/execute"
log_info "Copiando api_execute_endpoint.ts..."
cp "$SOURCE_DIR/api_execute_endpoint.ts" "$PROJECT_ROOT/src/app/api/execute/route.ts"
log_success "✓ api_execute_endpoint.ts → src/app/api/execute/route.ts"

# ============================================================================
# ITEM 3: FILE OUTPUT MANAGER
# ============================================================================

echo -e "\n${BLUE}─────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}ITEM 3: File Output Manager${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}\n"

# Copiar FileOutputManager.ts
log_info "Copiando FileOutputManager.ts..."
cp "$SOURCE_DIR/FileOutputManager.ts" "$PROJECT_ROOT/lib/"
log_success "✓ FileOutputManager.ts → lib/"

# Copiar API routes
mkdir -p "$PROJECT_ROOT/src/app/api/outputs"
log_info "Copiando api_outputs_routes.ts..."
cp "$SOURCE_DIR/api_outputs_routes.ts" "$PROJECT_ROOT/src/app/api/outputs/route.ts"
log_success "✓ api_outputs_routes.ts → src/app/api/outputs/route.ts"

# Copiar OutputPanel.tsx
mkdir -p "$PROJECT_ROOT/components"
log_info "Copiando OutputPanel.tsx..."
cp "$SOURCE_DIR/OutputPanel.tsx" "$PROJECT_ROOT/components/"
log_success "✓ OutputPanel.tsx → components/"

# ============================================================================
# SKILL EJEMPLO: CHART GENERATOR
# ============================================================================

echo -e "\n${BLUE}─────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}SKILL EJEMPLO: Chart Generator${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}\n"

SKILL_DIR="$PROJECT_ROOT/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0"

# Crear estructura
mkdir -p "$SKILL_DIR/scripts"

# Copiar handler
log_info "Copiando skill_chart_generator_handler.py..."
cp "$SOURCE_DIR/skill_chart_generator_handler.py" "$SKILL_DIR/scripts/handler.py"
log_success "✓ handler.py → $SKILL_DIR/scripts/"

# Copiar skill.json
log_info "Copiando skill_chart_generator_skill.json..."
cp "$SOURCE_DIR/skill_chart_generator_skill.json" "$SKILL_DIR/skill.json"
log_success "✓ skill.json → $SKILL_DIR/"

# Crear requirements.txt
log_info "Creando requirements.txt..."
cat > "$SKILL_DIR/requirements.txt" << 'EOF'
matplotlib==3.7.1
numpy==1.24.3
EOF
log_success "✓ requirements.txt creado"

# ============================================================================
# TESTING
# ============================================================================

echo -e "\n${BLUE}─────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}TESTING${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}\n"

# Test 1: Verificar que python_runner.py existe y es ejecutable
log_info "Test 1: Verificando python_runner.py..."
if check_file_exists "$PROJECT_ROOT/lib/python_runner.py"; then
    chmod +x "$PROJECT_ROOT/lib/python_runner.py"
    log_success "✓ python_runner.py listo"
fi

# Test 2: Verificar que FileOutputManager.ts existe
log_info "Test 2: Verificando FileOutputManager.ts..."
if check_file_exists "$PROJECT_ROOT/lib/FileOutputManager.ts"; then
    log_success "✓ FileOutputManager.ts listo"
fi

# Test 3: Verificar que OutputPanel.tsx existe
log_info "Test 3: Verificando OutputPanel.tsx..."
if check_file_exists "$PROJECT_ROOT/components/OutputPanel.tsx"; then
    log_success "✓ OutputPanel.tsx listo"
fi

# Test 4: Verificar API endpoints
log_info "Test 4: Verificando API endpoints..."
if check_file_exists "$PROJECT_ROOT/src/app/api/execute/route.ts"; then
    log_success "✓ /api/execute listo"
fi
if check_file_exists "$PROJECT_ROOT/src/app/api/outputs/route.ts"; then
    log_success "✓ /api/outputs listo"
fi

# Test 5: Verificar skill ejemplo
log_info "Test 5: Verificando Chart Generator skill..."
if check_file_exists "$SKILL_DIR/scripts/handler.py" && \
   check_file_exists "$SKILL_DIR/skill.json" && \
   check_file_exists "$SKILL_DIR/requirements.txt"; then
    log_success "✓ Chart Generator skill completo"
fi

# ============================================================================
# INSTRUCTIONS PARA PRÓXIMOS PASOS
# ============================================================================

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✅ INTEGRACIÓN COMPLETADA${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"

log_success "Items 2 y 3 integrados exitosamente"

echo -e "\n${BLUE}PRÓXIMOS PASOS:${NC}\n"

cat << 'EOF'
1. INTEGRAR OutputPanel EN ExecutionPanel
   ────────────────────────────────────────────────
   En tu componente ExecutionPanel, agregar:
   
   import { OutputPanel } from '@/components/OutputPanel';
   
   <div className="grid grid-cols-2 gap-4">
     <ExecutionForm {...props} />
     <OutputPanel flowId={flowId} jobId={jobId} skillId={skillId} />
   </div>

2. CREAR CARPETA DE OUTPUTS
   ────────────────────────────────────────────────
   mkdir -p /tmp/skill_outputs
   
   (O cambiar path en FileOutputManager si prefieres otra ubicación)

3. TESTEAR LOCALMENTE
   ────────────────────────────────────────────────
   npm run dev
   
   Luego ejecutar Chart Generator desde la UI:
   - Inputs: title="Test", data=[10,20,30], labels=["A","B","C"]
   - Ver PNG en preview
   - Descargar archivo

4. VERIFICAR PYTHON RUNNER
   ────────────────────────────────────────────────
   python3 /Users/cmotalvaro/Code/Skills/skill-architect-studio/lib/python_runner.py \
     --skill-path /Users/cmotalvaro/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0 \
     --inputs '{"title":"Test","data":[10,20,30],"labels":["A","B","C"]}'

5. COMMITEAR CAMBIOS
   ────────────────────────────────────────────────
   cd /Users/cmotalvaro/Code/Skills/skill-architect-studio
   git add -A
   git commit -m "feat: integrar Items 2 y 3 - Python Runner + File Output Manager"
   git push

6. PROCEDER A ITEM 1
   ────────────────────────────────────────────────
   Una vez validado, comenzar con Item 1 (Deploy en Producción)

EOF

echo -e "\n${YELLOW}NOTA IMPORTANTE:${NC}\n"
cat << 'EOF'
- El Python Runner creará virtualenvs temporales en /tmp/
- Los archivos se guardarán en /tmp/skill_outputs (configurable)
- Los outputs se limpian después de 30 días (configurable)
- Para producción: usar S3/GCS en lugar de file system

EOF

echo -e "\n${BLUE}DOCUMENTACIÓN RELEVANTE:${NC}\n"
cat << 'EOF'
- ITEMS_2_3_COMPLETE_SUMMARY.md    ← Resumen ejecutivo
- ITEM_2_SUMMARY.md                 ← Item 2 detalles
- ITEM_3_FILE_OUTPUT_MANAGER.md     ← Item 3 detalles
- QUICK_REFERENCE.txt               ← Cheat sheet rápido
- INDEX.md                          ← Índice maestro

EOF

log_success "¡Script completado sin errores!"

echo ""
