'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HabitCalendar from '@/components/habit-calendar';
import { Flame, Trash2 } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  description: string;
  color: string;
  streak: number;
  completedDates: string[];
  rewardWheelTriggered: boolean;
  rewards: any[];
  lastCompletedDate: string | null;
}

interface HabitCardProps {
  habit: Habit;
  onHabitUpdated: () => void;
  onRewardWheelTriggered: (habit: Habit) => void;
}

export default function HabitCard({
  habit,
  onHabitUpdated,
  onRewardWheelTriggered,
}: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este hábito?')) return;

    setIsDeleting(true);
    try {
      const userId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        onHabitUpdated();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className="border border-border overflow-hidden hover:shadow-lg transition-shadow"
      style={{
        borderTopWidth: '4px',
        borderTopColor: habit.color,
      }}
    >
      {/* Header with blocked state indicator */}
      {habit.rewardWheelTriggered && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 text-center">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            🎉 ¡Rueda de recompensas activada!
          </p>
        </div>
      )}

      <div className="p-6">
        {/* Title and Streak */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">{habit.name}</h3>
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{habit.streak}</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <HabitCalendar
            habit={habit}
            onDateMarked={onHabitUpdated}
            onRewardWheelTriggered={onRewardWheelTriggered}
            isBlocked={habit.rewardWheelTriggered}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {habit.rewardWheelTriggered && (
            <Button
              onClick={() => onRewardWheelTriggered(habit)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Girar Ruleta
            </Button>
          )}
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="outline"
            className="border-destructive/50 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
