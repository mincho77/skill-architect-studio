#!/bin/bash

# ============================================================================
# Skill Studio: Validation Script
# Verifica que Items 2 y 3 estén correctamente integrados
# ============================================================================

PROJECT_ROOT="/Users/cmotalvaro/Code/Skills/skill-architect-studio"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

log_pass() {
    echo -e "${GREEN}[✓]${NC} $1"
    PASS=$((PASS + 1))
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1"
    FAIL=$((FAIL + 1))
}

log_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     SKILL STUDIO: Validation Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# ============================================================================
# VALIDACIÓN ITEM 2
# ============================================================================

echo -e "\n${BLUE}ITEM 2: Python Runner Real${NC}\n"

if [ -f "$PROJECT_ROOT/lib/python_runner.py" ]; then
    log_pass "python_runner.py existe"
    
    # Verificar que es Python válido
    if python3 -m py_compile "$PROJECT_ROOT/lib/python_runner.py" 2>/dev/null; then
        log_pass "python_runner.py es Python válido"
    else
        log_fail "python_runner.py tiene errores de sintaxis"
    fi
else
    log_fail "python_runner.py NO ENCONTRADO"
fi

if [ -f "$PROJECT_ROOT/src/app/api/execute/route.ts" ]; then
    log_pass "api/execute/route.ts existe"
else
    log_fail "api/execute/route.ts NO ENCONTRADO"
fi

if [ -f "$PROJECT_ROOT/public/templates/example_handler.py" ]; then
    log_pass "example_handler.py existe"
else
    log_fail "example_handler.py NO ENCONTRADO"
fi

# ============================================================================
# VALIDACIÓN ITEM 3
# ============================================================================

echo -e "\n${BLUE}ITEM 3: File Output Manager${NC}\n"

if [ -f "$PROJECT_ROOT/lib/FileOutputManager.ts" ]; then
    log_pass "FileOutputManager.ts existe"
else
    log_fail "FileOutputManager.ts NO ENCONTRADO"
fi

if [ -f "$PROJECT_ROOT/src/app/api/outputs/route.ts" ]; then
    log_pass "api/outputs/route.ts existe"
else
    log_fail "api/outputs/route.ts NO ENCONTRADO"
fi

if [ -f "$PROJECT_ROOT/components/OutputPanel.tsx" ]; then
    log_pass "OutputPanel.tsx existe"
else
    log_fail "OutputPanel.tsx NO ENCONTRADO"
fi

# ============================================================================
# VALIDACIÓN SKILL EJEMPLO
# ============================================================================

echo -e "\n${BLUE}SKILL EJEMPLO: Chart Generator${NC}\n"

SKILL_DIR="$PROJECT_ROOT/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0"

if [ -f "$SKILL_DIR/scripts/handler.py" ]; then
    log_pass "handler.py existe"
    
    if python3 -m py_compile "$SKILL_DIR/scripts/handler.py" 2>/dev/null; then
        log_pass "handler.py es Python válido"
    else
        log_fail "handler.py tiene errores de sintaxis"
    fi
else
    log_fail "handler.py NO ENCONTRADO"
fi

if [ -f "$SKILL_DIR/skill.json" ]; then
    log_pass "skill.json existe"
    
    # Verificar JSON válido
    if python3 -c "import json; json.load(open('$SKILL_DIR/skill.json'))" 2>/dev/null; then
        log_pass "skill.json es JSON válido"
    else
        log_fail "skill.json tiene errores de formato"
    fi
else
    log_fail "skill.json NO ENCONTRADO"
fi

if [ -f "$SKILL_DIR/requirements.txt" ]; then
    log_pass "requirements.txt existe"
else
    log_fail "requirements.txt NO ENCONTRADO"
fi

# ============================================================================
# VALIDACIÓN FUNCIONAL (OPCIONAL)
# ============================================================================

echo -e "\n${BLUE}VALIDACIÓN FUNCIONAL (opcional)${NC}\n"

log_info "Para testear Python Runner ejecuta:"
echo "  python3 $PROJECT_ROOT/lib/python_runner.py \\"
echo "    --skill-path $SKILL_DIR \\"
echo "    --inputs '{\"title\":\"Test\",\"data\":[10,20,30],\"labels\":[\"A\",\"B\",\"C\"]}'"

log_info ""
log_info "Para testear API endpoints:"
echo "  npm run dev"
echo "  curl -X POST http://localhost:3000/api/execute \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"skillId\":\"SKL-CHART-GENERATOR\",\"version\":\"1.0.0\",\"inputs\":{...}}'"

# ============================================================================
# RESUMEN
# ============================================================================

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     RESUMEN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

TOTAL=$((PASS + FAIL))

echo -e "Pruebas pasadas: ${GREEN}$PASS/$TOTAL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✅ TODAS LAS VALIDACIONES PASARON${NC}\n"
    echo "Próximos pasos:"
    echo "1. Integra OutputPanel en ExecutionPanel (tu componente de UI)"
    echo "2. Ejecuta 'npm run dev'"
    echo "3. Testea el flujo completo (generar PNG → preview → descargar)"
    echo "4. Commitea cambios a git"
    echo "5. Procede a Item 1 (Deploy en Producción)"
    exit 0
else
    echo -e "\n${RED}❌ $FAIL VALIDACIÓN(ES) FALLARON${NC}\n"
    echo "Verifica los errores arriba y vuelve a ejecutar el script."
    exit 1
fi
