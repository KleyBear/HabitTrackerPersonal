import { NextRequest, NextResponse } from 'next/server';
import { deleteHabit, updateHabit } from '@/lib/habits';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    // CAMBIO: Desestructuramos user_id para coincidir con el Modal/Supabase
    const { user_id, name, description, color, rewards } = await request.json();
    const { habitId } = await params;

    if (!user_id || !habitId) {
      return NextResponse.json(
        { message: 'user_id y habitId son requeridos' },
        { status: 400 }
      );
    }

    // Usamos await para la operación asíncrona de Supabase
    const result = await updateHabit(parseInt(user_id), parseInt(habitId), {
      name,
      description,
      color,
      rewards,
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
      { status: 200 }
    );
  } catch (error) {
    console.error('Update habit error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  try {
    const { user_id } = await request.json();
    const { habitId } = await params;

    if (!user_id || !habitId) {
      return NextResponse.json(
        { message: 'user_id y habitId son requeridos' },
        { status: 400 }
      );
    }

    const result = await deleteHabit(parseInt(user_id), parseInt(habitId));

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete habit error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}