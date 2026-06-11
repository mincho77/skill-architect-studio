import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = 'skill_db/uploads';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json(
        { error: { code: 'ARCHIVO_FALTANTE', mensaje: 'No file provided' } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Límite 200MB (configurable)
    if (buffer.length > 200 * 1024 * 1024) {
      return Response.json(
        { error: { code: 'ARCHIVO_DEMASIADO_GRANDE', mensaje: 'Max 200MB' } },
        { status: 413 }
      );
    }

    // Sanitizar nombre
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(-100);

    const uploadId = nanoid();
    const dateStr = new Date().toISOString().slice(0, 10);
    const dirPath = path.join(UPLOAD_DIR, dateStr, uploadId);

    await mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, sanitized);
    await writeFile(filePath, buffer);

    return Response.json({
      upload_id: uploadId,
      server_path: filePath,
      nombre: sanitized,
      bytes: buffer.length,
    });
  } catch (e) {
    return Response.json(
      { error: { code: 'UPLOAD_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}
