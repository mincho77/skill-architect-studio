export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = `Eres el Arquitecto IA de Skill Studio, un experto en diseño de skills de automatización para Suramericana (SURA). 
Tu rol es ayudar a diseñar skills reutilizables con inputs/outputs bien definidos.

Contexto del skill actual:
- Nombre: ${context.name || 'Sin nombre'}
- Dominio: ${context.dominio || 'Sin dominio'}
- Descripción: ${context.descripcion || 'Sin descripción'}
- Inputs actuales: ${JSON.stringify(context.inputs || [])}
- Outputs actuales: ${JSON.stringify(context.outputs || [])}

Responde de forma concisa y práctica. Sugiere nombres de puertos, tipos de datos (String, JSON, File, Boolean, Number), y mejoras de diseño.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sin respuesta';

    return Response.json({ reply });
  } catch (e) {
    return Response.json({ reply: `Error: ${String(e)}` }, { status: 500 });
  }
}
