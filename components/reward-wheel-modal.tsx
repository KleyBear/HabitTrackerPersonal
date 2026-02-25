'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Reward {
  id: number;
  name: string;
  icon: string;
}

interface Habit {
  id: number;
  name: string;
  rewards: Reward[];
  [key: string]: any;
}

interface RewardWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
  onRewardSelected: () => void;
}

export default function RewardWheelModal({
  isOpen,
  onClose,
  habit,
  onRewardSelected,
}: RewardWheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showResult, setShowResult] = useState(false);

  // --- SOLUCIÓN AL ERROR DE RUNTIME ---
  // Blindamos el acceso a habit.rewards usando optional chaining y valor por defecto
  const rewards = habit?.rewards || [];
  
  const getWheelSize = () => {
    const rewardCount = rewards.length;
    if (rewardCount <= 3) return { size: 'w-64 h-64', radius: 90 };
    if (rewardCount <= 6) return { size: 'w-80 h-80', radius: 110 };
    if (rewardCount <= 8) return { size: 'w-96 h-96', radius: 130 };
    return { size: 'w-full max-w-[400px] h-[400px]', radius: 150 };
  };

  const wheelConfig = getWheelSize();

  const handleSpin = () => {
    if (isSpinning || rewards.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedReward(null);

    const spins = 5; 
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const segmentAngle = 360 / rewards.length;
    
    // Calculamos para que el premio quede en la parte superior (puntero)
    const randomRotation = spins * 360 + (360 - (randomIndex * segmentAngle));

    setRotation(randomRotation);

    setTimeout(() => {
      setSelectedReward(rewards[randomIndex]);
      setShowResult(true);
      setIsSpinning(false);
    }, 3000);
  };

  const handleClaimReward = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      const user_id = userStr ? JSON.parse(userStr).id : null;

      if (!user_id) return;

      const response = await fetch(`/api/habits/${habit.id}/reset-wheel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }), // Sincronizado con snake_case
      });

      if (response.ok) {
        onRewardSelected();
        onClose();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md border border-border overflow-hidden shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">¡Día 7 alcanzado!</h2>
              <p className="text-xs text-muted-foreground">{habit?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wheel Container */}
          <div className="mb-8 flex justify-center relative">
            {rewards.length > 0 ? (
              <div className={`relative ${wheelConfig.size}`}>
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md"></div>
                </div>

                {/* Wheel Visual */}
                <div
                  className="absolute inset-0 rounded-full border-8 border-primary/20 shadow-inner"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? '3s' : '0s',
                    transitionTimingFunction: 'cubic-bezier(0.15, 0, 0.15, 1)',
                    background: `conic-gradient(from 0deg, ${habit.color}20, ${habit.color}40, ${habit.color}20)`,
                  }}
                >
                  {rewards.map((reward, index) => {
                    const angle = (360 / rewards.length) * index;
                    return (
                      <div
                        key={reward.id || index}
                        className="absolute w-full h-full flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-${wheelConfig.radius}px) rotate(-${angle}deg)`,
                        }}
                      >
                        <div className="text-4xl drop-shadow-sm select-none">
                          {reward.icon}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center circle */}
                <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center shadow-lg z-10">
                  <span className="text-primary font-bold text-xl">✨</span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-muted-foreground">No hay recompensas configuradas.</p>
                <p className="text-xs">Edita el hábito para añadir opciones.</p>
              </div>
            )}
          </div>

          {/* Result Area */}
          <div className="h-28 flex items-center justify-center mb-4">
            {showResult && selectedReward ? (
              <div className="text-center animate-in zoom-in duration-300">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">¡Felicidades!</p>
                <p className="text-4xl my-1">{selectedReward.icon}</p>
                <p className="text-xl font-bold text-primary">
                  {selectedReward.name}
                </p>
              </div>
            ) : (
              !isSpinning && rewards.length > 0 && (
                <p className="text-muted-foreground text-sm italic">¿Qué te tocará hoy?</p>
              )
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!showResult ? (
              <Button
                onClick={handleSpin}
                disabled={isSpinning || rewards.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-7 shadow-lg transition-transform active:scale-95"
              >
                {isSpinning ? 'Girando la suerte...' : '🎡 Girar Ruleta'}
              </Button>
            ) : (
              <Button
                onClick={handleClaimReward}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg animate-bounce"
              >
                Reclamar Recompensa
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-muted-foreground"
              disabled={isSpinning}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}