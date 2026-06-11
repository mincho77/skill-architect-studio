# Skill Architect Studio - Documento de Contexto Comprehensive

## 📋 Descripción General

**Skill Architect Studio** es una plataforma web modular y visual diseñada para crear, gestionar, ejecutar y orquestar "Skills" (componentes reutilizables de procesamiento de datos) en flujos de trabajo complejos. Permite a usuarios técnicos y no técnicos:

- Diseñar y crear nuevos Skills (unidades de procesamiento)
- Componer Skills en Flows (pipelines de procesamiento)
- Crear AppSkills (composiciones no-code de Skills existentes)
- Ejecutar y visualizar flujos de trabajo
- Exportar y reutilizar componentes en otras aplicaciones

Es un **Meta-Framework** para construir sistemas de procesamiento de datos, documentos y reportes completamente parametrizables.

---

## 🎯 Características Principales

### 1. **Sandbox (Vista Principal)**
- Visualización canvas interactivo de flows ejecutándose
- Ejecución de Flows completos con visualización en tiempo real
- Testing individual de Skills
- Panel de ejecución con logs detallados de cada skill
- Visualización BPMN de procesos

### 2. **Catalog (Catálogo de Skills)**
- Listado de todos los Skills disponibles organizados por dominio
- Búsqueda y filtrado por nombre, dominio y estado
- Visualización de metadatos: inputs, outputs, descripción, tags
- Estados: Publicado (existente/activo) | En revisión (pendiente_desarrollo)
- Crear nuevos Skills desde el catálogo
- Editar Skills existentes
- Importar Skills desde paquetes ZIP
- Testear Skills individuales

### 3. **Flow Builder (Generador de Flujos)**
- Drag-and-drop de Skills en canvas
- Definir pipeline secuencial: orden, conexiones de datos
- Especificar nombre, descripción del flow
- Guardar flows para ejecución posterior
- Soporte para edición de flows existentes

### 4. **AppSkill Editor (Editor de Composiciones)**
- Crear "AppSkills" = composiciones de Skills sin escribir código
- Definir pasos secuenciales: qué skill + qué entrada
- Mapeo de variables entre pasos
- Reutilizar AppSkills en otros Flows

### 5. **Execution Panel (Panel de Ejecución)**
- Seleccionar flow a ejecutar
- Elegir modelo LLM (Claude, GPT-4, Gemini, etc.)
- Definir inputs del flow
- Ver ejecución con visualización progresiva
- Exportar resultados (JSON, CSV, HTML, PDF)
- Historial de ejecuciones previas

---

## 🔄 Flujo Típico de Uso

### Caso de Uso 1: Procesar Facturas

```
1. Ir a CATALOG
2. Verificar Skills disponibles:
   - SKL-001: Extractor_PDF (extrae datos de facturas)
   - SKL-002: Normalizador_Datos (limpia datos)
   - SKL-003: Validador_Montos (valida números)
   - SKL-004: Formateador_Resumen (formatea salida)
   - SKL-005: Notificador_Multicanal (envía por Slack/Teams/Email)

3. Ir a GENERATOR
4. Crear nuevo flow "Procesar_Facturas_Automatizado"
5. Drag-drop Skills en orden: PDF → Normalizar → Validar → Formatear → Notificar
6. Guardar flow

7. Ir a SANDBOX
8. Seleccionar flow creado
9. Cargar PDF de factura
10. Ejecutar
11. Ver progreso: cada skill se ejecuta, datos fluyen
12. Resultado final: factura procesada + notificación enviada
```

### Caso de Uso 2: Crear Custom AppSkill

```
1. Ir a EDITOR (AppSkill Editor)
2. Nombrar: "Procesar_Factura_Rápido"
3. Agregar pasos:
   - Paso 1: SKL-001 (Extractor_PDF) con entrada: archivo_pdf
   - Paso 2: SKL-002 (Normalizador_Datos) entrada: datos de paso 1
   - Paso 3: SKL-004 (Formateador_Resumen) entrada: datos de paso 2
4. Guardar AppSkill
5. Ahora "Procesar_Factura_Rápido" aparece en SANDBOX como componente único
```

### Caso de Uso 3: Convertir Texto a Diagrama BPMN

```
1. SANDBOX → Nueva Ejecución
2. Seleccionar flow con Skills:
   - SKL-011: Text_Flow_to_BPMN
   - SKL-006: Flow_to_PDF
3. Input: descripción en texto "El cliente envía requerimiento → 
         equipo revisa → envía presupuesto → ..."
4. Ejecutar
5. Salida: Diagrama BPMN XML visualizable en herramientas como Camunda/Bizagi
6. Opcional: exportar a PDF
```

