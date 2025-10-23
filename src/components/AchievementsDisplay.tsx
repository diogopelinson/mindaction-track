import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements, BADGE_INFO } from "@/hooks/useAchievements";
import { Trophy, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AchievementsDisplayProps {
  compact?: boolean;
}

export const AchievementsDisplay = ({ compact = false }: AchievementsDisplayProps) => {
  const { achievements, loading } = useAchievements();

  const earnedBadges = achievements.map(a => a.badge_type);
  const allBadges = Object.keys(BADGE_INFO);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayBadges = compact ? allBadges.slice(0, 3) : allBadges;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Conquistas
            </CardTitle>
            <CardDescription>
              {achievements.length} de {allBadges.length} badges conquistados
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg">
            {achievements.length}/{allBadges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayBadges.map((badgeType) => {
            const badge = BADGE_INFO[badgeType as keyof typeof BADGE_INFO];
            const isEarned = earnedBadges.includes(badgeType);

            return (
              <motion.div
                key={badgeType}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isEarned
                    ? 'border-primary bg-primary/5 hover:bg-primary/10'
                    : 'border-muted bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="text-4xl">
                    {isEarned ? badge.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
                {isEarned && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
