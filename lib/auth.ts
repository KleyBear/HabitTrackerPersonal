import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Suponiendo que tienes tus variables de entorno configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  created_at: string;
}

// --- Validaciones (Se mantienen igual) ---
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// --- Hash de Contraseña (SHA256 como pediste) ---
export const hashPassword = async (password: string): Promise<string> => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  return hashedPassword === hash;
};

// --- Registro de Usuario ---
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string; userId?: number }> => {
  if (!validateEmail(email) || !validatePassword(password) || !name.trim()) {
    return { success: false, message: 'Datos de registro inválidos' };
  }

  const hashedPassword = await hashPassword(password);

  // Insertar en Supabase. El ID se genera automáticamente (SERIAL/INT)
  const { data, error } = await supabase
    .from('users')
    .insert([
      { email, password: hashedPassword, name }
    ])
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') { // Código de PostgreSQL para llave duplicada (Unique)
      return { success: false, message: 'El email ya está registrado' };
    }
    return { success: false, message: 'Error al registrar usuario: ' + error.message };
  }

  return { success: true, message: 'Usuario registrado exitosamente', userId: data.id };
};

// --- Login de Usuario ---
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'>; token?: string }> => {
  if (!validateEmail(email)) {
    return { success: false, message: 'Email inválido' };
  }

  // Buscar usuario por email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return { success: false, message: 'Email o contraseña incorrectos' };
  }

  const passwordMatch = await verifyPassword(password, user.password);

  if (!passwordMatch) {
    return { success: false, message: 'Email o contraseña incorrectos' };
  }

  // Generar token simple
  const token = crypto.randomBytes(32).toString('hex');

  const { password: _, ...userWithoutPassword } = user;
  return {
    success: true,
    message: 'Login exitoso',
    user: userWithoutPassword,
    token
  };
};

// --- Obtener usuario por ID ---
export const getUserById = async (userId: number): Promise<Omit<User, 'password'> | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
};

// --- Obtener todos los usuarios (Debug) ---
export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at');

  return data || [];
};