#!/bin/bash
set -e
PROJECT_DIR="$HOME/Code/Skills/skill-architect-studio"
SKILLS_DIR="$PROJECT_DIR/skill_db/skills"

echo "🚀 Instalando skills text-to-mermaid y mermaid-to-png..."

# 1. SKL-TEXT-TO-MERMAID
mkdir -p "$SKILLS_DIR/SKL-TEXT-TO-MERMAID/1.0.0/scripts"

cat > "$SKILLS_DIR/SKL-TEXT-TO-MERMAID/1.0.0/scripts/handler.py" << 'HANDLER_EOF'
#!/usr/bin/env python3
import sys, json, os, requests

def handler(inputs):
    texto = inputs.get("texto", "")
    if not texto:
        return {"error": "texto requerido"}
    
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")
    model_name = os.getenv("OPENAI_MODEL_NAME", "gpt-4o")
    
    if not api_key or not base_url:
        return {"error": "Faltan OPENAI_API_KEY o OPENAI_BASE_URL"}
    
    system_prompt = """Eres un experto en Mermaid. Convierte descripciones a diagramas Mermaid válidos.
Retorna SOLO el código Mermaid, sin explicaciones."""
    
    user_prompt = f"Convierte a Mermaid flowchart:\n{texto}"
    
    try:
        headers = {"Content-Type": "application/json", "api-key": api_key}
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 1500
        }
        
        response = requests.post(f"{base_url}chat/completions", headers=headers, json=payload, timeout=30)
        if response.status_code != 200:
            return {"error": f"API error: {response.status_code}"}
        
        data = response.json()
        mermaid_code = data.get("choices", [{}])[0].get("message", {}).get("content", "").replace("```mermaid", "").replace("```", "").strip()
        
        return {"status": "success", "mermaid_code": mermaid_code, "tipo": "flowchart"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        inputs = json.loads(sys.stdin.read())
        print(json.dumps(handler(inputs)))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
HANDLER_EOF

chmod +x "$SKILLS_DIR/SKL-TEXT-TO-MERMAID/1.0.0/scripts/handler.py"

cat > "$SKILLS_DIR/SKL-TEXT-TO-MERMAID/1.0.0/skill.json" << 'JSON_EOF'
{
  "id": "SKL-TEXT-TO-MERMAID",
  "name": "text-to-mermaid",
  "version": "1.0.0",
  "description": "Convierte texto a Mermaid",
  "inputs": [{"nombre": "texto", "tipo": "String", "requerido": true}],
  "outputs": [{"nombre": "mermaid_code", "tipo": "String"}],
  "ai_model": true
}
JSON_EOF

# 2. SKL-MERMAID-TO-PNG
mkdir -p "$SKILLS_DIR/SKL-MERMAID-TO-PNG/1.0.0/scripts"

cat > "$SKILLS_DIR/SKL-MERMAID-TO-PNG/1.0.0/scripts/handler.py" << 'HANDLER2_EOF'
#!/usr/bin/env python3
import sys, json, requests

def handler(inputs):
    mermaid_code = inputs.get("mermaid_code", "")
    if not mermaid_code:
        return {"error": "mermaid_code requerido"}
    
    try:
        url = "https://mermaid.ink/svg/" + mermaid_code.replace("\n", "%0A").replace(" ", "%20")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            return {"error": f"Error: {response.status_code}"}
        
        return {
            "status": "success",
            "svg_data": response.text,
            "tipo": "svg",
            "mime_type": "image/svg+xml"
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        inputs = json.loads(sys.stdin.read())
        print(json.dumps(handler(inputs)))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
HANDLER2_EOF

chmod +x "$SKILLS_DIR/SKL-MERMAID-TO-PNG/1.0.0/scripts/handler.py"

cat > "$SKILLS_DIR/SKL-MERMAID-TO-PNG/1.0.0/skill.json" << 'JSON2_EOF'
{
  "id": "SKL-MERMAID-TO-PNG",
  "name": "mermaid-to-png",
  "version": "1.0.0",
  "description": "Renderiza Mermaid a SVG",
  "inputs": [{"nombre": "mermaid_code", "tipo": "String", "requerido": true}],
  "outputs": [{"nombre": "svg_data", "tipo": "String"}]
}
JSON2_EOF

echo "✅ Skills instalados!"
echo "📁 Ubicaciones:"
echo "   - $SKILLS_DIR/SKL-TEXT-TO-MERMAID"
echo "   - $SKILLS_DIR/SKL-MERMAID-TO-PNG"
