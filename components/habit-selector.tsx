'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Flame } from 'lucide-react';
import { useState } from 'react';

// INTERFAZ ACTUALIZADA: Ahora coincide perfectamente con el Dashboard y el Calendario
interface Habit {
  id: number;
  name: string;
  description: string;
  color: string;
  streak: number;
  completedDates: string[];
  reward_wheel_triggered: boolean; // Cambiado a snake_case
  rewards: any[];
  last_completed_date: string | null; // Cambiado a snake_case
}

interface HabitSelectorProps {
  habits: Habit[];
  selectedHabit: Habit | null;
  onSelectHabit: (habit: Habit) => void;
  onCreateNew: () => void;
}

export default function HabitSelector({
  habits,
  selectedHabit,
  onSelectHabit,
  onCreateNew,
}: HabitSelectorProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDelete = async (habitId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que quieres eliminar este hábito?')) return;

    setIsDeleting(habitId);
    try {
      const userStr = localStorage.getItem('currentUser');
      const user_id = userStr ? JSON.parse(userStr).id : null;

      if (!user_id) return;

      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }), // Cambiado a user_id para el backend
      });

      if (response.ok) {
        // En lugar de recargar toda la página, lo ideal sería notificar al padre
        // pero para mantener tu lógica actual:
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Mis Hábitos</h3>

      {/* Habit List */}
      <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay hábitos creados.</p>
        ) : (
          habits.map(habit => (
            <Card
              key={habit.id}
              onClick={() => onSelectHabit(habit)}
              className={`p-4 cursor-pointer transition-all border-l-4 ${
                selectedHabit?.id === habit.id
                  ? 'bg-primary/5 border-primary shadow-sm'
                  : 'border-border hover:border-primary/50'
              }`}
              style={{ borderLeftColor: habit.color }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate text-sm md:text-base">{habit.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {habit.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-bold text-orange-600">
                      {habit.streak} {habit.streak === 1 ? 'día' : 'días'}
                    </span>
                    {habit.reward_wheel_triggered && (
                      <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                        RUCO 🎡
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(habit.id, e)}
                  disabled={isDeleting === habit.id}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className={`w-4 h-4 ${isDeleting === habit.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Habit Button */}
      <Button
        onClick={onCreateNew}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4 shadow-md"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Hábito
      </Button>
    </div>
  );
}