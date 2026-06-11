import { setSecret, listSecretNames } from '@/lib/secrets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, valor } = body;

    if (!nombre || !valor) {
      return Response.json(
        { error: { code: 'CAMPOS_FALTANTES', mensaje: 'nombre y valor requeridos' } },
        { status: 400 }
      );
    }

    await setSecret(nombre, valor);

    return Response.json({
      nombre,
      message: 'Secreto guardado en vault',
    });
  } catch (e) {
    return Response.json(
      { error: { code: 'SECRETO_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const names = await listSecretNames();
    return Response.json({ secretos: names });
  } catch (e) {
    return Response.json(
      { error: { code: 'SECRETO_ERROR', mensaje: String(e) } },
      { status: 500 }
    );
  }
}
