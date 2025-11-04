import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { BADGE_INFO, getRarityLabel, getRarityBorderColor, type BadgeRarity } from "@/hooks/useAchievements";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface BadgeUnlockModalProps {
  open: boolean;
  onClose: () => void;
  badgeType: string;
}

export function BadgeUnlockModal({ open, onClose, badgeType }: BadgeUnlockModalProps) {
  const { width, height } = useWindowSize();
  const badge = BADGE_INFO[badgeType as keyof typeof BADGE_INFO];

  if (!badge) return null;

  const rarity = badge.rarity;
  const rarityLabel = getRarityLabel(rarity);
  const borderColor = getRarityBorderColor(rarity);

  const getRarityGradient = (rarity: BadgeRarity): string => {
    const gradients = {
      common: "from-slate-400 to-slate-600",
      rare: "from-blue-400 to-blue-600",
      epic: "from-purple-400 to-purple-600",
      legendary: "from-yellow-400 to-yellow-600",
    };
    return gradients[rarity];
  };

  return (
    <>
      {open && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          numberOfPieces={rarity === 'legendary' ? 800 : rarity === 'epic' ? 500 : 300}
          colors={
            rarity === 'legendary' ? ['#fbbf24', '#f59e0b', '#fef3c7'] :
            rarity === 'epic' ? ['#a855f7', '#9333ea', '#e9d5ff'] :
            rarity === 'rare' ? ['#3b82f6', '#2563eb', '#dbeafe'] :
            ['#94a3b8', '#64748b', '#e2e8f0']
          }
        />
      )}
      
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`max-w-md border-2 ${borderColor} bg-gradient-to-b from-background to-primary/5`}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 py-8"
          >
            {/* Badge Icon with glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className={`absolute inset-0 blur-3xl bg-gradient-to-r ${getRarityGradient(rarity)} opacity-50 rounded-full`} />
              <div className={`text-8xl relative z-10 ${rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                {badge.icon}
              </div>
              {rarity === 'legendary' && (
                <>
                  <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-4 -right-4 animate-pulse" />
                  <Star className="w-6 h-6 text-yellow-300 absolute -bottom-2 -left-2 animate-pulse" />
                  <Star className="w-5 h-5 text-yellow-400 absolute top-2 -left-6 animate-pulse" />
                </>
              )}
            </motion.div>

            {/* Text content */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge 
                  variant="outline" 
                  className={`mb-2 ${
                    rarity === 'legendary' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                    rarity === 'epic' ? 'border-purple-400 text-purple-400 bg-purple-400/10' :
                    rarity === 'rare' ? 'border-blue-400 text-blue-400 bg-blue-400/10' :
                    'border-slate-400 text-slate-400 bg-slate-400/10'
                  }`}
                >
                  {rarityLabel}
                </Badge>
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-3xl font-bold bg-gradient-to-r ${getRarityGradient(rarity)} bg-clip-text text-transparent`}
              >
                {badge.name}
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground max-w-xs"
              >
                {badge.description}
              </motion.p>
            </div>

            {/* Rewards section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-primary/10 rounded-lg p-4 space-y-2"
            >
              <p className="text-sm font-semibold text-center">Recompensas Desbloqueadas:</p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm">+200 XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">Conquista rara</span>
                </div>
              </div>
            </motion.div>

            {/* Close button */}
            <Button onClick={onClose} size="lg" className="w-full">
              Continuar
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
