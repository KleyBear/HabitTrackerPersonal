'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated: () => void;
  userId: number;
}

interface Reward {
  id: number;
  name: string;
  icon: string;
}

const REWARD_ICONS = ['🍦', '🎬', '🛍️', '📚', '🎮', '⚽', '🏖️', '💆', '🎵', '🍕'];

export default function CreateHabitModal({
  isOpen,
  onClose,
  onHabitCreated,
  userId,
}: CreateHabitModalProps) {
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitColor, setHabitColor] = useState('#7c3aed');
  const [rewards, setRewards] = useState<Reward[]>([
    { id: 1, name: 'Helado', icon: '🍦' },
  ]);
  const [newRewardName, setNewRewardName] = useState('');
  const [selectedRewardIcon, setSelectedRewardIcon] = useState('🍦');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddReward = () => {
    if (!newRewardName.trim()) return;
    const newReward: Reward = {
      id: Math.max(...rewards.map(r => r.id), 0) + 1,
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
    if (!habitName.trim()) return setError('El nombre del hábito es requerido');
    if (rewards.length === 0) return setError('Debe tener al menos una recompensa');

    setIsLoading(true);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: habitName,
          description: habitDescription,
          color: habitColor,
          rewards,
        }),
      });

      if (response.ok) {
        onHabitCreated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Error al crear el hábito');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const colors = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

  // Estilo inyectado para ocultar el scrollbar sin librerías externas
  const scrollbarHideStyle = `
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <style>{scrollbarHideStyle}</style>
      <Card className="w-full max-w-md border border-border flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nuevo Hábito</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE (BARRA OCULTA) */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          <form id="habit-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Hábito</label>
              <Input
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Ej: Ejercicio matutino"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Input
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
                placeholder="Descripción del hábito"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Color</label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setHabitColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      habitColor === color ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Recompensas</label>
              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
                {rewards.map(reward => (
                  <div key={reward.id} className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                    <span className="text-sm">{reward.icon} {reward.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReward(reward.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-3 border border-dashed rounded-lg">
                <Input
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  placeholder="Nombre de la recompensa"
                  disabled={isLoading}
                />
                {/* ICONOS (SCROLL HORIZONTAL OCULTO) */}
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {REWARD_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedRewardIcon(icon)}
                      className={`text-2xl p-2 rounded transition-all flex-shrink-0 ${
                        selectedRewardIcon === icon ? 'bg-primary/20' : 'hover:bg-muted'
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
                  className="w-full text-xs h-8"
                  disabled={!newRewardName.trim() || isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Recompensa
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-border flex gap-3 bg-card">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            form="habit-form"
            type="submit"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Hábito'}
          </Button>
        </div>
      </Card>
    </div>
  );
}