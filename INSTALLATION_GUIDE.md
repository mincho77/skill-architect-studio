# 🚀 Guía de Instalación: Items 2 y 3

## OPCIÓN 1: Instalación Automática (Recomendado) ⚡

### Paso 1: Descargar script
```bash
# El script ya está en /mnt/user-data/outputs/
# Descárgalo a tu Mac: integration_script.sh
```

### Paso 2: Hacerlo ejecutable
```bash
chmod +x integration_script.sh
```

### Paso 3: Ejecutar
```bash
./integration_script.sh
```

**Eso es todo.** El script:
- ✅ Copia todos los archivos al lugar correcto
- ✅ Crea la estructura de carpetas
- ✅ Verifica que todo esté bien
- ✅ Te da instrucciones de próximos pasos

**Tiempo:** ~2 minutos

---

## OPCIÓN 2: Instalación Manual (Si prefieres controlar cada paso)

### ITEM 2: Python Runner

#### 2a. Copiar python_runner.py
```bash
cp python_runner.py ~/Code/Skills/skill-architect-studio/lib/
```

#### 2b. Copiar ejemplo de handler
```bash
cp example_handler.py ~/Code/Skills/skill-architect-studio/public/templates/
```

#### 2c. Copiar API endpoint (reemplaza el anterior)
```bash
# Primero: crear carpeta
mkdir -p ~/Code/Skills/skill-architect-studio/src/app/api/execute

# Luego: copiar archivo
cp api_execute_endpoint.ts ~/Code/Skills/skill-architect-studio/src/app/api/execute/route.ts
```

---

### ITEM 3: File Output Manager

#### 3a. Copiar FileOutputManager.ts
```bash
cp FileOutputManager.ts ~/Code/Skills/skill-architect-studio/lib/
```

#### 3b. Copiar API routes (nuevo endpoint)
```bash
# Crear carpeta
mkdir -p ~/Code/Skills/skill-architect-studio/src/app/api/outputs

# Copiar archivo
cp api_outputs_routes.ts ~/Code/Skills/skill-architect-studio/src/app/api/outputs/route.ts
```

#### 3c. Copiar componente React
```bash
# Crear carpeta
mkdir -p ~/Code/Skills/skill-architect-studio/components

# Copiar archivo
cp OutputPanel.tsx ~/Code/Skills/skill-architect-studio/components/
```

---

### SKILL EJEMPLO: Chart Generator

#### 4a. Crear estructura de carpetas
```bash
mkdir -p ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/scripts
```

#### 4b. Copiar handler
```bash
cp skill_chart_generator_handler.py \
  ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/scripts/handler.py
```

#### 4c. Copiar skill.json
```bash
cp skill_chart_generator_skill.json \
  ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/skill.json
```

#### 4d. Crear requirements.txt
```bash
cat > ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/requirements.txt << 'EOF'
matplotlib==3.7.1
numpy==1.24.3
EOF
```

---

## ✅ VALIDACIÓN POST-INSTALACIÓN

### Opción A: Script de validación automático
```bash
chmod +x validation_script.sh
./validation_script.sh
```

### Opción B: Validación manual

#### 1. Verificar archivos copiados
```bash
ls -la ~/Code/Skills/skill-architect-studio/lib/python_runner.py
ls -la ~/Code/Skills/skill-architect-studio/lib/FileOutputManager.ts
ls -la ~/Code/Skills/skill-architect-studio/components/OutputPanel.tsx
```

#### 2. Verificar skill ejemplo
```bash
ls -la ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/scripts/handler.py
```

#### 3. Verificar Python válido
```bash
python3 -m py_compile ~/Code/Skills/skill-architect-studio/lib/python_runner.py
echo "✓ python_runner.py es Python válido"

python3 -m py_compile ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/scripts/handler.py
echo "✓ handler.py es Python válido"
```

---

## 🔧 INTEGRACIÓN EN COMPONENTES

### Paso 5: Agregar OutputPanel a ExecutionPanel

En tu componente `ExecutionPanel` (generalmente en `components/ExecutionPanel.tsx`):

```typescript
// 1. Agregar import al inicio del archivo
import { OutputPanel } from '@/components/OutputPanel';

// 2. En el JSX, usar grid layout para mostrar lado a lado
export function ExecutionPanel({ flowId, jobId, skillId, ...props }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Panel de ejecución (existente) */}
      <div>
        <ExecutionForm {...props} />
      </div>
      
      {/* Panel de outputs (nuevo) */}
      <div>
        <OutputPanel flowId={flowId} jobId={jobId} skillId={skillId} />
      </div>
    </div>
  );
}
```

