import { NextRequest, NextResponse } from 'next/server';
import { registerUser, validateEmail, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 1. Validaciones básicas (se mantienen igual)
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // 2. Llamada a la función que modificamos para Supabase
    // Esta función ahora interactúa con la tabla 'users' en la nube
    const result = await registerUser(email, password, name);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    // 3. Generar token simple
    // Nota: El userId ahora viene directamente de la respuesta de Supabase
    const token = Buffer.from(`${result.userId}:${Date.now()}`).toString('base64');

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        token,
        user: {
          id: result.userId,
          email,
          name,
          habits: [] // Enviamos array vacío ya que es un usuario nuevo
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}