import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  badge_type: string;
  earned_at: string;
  milestone_value?: number;
}

export const BADGE_INFO = {
  first_checkin: {
    name: 'Primeira Semana',
    description: 'Completou seu primeiro check-in',
    icon: '🎯',
  },
  consistency_4weeks: {
    name: 'Consistência Bronze',
    description: '4 semanas consecutivas',
    icon: '🥉',
  },
  consistency_12weeks: {
    name: 'Consistência Prata',
    description: '12 semanas consecutivas',
    icon: '🥈',
  },
  consistency_24weeks: {
    name: 'Consistência Ouro',
    description: '24 semanas consecutivas',
    icon: '🥇',
  },
  weight_milestone_5kg: {
    name: 'Milestone 5kg',
    description: 'Perdeu ou ganhou 5kg',
    icon: '💪',
  },
  weight_milestone_10kg: {
    name: 'Milestone 10kg',
    description: 'Perdeu ou ganhou 10kg',
    icon: '🔥',
  },
  body_fat_5percent: {
    name: 'Gordura -5%',
    description: 'Reduziu 5% de gordura corporal',
    icon: '📉',
  },
  green_zone_4weeks: {
    name: 'Zona Verde',
    description: '4 semanas na zona verde',
    icon: '🟢',
  },
  halfway_hero: {
    name: 'Metade do Caminho',
    description: 'Atingiu 50% da meta',
    icon: '⭐',
  },
  goal_achieved: {
    name: 'Meta Conquistada!',
    description: 'Completou sua meta final',
    icon: '🏆',
  },
  photo_champion: {
    name: 'Campeão das Fotos',
    description: '10 check-ins com fotos completas',
    icon: '📸',
  },
};

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async (updates: any[], profile: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingBadges = achievements.map(a => a.badge_type);
    const newBadges: string[] = [];

    // First check-in
    if (updates.length === 1 && !existingBadges.includes('first_checkin')) {
      newBadges.push('first_checkin');
    }

    // Consistency badges
    const consecutiveWeeks = calculateConsecutiveWeeks(updates);
    if (consecutiveWeeks >= 4 && !existingBadges.includes('consistency_4weeks')) {
      newBadges.push('consistency_4weeks');
    }
    if (consecutiveWeeks >= 12 && !existingBadges.includes('consistency_12weeks')) {
      newBadges.push('consistency_12weeks');
    }
    if (consecutiveWeeks >= 24 && !existingBadges.includes('consistency_24weeks')) {
      newBadges.push('consistency_24weeks');
    }

    // Weight milestones
    if (updates.length > 0 && profile.initial_weight) {
      const currentWeight = updates[0].weight;
      const weightDiff = Math.abs(currentWeight - profile.initial_weight);
      
      if (weightDiff >= 5 && !existingBadges.includes('weight_milestone_5kg')) {
        newBadges.push('weight_milestone_5kg');
      }
      if (weightDiff >= 10 && !existingBadges.includes('weight_milestone_10kg')) {
        newBadges.push('weight_milestone_10kg');
      }
    }

    // Photo champion
    const photosCount = updates.filter(u => u.photo_url).length;
    if (photosCount >= 10 && !existingBadges.includes('photo_champion')) {
      newBadges.push('photo_champion');
    }

    // Insert new badges
    for (const badgeType of newBadges) {
      const { error } = await supabase
        .from('achievements')
        .insert({ user_id: user.id, badge_type: badgeType });

      if (!error) {
        const badgeInfo = BADGE_INFO[badgeType as keyof typeof BADGE_INFO];
        toast({
          title: `🎉 Nova Conquista Desbloqueada!`,
          description: `${badgeInfo.icon} ${badgeInfo.name}: ${badgeInfo.description}`,
          duration: 5000,
        });
      }
    }

    if (newBadges.length > 0) {
      fetchAchievements();
    }
  };

  const calculateConsecutiveWeeks = (updates: any[]) => {
    if (updates.length === 0) return 0;
    
    const sortedUpdates = [...updates].sort((a, b) => b.week_number - a.week_number);
    let consecutive = 1;
    
    for (let i = 0; i < sortedUpdates.length - 1; i++) {
      if (sortedUpdates[i].week_number - sortedUpdates[i + 1].week_number === 1) {
        consecutive++;
      } else {
        break;
      }
    }
    
    return consecutive;
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    loading,
    checkAndAwardAchievements,
    fetchAchievements,
  };
};
