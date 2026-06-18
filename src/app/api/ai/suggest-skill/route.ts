import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion } = await req.json();

    if (!nombre || !descripcion) {
      return NextResponse.json({ error: 'nombre y descripcion requeridos' }, { status: 400 });
    }

    const prompt = `Eres un experto en arquitectura de skills y transformación de datos.

Basándote en esta descripción del skill:
Nombre: ${nombre}
Descripción: ${descripcion}

Sugiere cuáles deberían ser los INPUTS (puertos de entrada) y OUTPUTS (puertos de salida) para este skill.

Responde en JSON con esta estructura:
{
  "inputs": [
    {"nombre": "input_name", "tipo": "String|JSON|Number|Boolean|File|Array<string>", "descripcion": "..."},
    ...
  ],
  "outputs": [
    {"nombre": "output_name", "tipo": "String|JSON|Number|Boolean|File|Array<string>", "descripcion": "..."},
    ...
  ]
}

Sé específico y realista. Los tipos deben ser coherentes con la transformación descrita.`;

    // Mock response - en producción usarías Claude API o similar
    const mockResponse = generateMockSuggestions(nombre, descripcion);

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}

function generateMockSuggestions(nombre: string, descripcion: string) {
  // Sugerencias basadas en keywords en nombre/descripción
  const descLower = descripcion.toLowerCase();

  let inputs = [];
  let outputs = [];

  // Detectar patrones comunes
  if (descLower.includes('texto') || descLower.includes('text') || descLower.includes('string')) {
    inputs.push({ nombre: 'texto', tipo: 'String', descripcion: 'Texto de entrada a procesar' });
  }
  if (descLower.includes('workflow') || descLower.includes('flujo')) {
    inputs.push({ nombre: 'workflow', tipo: 'JSON', descripcion: 'Definición del workflow' });
    outputs.push({ nombre: 'workflow', tipo: 'JSON', descripcion: 'Workflow procesado' });
  }
  if (descLower.includes('mermaid') || descLower.includes('diagram')) {
    inputs.push({ nombre: 'mermaid', tipo: 'String', descripcion: 'Código Mermaid' });
    outputs.push({ nombre: 'svg', tipo: 'String', descripcion: 'Diagrama en formato SVG' });
  }
  if (descLower.includes('json')) {
    inputs.push({ nombre: 'data', tipo: 'JSON', descripcion: 'Datos en formato JSON' });
    outputs.push({ nombre: 'result', tipo: 'JSON', descripcion: 'Resultado procesado' });
  }
  if (descLower.includes('número') || descLower.includes('número')) {
    inputs.push({ nombre: 'value', tipo: 'Number', descripcion: 'Valor numérico' });
    outputs.push({ nombre: 'result', tipo: 'Number', descripcion: 'Resultado numérico' });
  }

  // Default si no hay sugerencias
  if (inputs.length === 0) {
    inputs.push({
      nombre: 'input',
      tipo: 'String',
      descripcion: 'Entrada principal del skill'
    });
  }
  if (outputs.length === 0) {
    outputs.push({
      nombre: 'output',
      tipo: 'String',
      descripcion: 'Salida principal del skill'
    });
  }

  return {
    id: `skill-${Date.now()}`,
    nombre,
    descripcion,
    inputs,
    outputs,
  };
}
