import { NextRequest, NextResponse } from 'next/server';
import { getUserHabits, createHabit } from '@/lib/habits';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'userId es requerido', habits: [] }, // Retornamos array vacío por seguridad
        { status: 400 }
      );
    }

    // AGREGADO: await para esperar la respuesta de Supabase
    const habits = await getUserHabits(parseInt(userId));

    return NextResponse.json(
      {
        success: true,
        habits: habits || [], // Nos aseguramos de que siempre sea un array
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get habits error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', habits: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, color, rewards } = await request.json();

    if (!userId || !name) {
      return NextResponse.json(
        { message: 'userId y name son requeridos' },
        { status: 400 }
      );
    }

    // AGREGADO: await ya que la inserción en Supabase es asíncrona
    const result = await createHabit(parseInt(userId), {
      name,
      description: description || '',
      color: color || '#7c3aed',
      rewards: rewards || [],
    });

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
      { status: 201 }
    );
  } catch (error) {
    console.error('Create habit error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}