import { NextRequest, NextResponse } from 'next/server';
import { resetRewardWheel } from '@/lib/habits';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    // CAMBIO: Usamos user_id para mantener la consistencia con Supabase
    const { user_id } = await request.json();
    const { habitId } = await params;

    if (!user_id || !habitId) {
      return NextResponse.json(
        { message: 'user_id y habitId son requeridos' },
        { status: 400 }
      );
    }

    // CORRECCIÓN: Se añade 'await' porque resetRewardWheel ahora devuelve una Promesa
    const result = await resetRewardWheel(parseInt(user_id), parseInt(habitId));

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        habit: result.habit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset wheel error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}