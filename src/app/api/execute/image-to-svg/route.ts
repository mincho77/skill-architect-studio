import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image?.base64) {
      return NextResponse.json({ error: 'Se requiere imagen con base64' }, { status: 400 });
    }

    const base64Data = image.base64.includes(',') ? image.base64.split(',')[1] : image.base64;
    const mediaType = image.type || 'image/png';

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/';
    const model = process.env.OPENAI_MODEL_NAME || 'gpt-4o';

    const systemPrompt = `Eres un experto en gráficos vectoriales SVG.
Tu tarea es analizar la imagen proporcionada y generar código SVG que la represente fielmente.

Reglas:
- Genera SOLO el código SVG completo, sin texto adicional ni bloques de código markdown
- El SVG debe comenzar con <svg y terminar con </svg>
- Usa viewBox apropiado según el contenido
- Incluye elementos SVG precisos: paths, shapes, text, gradients si aplica
- Mantén colores y proporciones de la imagen original
- El SVG debe ser self-contained (no dependencias externas)`;

    const response = await fetch(`${baseUrl}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64Data}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: 'Genera código SVG que represente esta imagen fielmente. Responde SOLO con el código SVG, sin explicaciones ni bloques markdown.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[image-to-svg] API error:', err);
      return NextResponse.json({ error: `Error del modelo: ${response.status}`, detail: err }, { status: 500 });
    }

    const data = await response.json();
    let svgCode = data.choices?.[0]?.message?.content || '';

    // Strip markdown code blocks if model wrapped it
    svgCode = svgCode.replace(/```svg\n?/gi, '').replace(/```xml\n?/gi, '').replace(/```\n?/gi, '').trim();

    if (!svgCode.startsWith('<svg')) {
      const match = svgCode.match(/<svg[\s\S]*<\/svg>/i);
      svgCode = match ? match[0] : svgCode;
    }

    return NextResponse.json({ svg: svgCode, name: image.name });
  } catch (e) {
    console.error('[image-to-svg] Error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
