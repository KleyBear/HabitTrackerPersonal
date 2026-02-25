import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

interface Reward {
  id: number;
  name: string;
  icon: string;
}

interface Habit {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  streak: number;
  last_completed_date: string | null;
  reward_wheel_triggered: boolean;
  rewards?: Reward[];
  habit_completions?: { completed_date: string }[];
}

// --- Obtener todos los hábitos de un usuario ---
export const getUserHabits = async (userId: number) => {
  const { data, error } = await supabase
    .from('habits')
    .select(`
      *,
      rewards (*),
      habit_completions (completed_date)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

// --- Crear un hábito ---
export const createHabit = async (userId: number, habitData: any) => {
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .insert([
      { 
        user_id: userId, 
        name: habitData.name, 
        description: habitData.description, 
        color: habitData.color 
      }
    ])
    .select()
    .single();

  if (habitError) return { success: false, message: habitError.message };

  if (habitData.rewards && habitData.rewards.length > 0) {
    const rewardsToInsert = habitData.rewards.map((r: any) => ({
      habit_id: habit.id,
      name: r.name,
      icon: r.icon
    }));
    await supabase.from('rewards').insert(rewardsToInsert);
  }

  return { success: true, message: 'Hábito creado', habit };
};

// --- Actualizar un hábito ---
export const updateHabit = async (userId: number, habitId: number, updates: any) => {
  const { name, description, color, rewards } = updates;

  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .update({ 
      name, 
      description, 
      color 
    })
    .eq('id', habitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (habitError) return { success: false, message: habitError.message };

  if (rewards) {
    await supabase.from('rewards').delete().eq('habit_id', habitId);
    
    if (rewards.length > 0) {
      const rewardsToInsert = rewards.map((r: any) => ({
        habit_id: habitId,
        name: r.name,
        icon: r.icon
      }));
      await supabase.from('rewards').insert(rewardsToInsert);
    }
  }

  return { success: true, message: 'Hábito actualizado', habit };
};

// --- Eliminar un hábito ---
export const deleteHabit = async (userId: number, habitId: number) => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);

  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Hábito eliminado' };
};

// --- Marcar hábito como completado ---
export const markHabitComplete = async (userId: number, habitId: number, date: string) => {
  const { error: insertError } = await supabase
    .from('habit_completions')
    .insert([{ habit_id: habitId, completed_date: date }]);

  if (insertError) {
    if (insertError.code === '23505') return { success: false, message: 'Ya completado hoy' };
    return { success: false, message: insertError.message };
  }

  const { data: completions } = await supabase
    .from('habit_completions')
    .select('completed_date')
    .eq('habit_id', habitId)
    .order('completed_date', { ascending: false });

  if (!completions) return { success: false, message: 'Error al calcular streak' };

  let currentStreak = 1;
  for (let i = 0; i < completions.length - 1; i++) {
    const current = new Date(completions[i].completed_date);
    const prev = new Date(completions[i + 1].completed_date);
    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    
    if (Math.round(diff) === 1) currentStreak++;
    else break;
  }

  const shouldTriggerWheel = currentStreak > 0 && currentStreak % 7 === 0;
  
  const { data: updatedHabit } = await supabase
    .from('habits')
    .update({ 
      streak: currentStreak, 
      last_completed_date: date,
      reward_wheel_triggered: shouldTriggerWheel
    })
    .eq('id', habitId)
    .select()
    .single();

  return { 
    success: true, 
    habit: updatedHabit, 
    reward_wheel_triggered: shouldTriggerWheel 
  };
};

// --- NUEVA: Reiniciar el estado de la ruleta de premios ---
export const resetRewardWheel = async (userId: number, habitId: number) => {
  const { data, error } = await supabase
    .from('habits')
    .update({ reward_wheel_triggered: false })
    .eq('id', habitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return { success: false, message: error.message };
  
  return { 
    success: true, 
    message: 'Ruleta reiniciada', 
    habit: data 
  };
};