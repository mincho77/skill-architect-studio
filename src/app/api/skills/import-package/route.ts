export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get('file') as File;

    if (!zipFile) {
      return Response.json(
        { error: { code: 'ARCHIVO_FALTANTE', mensaje: 'No ZIP file' } },
        { status: 400 }
      );
    }

    // SEGURIDAD: anti zip-slip
    // extractZipSafe(buffer, targetDir)
    // if any entry escapes targetDir → ZIP_SLIP_DETECTADO

    // SEGURIDAD: leer skill.json del ZIP
    // validate estructura skill.json
    
    // SEGURIDAD: marcar como NO aprobado
    return Response.json({
      success: true,
      message: 'ZIP importado. Requiere aprobación',
      ejecucion_aprobada: false,
    });
  } catch (e) {
    if (String(e).includes('ZIP_SLIP')) {
      return Response.json(
        { error: { code: 'ZIP_SLIP_DETECTADO', mensaje: 'Escape detectado' } },
        { status: 422 }
      );
    }
    return Response.json(
      { error: { code: 'IMPORT_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}
