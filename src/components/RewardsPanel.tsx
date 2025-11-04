import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Trophy, Star, Target } from "lucide-react";
import { motion } from "framer-motion";

interface Reward {
  type: "level" | "checkin" | "streak";
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: string;
}

interface RewardsPanelProps {
  currentLevel: number;
  xpToNextLevel: number;
  checkInCount: number;
  greenStreak: number;
}

export function RewardsPanel({ currentLevel, xpToNextLevel, checkInCount, greenStreak }: RewardsPanelProps) {
  const rewards: Reward[] = [
    {
      type: "level",
      title: `Nível ${currentLevel + 1}`,
      description: `Faltam ${xpToNextLevel} XP`,
      progress: 0,
      total: xpToNextLevel,
      reward: "Novo título desbloqueado",
    },
    {
      type: "checkin",
      title: "10 Check-ins",
      description: `Faltam ${Math.max(0, 10 - checkInCount)} check-ins`,
      progress: checkInCount,
      total: 10,
      reward: "Badge: Dedicação Ouro",
    },
    {
      type: "streak",
      title: "Streak 10",
      description: `Faltam ${Math.max(0, 10 - greenStreak)} semanas`,
      progress: greenStreak,
      total: 10,
      reward: "Badge: Mestre Verde",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "level":
        return Star;
      case "checkin":
        return Trophy;
      case "streak":
        return Target;
      default:
        return Gift;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-primary" />
          Próximas Recompensas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rewards.map((reward, index) => {
          const Icon = getIcon(reward.type);
          const progressPercent = Math.min((reward.progress / reward.total) * 100, 100);
          const isComplete = reward.progress >= reward.total;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${
                isComplete 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-background/50 border-border/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isComplete ? 'bg-success/20' : 'bg-primary/10'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isComplete ? 'text-success' : 'text-primary'
                  }`} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{reward.title}</p>
                    {isComplete && (
                      <Badge variant="outline" className="text-xs border-success text-success">
                        Completo!
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {reward.description}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full ${
                          isComplete ? 'bg-success' : 'bg-primary'
                        }`}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      🎁 {reward.reward}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
