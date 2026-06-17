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
