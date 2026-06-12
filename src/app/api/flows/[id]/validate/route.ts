import { validateFlow } from '@/lib/engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { flow } = body;

    const result = validateFlow(flow);

    return Response.json({
      valid: result.valid,
      errors: result.errors,
    });
  } catch (e) {
    return Response.json(
      {
        valid: false,
        errors: [
          {
            code: 'VALIDATE_ERROR',
            mensaje: String(e),
          },
        ],
      },
      { status: 500 }
    );
  }
}
