import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements, BADGE_INFO } from "@/hooks/useAchievements";
import { Trophy, Lock, Target, Zap, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AchievementsDisplayProps {
  compact?: boolean;
}

// Categorias de badges
const BADGE_CATEGORIES = {
  consistency: ['first_checkin', 'consistency_4weeks', 'consistency_12weeks', 'consistency_24weeks', 'perfect_streak_4'],
  zones: ['first_green', 'green_streak_3', 'green_streak_5', 'green_streak_10', 'green_zone_4weeks', 'diamond_12', 'no_red_8'],
  milestones: ['weight_milestone_5kg', 'weight_milestone_10kg', 'halfway_hero', 'goal_achieved'],
  special: ['body_fat_5percent', 'photo_champion', 'comeback', 'precision_5'],
};

const CATEGORY_INFO = {
  consistency: { name: "Consistência", icon: Zap, color: "text-blue-500" },
  zones: { name: "Zonas", icon: Target, color: "text-green-500" },
  milestones: { name: "Marcos", icon: Trophy, color: "text-yellow-500" },
  special: { name: "Especiais", icon: Award, color: "text-purple-500" },
};

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
  const progressPercent = Math.round((achievements.length / allBadges.length) * 100);

  const renderBadge = (badgeType: string) => {
    const badge = BADGE_INFO[badgeType as keyof typeof BADGE_INFO];
    if (!badge) return null;
    
    const isEarned = earnedBadges.includes(badgeType);

    return (
      <motion.div
        key={badgeType}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: isEarned ? 1.05 : 1.02 }}
        transition={{ duration: 0.2 }}
        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
          isEarned
            ? 'border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 hover:shadow-lg hover:border-primary/80'
            : 'border-muted/50 bg-muted/20 opacity-60 hover:opacity-80 hover:border-muted'
        }`}
      >
        {isEarned && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        )}
        
        <div className="flex flex-col items-center text-center gap-3 relative z-10">
          <div className={`text-5xl transition-transform duration-300 ${isEarned ? 'animate-bounce-subtle' : ''}`}>
            {isEarned ? badge.icon : <Lock className="h-10 w-10 text-muted-foreground/50" />}
          </div>
          <div>
            <p className={`font-bold text-sm mb-1 ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
              {badge.name}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {badge.description}
            </p>
          </div>
        </div>
        
        {isEarned && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="default" className="text-xs shadow-lg bg-gradient-to-r from-primary to-accent">
              ✓
            </Badge>
          </div>
        )}
      </motion.div>
    );
  };

  if (compact) {
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
                {achievements.length} de {allBadges.length} desbloqueadas
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">
              {achievements.length}/{allBadges.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayBadges.map(renderBadge)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-primary" />
              Conquistas
            </CardTitle>
            <CardDescription className="mt-1">
              Continue progredindo para desbloquear mais badges
            </CardDescription>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2 font-bold">
            {achievements.length}/{allBadges.length}
          </Badge>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm font-bold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="consistency">
              <Zap className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="zones">
              <Target className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="milestones">
              <Trophy className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="special">
              <Award className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allBadges.map(renderBadge)}
            </div>
          </TabsContent>
          
          {Object.entries(BADGE_CATEGORIES).map(([category, badges]) => {
            const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
            const CategoryIcon = categoryInfo.icon;
            const earnedCount = badges.filter(b => earnedBadges.includes(b)).length;
            
            return (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="mb-4 p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`h-5 w-5 ${categoryInfo.color}`} />
                    <span className="font-semibold">{categoryInfo.name}</span>
                  </div>
                  <Badge variant="outline">
                    {earnedCount}/{badges.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map(renderBadge)}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
