'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';

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
  rewards: Reward[];
  [key: string]: any;
}

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitUpdated: () => void;
  habit: Habit;
}

const REWARD_ICONS = ['🍦', '🎬', '🛍️', '📚', '🎮', '⚽', '🏖️', '💆', '🎵', '🍕', '🎸', '🚀', '⭐', '🎁', '🏆'];

export default function EditHabitModal({
  isOpen,
  onClose,
  onHabitUpdated,
  habit,
}: EditHabitModalProps) {
  const [habitName, setHabitName] = useState(habit.name);
  const [habitDescription, setHabitDescription] = useState(habit.description);
  const [habitColor, setHabitColor] = useState(habit.color);
  const [rewards, setRewards] = useState<Reward[]>(habit.rewards || []);
  const [newRewardName, setNewRewardName] = useState('');
  const [selectedRewardIcon, setSelectedRewardIcon] = useState('🍦');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddReward = () => {
    if (!newRewardName.trim()) return;

    // Generamos un ID temporal para la UI (en Supabase se generarán reales al insertar)
    const newReward: Reward = {
      id: Date.now(), 
      name: newRewardName,
      icon: selectedRewardIcon,
    };

    setRewards([...rewards, newReward]);
    setNewRewardName('');
    setSelectedRewardIcon('🍦');
  };

  const handleRemoveReward = (id: number) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!habitName.trim()) {
      setError('El nombre del hábito es requerido');
      return;
    }

    if (rewards.length === 0) {
      setError('Debe tener al menos una recompensa');
      return;
    }

    setIsLoading(true);

    try {
      // Obtenemos el ID del usuario del localStorage
      const userData = localStorage.getItem('currentUser');
      const userId = userData ? JSON.parse(userData).id : null;

      if (!userId) {
        setError('No se encontró sesión de usuario');
        setIsLoading(false);
        return;
      }

      // IMPORTANTE: Enviamos user_id con guion bajo para Supabase
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: habitName,
          description: habitDescription,
          color: habitColor,
          rewards: rewards.map(({ name, icon }) => ({ name, icon })), // Limpiamos IDs temporales
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el hábito');
      }

      onHabitUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const colors = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md border border-border">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="sticky top-0 bg-background z-10 p-6 pb-4 border-b border-border flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Configurar Hábito</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pb-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Hábito</label>
                <Input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="Ej: Ejercicio matutino"
                  disabled={isLoading}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Input
                  type="text"
                  value={habitDescription}
                  onChange={(e) => setHabitDescription(e.target.value)}
                  placeholder="Descripción del hábito"
                  disabled={isLoading}
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium mb-3">Color</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setHabitColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        habitColor === color ? 'ring-2 ring-offset-2 ring-foreground' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Recompensas */}
              <div className="pt-2">
                <label className="block text-sm font-medium mb-2">Recompensas</label>
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/30">
                  {rewards.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Sin recompensas agregadas</p>}
                  {rewards.map(reward => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-2 bg-background border rounded shadow-sm"
                    >
                      <span className="text-sm">
                        {reward.icon} {reward.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReward(reward.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                  <Input
                    type="text"
                    value={newRewardName}
                    onChange={(e) => setNewRewardName(e.target.value)}
                    placeholder="Nueva recompensa..."
                    disabled={isLoading}
                  />

                  <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
                    {REWARD_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedRewardIcon(icon)}
                        className={`text-xl p-2 rounded-md transition-all ${
                          selectedRewardIcon === icon ? 'bg-primary text-white scale-110' : 'hover:bg-muted'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddReward}
                    variant="outline"
                    className="w-full text-xs"
                    disabled={!newRewardName.trim() || isLoading}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Añadir a la lista
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}