---

## 🏗️ Componentes Clave (Arquitectura Frontend)

### Componentes UI Principales

| Componente | Propósito | Ubicación |
|-----------|----------|----------|
| **Sidebar** | Navegación entre vistas (Sandbox, Catalog, Generator, Editor, Execution) | `Sidebar.tsx` |
| **ArchitectView** | Canvas principal: visualización y ejecución de flows | `ArchitectView.tsx` |
| **CatalogView** | Listado, búsqueda, filtrado de Skills | `CatalogView.tsx` |
| **FlowBuilder** | Drag-drop de Skills, construcción de pipelines | `FlowBuilder.tsx` |
| **SkillDesigner** | Formulario para crear/editar Skills | `SkillDesigner.tsx` |
| **AppSkillBuilder** | Composición visual de Skills (AppSkills) | `AppSkillBuilder.tsx` |
| **AppSkillEditor** | Editor completo de AppSkills persistentes | `AppSkillEditor.tsx` |
| **ExecutionPanel** | Selector de flow, inputs, ejecución con UI de progreso | `ExecutionPanel.tsx` |
| **ArchitectCanvas** | Canvas renderizado (nodes, connections, animations) | `ArchitectCanvas.tsx` |
| **BPMNViewer** | Visor interactivo de diagramas BPMN | `BPMNViewer.tsx` |
| **DraggableSkill** | Skill draggable en builder | `DraggableSkill.tsx` |
| **DroppableCanvas** | Drop zone para skills | `DroppableCanvas.tsx` |

### Librerías UI Utilizadas

- **Next.js 16.2.6** - Framework React SSR
- **React 19.2.4** - UI library
- **Tailwind CSS 4** - Estilos (clase `bg-darker`, `text-slate-300`)
- **DND Kit** (@dnd-kit/core, @dnd-kit/sortable) - Drag-and-drop
- **Mermaid 11.15.0** - Generación de diagramas
- **BPMN.js 18.17.1** - Visualización BPMN
- **XyFlow 12.11.0** - Grafos interactivos

---

## 🔌 API Endpoints (Backend)

### 1. **Skills Management**

#### GET `/api/skills`
Obtiene listado completo de Skills disponibles.

**Respuesta:**
```json
[
  {
    "id": "SKL-001",
    "name": "Extractor_PDF",
    "version": "1.0.0",
    "status": "existente",
    "dominio": "documentos",
    "descripcion": "Extrae campos clave de facturas...",
    "inputs": [{"nombre": "archivo_pdf", "tipo": "File"}],
    "outputs": [{"nombre": "datos_extraidos", "tipo": "JSON"}],
    "stack": ["Python", "OpenCV"],
    "tags": ["pdf", "ocr", "facturas"]
  }
  ...
]
```

#### POST `/api/skills/create`
Crea un nuevo Skill.

**Payload:**
```json
{
  "name": "Mi_Skill",
  "dominio": "datos",
  "descripcion": "...",
  "inputs": [{"nombre": "entrada1", "tipo": "String"}],
  "outputs": [{"nombre": "salida1", "tipo": "JSON"}],
  "processing": "Describir procesamiento",
  "ai_model": "gpt-4-turbo"
}
```

#### GET `/api/skills/[id]`
Obtiene detalles de un Skill específico.

#### PUT `/api/skills/[id]`
Actualiza un Skill existente.

#### POST `/api/skills/import-package`
Importa Skills desde archivo ZIP.

**Especiales:**
- `/api/skills/text-to-bpmn` - Convierte texto a BPMN
- `/api/skills/icon-designer` - Genera iconos SVG
- `/api/skills/markdown-to-pdf` - Convierte Markdown a PDF
- `/api/skills/mermaid-to-svg` - Convierte Mermaid a SVG

### 2. **Flows Management**

#### GET `/api/flows`
Obtiene listado de todos los Flows guardados.

**Respuesta:**
```json
[
  {
    "id": "FLOW-001",
    "name": "Procesar_Facturas",
    "descripcion": "Pipeline de procesamiento de facturas",
    "pipeline": [
      {"skill_id": "SKL-001", "nombre": "Extractor_PDF", "orden": 1},
      {"skill_id": "SKL-002", "nombre": "Normalizador_Datos", "orden": 2}
    ]
  }
]
```

#### POST `/api/flows/create`
Crea un nuevo Flow.

