import matter from 'gray-matter';

const CATEGORY_TO_DOMINIO: Record<string, string> = {
  writing: 'documentos',
  analysis: 'reportes',
  design: 'diseño',
  code: 'procesos',
  notification: 'notificaciones',
  report: 'reportes',
  default: 'procesos',
};

const DEFAULT_INPUTS: Record<string, any[]> = {
  writing: [
    { nombre: 'contenido', tipo: 'String', descripcion: 'Texto o estructura del documento/UI' },
    { nombre: 'modo', tipo: 'String', descripcion: 'GENERAR o AUDITAR' },
  ],
  analysis: [
    { nombre: 'datos', tipo: 'JSON', descripcion: 'Datos a analizar' },
    { nombre: 'criterios', tipo: 'String', descripcion: 'Criterios de análisis' },
  ],
};

const DEFAULT_OUTPUTS: Record<string, any[]> = {
  writing: [
    { nombre: 'documento', tipo: 'File', descripcion: 'Documento/UI formateado' },
    { nombre: 'reporte', tipo: 'JSON', descripcion: 'Reporte de cambios' },
  ],
  analysis: [
    { nombre: 'resultado', tipo: 'JSON', descripcion: 'Resultado del análisis' },
  ],
};

interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  inputs: Array<{ nombre: string; tipo: string; descripcion?: string; requerido?: boolean }>;
  outputs: Array<{ nombre: string; tipo: string; descripcion?: string }>;
  modos: string[];
}

export function parseSKILLMD(content: string): SkillMetadata {
  const { data, content: body } = matter(content);

  const inputs: SkillMetadata['inputs'] = [];
  const outputs: SkillMetadata['outputs'] = [];
  const modos: string[] = [];

  // Intenta extraer Inputs
  const inputsMatch = body.match(/#{1,3}\s*Inputs?\s*\n([\s\S]*?)(?=\n#{1,3}\s|\n## |$)/i);
  if (inputsMatch) {
    const lines = inputsMatch[1].split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        const match = trimmed.match(/^-\s*([\w_]+)\s*:\s*([^|]+?)(?:\|\s*(.+))?$/);
        if (match) {
          inputs.push({
            nombre: match[1],
            tipo: match[2].trim(),
            descripcion: match[3]?.trim(),
            requerido: !line.includes('opcional'),
          });
        }
      }
    });
  }

  // Intenta extraer Outputs
  const outputsMatch = body.match(/#{1,3}\s*Outputs?\s*\n([\s\S]*?)(?=\n#{1,3}\s|\n## |$)/i);
  if (outputsMatch) {
    const lines = outputsMatch[1].split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        const match = trimmed.match(/^-\s*([\w_]+)\s*:\s*([^|]+?)(?:\|\s*(.+))?$/);
        if (match) {
          outputs.push({
            nombre: match[1],
            tipo: match[2].trim(),
            descripcion: match[3]?.trim(),
          });
        }
      }
    });
  }

  // Parse MODOS
  const modosMatches = body.match(/MODO\s+(\w+)/gi) || [];
  modosMatches.forEach(m => {
    const modo = m.replace(/MODO\s+/i, '').trim();
    if (modo && !modos.includes(modo)) modos.push(modo);
  });

  // Detecta category desde data.cowork.category o data.category
  const category = data.cowork?.category || data.category || 'code';

  return {
    name: data.name || 'Sin nombre',
    description: data.description || '',
    version: data.version || '1.0.0',
    category,
    tags: [...(data.tags || []), ...(modos.length > 0 ? modos : [])],
    inputs: inputs.length > 0 ? inputs : (DEFAULT_INPUTS[category] || DEFAULT_INPUTS.analysis),
    outputs: outputs.length > 0 ? outputs : (DEFAULT_OUTPUTS[category] || DEFAULT_OUTPUTS.analysis),
    modos,
  };
}

export function generateSkillId(name: string): string {
  const safe = name.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
  const ts = Date.now().toString(36).toUpperCase();
  return `SKL-${safe}-${ts}`;
}

export function mapDominio(category: string): string {
  return CATEGORY_TO_DOMINIO[category] || CATEGORY_TO_DOMINIO.default;
}
