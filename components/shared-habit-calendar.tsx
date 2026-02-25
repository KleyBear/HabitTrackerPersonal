'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Settings, Trash2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EditHabitModal from '@/components/edit-habit-modal';

interface Habit {
  id: number;
  name: string;
  description: string;
  color: string;
  streak: number;
  completedDates: string[];
  reward_wheel_triggered: boolean; // Cambiado para coincidir con DB
  rewards: any[];
  last_completed_date: string | null; // Cambiado para coincidir con DB
}

interface SharedHabitCalendarProps {
  habit: Habit;
  onDateMarked: () => void;
  onRewardWheelTriggered: (habit: Habit) => void;
  isBlocked?: boolean;
}

export default function SharedHabitCalendar({
  habit,
  onDateMarked,
  onRewardWheelTriggered,
  isBlocked = false,
}: SharedHabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateCompleted = (year: number, month: number, day: number) => {
    const dateStr = formatDate(year, month, day);
    return habit.completedDates.includes(dateStr);
  };

  // --- FUNCIÓN CORREGIDA PARA EVITAR ERROR 400 ---
  const handleDateClick = async (day: number) => {
    if (isBlocked || isLoading) return;

    const userStr = localStorage.getItem('currentUser');
    const user_id = userStr ? JSON.parse(userStr).id : null;
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (!user_id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${habit.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, date: dateStr }), // Cambiado a user_id
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onDateMarked();

        // Verificamos si el backend disparó la ruleta (snake_case)
        if (data.reward_wheel_triggered) {
          setTimeout(() => {
            onRewardWheelTriggered(data.habit);
          }, 500);
        }
      } else {
        console.error('Error del servidor:', data.message);
      }
    } catch (error) {
      console.error('Error marking habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHabit = async () => {
    const userStr = localStorage.getItem('currentUser');
    const user_id = userStr ? JSON.parse(userStr).id : null;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }), // Cambiado a user_id
      });

      if (response.ok) {
        onDateMarked();
        setDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <>
      <Card className="p-6 border border-border">
        {/* Habit Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: habit.color }}>
                {habit.name}
              </h2>
              <p className="text-muted-foreground mt-1">{habit.description}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: `${habit.color}20` }}>
                <Flame className="w-5 h-5" style={{ color: habit.color }} />
                <span className="text-lg font-bold" style={{ color: habit.color }}>{habit.streak}</span>
              </div>
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isBlocked}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setDeleteConfirm(true)}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={isBlocked}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Confirmación de eliminación */}
        {deleteConfirm && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-3">
            <p className="text-sm font-medium">¿Estás seguro de que quieres eliminar este hábito?</p>
            <div className="flex gap-2">
              <Button onClick={handleDeleteHabit} variant="destructive" size="sm" disabled={isLoading}>
                Eliminar
              </Button>
              <Button onClick={() => setDeleteConfirm(false)} variant="outline" size="sm" disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Reward Wheel Alert */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              🎉 ¡Completaste 7 días! La ruleta de recompensas está activada.
            </p>
            <Button
              onClick={() => onRewardWheelTriggered(habit)}
              className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Girar Ruleta
            </Button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold capitalize">{monthName}</span>
            <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} variant="outline" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
              <div key={day} className="text-center py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
            {days.map(day => {
              const isCompleted = isDateCompleted(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const isFuture = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) > new Date();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isFuture || isBlocked || isLoading}
                  className={`
                    aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center
                    ${isCompleted ? 'text-white' : isToday ? 'border-2' : 'border'}
                    ${isFuture || isBlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  `}
                  style={{
                    backgroundColor: isCompleted ? habit.color : 'transparent',
                    borderColor: isToday && !isCompleted ? habit.color : 'rgb(229 231 235)',
                  }}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Completado</p>
            <p className="text-2xl font-bold" style={{ color: habit.color }}>{habit.completedDates.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Racha</p>
            <p className="text-2xl font-bold" style={{ color: habit.color }}>{habit.streak}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <p className="text-2xl font-bold">{isBlocked ? '🎁' : '⚡'}</p>
          </div>
        </div>
      </Card>

      {showEditModal && (
        <EditHabitModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onHabitUpdated={onDateMarked}
          habit={habit}
        />
      )}
    </>
  );
}