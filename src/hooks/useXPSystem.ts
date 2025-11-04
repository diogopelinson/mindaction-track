import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type XPActionType = 
  | "checkin" 
  | "green_zone" 
  | "green_streak" 
  | "badge" 
  | "intermediate_goal" 
  | "photo_bonus"
  | "perfect_week";

interface XPReward {
  action: XPActionType;
  xp: number;
  description: string;
}

const XP_REWARDS: Record<XPActionType, number> = {
  checkin: 50,
  green_zone: 100,
  green_streak: 150,
  badge: 200,
  intermediate_goal: 300,
  photo_bonus: 25,
  perfect_week: 200,
};

const LEVEL_XP_REQUIREMENTS = (level: number): number => {
  if (level <= 5) return 500;
  if (level <= 10) return 750;
  if (level <= 20) return 1000;
  return 1500;
};

export const getLevelTitle = (level: number): string => {
  if (level <= 5) return "Iniciante";
  if (level <= 10) return "Intermediário";
  if (level <= 20) return "Avançado";
  return "Mestre";
};

export function useXPSystem() {
  const [userXP, setUserXP] = useState<{
    total_xp: number;
    current_level: number;
    xp_to_next_level: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [recentXP, setRecentXP] = useState<XPReward | null>(null);

  const fetchUserXP = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // User XP doesn't exist, create it
        const { data: newXP, error: insertError } = await supabase
          .from("user_xp")
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            xp_to_next_level: LEVEL_XP_REQUIREMENTS(1),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setUserXP(newXP);
      } else if (error) {
        throw error;
      } else {
        setUserXP(data);
      }
    } catch (error) {
      console.error("Error fetching user XP:", error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (actionType: XPActionType, customDescription?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !userXP) return;

      const xpGained = XP_REWARDS[actionType];
      const newTotalXP = userXP.total_xp + xpGained;
      let newLevel = userXP.current_level;
      let xpForNextLevel = userXP.xp_to_next_level;
      let leveledUp = false;

      // Calculate level ups
      let remainingXP = newTotalXP;
      let tempLevel = 1;
      
      while (remainingXP >= LEVEL_XP_REQUIREMENTS(tempLevel)) {
        remainingXP -= LEVEL_XP_REQUIREMENTS(tempLevel);
        tempLevel++;
      }

      if (tempLevel > userXP.current_level) {
        leveledUp = true;
        newLevel = tempLevel;
      }

      xpForNextLevel = LEVEL_XP_REQUIREMENTS(newLevel);

      // Update user_xp
      const { error: updateError } = await supabase
        .from("user_xp")
        .update({
          total_xp: newTotalXP,
          current_level: newLevel,
          xp_to_next_level: xpForNextLevel,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // If leveled up, update profile with new level and title
      if (leveledUp) {
        const newTitle = getLevelTitle(newLevel);
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            current_level: newLevel,
            level_title: newTitle,
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile level:", profileError);
        }
      }

      // Insert into xp_history
      const description = customDescription || getActionDescription(actionType);
      const { error: historyError } = await supabase
        .from("xp_history")
        .insert({
          user_id: user.id,
          action_type: actionType,
          xp_gained: xpGained,
          description,
        });

      if (historyError) throw historyError;

      // Update local state
      setUserXP({
        total_xp: newTotalXP,
        current_level: newLevel,
        xp_to_next_level: xpForNextLevel,
      });

      // Show XP gained
      setRecentXP({
        action: actionType,
        xp: xpGained,
        description,
      });

      // Clear recent XP after animation
      setTimeout(() => setRecentXP(null), 3000);

      // Show level up modal if leveled up
      if (leveledUp) {
        setShowLevelUp(true);
      }

      return { leveledUp, newLevel, xpGained };
    } catch (error) {
      console.error("Error adding XP:", error);
      toast({
        title: "Erro ao adicionar XP",
        description: "Não foi possível adicionar os pontos de experiência.",
        variant: "destructive",
      });
    }
  };

  const getActionDescription = (actionType: XPActionType): string => {
    const descriptions: Record<XPActionType, string> = {
      checkin: "Check-in semanal realizado",
      green_zone: "Zona verde atingida",
      green_streak: "Sequência verde mantida",
      badge: "Nova conquista desbloqueada",
      intermediate_goal: "Meta intermediária alcançada",
      photo_bonus: "Foto enviada no check-in",
      perfect_week: "Semana perfeita completa",
    };
    return descriptions[actionType];
  };

  const getXPProgress = (): number => {
    if (!userXP) return 0;
    
    let totalXPForCurrentLevel = 0;
    for (let i = 1; i < userXP.current_level; i++) {
      totalXPForCurrentLevel += LEVEL_XP_REQUIREMENTS(i);
    }
    
    const xpInCurrentLevel = userXP.total_xp - totalXPForCurrentLevel;
    const xpNeededForLevel = LEVEL_XP_REQUIREMENTS(userXP.current_level);
    
    return Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  };

  const getXPInCurrentLevel = (): number => {
    if (!userXP) return 0;
    
    let totalXPForCurrentLevel = 0;
    for (let i = 1; i < userXP.current_level; i++) {
      totalXPForCurrentLevel += LEVEL_XP_REQUIREMENTS(i);
    }
    
    return userXP.total_xp - totalXPForCurrentLevel;
  };

  useEffect(() => {
    fetchUserXP();
  }, []);

  return {
    userXP,
    loading,
    addXP,
    refetch: fetchUserXP,
    getXPProgress,
    getXPInCurrentLevel,
    showLevelUp,
    setShowLevelUp,
    recentXP,
    getLevelTitle,
  };
}
