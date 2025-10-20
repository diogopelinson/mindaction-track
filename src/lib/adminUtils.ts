import { WeeklyUpdate, Goal, Zone, calculateWeeklyZone } from "./progressUtils";

export interface MenteeData {
  id: string;
  full_name: string;
  email: string;
  sex: 'male' | 'female';
  age: number;
  height: number;
  initial_weight: number;
  target_weight: number;
  goal_type: 'perda_peso' | 'ganho_massa';
  created_at: string;
  updates?: WeeklyUpdate[];
}

export interface MenteeStatus {
  status: 'success' | 'warning' | 'danger' | 'needs_attention';
  currentZone: Zone;
  lastUpdateDaysAgo: number;
  needsAttention: boolean;
  attentionReasons: string[];
}

export interface WeeklyZoneData {
  week: number;
  zone: Zone;
  weight: number;
  date: string;
}

export interface GlobalStats {
  totalMentees: number;
  activeMentees: number;
  inactiveMentees: number;
  greenZone: number;
  yellowZone: number;
  redZone: number;
  needsAttention: number;
  averageProgress: number;
  perdaPesoCount: number;
  ganhoMassaCount: number;
}

// Calcular status geral de um mentorado
export const calculateMenteeStatus = (
  updates: WeeklyUpdate[],
  profile: MenteeData
): MenteeStatus => {
  if (!updates || updates.length === 0) {
    return {
      status: 'needs_attention',
      currentZone: 'red',
      lastUpdateDaysAgo: 999,
      needsAttention: true,
      attentionReasons: ['Sem check-ins registrados'],
    };
  }

  // Ordenar por semana (mais recente primeiro)
  const sortedUpdates = [...updates].sort((a, b) => b.week_number - a.week_number);
  const latestUpdate = sortedUpdates[0];
  const previousUpdate = sortedUpdates[1];

  // Calcular dias desde última atualização
  const lastUpdateDate = new Date(latestUpdate.created_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));

  const attentionReasons: string[] = [];
  let needsAttention = false;

  // Verificar se está sem check-in há mais de 7 dias
  if (daysDiff > 7) {
    needsAttention = true;
    attentionReasons.push(`Sem check-in há ${daysDiff} dias`);
  }

  // Calcular zona atual
  let currentZone: Zone = 'green';
  if (previousUpdate) {
    currentZone = calculateWeeklyZone(
      latestUpdate.weight,
      previousUpdate.weight,
      profile.goal_type,
      profile.goal_type === 'perda_peso' ? 1 : 0.5 // Variação esperada semanal
    );
  }

  // Verificar últimas 2 semanas em zona vermelha
  if (sortedUpdates.length >= 2) {
    const recentZones = sortedUpdates.slice(0, 2).map((update, i) => {
      if (i === sortedUpdates.length - 1) return 'green'; // primeira semana não tem comparação
      const prev = sortedUpdates[i + 1];
      return calculateWeeklyZone(
        update.weight,
        prev.weight,
        profile.goal_type,
        profile.goal_type === 'perda_peso' ? 1 : 0.5
      );
    });

    const redZoneCount = recentZones.filter(z => z === 'red').length;
    if (redZoneCount >= 2) {
      needsAttention = true;
      attentionReasons.push('2+ semanas em zona vermelha');
    }
  }

  // Verificar estagnação (3+ semanas sem mudança significativa)
  if (sortedUpdates.length >= 3) {
    const last3Weights = sortedUpdates.slice(0, 3).map(u => u.weight);
    const maxDiff = Math.max(...last3Weights) - Math.min(...last3Weights);
    if (maxDiff < 0.5) {
      needsAttention = true;
      attentionReasons.push('Estagnação de peso (3+ semanas)');
    }
  }

  // Determinar status geral
  let status: 'success' | 'warning' | 'danger' | 'needs_attention' = 'success';
  if (needsAttention) {
    status = 'needs_attention';
  } else if (currentZone === 'red') {
    status = 'danger';
  } else if (currentZone === 'yellow') {
    status = 'warning';
  }

  return {
    status,
    currentZone,
    lastUpdateDaysAgo: daysDiff,
    needsAttention,
    attentionReasons,
  };
};

