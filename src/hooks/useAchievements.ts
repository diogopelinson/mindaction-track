import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateWeeklyZoneByLimits, getZoneConfig } from '@/lib/progressUtils';
import type { Zone } from '@/lib/progressUtils';

export interface Achievement {
  id: string;
  badge_type: string;
  earned_at: string;
  milestone_value?: number;
}

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

interface BadgeInfo {
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
}

export const getRarityColor = (rarity: BadgeRarity): string => {
  const colors = {
    common: "from-slate-400 to-slate-600",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-yellow-600",
  };
  return colors[rarity];
};

export const getRarityBorderColor = (rarity: BadgeRarity): string => {
  const colors = {
    common: "border-slate-400/50",
    rare: "border-blue-400/50",
    epic: "border-purple-400/50",
    legendary: "border-yellow-400/50 shadow-yellow-400/20 shadow-lg",
  };
  return colors[rarity];
};

export const getRarityLabel = (rarity: BadgeRarity): string => {
  const labels = {
    common: "Comum",
    rare: "Raro",
    epic: "Épico",
    legendary: "Lendário",
  };
  return labels[rarity];
};

export const BADGE_INFO: Record<string, BadgeInfo> = {
  first_checkin: {
    name: 'Primeira Semana',
    description: 'Completou seu primeiro check-in',
    icon: '🎯',
    rarity: 'common',
  },
  consistency_4weeks: {
    name: 'Consistência Bronze',
    description: '4 semanas consecutivas',
    icon: '🥉',
    rarity: 'common',
  },
  consistency_12weeks: {
    name: 'Consistência Prata',
    description: '12 semanas consecutivas',
    icon: '🥈',
    rarity: 'rare',
  },
  consistency_24weeks: {
    name: 'Consistência Ouro',
    description: '24 semanas consecutivas',
    icon: '🥇',
    rarity: 'epic',
  },
  weight_milestone_5kg: {
    name: 'Milestone 5kg',
    description: 'Perdeu ou ganhou 5kg',
    icon: '💪',
    rarity: 'rare',
  },
  weight_milestone_10kg: {
    name: 'Milestone 10kg',
    description: 'Perdeu ou ganhou 10kg',
    icon: '🔥',
    rarity: 'epic',
  },
  body_fat_5percent: {
    name: 'Gordura -5%',
    description: 'Reduziu 5% de gordura corporal',
    icon: '📉',
    rarity: 'rare',
  },
  green_zone_4weeks: {
    name: 'Zona Verde',
    description: '4 semanas na zona verde',
    icon: '🟢',
    rarity: 'common',
  },
  halfway_hero: {
    name: 'Metade do Caminho',
    description: 'Atingiu 50% da meta',
    icon: '⭐',
    rarity: 'rare',
  },
  goal_achieved: {
    name: 'Meta Conquistada!',
    description: 'Completou sua meta final',
    icon: '🏆',
    rarity: 'legendary',
  },
  photo_champion: {
    name: 'Campeão das Fotos',
    description: '10 check-ins com fotos completas',
    icon: '📸',
    rarity: 'rare',
  },
  green_streak_3: {
    name: 'Sequência Verde',
    description: '3 semanas consecutivas na zona verde',
    icon: '🌿',
    rarity: 'common',
  },
  green_streak_5: {
    name: 'Dominância Verde',
    description: '5 semanas consecutivas na zona verde',
    icon: '🍀',
    rarity: 'rare',
  },
  green_streak_10: {
    name: 'Mestre Verde',
    description: '10 semanas consecutivas na zona verde',
    icon: '💚',
    rarity: 'epic',
  },
  perfect_streak_4: {
    name: 'Streak Perfeito',
    description: '4 check-ins semanais consecutivos',
    icon: '🔥',
    rarity: 'legendary',
  },
  no_red_8: {
    name: 'Evolução Constante',
    description: '8 semanas sem entrar na zona vermelha',
    icon: '📈',
    rarity: 'rare',
  },
  comeback: {
    name: 'Resiliência',
    description: 'Voltou à zona verde após 2 semanas vermelhas',
    icon: '💪',
    rarity: 'common',
  },
  first_green: {
    name: 'Primeira Vitória',
    description: 'Primeira semana na zona verde',
    icon: '⭐',
    rarity: 'common',
  },
  diamond_12: {
    name: 'Diamante',
    description: '12 semanas na zona verde',
    icon: '💎',
    rarity: 'epic',
  },
  precision_5: {
    name: 'Precisão Cirúrgica',
    description: '5 check-ins no peso projetado (±0.1kg)',
    icon: '🎯',
    rarity: 'legendary',
  },
};

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(() => {
    // Carregar notificações já mostradas do sessionStorage
    const stored = sessionStorage.getItem('shownAchievementNotifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
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

    // Nova gamificação: Streaks de Zona Verde
    const greenStreak = calculateConsecutiveGreenWeeks(updates, profile);
    if (greenStreak >= 3 && !existingBadges.includes('green_streak_3')) {
      newBadges.push('green_streak_3');
    }
    if (greenStreak >= 5 && !existingBadges.includes('green_streak_5')) {
      newBadges.push('green_streak_5');
    }
    if (greenStreak >= 10 && !existingBadges.includes('green_streak_10')) {
      newBadges.push('green_streak_10');
    }

    // Primeira zona verde
    const hasGreenZone = updates.some(u => {
      const zone = calculateZoneForUpdate(u, profile);
      return zone === 'green';
    });
    if (hasGreenZone && !existingBadges.includes('first_green')) {
      newBadges.push('first_green');
    }

    // Diamante (12 semanas na verde)
    const totalGreenWeeks = updates.filter(u => {
      const zone = calculateZoneForUpdate(u, profile);
      return zone === 'green';
    }).length;
    if (totalGreenWeeks >= 12 && !existingBadges.includes('diamond_12')) {
      newBadges.push('diamond_12');
    }

    // Streak perfeito
    if (consecutiveWeeks >= 4 && !existingBadges.includes('perfect_streak_4')) {
      newBadges.push('perfect_streak_4');
    }

    // 8 semanas sem vermelho
    const noRedStreak = calculateNoRedStreak(updates, profile);
    if (noRedStreak >= 8 && !existingBadges.includes('no_red_8')) {
      newBadges.push('no_red_8');
    }

    // Resiliência (voltou ao verde depois de vermelhas)
    if (hasComeback(updates, profile) && !existingBadges.includes('comeback')) {
      newBadges.push('comeback');
    }

    // Insert new badges
    for (const badgeType of newBadges) {
      const { error } = await supabase
        .from('achievements')
        .insert({ user_id: user.id, badge_type: badgeType });

      // Apenas mostrar toast se não foi mostrado ainda nesta sessão
      if (!error && !shownNotifications.has(badgeType)) {
        const badgeInfo = BADGE_INFO[badgeType as keyof typeof BADGE_INFO];
        toast({
          title: `🎉 Nova Conquista Desbloqueada!`,
          description: `${badgeInfo.icon} ${badgeInfo.name}: ${badgeInfo.description}`,
          duration: 5000,
        });
        
        // Marcar como mostrado
        setShownNotifications(prev => new Set([...prev, badgeType]));
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

  // Função auxiliar para calcular zona de um update
  const calculateZoneForUpdate = (update: any, profile: any): Zone => {
    if (!profile || !update) return 'red';
    
    const config = getZoneConfig(profile.goal_type, profile.goal_subtype || 'padrao');
    const yellowPercentKg = (profile.initial_weight * config.yellowMin) / 100;
    const greenMinKg = (profile.initial_weight * config.greenMin) / 100;
    const greenMaxKg = (profile.initial_weight * config.greenMax) / 100;

    let limInf: number, projetado: number, maxAting: number;
    
    if (profile.goal_type === 'ganho_massa') {
      limInf = profile.initial_weight + (yellowPercentKg * update.week_number);
      projetado = profile.initial_weight + (greenMinKg * update.week_number);
      maxAting = profile.initial_weight + (greenMaxKg * update.week_number);
    } else {
      limInf = profile.initial_weight - (yellowPercentKg * update.week_number);
      projetado = profile.initial_weight - (greenMinKg * update.week_number);
      maxAting = profile.initial_weight - (greenMaxKg * update.week_number);
    }

    return calculateWeeklyZoneByLimits(
      update.weight,
      parseFloat(limInf.toFixed(1)),
      parseFloat(projetado.toFixed(1)),
      parseFloat(maxAting.toFixed(1)),
      profile.goal_type
    );
  };

  // Calcular semanas consecutivas na zona verde
  const calculateConsecutiveGreenWeeks = (updates: any[], profile: any): number => {
    if (updates.length === 0) return 0;
    
    const sortedUpdates = [...updates].sort((a, b) => b.week_number - a.week_number);
    let streak = 0;
    
    for (const update of sortedUpdates) {
      const zone = calculateZoneForUpdate(update, profile);
      if (zone === 'green') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calcular streak sem zona vermelha
  const calculateNoRedStreak = (updates: any[], profile: any): number => {
    if (updates.length === 0) return 0;
    
    const sortedUpdates = [...updates].sort((a, b) => b.week_number - a.week_number);
    let streak = 0;
    
    for (const update of sortedUpdates) {
      const zone = calculateZoneForUpdate(update, profile);
      if (zone !== 'red') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Detectar recuperação (voltou ao verde depois de vermelhas)
  const hasComeback = (updates: any[], profile: any): boolean => {
    if (updates.length < 3) return false;
    
    const sortedUpdates = [...updates].sort((a, b) => a.week_number - b.week_number);
    let redCount = 0;
    
    for (let i = sortedUpdates.length - 3; i < sortedUpdates.length; i++) {
      if (i < 0) continue;
      
      const zone = calculateZoneForUpdate(sortedUpdates[i], profile);
      if (i < sortedUpdates.length - 1 && zone === 'red') {
        redCount++;
      }
      if (i === sortedUpdates.length - 1 && zone === 'green' && redCount >= 2) {
        return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Sincronizar shownNotifications com sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      'shownAchievementNotifications',
      JSON.stringify(Array.from(shownNotifications))
    );
  }, [shownNotifications]);

  // Limpar sessionStorage ao fechar navegador/aba
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('shownAchievementNotifications');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Mostrar toasts apenas para conquistas MUITO recentes (últimos 5 segundos)
  useEffect(() => {
    if (achievements.length === 0) return;
    
    const recentAchievements = achievements.filter(a => {
      const earnedAt = new Date(a.earned_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - earnedAt.getTime()) / 1000;
      return diffSeconds < 5; // Reduzido de 10 para 5 segundos
    });

    for (const achievement of recentAchievements) {
      if (!shownNotifications.has(achievement.badge_type)) {
        const badgeInfo = BADGE_INFO[achievement.badge_type as keyof typeof BADGE_INFO];
        toast({
          title: `🎉 Conquista Desbloqueada!`,
          description: `${badgeInfo.icon} ${badgeInfo.name}`,
          duration: 5000,
        });
        setShownNotifications(prev => new Set([...prev, achievement.badge_type]));
      }
    }
  }, [achievements]);

  return {
    achievements,
    loading,
    checkAndAwardAchievements,
    fetchAchievements,
  };
};
