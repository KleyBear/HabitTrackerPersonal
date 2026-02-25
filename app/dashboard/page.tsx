'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import HabitSelector from '@/components/habit-selector';
import SharedHabitCalendar from '@/components/shared-habit-calendar';
import CreateHabitModal from '@/components/create-habit-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import RewardWheelModal from '@/components/reward-wheel-modal';

interface User {
  id: number;
  email: string;
  name: string;
}

// INTERFAZ CORREGIDA: Nombres sincronizados con el componente Calendar y Supabase
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRewardWheel, setShowRewardWheel] = useState(false);
  const [wheelHabit, setWheelHabit] = useState<Habit | null>(null);
  const router = useRouter();

  const loadHabits = async (userId: number) => {
    try {
      const response = await fetch(`/api/habits?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // MAPEO CORREGIDO: Transformamos los datos de la DB a la interfaz Habit
        const formattedHabits: Habit[] = data.habits.map((h: any) => ({
          id: h.id,
          name: h.name,
          description: h.description,
          color: h.color,
          streak: h.streak || 0,
          // Convertimos [{completed_date: '...'}] a ['...']
          completedDates: h.habit_completions?.map((c: any) => c.completed_date) || [],
          reward_wheel_triggered: h.reward_wheel_triggered || false,
          rewards: h.rewards || [],
          last_completed_date: h.last_completed_date || null
        }));

        setHabits(formattedHabits);
        
        // Sincronizar el hábito seleccionado con los nuevos datos
        if (selectedHabit) {
          const updated = formattedHabits.find((hab) => hab.id === selectedHabit.id);
          setSelectedHabit(updated || formattedHabits[0] || null);
        } else if (formattedHabits.length > 0) {
          setSelectedHabit(formattedHabits[0]);
        }
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (!token || !currentUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(currentUser);
    setUser(userData);
    loadHabits(userData.id);
  }, [router]);

  const handleHabitAction = () => {
    if (user) loadHabits(user.id);
  };

  const handleRewardWheelTriggered = (habit: Habit) => {
    setWheelHabit(habit);
    setShowRewardWheel(true);
  };

  const handleRewardSelected = () => {
    setShowRewardWheel(false);
    setWheelHabit(null);
    handleHabitAction();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Conectando con Supabase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Hola, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground">Tu progreso está guardado de forma segura en la nube.</p>
        </div>

        {habits.length > 0 && (
          <Card className="mb-8 p-6 border border-border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Hábitos</p>
                <p className="text-3xl font-bold text-primary">{habits.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Racha Seleccionada</p>
                <p className="text-3xl font-bold text-orange-500">
                  {selectedHabit?.streak || 0} 🔥
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Racha Máxima</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.max(...habits.map(h => h.streak || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <HabitSelector
              habits={habits}
              selectedHabit={selectedHabit}
              onSelectHabit={setSelectedHabit}
              onCreateNew={() => setShowCreateModal(true)}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedHabit ? (
              <SharedHabitCalendar
                habit={selectedHabit}
                onDateMarked={handleHabitAction}
                onRewardWheelTriggered={handleRewardWheelTriggered}
                // isBlocked ahora depende del nombre correcto de la propiedad
                isBlocked={selectedHabit.reward_wheel_triggered}
              />
            ) : (
              <Card className="p-12 border border-border border-dashed text-center">
                <p className="text-muted-foreground mb-4">No tienes hábitos aún</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Crear tu primer hábito
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateHabitModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onHabitCreated={handleHabitAction}
          userId={user?.id || 0}
        />
      )}

      {showRewardWheel && wheelHabit && (
        <RewardWheelModal
          isOpen={showRewardWheel}
          onClose={() => {
            setShowRewardWheel(false);
            setWheelHabit(null);
          }}
          habit={wheelHabit}
          onRewardSelected={handleRewardSelected}
        />
      )}
    </div>
  );
}