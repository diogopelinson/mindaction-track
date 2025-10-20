export interface WeeklyUpdate {
  id?: string;
  user_id?: string;
  week_number: number;
  weight: number;
  body_fat_percentage?: number;
  neck_circumference?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  photo_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  goal_type: 'perda_peso' | 'ganho_massa';
  target_weight: number;
  weekly_variation_percent: number;
}

export type Zone = 'green' | 'yellow' | 'red';

export const calculateWeeklyZone = (
  currentWeight: number,
  previousWeight: number,
  goalType: 'perda_peso' | 'ganho_massa',
  weeklyVariationPercent: number
): Zone => {
  const weightChange = currentWeight - previousWeight;
  const expectedChange = (previousWeight * weeklyVariationPercent) / 100;
  
  if (goalType === 'perda_peso') {
    // For weight loss, negative change is good
    if (weightChange <= expectedChange * 0.8) {
      return 'green'; // Lost more or equal than expected
    } else if (weightChange <= expectedChange * 1.2) {
      return 'yellow'; // Slight deviation
    } else {
      return 'red'; // Gained weight or lost too little
    }
  } else {
    // For muscle gain, positive change is good
    if (weightChange >= expectedChange * 0.8) {
      return 'green'; // Gained as expected
    } else if (weightChange >= expectedChange * 0.6) {
      return 'yellow'; // Slight deviation
    } else {
      return 'red'; // Gained too little or lost weight
    }
  }
};

export const calculateOverallProgress = (
  initialWeight: number,
  currentWeight: number,
  targetWeight: number,
  goalType: 'perda_peso' | 'ganho_massa'
): number => {
  if (goalType === 'perda_peso') {
    const totalToLose = initialWeight - targetWeight;
    const lostSoFar = initialWeight - currentWeight;
    return (lostSoFar / totalToLose) * 100;
  } else {
    const totalToGain = targetWeight - initialWeight;
    const gainedSoFar = currentWeight - initialWeight;
    return (gainedSoFar / totalToGain) * 100;
  }
};

export const getZoneColor = (zone: Zone): string => {
  switch (zone) {
    case 'green':
      return 'text-success bg-success/10 border-success';
    case 'yellow':
      return 'text-warning bg-warning/10 border-warning';
    case 'red':
      return 'text-danger bg-danger/10 border-danger';
  }
};

export const getZoneLabel = (zone: Zone): string => {
  switch (zone) {
    case 'green':
      return 'Zona Verde';
    case 'yellow':
      return 'Zona Amarela';
    case 'red':
      return 'Zona Vermelha';
  }
};