#### GET `/api/flows/[id]`
Obtiene detalles de un Flow.

#### PUT `/api/flows/[id]`
Actualiza un Flow existente.

### 3. **AppSkills Management**

#### GET `/api/appskills`
Obtiene listado de AppSkills (composiciones guardadas).

#### POST `/api/appskills/create`
Crea un nuevo AppSkill.

**Payload:**
```json
{
  "nombre": "Procesar_Factura_Rápido",
  "descripcion": "...",
  "pasos": [
    {
      "skill_id": "SKL-001",
      "nombre": "Extractor_PDF",
      "entrada": {"archivo_pdf": ""}
    },
    {
      "skill_id": "SKL-002",
      "nombre": "Normalizador_Datos",
      "entrada": {"datos": "${pasos.0.salida}"}
    }
  ]
}
```

#### GET `/api/appskills/[id]`
Obtiene detalles de un AppSkill.

### 4. **Execution & Results**

#### POST `/api/execute/[flowId]`
Ejecuta un Flow con inputs especificados.

**Payload:**
```json
{
  "flow_id": "FLOW-001",
  "inputs": {
    "archivo_pdf": "<base64-encoded-pdf>",
    "email": "usuario@empresa.com"
  },
  "llm_model": "claude-sonnet-4-6",
  "channel": "slack"
}
```

**Respuesta:**
```json
{
  "status": "success",
  "flow_id": "FLOW-001",
  "flow_name": "Procesar_Facturas",
  "execution_log": [
    {
      "skill_id": "SKL-001",
      "skill_name": "Extractor_PDF",
      "status": "success",
      "input": {"archivo_pdf": "..."},
      "output": {"datos_extraidos": {...}},
      "execution_time_ms": 2341
    }
  ],
  "final_output": {...},
  "total_execution_time_ms": 8234,
  "timestamp": "2026-06-11T10:30:00Z"
}
```

#### GET `/api/results/[flowId]`
Obtiene historial de ejecuciones previas de un Flow.

#### GET `/api/results/[resultId]/export`
Exporta resultado en formato especificado (JSON, CSV, HTML, PDF).

---

## 📊 Modelos de Datos

### Skill
```typescript
interface Skill {
  id: string;                    // Ej: "SKL-001"
  name: string;                  // Ej: "Extractor_PDF"
  version: string;               // Ej: "1.0.0"
  status: 'existente' | 'activo' | 'pendiente_desarrollo';
  dominio: string;               // Ej: "documentos", "procesos", "reportes"
  descripcion: string;           // Descripción funcional
  inputs: Array<{
    nombre: string;              // Ej: "archivo_pdf"
    tipo: string;                // Ej: "File", "JSON", "String", "PDF", etc.
  }>;
  outputs: Array<{
    nombre: string;              // Ej: "datos_extraidos"
    tipo: string;
  }>;
  stack?: string[];              // Tecnologías: ["Python", "OpenCV", "LLM"]
  ai_model?: string;             // Modelo a usar: "gpt-4-turbo", "claude-sonnet-4-6"
  processing?: string;           // Instrucciones de procesamiento
  metricas_exito?: Record<string, number>; // Ej: {"precision_ocr": 0.95}
  tags: string[];                // Tags para búsqueda
}
```

### Flow
```typescript
interface Flow {
  id: string;                    // Ej: "FLOW-001"
  name: string;                  // Nombre del pipeline
  descripcion: string;           // Descripción del caso de uso
  pipeline: Array<{
    skill_id: string;            // Referencia a Skill
    nombre: string;              // Nombre del Skill (denormalizado)
    orden: number;               // Orden de ejecución (1, 2, 3...)
  }>;
}
```

### AppSkill
```typescript
interface AppSkill {
  id: string;                    // Ej: "APPSKILL-1780613638774"
  nombre: string;
  descripcion: string;
  pasos: Array<{
    id: string;
    skill_id: string;
    nombre: string;
    entrada: Record<string, any>;   // Mapeo de inputs
    salida?: any;                    // Cached en edición
  }>;
  entrada: Record<string, any>;     // Inputs agregados del AppSkill
  salida: Record<string, any>;      // Outputs agregados
}
```

### ExecutionResult
```typescript
interface ExecutionResult {
  flow_id: string;
  flow_name: string;
  status: 'success' | 'error' | 'partial';
  execution_log: Array<{
    skillId: string;
    skillName: string;
    status: 'idle' | 'active' | 'done' | 'error';
    input: any;
    output: any;
    time: number;                    // ms
    error?: string;
  }>;
  final_output: any;
  total_execution_time_ms: number;
  timestamp: string;
  channel?: string;                 // slack, email, teams, etc.
}
```