Si tu componente tiene otra estructura, simplemente asegúrate de:
- Importar `OutputPanel`
- Pasar props: `flowId`, `jobId`, `skillId`
- Colocarlo donde quieras que aparezca en la UI

---

## 🧪 TESTING LOCAL

### Test 1: CLI (Python Runner)
```bash
python3 ~/Code/Skills/skill-architect-studio/lib/python_runner.py \
  --skill-path ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0 \
  --inputs '{"title":"Test Chart","data":[10,20,15,30],"labels":["Q1","Q2","Q3","Q4"]}'
```

**Resultado esperado:**
```json
{
  "status": "success",
  "outputs": {
    "filename": "chart.png",
    "mime_type": "image/png",
    "size": 12345,
    "data": "iVBORw0KGgoAAAA..."
  },
  "duration_seconds": 3.2
}
```

### Test 2: API (Next.js)
```bash
# 1. Inicia el servidor
npm run dev

# 2. En otra terminal, ejecuta el skill
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "SKL-CHART-GENERATOR",
    "version": "1.0.0",
    "inputs": {
      "title": "Test Chart",
      "data": [10, 20, 15, 30],
      "labels": ["Q1", "Q2", "Q3", "Q4"]
    }
  }'

# 3. Copia el jobId de la respuesta
# 4. Consulta estado
curl "http://localhost:3000/api/execute?jobId=job_..."

# 5. Debería retornar:
# {
#   "jobId": "job_1686920355_abc123",
#   "status": "success",
#   "outputs": {...},
#   "duration_seconds": 3.2
# }
```

### Test 3: UI Completa (en navegador)
1. Abre http://localhost:3000
2. Ve a Canvas
3. Crea un flujo con Chart Generator
4. Click en "Execute"
5. En OutputPanel, deberías ver:
   - Lista de archivos con "chart.png"
   - Preview inline de la imagen
   - Botón "Descargar"
6. Click en "Descargar" → debería guardarse el PNG

---

## 🐛 TROUBLESHOOTING

### Error: "python_runner.py: No such file or directory"
**Causa:** El archivo no se copió correctamente  
**Solución:**
```bash
# Verifica que existe
ls -la ~/Code/Skills/skill-architect-studio/lib/python_runner.py

# Si no existe, cópialo manualmente desde /mnt/user-data/outputs/
cp /mnt/user-data/outputs/python_runner.py ~/Code/Skills/skill-architect-studio/lib/
```

### Error: "handler.py no encontrado en /path/to/skill/scripts/handler.py"
**Causa:** El skill no tiene estructura correcta  
**Solución:**
```bash
# Verifica estructura
ls -la ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/scripts/handler.py

# Debe ser exactamente: scripts/handler.py
```

### Error: "JSON parse error"
**Causa:** El output del handler no es JSON válido  
**Solución:**
```bash
# Test el handler directamente
echo '{"title":"Test","data":[10,20],"labels":["A","B"]}' | \
  python3 ~/Code/Skills/skill-architect-studio/public/skill_db/skills/SKL-CHART-GENERATOR/1.0.0/scripts/handler.py

# Debería retornar JSON válido
```

### Error: "ModuleNotFoundError: No module named 'matplotlib'"
**Causa:** matplotlib no está instalado  
**Solución:** El Python Runner lo instala automáticamente desde requirements.txt
```bash
# Pero si quieres hacerlo manualmente:
pip install matplotlib==3.7.1 numpy==1.24.3
```

---

## ✨ PRÓXIMOS PASOS

Una vez completada la instalación y validación:

1. **Integra OutputPanel en tu UI** (5 min)
2. **Testea el flujo completo** (10 min)
3. **Commitea cambios a git:**
   ```bash
   cd ~/Code/Skills/skill-architect-studio
   git add -A
   git commit -m "feat: integrar Items 2 y 3 - Python Runner + File Output Manager"
   git push
   ```
4. **Procede a Item 1: Deploy en Producción** ⏭️

---

## 📊 RESUMEN DE CAMBIOS

### Nuevos archivos
- `lib/python_runner.py` → Ejecutor de skills
- `lib/FileOutputManager.ts` → Gestor de archivos
- `components/OutputPanel.tsx` → Componente de UI
- `src/app/api/outputs/route.ts` → API para outputs
- `public/skill_db/skills/SKL-CHART-GENERATOR/` → Skill ejemplo

### Archivos modificados
- `src/app/api/execute/route.ts` → Versión mejorada

### Nuevas carpetas
- `/tmp/skill_outputs/` → Almacenamiento de outputs (automático)

---

**¿Necesitas ayuda? Consulta QUICK_REFERENCE.txt o revisa los errores comunes arriba.**
