// Utilities for progress calculations and zone determination

export type GoalType = 'perda_peso' | 'ganho_massa';
export type ZoneType = 'green' | 'yellow' | 'red';

interface ZoneResult {
  zone: ZoneType;
  weeklyChange: number;
  weeklyChangePercent: number;
}

/**
 * Calculate weekly weight change percentage and determine zone
 */
export function calculateWeeklyZone(
  currentWeight: number,
  previousWeight: number,
  goalType: GoalType
): ZoneResult {
  const weightChange = currentWeight - previousWeight;
  const weeklyChangePercent = (Math.abs(weightChange) / previousWeight) * 100;

  let zone: ZoneType = 'red';

  if (goalType === 'perda_peso') {
    // Weight loss: negative change is good
    if (weightChange >= 0) {
      zone = 'red'; // Gained weight
    } else if (weeklyChangePercent >= 0.5 && weeklyChangePercent <= 0.75) {
      zone = 'green';
    } else if (weeklyChangePercent >= 0.25 && weeklyChangePercent < 0.5) {
      zone = 'yellow';
    } else {
      zone = 'red'; // Too fast or no change
    }
  } else {
    // Weight gain: positive change is good
    if (weightChange <= 0) {
      zone = 'red'; // Lost weight
    } else if (weeklyChangePercent >= 0.35 && weeklyChangePercent <= 0.5) {
      zone = 'green';
    } else if (weeklyChangePercent >= 0.25 && weeklyChangePercent < 0.35) {
      zone = 'yellow';
    } else {
      zone = 'red'; // Too fast or no change
    }
  }

  return {
    zone,
    weeklyChange: weightChange,
    weeklyChangePercent,
  };
}

/**
 * Get zone color class
 */
export function getZoneColor(zone: ZoneType): string {
  switch (zone) {
    case 'green':
      return 'bg-success';
    case 'yellow':
      return 'bg-warning';
    case 'red':
      return 'bg-danger';
  }
}

/**
 * Get zone label
 */
export function getZoneLabel(zone: ZoneType): string {
  switch (zone) {
    case 'green':
      return 'No Ritmo';
    case 'yellow':
      return 'Atenção';
    case 'red':
      return 'Ajuste Necessário';
  }
}

/**
 * Calculate overall progress percentage
 */
export function calculateOverallProgress(
  initialWeight: number,
  currentWeight: number,
  targetWeight: number,
  goalType: GoalType
): number {
  if (goalType === 'perda_peso') {
    return ((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100;
  } else {
    return ((currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100;
  }
}

/**
 * Estimate weeks to goal based on current progress
 */
export function estimateWeeksToGoal(
  currentWeight: number,
  targetWeight: number,
  averageWeeklyChange: number,
  goalType: GoalType
): number {
  const remaining = Math.abs(targetWeight - currentWeight);
  const avgChange = Math.abs(averageWeeklyChange);
  
  if (avgChange === 0) return Infinity;
  
  return Math.ceil(remaining / avgChange);
}