// Calcular zonas de todas as semanas
export const calculateAllWeeklyZones = (
  updates: WeeklyUpdate[],
  goal: { goal_type: 'perda_peso' | 'ganho_massa'; weekly_variation_percent?: number }
): WeeklyZoneData[] => {
  if (!updates || updates.length === 0) return [];

  const sortedUpdates = [...updates].sort((a, b) => a.week_number - b.week_number);
  const weeklyVariation = goal.weekly_variation_percent || (goal.goal_type === 'perda_peso' ? 1 : 0.5);

  return sortedUpdates.map((update, index) => {
    if (index === 0) {
      return {
        week: update.week_number,
        zone: 'green' as Zone,
        weight: update.weight,
        date: update.created_at,
      };
    }

    const previousUpdate = sortedUpdates[index - 1];
    const zone = calculateWeeklyZone(
      update.weight,
      previousUpdate.weight,
      goal.goal_type,
      weeklyVariation
    );

    return {
      week: update.week_number,
      zone,
      weight: update.weight,
      date: update.created_at,
    };
  });
};

// Detectar mentorados que precisam de atenção
export const detectAttentionNeeded = (
  updates: WeeklyUpdate[],
  profile: MenteeData
): { needsAttention: boolean; reasons: string[] } => {
  const status = calculateMenteeStatus(updates, profile);
  return {
    needsAttention: status.needsAttention,
    reasons: status.attentionReasons,
  };
};

// Estatísticas gerais de todos os mentorados
export const calculateGlobalStats = (allMentees: MenteeData[]): GlobalStats => {
  let totalMentees = allMentees.length;
  let activeMentees = 0;
  let inactiveMentees = 0;
  let greenZone = 0;
  let yellowZone = 0;
  let redZone = 0;
  let needsAttention = 0;
  let totalProgress = 0;
  let menteesWithProgress = 0;
  let perdaPesoCount = 0;
  let ganhoMassaCount = 0;

  allMentees.forEach((mentee) => {
    // Contar por tipo de objetivo
    if (mentee.goal_type === 'perda_peso') {
      perdaPesoCount++;
    } else {
      ganhoMassaCount++;
    }

    if (!mentee.updates || mentee.updates.length === 0) {
      inactiveMentees++;
      redZone++;
      needsAttention++;
      return;
    }

    const status = calculateMenteeStatus(mentee.updates, mentee);

    // Verificar se está ativo (última atualização nos últimos 14 dias)
    if (status.lastUpdateDaysAgo <= 14) {
      activeMentees++;
    } else {
      inactiveMentees++;
    }

    // Contar por zona
    if (status.currentZone === 'green') greenZone++;
    else if (status.currentZone === 'yellow') yellowZone++;
    else redZone++;

    // Contar se precisa de atenção
    if (status.needsAttention) needsAttention++;

    // Calcular progresso
    const sortedUpdates = [...mentee.updates].sort((a, b) => b.week_number - a.week_number);
    const currentWeight = sortedUpdates[0].weight;
    const initialWeight = mentee.initial_weight;
    const targetWeight = mentee.target_weight;

    if (mentee.goal_type === 'perda_peso') {
      const totalToLose = initialWeight - targetWeight;
      const lostSoFar = initialWeight - currentWeight;
      if (totalToLose > 0) {
        const progress = (lostSoFar / totalToLose) * 100;
        totalProgress += Math.max(0, Math.min(100, progress));
        menteesWithProgress++;
      }
    } else {
      const totalToGain = targetWeight - initialWeight;
      const gainedSoFar = currentWeight - initialWeight;
      if (totalToGain > 0) {
        const progress = (gainedSoFar / totalToGain) * 100;
        totalProgress += Math.max(0, Math.min(100, progress));
        menteesWithProgress++;
      }
    }
  });

  return {
    totalMentees,
    activeMentees,
    inactiveMentees,
    greenZone,
    yellowZone,
    redZone,
    needsAttention,
    averageProgress: menteesWithProgress > 0 ? totalProgress / menteesWithProgress : 0,
    perdaPesoCount,
    ganhoMassaCount,
  };
};

// Função auxiliar para formatar data
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// Função auxiliar para calcular % de progresso
export const calculateProgressPercentage = (
  currentWeight: number,
  initialWeight: number,
  targetWeight: number,
  goalType: 'perda_peso' | 'ganho_massa'
): number => {
  if (goalType === 'perda_peso') {
    const totalToLose = initialWeight - targetWeight;
    const lostSoFar = initialWeight - currentWeight;
    return totalToLose > 0 ? Math.max(0, Math.min(100, (lostSoFar / totalToLose) * 100)) : 0;
  } else {
    const totalToGain = targetWeight - initialWeight;
    const gainedSoFar = currentWeight - initialWeight;
    return totalToGain > 0 ? Math.max(0, Math.min(100, (gainedSoFar / totalToGain) * 100)) : 0;
  }
};
