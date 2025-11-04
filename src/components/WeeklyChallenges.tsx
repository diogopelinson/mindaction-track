import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Check } from "lucide-react";
import { motion } from "framer-motion";

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

export function WeeklyChallenges() {
  // Mock challenge - será substituído por dados reais
  const challenge: Challenge = {
    id: "perfect_week",
    title: "Semana Perfeita",
    description: "Fazer check-in e atingir zona verde",
    xpReward: 200,
    completed: false,
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Desafio da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{challenge.title}</h3>
            <Badge variant="outline" className="text-primary border-primary">
              +{challenge.xpReward} XP 💎
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {challenge.completed ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <div className="w-4 h-4 border-2 rounded" />
              )}
              <span className={challenge.completed ? "text-success line-through" : ""}>
                Check-in feito
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 border-2 rounded" />
              <span>Zona verde atingida</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
