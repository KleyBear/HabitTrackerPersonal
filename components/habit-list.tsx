'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HabitCard from '@/components/habit-card';
import RewardWheelModal from '@/components/reward-wheel-modal';

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

interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: () => void;
}

export default function HabitList({ habits, onHabitUpdated }: HabitListProps) {
  const [showRewardWheel, setShowRewardWheel] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const handleRewardWheelTriggered = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowRewardWheel(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onHabitUpdated={onHabitUpdated}
            onRewardWheelTriggered={handleRewardWheelTriggered}
          />
        ))}
      </div>

      {/* Reward Wheel Modal */}
      {showRewardWheel && selectedHabit && (
        <RewardWheelModal
          isOpen={showRewardWheel}
          onClose={() => {
            setShowRewardWheel(false);
            setSelectedHabit(null);
          }}
          habit={selectedHabit}
          onRewardSelected={onHabitUpdated}
        />
      )}
    </>
  );
}
