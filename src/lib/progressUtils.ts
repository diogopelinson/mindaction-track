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
  goal_subtype?: GoalSubtype;
  initial_weight?: number;
}

export type Zone = 'green' | 'yellow' | 'red';

export type GoalSubtype = 'padrao' | 'moderada' | 'standard';

export interface ZoneConfig {
  yellowMin: number;  // 0.25
  greenMin: number;   // 0.35 ou 0.5
  greenMax: number;   // 0.5 ou 0.75
}

/**
 * Retorna a configuração de zonas baseado no tipo de objetivo
 * Todas as porcentagens são em relação ao PESO INICIAL
 */
export const getZoneConfig = (
  goalType: 'perda_peso' | 'ganho_massa',
  subtype: GoalSubtype = 'padrao'
): ZoneConfig => {
  if (goalType === 'ganho_massa') {
    // Ganho de Massa: 0,25% | 0,35% | 0,50%
    return { yellowMin: 0.25, greenMin: 0.35, greenMax: 0.50 };
  }
  
  if (goalType === 'perda_peso') {
    if (subtype === 'moderada') {
      // Perda de Peso MODERADA: 0,25% | 0,35% | 0,50%
      return { yellowMin: 0.25, greenMin: 0.35, greenMax: 0.50 };
    }
    // Perda de Peso PADRÃO: 0,25% | 0,50% | 0,75%
    return { yellowMin: 0.25, greenMin: 0.50, greenMax: 0.75 };
  }
  
  // Fallback para padrão
  return { yellowMin: 0.25, greenMin: 0.50, greenMax: 0.75 };
};

/**
 * Calcula a zona semanal baseada no peso INICIAL (não no peso anterior)
 * MUDANÇA CRÍTICA: Agora usa initialWeight ao invés de previousWeight
 */
export const calculateWeeklyZone = (
  currentWeight: number,
  initialWeight: number,
  goalType: 'perda_peso' | 'ganho_massa',
  subtype: GoalSubtype = 'padrao'
): Zone => {
  const config = getZoneConfig(goalType, subtype);
  
  // Calcular variação em relação ao peso INICIAL
  const weightChange = currentWeight - initialWeight;
  const changePercent = Math.abs((weightChange / initialWeight) * 100);
  
  if (goalType === 'perda_peso') {
    // Para perda de peso, weight change negativo é bom
    if (weightChange >= 0) {
      // Ganhou peso = Zona Vermelha
      return 'red';
    }
    
    // Verificar limites (em valor absoluto da mudança)
    if (changePercent >= config.greenMin && changePercent <= config.greenMax) {
      return 'green'; // Perda ideal
    } else if (changePercent >= config.yellowMin && changePercent < config.greenMin) {
      return 'yellow'; // Perda menor que ideal
    } else {
      return 'red'; // Muito pouco ou muito peso perdido
    }
  } else {
    // Para ganho de massa, weight change positivo é bom
    if (weightChange <= 0) {
      // Perdeu peso = Zona Vermelha
      return 'red';
    }
    
    // Verificar limites
    if (changePercent >= config.greenMin && changePercent <= config.greenMax) {
      return 'green'; // Ganho ideal
    } else if (changePercent >= config.yellowMin && changePercent < config.greenMin) {
      return 'yellow'; // Ganho menor que ideal
    } else {
      return 'red'; // Muito pouco ou muito peso ganho
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

/**
 * Calcula a zona baseada nos limites semanais específicos
 * ESTA É A FUNÇÃO CORRETA para usar na tabela de projeção
 */
export const calculateWeeklyZoneByLimits = (
  currentWeight: number,
  limInf: number,
  projetado: number,
  maxAting: number,
  goalType: 'perda_peso' | 'ganho_massa'
): Zone => {
  if (goalType === 'ganho_massa') {
    // Para GANHO DE MASSA (peso deve aumentar)
    if (currentWeight < limInf) return 'red';        // Abaixo do mínimo esperado
    if (currentWeight >= limInf && currentWeight < projetado) return 'yellow'; // Entre mínimo e ideal
    if (currentWeight >= projetado && currentWeight <= maxAting) return 'green'; // Na faixa ideal!
    if (currentWeight > maxAting) return 'red';      // Acima do máximo (ganho excessivo)
  } else {
    // Para PERDA DE PESO (peso deve diminuir)
    if (currentWeight > limInf) return 'red';        // Acima do limite (pouca perda)
    if (currentWeight > projetado && currentWeight <= limInf) return 'yellow'; // Entre ideal e limite
    if (currentWeight >= maxAting && currentWeight <= projetado) return 'green'; // Na faixa ideal!
    if (currentWeight < maxAting) return 'red';      // Abaixo do máximo (perda excessiva)
  }
  return 'red'; // Fallback
};
