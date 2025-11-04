import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Calendar, TrendingUp, Target, Award } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { Skeleton } from "@/components/ui/skeleton";

interface GamificationStatsProps {
  checkInCount: number;
  greenStreak: number;
  totalXP: number;
}

export function GamificationStats({ checkInCount, greenStreak, totalXP }: GamificationStatsProps) {
  const { achievements, loading } = useAchievements();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const achievementCount = achievements.length;
  const totalAchievements = 19;
  const successRate = checkInCount > 0 ? Math.round((greenStreak / checkInCount) * 100) : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Suas Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Award className="w-4 h-4" />
            <span>Conquistas</span>
          </div>
          <p className="text-2xl font-bold">
            {achievementCount}/{totalAchievements}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.round((achievementCount / totalAchievements) * 100)}% completo
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Flame className="w-4 h-4" />
            <span>Maior Streak</span>
          </div>
          <p className="text-2xl font-bold">{greenStreak}</p>
          <p className="text-xs text-muted-foreground">semanas verdes</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Target className="w-4 h-4" />
            <span>Total XP</span>
          </div>
          <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">pontos de experiência</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Taxa de Sucesso</span>
          </div>
          <p className="text-2xl font-bold">{successRate}%</p>
          <p className="text-xs text-muted-foreground">check-ins verdes</p>
        </div>
      </CardContent>
    </Card>
  );
}
