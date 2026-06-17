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
