'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Habit {
  id: number;
  completedDates: string[];
  rewardWheelTriggered: boolean;
  [key: string]: any;
}

interface HabitCalendarProps {
  habit: Habit;
  onDateMarked: () => void;
  onRewardWheelTriggered: (habit: Habit) => void;
  isBlocked?: boolean;
}

export default function HabitCalendar({
  habit,
  onDateMarked,
  onRewardWheelTriggered,
  isBlocked = false,
}: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateCompleted = (year: number, month: number, day: number) => {
    const dateStr = formatDate(year, month, day);
    return habit.completedDates.includes(dateStr);
  };

  const handleDateClick = async (day: number) => {
    if (isBlocked) return;

    const userId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);

    setIsLoading(true);
    try {
      const response = await fetch(`/api/habits/${habit.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, date: dateStr }),
      });

      const data = await response.json();

      if (data.success) {
        onDateMarked();
        
        // Si se activa la ruleta, mostrarla después de actualizar
        if (data.rewardWheelTriggered) {
          setTimeout(() => {
            onRewardWheelTriggered(data.habit);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error marking habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevMonth}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">{monthName}</span>
        <Button
          onClick={handleNextMonth}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
          <div key={day} className="text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}

        {/* Day cells */}
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
                aspect-square rounded-lg text-xs font-medium transition-all
                flex items-center justify-center
                ${isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                  ? 'border-2 border-primary'
                  : 'border border-border hover:border-primary'
                }
                ${isFuture || isBlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={isBlocked ? 'Desbloqueado después de girar la ruleta' : ''}
            >
              {isCompleted && <Check className="w-3 h-3" />}
              {!isCompleted && day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
