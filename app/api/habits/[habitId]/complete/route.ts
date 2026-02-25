import { NextRequest, NextResponse } from 'next/server';
import { markHabitComplete } from '@/lib/habits';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    // CAMBIO: Usamos user_id para coincidir con el resto de la app y Supabase
    const { user_id, date } = await request.json();
    const { habitId } = await params;

    if (!user_id || !habitId || !date) {
      return NextResponse.json(
        { message: 'user_id, habitId y date son requeridos' },
        { status: 400 }
      );
    }

    // CORRECCIÓN CRÍTICA: Se agregó 'await' porque markHabitComplete ahora es asíncrona (Supabase)
    const result = await markHabitComplete(
      parseInt(user_id), 
      parseInt(habitId), 
      date
    );

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
        // Nota: Asegúrate de que en lib/habits.ts la propiedad se llame igual
        reward_wheel_triggered: result.reward_wheel_triggered, 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark complete error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}