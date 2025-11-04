import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { getLevelTitle } from "@/hooks/useXPSystem";
import { Skeleton } from "@/components/ui/skeleton";

interface XPCardProps {
  totalXP: number;
  currentLevel: number;
  xpProgress: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  loading?: boolean;
}

export function XPCard({
  totalXP,
  currentLevel,
  xpProgress,
  xpInCurrentLevel,
  xpToNextLevel,
  loading,
}: XPCardProps) {
  const title = getLevelTitle(currentLevel);
  const xpNeeded = xpToNextLevel - xpInCurrentLevel;

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Nível {currentLevel}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* XP Progress bar with animation */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {xpInCurrentLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </span>
            <span className="text-primary font-semibold">
              {Math.round(xpProgress)}%
            </span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Progress value={xpProgress} className="h-3" />
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-background/50 rounded-lg p-3 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Próximo nível</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {xpNeeded.toLocaleString()} XP
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-background/50 rounded-lg p-3 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">XP Total</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {totalXP.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Next reward hint */}
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
          <p className="text-xs text-center text-muted-foreground">
            🎯 Próximo check-in: <span className="text-primary font-semibold">+50 XP</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
