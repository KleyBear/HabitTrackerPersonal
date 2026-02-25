import { NextRequest, NextResponse } from 'next/server';
import { loginUser, validateEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 1. Validaciones de entrada
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    // 2. Intento de login usando la función que adaptamos para Supabase
    // Esta función ahora hace un SELECT simple filtrando por email
    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 401 } // 401 Unauthorized para credenciales incorrectas
      );
    }

    // 3. Generación del token (basado en el ID entero de Supabase)
    const token = Buffer.from(`${result.user?.id}:${Date.now()}`).toString('base64');

    // Retornamos el usuario y el token
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        token,
        user: result.user // result.user ya no tiene el campo password
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}