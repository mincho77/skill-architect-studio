# 🧩 Skill Architect Studio

> Sistema de habilidades reutilizables (Skills) para ensamblaje inteligente de soluciones de automatización.

## ¿Qué es esto?

Una arquitectura basada en **células atómicas** (Skills) que resuelven micro-necesidades específicas. En lugar de construir soluciones desde cero, el sistema ensambla Skills existentes y detecta automáticamente qué falta construir (GAPs).

---

## Estructura del proyecto

```
skill_db/
├── index.json              ← Índice central del catálogo
├── flows/
│   └── FLOW-001.json       ← Flujo: Facturas PDF → Slack
└── skills/
    ├── SKL-001.json        ← Extractor_PDF
    ├── SKL-002.json        ← Normalizador_Datos
    ├── SKL-003.json        ← Validador_Montos
    ├── SKL-004.json        ← Formateador_Resumen
    └── SKL-GAP-001.json    ← Notificador_Slack ⚠️ (pendiente desarrollo)
```

---

## Flujo piloto: Procesamiento de Facturas PDF → Slack

```
[PDF Factura]
    ↓ SKL-001: Extractor_PDF
    ↓ SKL-002: Normalizador_Datos
    ↓ SKL-003: Validador_Montos
    ↓ SKL-004: Formateador_Resumen
    ↓ SKL-GAP-001: Notificador_Slack  ← único skill a desarrollar
[Mensaje en Slack]
```

**Eficiencia:** 4 de 5 Skills reutilizados → 80% del flujo sin desarrollo nuevo.

---

## Schema de un Skill

Cada archivo JSON sigue esta estructura base:

```json
{
  "id": "SKL-XXX",
  "name": "NombreDelSkill",
  "version": "1.0.0",
  "status": "existente | pendiente_desarrollo",
  "dominio": "documentos | reportes | notificaciones | integraciones",
  "descripcion": "...",
  "inputs": [ { "nombre": "...", "tipo": "...", "requerido": true } ],
  "outputs": [ { "nombre": "...", "tipo": "..." } ],
  "stack": ["..."],
  "dependencias": ["SKL-XXX"],
  "siguiente_skill": "SKL-XXX",
  "metricas_exito": {},
  "esfuerzo_desarrollo": "N días",
  "reutilizacion": "Alta | Muy Alta"
}
```

---

## Roadmap

| Fase | Descripción | Estado |
|------|-------------|--------|
| MVP | Skill DB en archivos JSON | ✅ Activo |
| Motor | Búsqueda semántica con embeddings | 🔜 Próximo |
| UI | Skill Architect Studio (canvas visual) | 🔜 Próximo |
| Producción | Migración a PostgreSQL + pgvector | ⏳ Planificado |

---

## Contexto

Proyecto desarrollado en **Suramericana** como piloto de automatización inteligente mediante arquitectura de Skills reutilizables.