---

## 🎯 Dominios Disponibles

Los Skills están organizados en dominios temáticos:

| Dominio | Descripción | Ejemplos de Skills |
|---------|------------|-------------------|
| **documentos** | Procesamiento de PDF, Markdown, OCR | Extractor_PDF, Markdown_to_PDF, Mermaid_to_SVG |
| **reportes** | Generación de reportes, dashboards | Formateador_Resumen, Report_Generator |
| **notificaciones** | Envío de mensajes multicanal | Notificador_Multicanal, Notificador_Slack |
| **exportacion** | Exportación a múltiples formatos | Flow_to_PDF, Flow_to_Excel |
| **distribucion** | Distribución de contenido | Flow_Distribuidor (email, Teams, Slack) |
| **diseño** | Generación de assets visuales | Icon_Designer_AI, Theme_Generator |
| **procesos** | Diagramas y automatización de procesos | Text_Flow_to_BPMN, Mermaid_a_BPMN |
| **datos** | Normalización, validación, transformación | Normalizador_Datos, Validador_Montos |
| **importado** | Skills importados desde paquetes externos | sura-brand-ui |

---

## 🧠 Modelos LLM Soportados

El sistema integra múltiples proveedores de LLMs:

```typescript
const LLM_CATALOG = [
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    vendor: 'Anthropic',
    best_for: ['documentos', 'diseño', 'reportes', 'procesos'],
    desc: 'Balance óptimo velocidad/calidad. HTML/CSS, análisis de marca.',
    recommended: true
  },
  {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    vendor: 'Anthropic',
    best_for: ['procesos', 'datos', 'reportes'],
    desc: 'Máxima inteligencia. Razonamiento complejo, BPMN, arquitecturas.'
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    vendor: 'Anthropic',
    best_for: ['notificaciones', 'exportacion', 'distribucion'],
    desc: 'Ultra-rápido, económico. Tareas simples, notificaciones.'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    vendor: 'OpenAI',
    best_for: ['documentos', 'datos'],
    desc: 'Multimodal fuerte. Excelente con imágenes y PDFs.'
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    vendor: 'Google',
    best_for: ['distribucion', 'exportacion'],
    desc: 'Contexto 1M tokens. Procesar documentos muy largos.'
  }
];
```

---

## 📁 Estructura de Datos en Filesystem

```
data/
├── db/
│   ├── index.json              # Índice central (skills, flows, metadata)
│   ├── skills/
│   │   ├── SKL-001.json        # Skill individual
│   │   ├── SKL-002.json
│   │   └── ...
│   ├── flows/                  # (Actualmente en index.json)
│   │   └── FLOW-001.json
│   └── appskills/
│       ├── APPSKILL-123456.json
│       └── ...
├── results/                    # Historial de ejecuciones
│   ├── FLOW-001_1686247824234.json
│   ├── FLOW-001_1686247841232.json
│   └── ...
└── skills/                     # Cache local de skills descargados
```

---

## 🔧 Casos de Uso Prácticos

### 1. **Pipeline Automatizado de Facturación**
```
Usuario → Carga PDF → [Extractor] → [Normalizador] → [Validador] 
→ [Formateador] → [Notificador] → Email/Slack ✓
```

### 2. **Generador de Reportes Visuales**
```
Datos JSON → [Procesador] → [Formateador] → [Markdown_to_PDF] 
→ [Distribuidor] → Usuarios finales ✓
```

### 3. **Conversion de Procesos a BPMN**
```
Descripción de Proceso (texto) → [Text_to_BPMN] → XML BPMN 
→ [Visor BPMN] → Camunda/Bizagi ✓
```

### 4. **Pipeline de Diseño de Marcas**
```
Brief de Marca → [Icon_Designer_AI] → SVG Iconos 
→ [Theme_Generator] → CSS Theme ✓
```

### 5. **Conversión Multimedia**
```
Markdown con Mermaid → [Markdown_to_PDF] + [Mermaid_to_SVG] 
→ Documentación HTML/PDF completa ✓
```

---

## 💾 Gestión de Estado

### Frontend State Management (React Hooks)
- **Sandbox View**: flows, skills, selectedFlow, nodeStates, executionLog
- **Catalog View**: skills, selectedSkill, search, filterDomain, filterStatus
- **Flow Builder**: skills, pipeline, activeId (drag-drop)
- **Execution Panel**: flows, selectedFlow, inputs, executionResults

### Backend Storage
- **Persistent**: Filesystem JSON (data/db/)
- **Transient**: Execution results (data/results/)
- **Cache**: In-memory skill definitions during execution

---

## 🔍 Funcionalidades Avanzadas

### Variable Resolution
El sistema soporta variable mapping entre skills:
```
Paso 1: SKL-001 (output: "datos_extraidos")
Paso 2: entrada = {"archivo": "${pasos.0.salida.datos}"}
```

### BPMN Integration
- Visor BPMN.js para visualizar workflows
- Generador de BPMN a partir de texto o JSON
- Export/import compatible con estándares

### Exportación Múltiple Formatos
- **JSON**: Raw execution results
- **CSV**: Tabular format para análisis
- **HTML**: Reporte renderizado
- **PDF**: Documento final

### Logging Detallado
Cada skill en el pipeline registra:
- Tiempo de ejecución (ms)
- Inputs recibidos
- Outputs generados
- Errores (si aplica)
- Estado (idle → active → done/error)

---

## 🚀 Tecnologías Clave

| Categoría | Stack |
|-----------|-------|
| **Framework** | Next.js 16.2.6 (React 19.2.4) |
| **Estilos** | Tailwind CSS 4 |
| **UI Avanzada** | DND Kit, Mermaid, BPMN.js, XyFlow |
| **LLM Integration** | Anthropic SDK (`@anthropic-ai/sdk`) |
| **PDF** | PDFKit, pdfkit |
| **Compresión** | adm-zip, archiver |
| **Data** | JSON2CSV |
| **Conversión** | Markdown-it, Mermaid CLI |
| **Tipado** | TypeScript 5 |

---

## 📊 Flujo de Datos General

```
┌─────────────────────────────────────────────────────────────┐
│                     SKILL ARCHITECT STUDIO                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CATALOG VIEW          FLOW BUILDER         SANDBOX VIEW   │
│  (Browse Skills)   +   (Design Flows)   →   (Execute)      │
│       ↓                    ↓                    ↓           │
│  Selecciona Skills   Crea Pipeline        Dispara ejecución│
│       ↓                    ↓                    ↓           │
│  /api/skills         /api/flows/create    /api/execute/[id]
│       ↓                    ↓                    ↓           │
│  data/db/skills/     data/db/flows/      Execution Log    │
│                                                             │
│                  EXECUTION ENGINE                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Orchestrates Sequential Skill Execution            │   │
│  │ - Valida inputs                                    │   │
│  │ - Ejecuta cada skill con LLM                       │   │
│  │ - Mapea variables (outputs → inputs)               │   │
│  │ - Registra logs, timings, errors                   │   │
│  │ - Retorna final_output                             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  RESULTS STORAGE            EXPORT FORMATS                │
│  data/results/[id].json  →  JSON | CSV | HTML | PDF      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

1. **No-Code Yet Code-Capable**: Los AppSkills permiten composición visual, pero pueden customizarse con prompts complejos.

2. **LLM-Driven**: Muchos Skills usan LLMs (Claude, GPT-4, Gemini) para procesamiento inteligente, no solo transformaciones de datos.

3. **Composable**: Flows → AppSkills → Flows → AppSkills (composición anidada).

4. **Versionable**: Skills y Flows pueden tener versiones para reproducibilidad.

5. **Multicanal**: Notificaciones y distribución integradas (Slack, Teams, Email, PDF).

6. **Extensible**: Importación de Skills desde paquetes ZIP externos.

---

## 🎓 Guía de Primeros Pasos

### Para crear tu primer Flow:

1. **CATALOG**: Explora Skills disponibles, entiende inputs/outputs
2. **GENERATOR**: Crea nuevo Flow, asigna nombre y descripción
3. **BUILDER**: Drag-drop Skills en orden, conecta variables
4. **SANDBOX**: Prueba el Flow con datos de ejemplo
5. **EXECUTION**: Ejecuta con inputs reales, observa logs
6. **EXPORT**: Descarga resultado en formato necesario

### Para crear tu primer Skill:

1. **CATALOG**: Click "Nuevo Skill" o modal
2. **DESIGNER**: Completa: nombre, dominio, descripción
3. **INPUTS/OUTPUTS**: Define que entra y que sale
4. **PROCESSING**: Describe qué debe hacer el Skill
5. **AI CONFIG**: Elige modelo LLM recomendado
6. **SAVE**: Guardado en data/db/skills/

---

**Documento generado:** 2026-06-11  
**Versión:** 1.0  
**Estado:** Comprehensive Context Document
